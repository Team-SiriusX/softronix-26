export type ChatbotProduct = {
  name: string;
  price: string;
  rating: number | null;
  reviewCount: number | null;
  url: string | null;
};

/**
 * RPC-like function call that the frontend should execute.
 * The clerk AI decides which UI actions to trigger based on conversation context.
 *
 * Available function names:
 * - "sortProducts"        → Sort the product listing
 * - "filterProducts"      → Apply filters (category, price range, rating, stock)
 * - "navigateToProduct"   → Scroll/navigate to a specific product
 * - "showRecommendations" → Show personalized product recommendations
 * - "highlightProduct"    → Visually highlight a product card
 * - "applyVibeFilter"     → Apply a vibe-based layout change ("cheaper", "premium", "trending")
 * - "clearFilters"        → Reset all active filters
 * - "openProductDetail"   → Open the product detail view/modal
 * - "addToCart"           → Add a product to the cart
 * - "applyCoupon"         → Apply a generated coupon code to the cart
 */
export type ClerkRpcCall = {
  /** The frontend function name to invoke */
  name: string;
  /** Arguments to pass to the function */
  args: Record<string, unknown>;
};

export type ClerkResponse = {
  text: string;
  toolProducts: ChatbotProduct[];
  functions: ClerkRpcCall[];
};

export type ConversationMessage = {
  role: string;
  content: string;
};

export type ToolFunction = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required: string[];
    };
  };
};
