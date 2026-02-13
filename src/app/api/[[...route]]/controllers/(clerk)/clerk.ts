import { store } from "@/constants/store";
import { currentUser } from "@/lib/current-user";
import db from "@/lib/db";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { chatWithClerk } from "./chat-handler";
import { extractProductsFromResponse } from "./product-extractors";
import { cleanResponseForChat } from "./response-formatters";
import { executeFunctions } from "./tool-executor";

const app = new Hono()
  .get(
    "/",
    (c) => {
      return c.json({
        message: `CLERK ENDPOINT`,
        store: store.store_info.name,
        totalProducts: store.total_products,
      });
    }
  )
  .post(
    "/search",
    zValidator(
      "json",
      z.object({
        query: z.string(),
        maxResults: z.number().optional().default(5),
      })
    ),
    async (c) => {
      const { query, maxResults } = c.req.valid("json");

      try {
        const result = await executeFunctions("searchProducts", { query, maxResults });
        return c.json(result);
      } catch (error) {
        console.error("Error in product search:", error);
        return c.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
          },
          500
        );
      }
    }
  )
  .post(
    "/product/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      try {
        const result = await executeFunctions("getProductDetails", { productId: id });
        return c.json(result);
      } catch (error) {
        console.error("Error getting product details:", error);
        return c.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
          },
          500
        );
      }
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        userMessage: z.string(),
        conversationHistory: z.array(
          z.object({
            role: z.string(),
            content: z.string()
          })
        ).default([])
      })
    ),
    async (c) => {
      const { userMessage, conversationHistory } = c.req.valid("json");

      try {
        const user = await currentUser();
        const { text: rawResponse, toolProducts, functions } = await chatWithClerk(userMessage, conversationHistory, user?.id);
        let products = extractProductsFromResponse(rawResponse);
        // Fallback: use products captured from tool calls if text extraction found nothing
        if (products.length === 0 && toolProducts.length > 0) {
          products = toolProducts;
        }
        const response = cleanResponseForChat(rawResponse);

        const result: Record<string, unknown> = {
          success: true,
          response,
          products,
          functions,
        };

        // In dev mode, return the conversation history for the next request
        if (process.env.NODE_ENV === "development") {
          result.conversationHistory = [
            ...conversationHistory,
            { role: "user", content: userMessage },
            { role: "assistant", content: response },
          ];
        }

        return c.json(result);
      } catch (error) {
        console.error("Error in clerk chat:", error);
        return c.json({
          success: false,
          error: error instanceof Error ? error.message : "An error occurred"
        }, 500);
      }
    }
  )
  .post(
    "/coupon/verify",
    zValidator(
      "json",
      z.object({
        code: z.string(),
        productId: z.string(),
      })
    ),
    async (c) => {
      const { code, productId } = c.req.valid("json");

      try {
        const user = await currentUser();
        if (!user) {
          return c.json({ success: false, error: "You must be logged in to verify a coupon" }, 401);
        }

        const coupon = await db.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });

        if (!coupon) {
          return c.json({ success: false, error: "Invalid coupon code" }, 404);
        }

        if (coupon.userId !== user.id) {
          return c.json({ success: false, error: "This coupon does not belong to you" }, 403);
        }

        if (coupon.status === "USED") {
          return c.json({ success: false, error: "This coupon has already been used" }, 400);
        }

        if (coupon.status === "EXPIRED" || coupon.expiresAt < new Date()) {
          // Mark as expired if not already
          if (coupon.status !== "EXPIRED") {
            await db.coupon.update({ where: { id: coupon.id }, data: { status: "EXPIRED" } });
          }
          return c.json({ success: false, error: "This coupon has expired" }, 400);
        }

        if (coupon.productId !== productId) {
          return c.json({ success: false, error: "This coupon is not valid for this product" }, 400);
        }

        return c.json({
          success: true,
          coupon: {
            code: coupon.code,
            productId: coupon.productId,
            productName: coupon.productName,
            discountPercentage: coupon.discountPercentage,
            originalPrice: coupon.originalPrice,
            discountedPrice: coupon.discountedPrice,
            formattedOriginalPrice: `${coupon.currency} ${coupon.originalPrice.toFixed(2)}`,
            formattedDiscountedPrice: `${coupon.currency} ${coupon.discountedPrice.toFixed(2)}`,
            expiresAt: coupon.expiresAt.toISOString(),
          },
        });
      } catch (error) {
        console.error("Error verifying coupon:", error);
        return c.json({ success: false, error: "Failed to verify coupon" }, 500);
      }
    }
  )
  .post(
    "/coupon/redeem",
    zValidator(
      "json",
      z.object({
        code: z.string(),
        productId: z.string(),
      })
    ),
    async (c) => {
      const { code, productId } = c.req.valid("json");

      try {
        const user = await currentUser();
        if (!user) {
          return c.json({ success: false, error: "You must be logged in to redeem a coupon" }, 401);
        }

        const coupon = await db.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });

        if (!coupon) {
          return c.json({ success: false, error: "Invalid coupon code" }, 404);
        }

        if (coupon.userId !== user.id) {
          return c.json({ success: false, error: "This coupon does not belong to you" }, 403);
        }

        if (coupon.status === "USED") {
          return c.json({ success: false, error: "This coupon has already been used" }, 400);
        }

        if (coupon.status === "EXPIRED" || coupon.expiresAt < new Date()) {
          if (coupon.status !== "EXPIRED") {
            await db.coupon.update({ where: { id: coupon.id }, data: { status: "EXPIRED" } });
          }
          return c.json({ success: false, error: "This coupon has expired" }, 400);
        }

        if (coupon.productId !== productId) {
          return c.json({ success: false, error: "This coupon is not valid for this product" }, 400);
        }

        // Mark coupon as used
        const redeemedCoupon = await db.coupon.update({
          where: { id: coupon.id },
          data: { status: "USED", usedAt: new Date() },
        });

        return c.json({
          success: true,
          coupon: {
            code: redeemedCoupon.code,
            productId: redeemedCoupon.productId,
            productName: redeemedCoupon.productName,
            discountPercentage: redeemedCoupon.discountPercentage,
            originalPrice: redeemedCoupon.originalPrice,
            discountedPrice: redeemedCoupon.discountedPrice,
            formattedDiscountedPrice: `${redeemedCoupon.currency} ${redeemedCoupon.discountedPrice.toFixed(2)}`,
            usedAt: redeemedCoupon.usedAt?.toISOString(),
          },
          message: "Coupon redeemed successfully!",
        });
      } catch (error) {
        console.error("Error redeeming coupon:", error);
        return c.json({ success: false, error: "Failed to redeem coupon" }, 500);
      }
    }
  )

export default app;
