import { Hono } from "hono";
import db from "@/lib/db";
import { getProductById } from "@/lib/product-loader";
import { authMiddleware } from "../../middleware/auth-middleware";

const app = new Hono()
  // All order routes require auth
  .use("/*", authMiddleware)

  // POST /checkout — convert cart → order with price snapshots
  .post("/checkout", async (c) => {
    const user = c.get("user");

    // Get user's cart with items
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return c.json({ error: "Cart is empty" }, 400);
    }

    // Build order items with price snapshots from store.ts
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

    // Create order + order items in a transaction, then clear cart
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      // Clear the cart items (keep the cart itself)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Enrich response with product data
    const enrichedItems = order.items.map((item) => {
      const product = getProductById(item.productId);
      return {
        ...item,
        product: product
          ? {
              name: product.name,
              image: product.images?.[0] ?? null,
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
        items: enrichedItems,
        createdAt: order.createdAt,
      },
      message: "Order placed successfully",
    });
  })

  // GET /orders — list all orders for current user
  .get("/", async (c) => {
    const user = c.get("user");

    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Enrich each order with product data
    const enrichedOrders = orders.map((order) => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      createdAt: order.createdAt,
      itemCount: order.items.length,
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

  // GET /orders/:id — single order with enriched product data
  .get("/:id", async (c) => {
    const user = c.get("user");
    const { id } = c.req.param();

    const order = await db.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
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
        items: enrichedItems,
      },
    });
  });

export default app;
