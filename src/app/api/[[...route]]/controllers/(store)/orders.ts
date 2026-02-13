import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import db from "@/lib/db";
import { getProductById } from "@/lib/product-loader";
import { stripe } from "@/lib/stripe";
import { authMiddleware } from "../../middleware/auth-middleware";

const app = new Hono()
  .use("/*", authMiddleware)

  // ─────────────────────────────────────────────────────────
  // POST /checkout/init — production-grade checkout
  //
  // Flow:
  //   1. Validate cart (non-empty, all products exist)
  //   2. Validate address belongs to user
  //   3. Calculate total SERVER-SIDE (never trust frontend)
  //   4. Create Order (PENDING) + OrderItems + Payment (UNPAID) in transaction
  //   5. Create Stripe PaymentIntent with orderId as idempotency key
  //   6. Update Payment with intentId
  //   7. Return clientSecret + orderId
  //   Cart is NOT cleared — only webhook clears cart on payment success
  // ─────────────────────────────────────────────────────────
  .post(
    "/checkout/init",
    zValidator(
      "json",
      z.object({
        addressId: z.string().min(1),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { addressId } = c.req.valid("json");

      // 1. Validate address belongs to user
      const address = await db.address.findFirst({
        where: { id: addressId, userId: user.id },
      });
      if (!address) {
        return c.json({ error: "Address not found" }, 404);
      }

      // 2. Validate cart is non-empty
      const cart = await db.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      });
      if (!cart || cart.items.length === 0) {
        return c.json({ error: "Cart is empty" }, 400);
      }

      // 3. Calculate total server-side — never trust frontend
      const orderItems: {
        productId: string;
        priceSnapshot: number;
        quantity: number;
      }[] = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = getProductById(item.productId);
        if (!product) {
          return c.json(
            { error: `Product "${item.productId}" no longer available` },
            400
          );
        }
        const priceSnapshot = product.price.current;
        orderItems.push({
          productId: item.productId,
          priceSnapshot,
          quantity: item.quantity,
        });
        totalAmount += priceSnapshot * item.quantity;
      }

      // 4. Check for existing PENDING order to prevent duplicates
      const existingOrder = await db.order.findFirst({
        where: {
          userId: user.id,
          status: "PENDING",
          payment: { status: "UNPAID" },
        },
        include: { payment: true },
      });

      if (existingOrder?.payment?.intentId) {
        // Resume existing payment — don't create duplicate
        try {
          const existingIntent = await stripe.paymentIntents.retrieve(
            existingOrder.payment.intentId
          );
          if (
            existingIntent.status === "requires_payment_method" ||
            existingIntent.status === "requires_confirmation" ||
            existingIntent.status === "requires_action"
          ) {
            return c.json({
              clientSecret: existingIntent.client_secret,
              orderId: existingOrder.id,
              totalAmount: existingOrder.totalAmount,
              message: "Resuming existing checkout",
            });
          }
        } catch {
          // Intent no longer valid — continue to create new one
        }
      }

      // 5. Create Order + OrderItems + Payment placeholder in transaction
      const order = await db.$transaction(async (tx) => {
        // Cancel any stale PENDING orders for this user
        if (existingOrder) {
          await tx.order.update({
            where: { id: existingOrder.id },
            data: { status: "CANCELLED", paymentStatus: "FAILED" },
          });
          if (existingOrder.payment) {
            await tx.payment.update({
              where: { id: existingOrder.payment.id },
              data: { status: "FAILED" },
            });
          }
        }

        // Create new order
        const newOrder = await tx.order.create({
          data: {
            userId: user.id,
            totalAmount,
            status: "PENDING",
            paymentStatus: "UNPAID",
            addressId,
            items: {
              create: orderItems,
            },
          },
          include: { items: true },
        });

        return newOrder;
      });

      // 6. Create Stripe PaymentIntent with orderId as idempotency key
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(totalAmount * 100), // Stripe needs cents/paisa
          currency: "pkr",
          metadata: {
            orderId: order.id,
            userId: user.id,
          },
          automatic_payment_methods: { enabled: true },
        },
        {
          idempotencyKey: `order-${order.id}`,
        }
      );

      // 7. Create Payment record linked to order
      await db.payment.create({
        data: {
          orderId: order.id,
          provider: "stripe",
          intentId: paymentIntent.id,
          status: "UNPAID",
          amount: totalAmount,
          currency: "pkr",
        },
      });

      return c.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        totalAmount,
        message: "Checkout initialized",
      });
    }
  )

  // ─────────────────────────────────────────────────────────
  // GET /orders — list all orders for current user
  // ─────────────────────────────────────────────────────────
  .get("/", async (c) => {
    const user = c.get("user");

    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: { items: true, payment: true, address: true },
      orderBy: { createdAt: "desc" },
    });

    const enrichedOrders = orders.map((order) => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      address: order.address,
      payment: order.payment
        ? {
            provider: order.payment.provider,
            status: order.payment.status,
            amount: order.payment.amount,
          }
        : null,
      items: order.items.map((item) => {
        const product = getProductById(item.productId);
        return {
          ...item,
          product: product
            ? {
                name: product.name,
                price: product.price.current,
                image: product.images?.[0] ?? null,
              }
            : null,
        };
      }),
    }));

    return c.json({ data: enrichedOrders, total: enrichedOrders.length });
  })

  // ─────────────────────────────────────────────────────────
  // GET /orders/:id — single order detail
  // ─────────────────────────────────────────────────────────
  .get("/:id", async (c) => {
    const user = c.get("user");
    const { id } = c.req.param();

    const order = await db.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true, payment: true, address: true },
    });

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const enrichedItems = order.items.map((item) => {
      const product = getProductById(item.productId);
      return {
        ...item,
        product: product
          ? {
              name: product.name,
              price: product.price.current,
              image: product.images?.[0] ?? null,
              category: product.category,
            }
          : null,
      };
    });

    return c.json({
      data: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        address: order.address,
        payment: order.payment
          ? {
              provider: order.payment.provider,
              status: order.payment.status,
              amount: order.payment.amount,
            }
          : null,
        items: enrichedItems,
      },
    });
  });

export default app;
