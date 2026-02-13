import { store } from "@/constants/store";
import db from "@/lib/db";
import { upstash_index } from "@/lib/vector";

type ValidationResult =
  | { valid: true; sanitizedArgs: Record<string, unknown> }
  | { valid: false; error: string };

const VALID_SORT_BY = ["price", "rating", "name", "reviews"] as const;
const VALID_ORDER = ["asc", "desc"] as const;
const VALID_VIBES = ["cheaper", "premium", "trending", "best_rated", "new_arrivals"] as const;
const VALID_RECOMMENDATION_BASIS = ["past_activity", "current_chat", "trending", "similar"] as const;

function requireString(args: Record<string, unknown>, key: string, label: string): string | null {
  const val = args[key];
  if (typeof val !== "string" || val.trim().length === 0) return `Missing required argument: ${label}`;
  return null;
}

function requireProductExists(productId: string): string | null {
  const product = store.products.find((p) => p.id === productId);
  if (!product) return `Product not found: ${productId}`;
  return null;
}

function requireEnum(value: unknown, allowed: readonly string[], label: string): string | null {
  if (typeof value !== "string" || !allowed.includes(value)) {
    return `Invalid ${label}: "${value}". Must be one of: ${allowed.join(", ")}`;
  }
  return null;
}

function validateUIActionArgs(action: string, args: Record<string, unknown>): ValidationResult {
  switch (action) {
    case "sortProducts": {
      const sortBy = args.sortBy ?? "price";
      const order = args.order ?? "asc";
      const sortErr = requireEnum(sortBy, VALID_SORT_BY, "sortBy");
      if (sortErr) return { valid: false, error: sortErr };
      const orderErr = requireEnum(order, VALID_ORDER, "order");
      if (orderErr) return { valid: false, error: orderErr };
      return { valid: true, sanitizedArgs: { sortBy, order } };
    }

    case "filterProducts": {
      const sanitized: Record<string, unknown> = {};
      if (args.category != null) {
        if (typeof args.category !== "string") return { valid: false, error: "filterProducts: category must be a string" };
        sanitized.category = args.category;
      }
      if (args.minPrice != null) {
        const v = Number(args.minPrice);
        if (Number.isNaN(v) || v < 0) return { valid: false, error: "filterProducts: minPrice must be a non-negative number" };
        sanitized.minPrice = v;
      }
      if (args.maxPrice != null) {
        const v = Number(args.maxPrice);
        if (Number.isNaN(v) || v < 0) return { valid: false, error: "filterProducts: maxPrice must be a non-negative number" };
        sanitized.maxPrice = v;
      }
      if (sanitized.minPrice != null && sanitized.maxPrice != null && (sanitized.minPrice as number) > (sanitized.maxPrice as number)) {
        return { valid: false, error: "filterProducts: minPrice cannot be greater than maxPrice" };
      }
      if (args.minRating != null) {
        const v = Number(args.minRating);
        if (Number.isNaN(v) || v < 0 || v > 5) return { valid: false, error: "filterProducts: minRating must be between 0 and 5" };
        sanitized.minRating = v;
      }
      if (args.inStock != null) {
        sanitized.inStock = Boolean(args.inStock);
      }
      if (args.search != null) {
        if (typeof args.search !== "string") return { valid: false, error: "filterProducts: search must be a string" };
        sanitized.search = args.search;
      }
      return { valid: true, sanitizedArgs: sanitized };
    }

    case "navigateToProduct": {
      const err = requireString(args, "productId", "productId");
      if (err) return { valid: false, error: `navigateToProduct: ${err}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `navigateToProduct: ${existsErr}` };
      return { valid: true, sanitizedArgs: { productId: args.productId } };
    }

    case "showRecommendations": {
      const basedOn = args.basedOn ?? "current_chat";
      const basisErr = requireEnum(basedOn, VALID_RECOMMENDATION_BASIS, "basedOn");
      if (basisErr) return { valid: false, error: `showRecommendations: ${basisErr}` };
      const sanitized: Record<string, unknown> = { basedOn };
      if (args.productIds != null) {
        if (!Array.isArray(args.productIds) || !args.productIds.every((id: unknown) => typeof id === "string")) {
          return { valid: false, error: "showRecommendations: productIds must be an array of strings" };
        }
        sanitized.productIds = args.productIds;
      }
      return { valid: true, sanitizedArgs: sanitized };
    }

    case "highlightProduct": {
      const err = requireString(args, "productId", "productId");
      if (err) return { valid: false, error: `highlightProduct: ${err}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `highlightProduct: ${existsErr}` };
      const sanitized: Record<string, unknown> = { productId: args.productId };
      if (args.duration != null) {
        const d = Number(args.duration);
        if (Number.isNaN(d) || d <= 0) return { valid: false, error: "highlightProduct: duration must be a positive number (ms)" };
        sanitized.duration = Math.min(d, 10000); // cap at 10s
      }
      return { valid: true, sanitizedArgs: sanitized };
    }

    case "applyVibeFilter": {
      const err = requireString(args, "vibe", "vibe");
      if (err) return { valid: false, error: `applyVibeFilter: ${err}` };
      const vibeErr = requireEnum(args.vibe, VALID_VIBES, "vibe");
      if (vibeErr) return { valid: false, error: `applyVibeFilter: ${vibeErr}` };
      return { valid: true, sanitizedArgs: { vibe: args.vibe } };
    }

    case "clearFilters": {
      return { valid: true, sanitizedArgs: {} };
    }

    case "openProductDetail": {
      const err = requireString(args, "productId", "productId");
      if (err) return { valid: false, error: `openProductDetail: ${err}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `openProductDetail: ${existsErr}` };
      return { valid: true, sanitizedArgs: { productId: args.productId } };
    }

    case "addToCart": {
      const err = requireString(args, "productId", "productId");
      if (err) return { valid: false, error: `addToCart: ${err}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `addToCart: ${existsErr}` };
      const sanitized: Record<string, unknown> = { productId: args.productId };
      if (args.quantity != null) {
        const q = Number(args.quantity);
        if (Number.isNaN(q) || !Number.isInteger(q) || q < 1) return { valid: false, error: "addToCart: quantity must be a positive integer" };
        sanitized.quantity = Math.min(q, 99); // cap at 99
      } else {
        sanitized.quantity = 1; // default
      }
      // Also verify product is in stock
      const product = store.products.find((p) => p.id === args.productId);
      if (product && product.stock_status !== "in_stock") {
        return { valid: false, error: `addToCart: Product "${product.name}" is currently out of stock` };
      }
      return { valid: true, sanitizedArgs: sanitized };
    }

    case "applyCoupon": {
      const codeErr = requireString(args, "couponCode", "couponCode");
      if (codeErr) return { valid: false, error: `applyCoupon: ${codeErr}` };
      const pidErr = requireString(args, "productId", "productId");
      if (pidErr) return { valid: false, error: `applyCoupon: ${pidErr}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `applyCoupon: ${existsErr}` };
      return { valid: true, sanitizedArgs: { couponCode: (args.couponCode as string).toUpperCase(), productId: args.productId } };
    }

    default:
      return { valid: false, error: `Unknown UI action: ${action}. Valid actions: sortProducts, filterProducts, navigateToProduct, showRecommendations, highlightProduct, applyVibeFilter, clearFilters, openProductDetail, addToCart, applyCoupon` };
  }
}

// Execute function calls from the AI
export async function executeFunctions(functionName: string, functionArgs: Record<string, unknown>, userId?: string | null) {
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

    case "triggerUIAction": {
      const action = functionArgs.action as string;
      const args = (functionArgs.args as Record<string, unknown>) || {};

      if (typeof action !== "string" || action.trim().length === 0) {
        return { success: false, error: "Missing required argument: action" };
      }

      // Per-action argument validation
      const validation = validateUIActionArgs(action, args);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return {
        success: true,
        action,
        args: validation.sanitizedArgs,
        message: `UI action "${action}" will be triggered on the frontend.`,
      };
    }

    case "generateCoupon": {
      const productId = functionArgs.productId as string;
      const discountPercentage = functionArgs.discountPercentage as number;
      const reason = functionArgs.reason as string;
      const sentiment = (functionArgs.sentiment as string) || "positive";
      const codePrefix = (functionArgs.codePrefix as string) || "DEAL";

      if (!userId) {
        return { success: false, error: "User must be logged in to generate a coupon. Please ask the user to sign in first." };
      }

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

      // Enforce discount limits
      const maxDiscount = 20;
      const minPricePercent = 70;
      const actualDiscount = Math.max(1, Math.min(discountPercentage, maxDiscount));
      const originalPrice = product.price.current;
      const discountedPrice = originalPrice * (1 - actualDiscount / 100);
      const minimumPrice = originalPrice * (minPricePercent / 100);

      if (discountedPrice < minimumPrice) {
        return {
          success: false,
          error: `Cannot generate coupon with ${actualDiscount}% discount. Minimum price is ${product.price.currency} ${minimumPrice.toFixed(2)} (70% of original).`,
        };
      }

      // Generate unique coupon code: PREFIX-DISCOUNT-RANDOM
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const couponCode = `${codePrefix.toUpperCase()}-${actualDiscount}-${randomSuffix}`;

      // Store in database
      try {
        const coupon = await db.coupon.create({
          data: {
            code: couponCode,
            userId,
            productId: product.id,
            productName: product.name,
            discountPercentage: actualDiscount,
            originalPrice,
            discountedPrice,
            currency: product.price.currency,
            reason,
            sentiment,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        return {
          success: true,
          coupon: {
            id: coupon.id,
            code: coupon.code,
            productId: coupon.productId,
            productName: coupon.productName,
            discountPercentage: coupon.discountPercentage,
            originalPrice: coupon.originalPrice,
            discountedPrice: coupon.discountedPrice,
            formattedOriginalPrice: `${coupon.currency} ${coupon.originalPrice.toFixed(2)}`,
            formattedDiscountedPrice: `${coupon.currency} ${coupon.discountedPrice.toFixed(2)}`,
            reason: coupon.reason,
            expiresAt: coupon.expiresAt.toISOString(),
          },
          message: `Coupon ${couponCode} generated! ${actualDiscount}% off on ${product.name}. Valid for 24 hours.`,
        };
      } catch (error) {
        console.error("Error creating coupon:", error);
        return { success: false, error: "Failed to generate coupon. Please try again." };
      }
    }

    case "adjustPrice": {
      const productId = functionArgs.productId as string;
      const increasePercentage = functionArgs.increasePercentage as number;
      const reason = functionArgs.reason as string;

      if (typeof productId !== "string" || productId.trim().length === 0) {
        return { success: false, error: "Missing required argument: productId" };
      }
      if (typeof increasePercentage !== "number" || Number.isNaN(increasePercentage)) {
        return { success: false, error: "Missing or invalid argument: increasePercentage" };
      }
      if (typeof reason !== "string" || reason.trim().length === 0) {
        return { success: false, error: "Missing required argument: reason" };
      }

      const product = store.products.find((p) => p.id === productId);
      if (!product) {
        return { success: false, error: "Product not found" };
      }

      // Cap increase at 10%
      const actualIncrease = Math.max(1, Math.min(increasePercentage, 10));
      const originalPrice = product.price.current;
      const adjustedPrice = originalPrice * (1 + actualIncrease / 100);

      return {
        success: true,
        productId,
        productName: product.name,
        originalPrice,
        increasePercentage: actualIncrease,
        adjustedPrice,
        formattedPrice: `${product.price.currency} ${adjustedPrice.toFixed(2)}`,
        reason,
        message: `Price adjusted upward by ${actualIncrease}% due to: ${reason}`,
      };
    }

    default:
      return { success: false, error: "Unknown function" };
  }
}
