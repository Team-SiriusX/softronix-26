import { store } from "@/constants/store";
import { currentUser } from "@/lib/current-user";
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

export default app;
