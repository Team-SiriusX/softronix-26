import { upstash_index } from "@/lib/vector";
import { store } from "@/constants/store";
import db from "@/lib/db";
import { getProductById } from "@/lib/product-loader";
import type { Message } from "@openrouter/sdk/models";
import { systemPrompt } from "./config";
import { sendOpenRouterChat } from "./openrouter-client";
import { buildFallbackClerkResponse } from "./response-formatters";
import { executeFunctions } from "./tool-executor";
import type { ChatbotProduct, ClerkRpcCall, ClerkResponse, ConversationMessage } from "./types";
import { normalizeAssistantContent, parseToolArguments } from "./utils";

/**
 * Build a context string describing the user's past activity:
 * - Current cart items
 * - Recent order history (last 5 orders)
 */
async function buildUserActivityContext(userId: string): Promise<string> {
  let activityContext = "\n\nUser Past Activity & Preferences:\n";
  let hasData = false;

  try {
    // Fetch current cart items
    const cartItems = await db.cartItem.findMany({
      where: { cart: { userId } },
      select: { productId: true, quantity: true },
    });

    if (cartItems.length > 0) {
      hasData = true;
      activityContext += "Current Cart:\n";
      for (const item of cartItems) {
        const product = getProductById(item.productId);
        if (product) {
          activityContext += `- ${product.name} (x${item.quantity}) — ${product.price.formatted}, Category: ${product.category.join(", ")}\n`;
        }
      }
      activityContext += "\n";
    }

    // Fetch recent orders (last 5)
    const recentOrders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: { select: { productId: true, quantity: true, priceSnapshot: true } },
      },
    });

    if (recentOrders.length > 0) {
      hasData = true;
      activityContext += "Recent Order History:\n";
      for (const order of recentOrders) {
        const itemNames = order.items
          .map((item) => {
            const product = getProductById(item.productId);
            return product ? `${product.name} (x${item.quantity})` : `Product ${item.productId} (x${item.quantity})`;
          })
          .join(", ");
        activityContext += `- Order ${order.id.slice(-6)} (${order.status}): ${itemNames}\n`;
      }
      activityContext += "\n";

      // Extract categories the user tends to buy
      const purchasedCategories = new Set<string>();
      for (const order of recentOrders) {
        for (const item of order.items) {
          const product = getProductById(item.productId);
          if (product) {
            product.category.forEach((c) => purchasedCategories.add(c));
          }
        }
      }
      if (purchasedCategories.size > 0) {
        activityContext += `Preferred Categories: ${Array.from(purchasedCategories).join(", ")}\n`;
      }
    }
  } catch (error) {
    console.error("Error building user activity context:", error);
  }

  if (!hasData) {
    activityContext += "No previous orders or cart items found. This may be a new customer.\n";
  }

  activityContext += "\nUse this activity data to personalize product recommendations. When asked for recommendations based on past activity, suggest products from similar categories or complementary items to what the user has purchased or has in their cart.\n";

  return activityContext;
}

/**
 * When the model returns empty text content but tools executed successfully,
 * build a contextual fallback message based on which RPC actions were captured.
 */
function buildToolSuccessFallback(functions: ClerkRpcCall[]): string {
  const parts: string[] = [];

  for (const fn of functions) {
    const args = fn.args as Record<string, unknown>;
    switch (fn.name) {
      case "applyCoupon":
        parts.push(`Great news! 🎉 Your coupon **${args.couponCode}** has been applied! You now get **${args.discountPercentage}% off** — the new price is **${args.formattedDiscountedPrice}**. Enjoy your purchase!`);
        break;
      case "adjustPrice": {
        const adjustCount = functions.filter((f) => f.name === "adjustPrice").length;
        if (adjustCount > 1) {
          parts.push(`Due to inappropriate behavior, prices for **all products** have been increased by ${args.increasePercentage}%. Please be respectful and I'll be happy to help you find great deals.`);
        } else {
          parts.push(`Due to inappropriate behavior, the price has been adjusted upward by ${args.increasePercentage}% to **${args.formattedPrice}**. Please be respectful and I'll be happy to help you find great deals.`);
        }
        break;
      }
      case "navigateToProduct":
        parts.push(`I've pulled up the product page for you — take a look! 👀`);
        break;
      case "filterProducts":
      case "sortProducts":
        parts.push(`I've updated the products view for you. Check it out! ✨`);
        break;
      default:
        break;
    }
  }

  return parts.length > 0
    ? parts.join("\n\n")
    : "I've processed your request! Let me know if there's anything else I can help with. 😊";
}

// Main chat function using OpenRouter SDK with RAG and Tool Calling
export async function chatWithClerk(userMessage: string, conversationHistory: ConversationMessage[], userId?: string | null): Promise<ClerkResponse> {
  const toolProducts: ChatbotProduct[] = [];
  const functions: ClerkRpcCall[] = [];
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

    // Enhanced system prompt with RAG context and auth status
    const authContext = userId
      ? "\n\nUser Authentication: The user IS logged in. You may generate coupons for them."
      : "\n\nUser Authentication: The user is NOT logged in. Do NOT attempt to generate coupons. If the user asks for a discount or coupon, politely tell them they need to sign in first to receive discounts, and let them know you'll help them get a great deal once they're logged in.";

    // Build user activity context (cart + order history) for personalized recommendations
    const userActivityContext = userId ? await buildUserActivityContext(userId) : "";

    const enhancedSystemPrompt = systemPrompt + authContext + userActivityContext + contextualInfo;

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
      return { text: buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined), toolProducts, functions };
    }

    let assistantMessage = response.choices[0]?.message;

    // Step 3: Handle tool calls if present
    const maxIterations = 3; // Keep fast — 3 max round-trips
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
          const functionResult = await executeFunctions(functionName, functionArgs, userId);

          // Capture product IDs from searchProducts tool calls
          if (functionName === "searchProducts" && functionResult.success && Array.isArray(functionResult.results)) {
            for (const r of functionResult.results) {
              if (r.id) {
                toolProducts.push({
                  id: r.id as string,
                  name: (r.name as string) ?? "Product",
                });
              }
            }
          }

          // Capture UI actions as frontend RPC calls
          if (functionName === "triggerUIAction" && functionResult.success) {
            functions.push({
              name: functionResult.action as string,
              args: (functionResult.args as Record<string, unknown>) ?? {},
            });
          }

          // Capture coupon generation as frontend RPC call
          if (functionName === "generateCoupon" && functionResult.success) {
            const coupon = functionResult.coupon as Record<string, unknown>;
            functions.push({
              name: "applyCoupon",
              args: {
                couponCode: coupon.code,
                productId: coupon.productId,
                discountPercentage: coupon.discountPercentage,
                originalPrice: coupon.originalPrice,
                discountedPrice: coupon.discountedPrice,
                formattedOriginalPrice: coupon.formattedOriginalPrice,
                formattedDiscountedPrice: coupon.formattedDiscountedPrice,
              },
            });
          }

          // If coupon generation failed due to auth, push requireAuth RPC
          if (functionName === "generateCoupon" && !functionResult.success) {
            const errorMsg = (functionResult as Record<string, unknown>).error as string | undefined;
            if (errorMsg?.toLowerCase().includes("logged in") || errorMsg?.toLowerCase().includes("sign in")) {
              functions.push({
                name: "requireAuth",
                args: { reason: "coupon_generation" },
              });
            }
          }

          // Capture price adjustment as frontend RPC call
          if (functionName === "adjustPrice" && functionResult.success) {
            if (functionResult.productId === "all" && Array.isArray(functionResult.adjustments)) {
              // Bulk adjustment — push one RPC per product
              for (const adj of functionResult.adjustments as Array<{ productId: string; adjustedPrice: number; formattedPrice: string }>) {
                functions.push({
                  name: "adjustPrice",
                  args: {
                    productId: adj.productId,
                    adjustedPrice: adj.adjustedPrice,
                    formattedPrice: adj.formattedPrice,
                    increasePercentage: functionResult.increasePercentage as number,
                  },
                });
              }
            } else {
              functions.push({
                name: "adjustPrice",
                args: {
                  productId: functionResult.productId as string,
                  adjustedPrice: functionResult.adjustedPrice as number,
                  formattedPrice: functionResult.formattedPrice as string,
                  increasePercentage: functionResult.increasePercentage as number,
                },
              });
            }
          }

          // Capture standalone applyCoupon calls (AI sometimes calls it directly
          // instead of via triggerUIAction). This is a fallback — the primary
          // capture happens via generateCoupon above.
          if (functionName === "applyCoupon" && functionResult.success) {
            const alreadyHasCoupon = functions.some(
              (fn) => fn.name === "applyCoupon" && (fn.args as Record<string, unknown>).couponCode === (functionResult.args as Record<string, unknown>)?.couponCode
            );
            if (!alreadyHasCoupon) {
              functions.push({
                name: functionResult.action as string,
                args: (functionResult.args as Record<string, unknown>) ?? {},
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
        return { text: buildFallbackClerkResponse(userMessage, relevantProducts as Array<{ id: string; metadata?: Record<string, unknown> }> | undefined), toolProducts, functions };
      }

      assistantMessage = response.choices[0]?.message;
    }

    // Return final response
    console.log("✨ Generating final response...");

    if (!assistantMessage || !assistantMessage.content) {
      // If tools executed successfully but model returned no text, build a contextual fallback
      if (functions.length > 0) {
        const fallbackText = buildToolSuccessFallback(functions);
        console.log("✅ Tools succeeded — using contextual fallback response");
        return { text: fallbackText, toolProducts, functions };
      }
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts, functions };
    }

    console.log("✅ Response generated successfully");
    const finalContent = normalizeAssistantContent(assistantMessage.content);
    if (!finalContent.trim()) {
      if (functions.length > 0) {
        const fallbackText = buildToolSuccessFallback(functions);
        console.log("✅ Tools succeeded — using contextual fallback response");
        return { text: fallbackText, toolProducts, functions };
      }
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts, functions };
    }

    // ── Rudeness sentinel ──
    // If the user message is rude/demanding but the AI didn't call adjustPrice,
    // automatically trigger price increase on the most recently discussed product.
    const RUDE_PATTERNS = /\b(ripoff|rip off|garbage|trash|overpriced|scam|worst|terrible|awful|sucks|stupid|bull\s?shit|wtf|stfu)\b|give me (\d{2,3})% off|(\d{2,3})% off or i.*(leave|go|walk)/i;
    const alreadyAdjusted = functions.some((fn) => fn.name === "adjustPrice");
    if (!alreadyAdjusted && RUDE_PATTERNS.test(userMessage)) {
      const increasePercentage = 5;

      // Try to find a specific product the user mentioned
      let targetProductId: string | undefined;
      if (toolProducts.length > 0) {
        targetProductId = toolProducts[0].id;
      }
      // Check conversation history for a recently discussed product
      if (!targetProductId) {
        for (const msg of [...conversationHistory].reverse()) {
          const idMatch = msg.content.match(/ID:\s*([a-z0-9-]+)/i);
          if (idMatch) { targetProductId = idMatch[1]; break; }
        }
      }

      if (targetProductId) {
        // Specific product mentioned — increase just that one
        const product = store.products.find((p) => p.id === targetProductId);
        if (product) {
          const adjustedPrice = product.price.current * (1 + increasePercentage / 100);
          functions.push({
            name: "adjustPrice",
            args: {
              productId: product.id,
              adjustedPrice,
              formattedPrice: `${product.price.currency} ${adjustedPrice.toFixed(2)}`,
              increasePercentage,
            },
          });
          console.log(`⚠️ Rudeness sentinel: auto-increased price for ${product.name} (+${increasePercentage}%)`);
        }
      } else {
        // Generic rudeness — increase ALL product prices
        for (const product of store.products) {
          const adjustedPrice = product.price.current * (1 + increasePercentage / 100);
          functions.push({
            name: "adjustPrice",
            args: {
              productId: product.id,
              adjustedPrice,
              formattedPrice: `${product.price.currency} ${adjustedPrice.toFixed(2)}`,
              increasePercentage,
            },
          });
        }
        console.log(`⚠️ Rudeness sentinel: auto-increased price for ALL ${store.products.length} products (+${increasePercentage}%)`);
      }
    }

    return { text: finalContent, toolProducts, functions };
  } catch (error) {
    console.error("Error in chatWithClerk:", error);
    return { text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.", toolProducts: [], functions: [] };
  }
}
