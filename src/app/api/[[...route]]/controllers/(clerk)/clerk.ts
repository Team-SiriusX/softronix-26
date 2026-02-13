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
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
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

type ChatbotProduct = {
  name: string;
  price: string;
  rating: number | null;
  reviewCount: number | null;
  url: string | null;
};

function extractUrl(value: string): string | null {
  const markdownMatch = value.match(/\((https?:\/\/[^)\s]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];

  const angleBracketMatch = value.match(/<(https?:\/\/[^>\s]+)>/i);
  if (angleBracketMatch?.[1]) return angleBracketMatch[1];

  const plainMatch = value.match(/(https?:\/\/\S+)/i);
  if (plainMatch?.[1]) return plainMatch[1].replace(/[)>.,]$/, "");

  return null;
}

function cleanResponseForChat(text: string): string {
  const lines = text.split("\n");

  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    // Remove markdown table rows (| ... |) and divider rows (|---|---|)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) return false;
    // Remove product heading lines like "### 1. Glow Face Wash"
    if (/^#{1,4}\s*\d+[\.)\s]/.test(trimmed)) return false;
    // Remove bullet lines with product metadata (Price, Rating, Category, Product link)
    if (/^[-*]\s*\*\*(?:Price|Rating|Category|Product\s*link|Availability|Reviews?|Link)[:\s]*\*\*/i.test(trimmed)) return false;
    return true;
  });

  let result = cleaned.join("\n");

  // Remove angle-bracket URLs: <https://...>
  result = result.replace(/<(https?:\/\/[^>\s]+)>/gi, "");

  // Replace markdown links [text](url) with just the text
  result = result.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1");

  // Remove bare URLs
  result = result.replace(/https?:\/\/\S+/gi, "");

  // Collapse 3+ consecutive blank lines into 2
  result = result.replace(/(\n\s*){3,}/g, "\n\n");

  return result.trim();
}

function lookupProductUrl(name: string): string | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = store.products.find((p) => {
    const pNormalized = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return pNormalized === normalized || pNormalized.includes(normalized) || normalized.includes(pNormalized);
  });
  return match?.url ?? null;
}

function extractProductsFromResponse(responseText: string): ChatbotProduct[] {
  // Strategy 1: Markdown table
  const tableProducts = extractFromTable(responseText);
  if (tableProducts.length > 0) return tableProducts;

  // Strategy 2: Heading + bullet list (### 1. Product Name / - **Price:** ...)
  const headingProducts = extractFromHeadingList(responseText);
  if (headingProducts.length > 0) return headingProducts;

  // Strategy 3: Simple numbered list (1. Name — Price | ⭐ ...)
  return extractFromNumberedList(responseText);
}

function extractFromTable(responseText: string): ChatbotProduct[] {
  const lines = responseText.split("\n").map((l) => l.trim());

  return lines
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((c) => c.trim()))
    .filter((cells) => cells.length >= 3)
    .filter((cells) => {
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return false;
      const headerKws = ["product", "price", "rating", "reviews", "link", "category", "quick link", "name", "status", "stock", "availability"];
      const hits = cells.filter((c) => {
        const lower = c.toLowerCase().replace(/[^a-z\s]/g, "").trim();
        return headerKws.some((kw) => lower === kw || lower.includes(kw));
      });
      return hits.length < 2;
    })
    .map((cells): ChatbotProduct | null => {
      const name = cells[0].replace(/\*\*/g, "").trim();

      let url: string | null = null;
      for (const cell of cells) {
        const found = extractUrl(cell);
        if (found) { url = found; break; }
      }

      let price = "";
      for (const cell of cells) {
        if (/(?:Rs|₹|\$|€|£)[\s.]*[\d,]+/.test(cell)) { price = cell; break; }
      }

      let rating: number | null = null;
      let reviewCount: number | null = null;
      for (const cell of cells) {
        const rm = cell.match(/([\d.]+)\s*[\/\s]+5/i);
        const rvm = cell.match(/\(\s*(\d+)\s+reviews?\)/i);
        const sc = cell.match(/^\s*(\d+)\s*$/);
        if (rm && rating === null) rating = Number.parseFloat(rm[1]);
        if (rvm && reviewCount === null) reviewCount = Number.parseInt(rvm[1], 10);
        else if (sc && reviewCount === null && rating !== null) reviewCount = Number.parseInt(sc[1], 10);
      }

      return { name, price, rating, reviewCount, url };
    })
    .filter((item): item is ChatbotProduct => item !== null);
}

function extractFromHeadingList(responseText: string): ChatbotProduct[] {
  // Split on heading patterns like "### 1. Glow Face Wash" or "## 2) Product"
  const blocks = responseText.split(/(?=#{1,4}\s*\d+[.)\s])/g);
  const products: ChatbotProduct[] = [];

  for (const block of blocks) {
    const headerMatch = block.match(/#{1,4}\s*\d+[.)\s]+(.+)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].replace(/\*\*/g, "").trim();

    // Price: match "**Price:** Rs. 899.00" or "Price: Rs 899"
    const priceMatch = block.match(/\*\*Price[:\s]\*\*\s*([^\n]+)/i) || block.match(/Price[:\s]+([^\n]+)/i);
    const price = priceMatch ? priceMatch[1].replace(/\*\*/g, "").trim() : "";

    // Rating: match "4.5 / 5" or "4.5/5"
    const ratingMatch = block.match(/([\d.]+)\s*[\/\s]+5/i);
    const rating = ratingMatch ? Number.parseFloat(ratingMatch[1]) : null;

    // Reviews: match "(68 reviews)" or "68 reviews"
    const reviewMatch = block.match(/\(\s*(\d+)\s+reviews?\)/i);
    const reviewCount = reviewMatch ? Number.parseInt(reviewMatch[1], 10) : null;

    // URL: from block text or store lookup
    const url = extractUrl(block) ?? lookupProductUrl(name);

    products.push({ name, price, rating, reviewCount, url });
  }

  return products;
}

function extractFromNumberedList(responseText: string): ChatbotProduct[] {
  const lines = responseText.split("\n").map((l) => l.trim());

  return lines
    .map((line): ChatbotProduct | null => {
      const m = line.match(/^\d+[.)\s]+\*{0,2}(.+?)\*{0,2}\s+[—–\-]\s+(.+?)\s+\|\s+[⭐★]\s*([\d.]+)\s*\/\s*5\s*\((\d+)\s+reviews?\)\s*(?:\|\s*(https?:\/\/\S+))?$/i);
      if (!m) return null;

      const name = m[1].trim();
      return {
        name,
        price: m[2].trim(),
        rating: Number.parseFloat(m[3]),
        reviewCount: Number.parseInt(m[4], 10),
        url: m[5]?.trim() ?? lookupProductUrl(name),
      };
    })
    .filter((item): item is ChatbotProduct => item !== null);
}
function normalizeAssistantContent(content: Message["content"]): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          const text = item.text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter((part) => part.length > 0)
      .join("\n");
  }

  return "";
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

type ClerkResponse = {
  text: string;
  toolProducts: ChatbotProduct[];
};

// Main chat function using OpenRouter SDK with RAG and Tool Calling
async function chatWithClerk(userMessage: string, conversationHistory: Array<{ role: string; content: string }>): Promise<ClerkResponse> {
  const toolProducts: ChatbotProduct[] = [];
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
      return { text: buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined), toolProducts };
    }

    let assistantMessage = response.choices[0]?.message;

    // Step 3: Handle tool calls if present
    const maxIterations = 5; // Prevent infinite loops
    let iteration = 0;

    while (assistantMessage?.toolCalls && assistantMessage.toolCalls.length > 0 && iteration < maxIterations) {
      iteration++;
      console.log(`🛠️ Iteration ${iteration}: Model requested ${assistantMessage.toolCalls.length} tool call(s)`);

      // Add assistant's message with tool calls to conversation
      const assistantContent = normalizeAssistantContent(assistantMessage.content);

      messages.push({
        role: 'assistant',
        content: assistantContent,
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

          // Capture products from searchProducts tool calls
          if (functionName === "searchProducts" && functionResult.success && Array.isArray(functionResult.results)) {
            for (const r of functionResult.results) {
              toolProducts.push({
                name: r.name ?? "Product",
                price: r.price?.formatted ?? (typeof r.price === "string" ? r.price : ""),
                rating: r.rating ?? null,
                reviewCount: r.reviewCount ?? null,
                url: r.url ?? null,
              });
            }
          }

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
        return { text: buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined), toolProducts };
      }

      assistantMessage = response.choices[0]?.message;
    }

    // Return final response
    console.log("✨ Generating final response...");

    if (!assistantMessage || !assistantMessage.content) {
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts };
    }

    console.log("✅ Response generated successfully");
    const finalContent = normalizeAssistantContent(assistantMessage.content);
    if (!finalContent.trim()) {
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts };
    }

    return { text: finalContent, toolProducts };
  } catch (error) {
    console.error("Error in chatWithClerk:", error);
    return { text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.", toolProducts: [] };
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
        const { text: rawResponse, toolProducts } = await chatWithClerk(userMessage, conversationHistory);
        let products = extractProductsFromResponse(rawResponse);
        // Fallback: use products captured from tool calls if text extraction found nothing
        if (products.length === 0 && toolProducts.length > 0) {
          products = toolProducts;
        }
        const response = cleanResponseForChat(rawResponse);

        return c.json({
          success: true,
          response,
          products,
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
