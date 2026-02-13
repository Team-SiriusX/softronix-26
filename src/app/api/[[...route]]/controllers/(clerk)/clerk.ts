import { store } from "@/constants/store";
import { openRouter } from "@/lib/open-router";
import { upstash_index } from "@/lib/vector";
import { zValidator } from "@hono/zod-validator";
import type { Message } from "@openrouter/sdk/models";
import { Hono } from "hono";
import z from "zod";

const systemPrompt = `You are an AI shopping clerk for ${store.store_info.name}. 
Your role is to help customers find products, check availability, and assist with purchases.

Store Information:
- Website: ${store.store_info.website}
- Description: ${store.store_info.description}
- Contact: ${store.store_info.contact.email}, ${store.store_info.contact.phone}

Guidelines:
- Be helpful, friendly, and conversational
- Use semantic search to find the most relevant products based on customer needs
- Always check inventory before confirming availability
- You can negotiate discounts (max 20% off) for good reasons
- If user is rude, politely decline or increase price by 5%
- When showing products, display rich schemas with name, price, rating, and product link
- Use the retrieved product context to provide accurate information

Bottom price rule: Never go below 70% of original price.`;

// Define available tools for the AI clerk in OpenRouter format
const tools = [
  {
    type: "function" as const,
    function: {
      name: "searchProducts",
      description: "Search for products based on keywords, category, or description. Use this when customer asks about products, needs recommendations, or searches for specific items.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query (keywords, category, or description)"
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return (default: 5)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getProductDetails",
      description: "Get detailed information about a specific product by ID. Use this when customer asks for more information about a specific product.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The unique identifier of the product"
          }
        },
        required: ["productId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "checkAvailability",
      description: "Check if a product is in stock. Use this when customer wants to know if a product is available for purchase.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The product ID to check availability for"
          }
        },
        required: ["productId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "applyDiscount",
      description: "Apply a discount to a product (max 20%, never below 70% of original price). Use this when negotiating price or customer requests a discount with valid reason.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The product ID"
          },
          discountPercentage: {
            type: "number",
            description: "The discount percentage to apply (0-20)"
          },
          reason: {
            type: "string",
            description: "The reason for the discount"
          }
        },
        required: ["productId", "discountPercentage", "reason"]
      }
    }
  }
];

function repairIncompleteJson(input: string): string {
  let inString = false;
  let escaped = false;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (const char of input) {
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") braceDepth++;
    if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
    if (char === "[") bracketDepth++;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
  }

  let repaired = input;
  if (inString) repaired += '"';
  if (bracketDepth > 0) repaired += "]".repeat(bracketDepth);
  if (braceDepth > 0) repaired += "}".repeat(braceDepth);

  return repaired;
}

function parseToolArguments(rawArguments: unknown): Record<string, unknown> {
  if (!rawArguments) return {};

  if (typeof rawArguments === "object") {
    return rawArguments as Record<string, unknown>;
  }

  if (typeof rawArguments !== "string") {
    return {};
  }

  const trimmed = rawArguments.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    try {
      const repaired = repairIncompleteJson(trimmed);
      return JSON.parse(repaired) as Record<string, unknown>;
    } catch {
      return { rawArguments: trimmed };
    }
  }
}

function extractProviderErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const errorRecord = error as Record<string, unknown>;

  const parseJsonLike = (value: unknown): Record<string, unknown> | null => {
    if (!value) return null;

    if (typeof value === "object") {
      return value as Record<string, unknown>;
    }

    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
      return null;
    }

    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  const candidates = [
    parseJsonLike(errorRecord.rawValue),
    parseJsonLike(errorRecord.body),
    parseJsonLike((errorRecord.cause as Record<string, unknown> | undefined)?.body),
  ].filter(Boolean) as Array<Record<string, unknown>>;

  for (const candidate of candidates) {
    const errorData = candidate.error as Record<string, unknown> | undefined;
    if (!errorData) continue;

    const provider = (errorData.metadata as Record<string, unknown> | undefined)?.provider_name;
    const message = errorData.message;

    if (typeof message === "string" && message.trim()) {
      return provider && typeof provider === "string"
        ? `${provider}: ${message}`
        : message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return null;
}

async function sendOpenRouterChat(messages: Message[]) {
  try {
    return await openRouter.chat.send({
      chatGenerationParams: {
        model: "arcee-ai/trinity-mini:free",
        messages,
        tools,
        toolChoice: "auto",
      },
    });
  } catch (error) {
    const providerErrorMessage = extractProviderErrorMessage(error);
    if (providerErrorMessage) {
      throw new Error(`OpenRouter request failed: ${providerErrorMessage}`);
    }

    throw error;
  }
}

function buildFallbackClerkResponse(
  userMessage: string,
  relevantProducts: Array<{ id: string; metadata?: Record<string, unknown> }> | undefined
): string {
  if (!relevantProducts || relevantProducts.length === 0) {
    return "I'm having trouble reaching my AI provider right now, but I can still help. I couldn't find strong product matches yet—please share a bit more detail like category, budget, or skin type and I'll narrow it down.";
  }

  const topProducts = relevantProducts.slice(0, 3);
  const lines = topProducts.map((product, index) => {
    const name = (product.metadata?.name as string) || "Product";
    const price = (product.metadata?.formatted_price as string) || "Price unavailable";
    const rating = (product.metadata?.rating as number) || 0;
    const reviewCount = (product.metadata?.review_count as number) || 0;
    const url = (product.metadata?.url as string) || "";

    return `${index + 1}. ${name} — ${price} | ⭐ ${rating}/5 (${reviewCount} reviews)${url ? ` | ${url}` : ""}`;
  });

  return [
    "I'm having trouble reaching my AI provider right now, but I can still help using available product matches.",
    `Based on your request: \"${userMessage}\"`,
    "",
    "Top suggestions:",
    ...lines,
    "",
    "If you want, I can refine these by budget, brand, skin type, or ingredient preference.",
  ].join("\n");
}

// Execute function calls from the AI
async function executeFunctions(functionName: string, functionArgs: Record<string, unknown>) {
  switch (functionName) {
    case "searchProducts": {
      const query = functionArgs.query as string;
      const maxResults = (functionArgs.maxResults as number) || 5;

      if (typeof query !== "string" || query.trim().length === 0) {
        return { success: false, error: "Missing required argument: query" };
      }

      try {
        // Use RAG: Search vector database for semantically similar products
        const vectorResults = await upstash_index.query({
          data: query,
          topK: maxResults,
          includeVectors: false,
          includeMetadata: true,
        });

        if (!vectorResults || vectorResults.length === 0) {
          return {
            success: true,
            results: [],
            message: "No products found matching your search."
          };
        }

        const results = vectorResults.map((result) => ({
          id: result.id,
          name: result.metadata?.name as string,
          price: {
            current: result.metadata?.price as number,
            formatted: result.metadata?.formatted_price as string,
          },
          category: result.metadata?.category as string,
          description: result.metadata?.description as string || "",
          rating: result.metadata?.rating as number,
          reviewCount: result.metadata?.review_count as number,
          inStock: result.metadata?.stock_status === "in_stock",
          url: result.metadata?.url as string,
          image: result.metadata?.image as string,
          relevanceScore: result.score,
        }));

        return {
          success: true,
          results,
          searchQuery: query,
        };
      } catch (error) {
        console.error("Vector search error:", error);
        // Fallback to local search
        const categoryString = (category: string | string[] | undefined) => {
          if (!category) return "";
          return Array.isArray(category) ? category.join(" ") : category;
        };

        const results = store.products
          .filter(
            (product) =>
              product.name.toLowerCase().includes(query.toLowerCase()) ||
              categoryString(product.category).toLowerCase().includes(query.toLowerCase()) ||
              product.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, maxResults);

        return {
          success: true,
          results: results.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: Array.isArray(p.category) ? p.category.join(", ") : p.category,
            description: p.description,
            rating: p.reviews?.average_rating || 0,
            reviewCount: p.reviews?.count || 0,
            inStock: p.stock_status === "in_stock",
            url: p.url,
          })),
        };
      }
    }

    case "getProductDetails": {
      const productId = functionArgs.productId as string;
      if (typeof productId !== "string" || productId.trim().length === 0) {
        return { success: false, error: "Missing required argument: productId" };
      }
      const product = store.products.find((p) => p.id === productId);

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          extendedDescription: product.extendedDescription,
          rating: product.reviews?.average_rating || 0,
          reviewCount: product.reviews?.count || 0,
          reviewSummary: product.reviews?.summary,
          inStock: product.stock_status === "in_stock",
          url: product.url,
          images: product.images,
          key_features: product.key_features,
          key_benefits: product.key_benefits,
          ingredients: product.ingredients,
        },
      };
    }

    case "checkAvailability": {
      const productId = functionArgs.productId as string;
      if (typeof productId !== "string" || productId.trim().length === 0) {
        return { success: false, error: "Missing required argument: productId" };
      }
      const product = store.products.find((p) => p.id === productId);

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      return {
        success: true,
        productId,
        inStock: product.stock_status === "in_stock",
        stockStatus: product.stock_status,
      };
    }

    case "applyDiscount": {
      const productId = functionArgs.productId as string;
      const discountPercentage = functionArgs.discountPercentage as number;
      const reason = functionArgs.reason as string;

      if (typeof productId !== "string" || productId.trim().length === 0) {
        return { success: false, error: "Missing required argument: productId" };
      }
      if (typeof discountPercentage !== "number" || Number.isNaN(discountPercentage)) {
        return { success: false, error: "Missing or invalid argument: discountPercentage" };
      }
      if (typeof reason !== "string" || reason.trim().length === 0) {
        return { success: false, error: "Missing required argument: reason" };
      }

      const product = store.products.find((p) => p.id === productId);

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      // Validate discount rules
      const maxDiscount = 20;
      const minPricePercent = 70;
      const actualDiscount = Math.min(discountPercentage, maxDiscount);
      const originalPrice = product.price.current;
      const discountedPrice = originalPrice * (1 - actualDiscount / 100);
      const minimumPrice = originalPrice * (minPricePercent / 100);

      if (discountedPrice < minimumPrice) {
        return {
          success: false,
          error: `Cannot apply ${actualDiscount}% discount. Minimum price is ${product.price.currency} ${minimumPrice.toFixed(2)}`,
        };
      }

      return {
        success: true,
        productId,
        productName: product.name,
        originalPrice: originalPrice,
        discountPercentage: actualDiscount,
        discountedPrice: discountedPrice,
        formattedPrice: `${product.price.currency} ${discountedPrice.toFixed(2)}`,
        reason,
      };
    }

    default:
      return { success: false, error: "Unknown function" };
  }
}

// Main chat function using OpenRouter SDK with RAG and Tool Calling
async function chatWithClerk(userMessage: string, conversationHistory: Array<{ role: string; content: string }>) {
  try {
    console.log("🤖 Clerk received message:", userMessage);

    // Step 1: Use RAG to retrieve relevant product context
    const relevantProducts = await upstash_index.query({
      data: userMessage,
      topK: 5,
      includeVectors: false,
      includeMetadata: true,
    });

    console.log(`📦 Found ${relevantProducts?.length || 0} relevant products via RAG`);

    // Build context from retrieved products
    let contextualInfo = "";
    if (relevantProducts && relevantProducts.length > 0) {
      contextualInfo = "\n\nRelevant Products Found:\n";
      relevantProducts.forEach((result, idx) => {
        contextualInfo += `${idx + 1}. ${result.metadata?.name} (ID: ${result.id}) - ${result.metadata?.formatted_price}\n`;
        contextualInfo += `   Category: ${result.metadata?.category}\n`;
        contextualInfo += `   Rating: ${result.metadata?.rating}/5 (${result.metadata?.review_count} reviews)\n`;
        contextualInfo += `   URL: ${result.metadata?.url}\n`;
        contextualInfo += `   In Stock: ${result.metadata?.stock_status === "in_stock" ? "Yes" : "No"}\n\n`;
      });
    }

    // Enhanced system prompt with RAG context
    const enhancedSystemPrompt = systemPrompt + contextualInfo;

    // Prepare messages for the API call
    const historyMessages = conversationHistory.reduce<Message[]>((accumulator, msg) => {
      if (msg.role === "user") {
        accumulator.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        accumulator.push({ role: "assistant", content: msg.content });
      } else if (msg.role === "system") {
        accumulator.push({ role: "system", content: msg.content });
      }

      return accumulator;
    }, []);

    const messages: Message[] = [
      { role: "system", content: enhancedSystemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage },
    ];

    // Step 2: Call OpenRouter API with tools
    console.log("🔧 Calling OpenRouter with tools enabled...");
    let response;
    try {
      response = await sendOpenRouterChat(messages);
    } catch (error) {
      console.error("OpenRouter initial call failed, using fallback response:", error);
      return buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined);
    }

    let assistantMessage = response.choices[0]?.message;

    // Step 3: Handle tool calls if present
    const maxIterations = 5; // Prevent infinite loops
    let iteration = 0;

    while (assistantMessage?.toolCalls && assistantMessage.toolCalls.length > 0 && iteration < maxIterations) {
      iteration++;
      console.log(`🛠️ Iteration ${iteration}: Model requested ${assistantMessage.toolCalls.length} tool call(s)`);

      // Add assistant's message with tool calls to conversation
      messages.push({
        role: 'assistant',
        content: assistantMessage.content || "",
        toolCalls: assistantMessage.toolCalls,
      });

      // Execute each tool call
      for (const toolCall of assistantMessage.toolCalls) {
        try {
          const functionName = toolCall.function.name;
          const functionArgs = parseToolArguments(toolCall.function.arguments);

          if (functionName === "searchProducts") {
            const query = functionArgs.query;
            if (typeof query !== "string" || query.trim().length === 0) {
              functionArgs.query = userMessage;
            }
          }

          console.log(`✅ Executing tool: ${functionName}`, functionArgs);

          // Execute the function
          const functionResult = await executeFunctions(functionName, functionArgs);

          console.log(`✅ Tool result:`, functionResult);

          // Add tool result to messages
          messages.push({
            role: 'tool',
            content: JSON.stringify(functionResult),
            toolCallId: toolCall.id,
          });
        } catch (error) {
          console.error("Error executing tool:", error);
          messages.push({
            role: 'tool',
            content: JSON.stringify({ success: false, error: "Failed to execute tool" }),
            toolCallId: toolCall.id,
          });
        }
      }

      // Get next response from model with tool results
      try {
        response = await sendOpenRouterChat(messages);
      } catch (error) {
        console.error("OpenRouter follow-up call failed, using fallback response:", error);
        return buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined);
      }

      assistantMessage = response.choices[0]?.message;
    }

    // Return final response
    console.log("✨ Generating final response...");

    if (!assistantMessage || !assistantMessage.content) {
      return "I apologize, but I couldn't process your request. Please try again.";
    }

    console.log("✅ Response generated successfully");
    return assistantMessage.content;
  } catch (error) {
    console.error("Error in chatWithClerk:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
}


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
        const response = await chatWithClerk(userMessage, conversationHistory);

        return c.json({
          success: true,
          response
        });
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
