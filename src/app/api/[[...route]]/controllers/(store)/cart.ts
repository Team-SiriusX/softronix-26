import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import db from "@/lib/db";
import { getProductById } from "@/lib/product-loader";
import { authMiddleware } from "../../middleware/auth-middleware";

const app = new Hono()
  // All cart routes require auth — Better Auth session check
  .use("/*", authMiddleware)

  // GET /cart — get active cart with enriched product data
  .get("/", async (c) => {
    const user = c.get("user");

    // Find or create user's cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: { items: true },
      });
    }

    // Enrich cart items with product data from store.ts
    const enrichedItems = cart.items.map((item) => {
      const product = getProductById(item.productId);
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: product
          ? {
              name: product.name,
              price: product.price.current,
              image: product.images?.[0] ?? null,
              formattedPrice: product.price.formatted,
            }
          : null,
        subtotal: product ? product.price.current * item.quantity : 0,
      };
    });

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return c.json({
      data: {
        id: cart.id,
        items: enrichedItems,
        itemCount: enrichedItems.length,
        total,
      },
    });
  })

  // POST /cart/add — add item to cart
  .post(
    "/add",
    zValidator(
      "json",
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { productId, quantity } = c.req.valid("json");

      // Validate product exists in store
      const product = getProductById(productId);
      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }

      // Find or create cart
      let cart = await db.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        cart = await db.cart.create({
          data: { userId: user.id },
        });
      }

      // Upsert cart item (increment if already exists)
      const existingItem = await db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      let cartItem;
      if (existingItem) {
        cartItem = await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        cartItem = await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      return c.json({
        data: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: {
            name: product.name,
            price: product.price.current,
            image: product.images?.[0] ?? null,
          },
        },
        message: "Item added to cart",
      });
    }
  )

  // POST /cart/update — update item quantity
  .post(
    "/update",
    zValidator(
      "json",
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { productId, quantity } = c.req.valid("json");

      const cart = await db.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        return c.json({ error: "Cart not found" }, 404);
      }

      const existingItem = await db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (!existingItem) {
        return c.json({ error: "Item not in cart" }, 404);
      }

      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });

      return c.json({
        data: {
          id: updated.id,
          productId: updated.productId,
          quantity: updated.quantity,
        },
        message: "Cart updated",
      });
    }
  )

  // POST /cart/remove — remove item from cart
  .post(
    "/remove",
    zValidator(
      "json",
      z.object({
        productId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { productId } = c.req.valid("json");

      const cart = await db.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        return c.json({ error: "Cart not found" }, 404);
      }

      const existingItem = await db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (!existingItem) {
        return c.json({ error: "Item not in cart" }, 404);
      }

      await db.cartItem.delete({
        where: { id: existingItem.id },
      });

      return c.json({ message: "Item removed from cart" });
    }
  )

  // POST /cart/sync — merge localStorage items into DB cart (called on login)
  .post(
    "/sync",
    zValidator(
      "json",
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          })
        ),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const { items } = c.req.valid("json");

      // Find or create cart
      let cart = await db.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        cart = await db.cart.create({
          data: { userId: user.id },
        });
      }

      // Upsert each item from local cart
      for (const item of items) {
        const product = getProductById(item.productId);
        if (!product) continue; // skip invalid products

        const existing = await db.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId,
            },
          },
        });

        if (existing) {
          await db.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await db.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }

      // Return the merged cart
      const mergedCart = await db.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      });

      const enrichedItems = (mergedCart?.items ?? []).map((item) => {
        const product = getProductById(item.productId);
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: product
            ? {
                name: product.name,
                price: product.price.current,
                image: product.images?.[0] ?? null,
                formattedPrice: product.price.formatted,
              }
            : null,
          subtotal: product ? product.price.current * item.quantity : 0,
        };
      });

      const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

      return c.json({
        data: {
          id: mergedCart!.id,
          items: enrichedItems,
          itemCount: enrichedItems.length,
          total,
        },
        message: "Cart synced successfully",
      });
    }
  );

export default app;
