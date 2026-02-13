import { upstash_index } from "@/lib/vector";
import type { Message } from "@openrouter/sdk/models";
import { systemPrompt } from "./config";
import { sendOpenRouterChat } from "./openrouter-client";
import { buildFallbackClerkResponse } from "./response-formatters";
import { executeFunctions } from "./tool-executor";
import type { ChatbotProduct, ClerkRpcCall, ClerkResponse, ConversationMessage } from "./types";
import { normalizeAssistantContent, parseToolArguments } from "./utils";

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
    const enhancedSystemPrompt = systemPrompt + authContext + contextualInfo;

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
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts, functions };
    }

    console.log("✅ Response generated successfully");
    const finalContent = normalizeAssistantContent(assistantMessage.content);
    if (!finalContent.trim()) {
      return { text: "I apologize, but I couldn't process your request. Please try again.", toolProducts, functions };
    }

    return { text: finalContent, toolProducts, functions };
  } catch (error) {
    console.error("Error in chatWithClerk:", error);
    return { text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.", toolProducts: [], functions: [] };
  }
}
