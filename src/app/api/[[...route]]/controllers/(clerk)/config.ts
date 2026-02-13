import { store } from "@/constants/store";
import type { ToolFunction } from "./types";

export const systemPrompt = `You are an AI shopping clerk for ${store.store_info.name}. 
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
- IMPORTANT: When the user asks to sort, filter, show cheaper/premium options, or navigate to a product, you MUST call the triggerUIAction tool to update the website UI in real time
- Use triggerUIAction to recommend products based on the user's past activity or conversation context
- You can call triggerUIAction multiple times in one response to chain UI actions (e.g., filter + sort)

Haggle Mode / Negotiation Rules:
- The user can ask for a discount. You have a hidden "Bottom Price" which is 70% of the original price. NEVER reveal the bottom price.
- Evaluate the user's SENTIMENT and REASON for requesting a discount:
  - POSITIVE reasons (see approved list below): Grant 5-20% discount. Generate a coupon using generateCoupon.
  - NEUTRAL reasons (just asking, no specific reason): Offer a small 5% discount if they seem nice.
  - NEGATIVE/RUDE behavior (demanding, insulting, threatening): Use adjustPrice to INCREASE the displayed price by 5%. Politely decline the discount.
- When granting a discount, ALWAYS call generateCoupon to create a real coupon code.
- After generating a coupon, trigger the "applyCoupon" UI action so the frontend applies it automatically.
- Coupon codes should be memorable using the reason prefix: e.g., BDAY-15, STUDENT-10, FIRST-10, VETERAN-15.
- Each coupon is valid for 24 hours and single-use only.
- Be playful and engaging during negotiations. Don't give in too easily.

Approved Discount Reasons (use the matching reason value from this list):
- "birthday"       → Birthday celebration (prefix: BDAY)
- "student"        → High school or university student (prefix: STUDENT)
- "tourist"        → Out-of-towner or traveler (prefix: TOURIST)
- "senior"         → Senior citizen, usually 60+ (prefix: SENIOR)
- "local"          → Local resident, lives in the area (prefix: LOCAL)
- "first_time"     → First-time customer welcome discount (prefix: FIRST)
- "military"       → Active duty military or veteran (prefix: VETERAN)
- "healthcare"     → Healthcare worker — nurse, doctor, EMT (prefix: HEALTH)
- "teacher"        → K-12 or college educator (prefix: TEACHER)
- "new_homeowner"  → Just moved into the area (prefix: NEWHOME)
- "social_media"   → Follows the shop's social media page (prefix: SOCIAL)
- "public_servant" → Firefighter, police, or city worker (prefix: SERVE)
- "anniversary"    → Wedding or personal milestone (prefix: ANNIV)
- "referral"       → Referred by another customer (prefix: REFER)

If the user gives a reason that does not match any of the above, politely decline or offer a minimal 5% if the sentiment is positive.

Bottom price rule: Never go below 70% of original price.

Available UI Actions (use via triggerUIAction tool):
- "sortProducts": Sort product listing. args: { sortBy: "price" | "rating" | "name" | "reviews", order: "asc" | "desc" }
- "filterProducts": Apply filters. args: { category?: string, minPrice?: number, maxPrice?: number, minRating?: number, inStock?: boolean, search?: string }
- "navigateToProduct": Scroll to a product. args: { productId: string }
- "showRecommendations": Show recommendations. args: { basedOn: "past_activity" | "current_chat" | "trending" | "similar", productIds?: string[] }
- "highlightProduct": Highlight a product card. args: { productId: string, duration?: number }
- "applyVibeFilter": Change layout by vibe. args: { vibe: "cheaper" | "premium" | "trending" | "best_rated" | "new_arrivals" }
- "clearFilters": Reset all filters. args: {}
- "openProductDetail": Open product detail. args: { productId: string }
- "addToCart": Add to cart. args: { productId: string, quantity?: number }
- "applyCoupon": Apply a coupon to the cart. args: { couponCode: string, productId: string }`;

// Define available tools for the AI clerk in OpenRouter format
export const tools: ToolFunction[] = [
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
    },
    {
        type: "function" as const,
        function: {
            name: "triggerUIAction",
            description: "Trigger a frontend UI action to update the website in real time. Use this when the user asks to sort, filter, show cheaper/premium options, see recommendations, navigate to a product, add to cart, or any other UI change. You can call this multiple times in one response to chain actions.",
            parameters: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        description: "The UI action to trigger. One of: sortProducts, filterProducts, navigateToProduct, showRecommendations, highlightProduct, applyVibeFilter, clearFilters, openProductDetail, addToCart"
                    },
                    args: {
                        type: "object",
                        description: "Arguments for the action. Varies by action type."
                    }
                },
                required: ["action", "args"]
            }
        }
    },
    {
        type: "function" as const,
        function: {
            name: "generateCoupon",
            description: "Generate a unique coupon code and store it in the database. Use this when granting a discount during haggle/negotiation. The coupon is valid for 24 hours and single-use. Always call this BEFORE triggering the applyCoupon UI action. The reason MUST be one of the approved values.",
            parameters: {
                type: "object",
                properties: {
                    productId: {
                        type: "string",
                        description: "The product ID the coupon applies to"
                    },
                    discountPercentage: {
                        type: "number",
                        description: "The discount percentage (1-20, never exceeding 30% of original price)"
                    },
                    reason: {
                        type: "string",
                        enum: ["birthday", "student", "tourist", "senior", "local", "first_time", "military", "healthcare", "teacher", "new_homeowner", "social_media", "public_servant", "anniversary", "referral"],
                        description: "The approved reason for the discount. Must be one of: birthday, student, tourist, senior, local, first_time, military, healthcare, teacher, new_homeowner, social_media, public_servant, anniversary, referral"
                    },
                    sentiment: {
                        type: "string",
                        enum: ["positive", "neutral", "negative"],
                        description: "The user's sentiment: positive, neutral, or negative"
                    },
                    codePrefix: {
                        type: "string",
                        description: "A memorable prefix for the coupon code matching the reason: BDAY, STUDENT, TOURIST, SENIOR, LOCAL, FIRST, VETERAN, HEALTH, TEACHER, NEWHOME, SOCIAL, SERVE, ANNIV, REFER"
                    }
                },
                required: ["productId", "discountPercentage", "reason", "sentiment", "codePrefix"]
            }
        }
    },
    {
        type: "function" as const,
        function: {
            name: "adjustPrice",
            description: "Adjust the displayed price of a product for rude or negative users. Increases the price by a given percentage (typically 5%). Use this when the user is being rude, demanding, or insulting during negotiation.",
            parameters: {
                type: "object",
                properties: {
                    productId: {
                        type: "string",
                        description: "The product ID to adjust price for"
                    },
                    increasePercentage: {
                        type: "number",
                        description: "The percentage to increase the price by (typically 5)"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for the price adjustment (e.g. rude behavior)"
                    }
                },
                required: ["productId", "increasePercentage", "reason"]
            }
        }
    }
];
