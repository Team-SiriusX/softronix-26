/**
 * Example: AI-Driven Product Filtering
 * 
 * This file demonstrates how to integrate the ChatProvider with your AI
 * to automatically update product filters based on user queries.
 * 
 * You can integrate this logic into your existing chat components.
 */

import { useChatContext, ProductFilters } from "@/components/providers/chat-provider";

/**
 * Example: Parse user message intent and update filters
 */
export function useAIFilterIntegration() {
  const { updateFilters, filters, addMessage } = useChatContext();

  /**
   * Parse a user message and extract filtering intent
   */
  const parseFilterIntent = (message: string): Partial<ProductFilters> => {
    const intent: Partial<ProductFilters> = {};
    const lowerMessage = message.toLowerCase();

    // Category detection
    if (lowerMessage.includes("skincare") || lowerMessage.includes("skin care")) {
      intent.category = "skincare";
    } else if (lowerMessage.includes("haircare") || lowerMessage.includes("hair care")) {
      intent.category = "haircare";
    } else if (lowerMessage.includes("bodycare") || lowerMessage.includes("body care")) {
      intent.category = "bodycare";
    } else if (lowerMessage.includes("shaving") || lowerMessage.includes("shave")) {
      intent.category = "shaving";
    } else if (lowerMessage.includes("fragrance") || lowerMessage.includes("perfume") || lowerMessage.includes("cologne")) {
      intent.category = "fragrance";
    }

    // Price range detection
    const priceRegex = /\$?(\d+)/g;
    const prices = Array.from(message.matchAll(priceRegex)).map(m => parseInt(m[1]));
    
    if (lowerMessage.includes("under") && prices.length > 0) {
      intent.maxPrice = prices[0];
    } else if (lowerMessage.includes("over") && prices.length > 0) {
      intent.minPrice = prices[0];
    } else if (lowerMessage.includes("between") && prices.length >= 2) {
      intent.minPrice = Math.min(...prices);
      intent.maxPrice = Math.max(...prices);
    }

    // Sorting detection
    if (lowerMessage.includes("cheap") || lowerMessage.includes("affordable") || lowerMessage.includes("lowest price")) {
      intent.sortBy = "price-asc";
    } else if (lowerMessage.includes("expensive") || lowerMessage.includes("premium") || lowerMessage.includes("highest price")) {
      intent.sortBy = "price-desc";
    } else if (lowerMessage.includes("new") || lowerMessage.includes("latest") || lowerMessage.includes("recent")) {
      intent.sortBy = "newest";
    } else if (lowerMessage.includes("alphabetical") || lowerMessage.includes("a to z")) {
      intent.sortBy = "name-asc";
    }

    // Search terms (extract product-related keywords)
    const searchKeywords = ["moisturizer", "serum", "cleanser", "shampoo", "conditioner", 
                           "beard", "razor", "aftershave", "lotion", "cream", "oil"];
    for (const keyword of searchKeywords) {
      if (lowerMessage.includes(keyword)) {
        intent.search = keyword;
        break;
      }
    }

    return intent;
  };

  /**
   * Generate a natural language description of applied filters
   */
  const describeFilters = (appliedFilters: Partial<ProductFilters>): string => {
    const parts: string[] = [];

    if (appliedFilters.category) {
      parts.push(`${appliedFilters.category} products`);
    }

    if (appliedFilters.search) {
      parts.push(`matching "${appliedFilters.search}"`);
    }

    if (appliedFilters.minPrice && appliedFilters.maxPrice) {
      parts.push(`priced between $${appliedFilters.minPrice} and $${appliedFilters.maxPrice}`);
    } else if (appliedFilters.maxPrice) {
      parts.push(`under $${appliedFilters.maxPrice}`);
    } else if (appliedFilters.minPrice) {
      parts.push(`over $${appliedFilters.minPrice}`);
    }

    if (appliedFilters.sortBy) {
      const sortDescriptions = {
        "price-asc": "sorted by lowest price first",
        "price-desc": "sorted by highest price first",
        "name-asc": "sorted alphabetically",
        "name-desc": "sorted reverse alphabetically",
        "newest": "sorted by newest arrivals"
      };
      parts.push(sortDescriptions[appliedFilters.sortBy]);
    }

    return parts.length > 0 
      ? `Here are the ${parts.join(", ")}.`
      : "Here are all available products.";
  };

  /**
   * Handle a user message and automatically update filters
   */
  const handleUserMessage = (userMessage: string) => {
    // Parse intent from message
    const intent = parseFilterIntent(userMessage);
    
    // Check if intent was found
    const hasIntent = Object.keys(intent).length > 0;

    if (hasIntent) {
      // Update filters based on parsed intent
      updateFilters(intent);

      // Generate response message
      const responseText = describeFilters(intent);
      
      // Add assistant message
      addMessage({
        role: "assistant",
        content: responseText
      });

      return { filtersUpdated: true, intent, response: responseText };
    }

    return { filtersUpdated: false, intent: {}, response: null };
  };

  return {
    parseFilterIntent,
    describeFilters,
    handleUserMessage,
    currentFilters: filters,
  };
}

/**
 * Example Component: Chat Input with Auto-Filtering
 * Demonstrates how to integrate filtering with chat input
 */
export function ChatInputWithFiltering() {
  const { handleUserMessage } = useAIFilterIntegration();
  const { addMessage } = useChatContext();

  // This is an example function showing the pattern
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSendMessage = async (message: string) => {
    // Add user message
    addMessage({ role: "user", content: message });

    // Try to extract and apply filters
    const result = handleUserMessage(message);

    // If no filters were detected, send to AI backend
    if (!result.filtersUpdated) {
      // Call your AI API here
      // const response = await fetch("/api/chat", { ... });
      // addMessage({ role: "assistant", content: response.text });
    }
  };

  // Return your input component here
  // This is just an example - replace with your actual component
  return null;
}

/**
 * Example Quick Action Buttons
 */
export function QuickFilterButtons() {
  const { updateFilters, addMessage, openChat } = useChatContext();

  const quickFilters = [
    {
      label: "Best Sellers",
      action: () => {
        updateFilters({ sortBy: "newest" });
        addMessage({
          role: "assistant",
          content: "Here are our best-selling products!"
        });
        openChat();
      }
    },
    {
      label: "Under $30",
      action: () => {
        updateFilters({ maxPrice: 30, sortBy: "price-asc" });
        addMessage({
          role: "assistant",
          content: "Here are our affordable products under $30, sorted by price."
        });
        openChat();
      }
    },
    {
      label: "Daily Essentials",
      action: () => {
        updateFilters({ category: "skincare", sortBy: "price-asc" });
        addMessage({
          role: "assistant",
          content: "Here are our daily skincare essentials!"
        });
        openChat();
      }
    },
    {
      label: "Grooming Starter Kit",
      action: () => {
        updateFilters({ maxPrice: 50, sortBy: "price-asc" });
        addMessage({
          role: "assistant",
          content: "Here's a selection for your starter grooming kit - all under $50!"
        });
        openChat();
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickFilters.map((filter) => (
        <button
          key={filter.label}
          onClick={filter.action}
          className="px-4 py-2 rounded-lg border hover:bg-accent"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Example: Smart Product Card with "Ask About This" button
 * Shows how to trigger chat with context about a specific product
 */
interface ProductType {
  id: string;
  name: string;
  price: number;
  category: string;
}

export function SmartProductCard({ product }: { product: ProductType }) {
  const { updateFilters, openChat, addMessage } = useChatContext();

  const handleAskAboutProduct = () => {
    // Filter to similar products
    updateFilters({
      category: product.category,
      minPrice: product.price * 0.8,
      maxPrice: product.price * 1.2,
    });

    // Add message about the product
    addMessage({
      role: "user",
      content: `Tell me more about ${product.name}`
    });

    addMessage({
      role: "assistant",
      content: `${product.name} is a great choice! I've filtered similar products in the same price range. What would you like to know more about?`
    });

    // Open chat
    openChat();
  };

  return (
    <div className="border rounded-lg p-4">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button
        onClick={handleAskAboutProduct}
        className="mt-2 px-4 py-2 bg-primary text-white rounded"
      >
        Ask AI About This
      </button>
    </div>
  );
}

/**
 * Example: Integration with your existing chat API
 */
export async function sendChatMessageWithFiltering(
  userMessage: string,
  currentFilters: ProductFilters
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      currentFilters, // Send current filters to AI for context
      conversationHistory: [], // Your conversation history
    }),
  });

  const data = await response.json();

  return {
    reply: data.response,
    suggestedFilters: data.filters, // AI can suggest filter updates
    products: data.products,
  };
}

/**
 * Usage Example in your Chat Widget:
 * 
 * const { updateFilters } = useChatContext();
 * const { handleUserMessage } = useAIFilterIntegration();
 * 
 * // In your message handler:
 * const result = handleUserMessage(userInput);
 * 
 * if (!result.filtersUpdated) {
 *   // No filters detected, send to AI
 *   const aiResponse = await sendChatMessageWithFiltering(userInput, filters);
 *   
 *   // AI can also suggest filters
 *   if (aiResponse.suggestedFilters) {
 *     updateFilters(aiResponse.suggestedFilters);
 *   }
 * }
 */
