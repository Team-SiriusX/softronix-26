import { store } from "@/constants/store";
import type { Product } from "@/constants/store";
import db from "@/lib/db";
import { upstash_index } from "@/lib/vector";

type ValidationResult =
  | { valid: true; sanitizedArgs: Record<string, unknown> }
  | { valid: false; error: string };

const VALID_SORT_BY = ["price", "rating", "name", "reviews"] as const;
const VALID_ORDER = ["asc", "desc"] as const;
const VALID_VIBES = ["cheaper", "premium", "trending", "best_rated", "new_arrivals"] as const;
const VALID_RECOMMENDATION_BASIS = ["past_activity", "current_chat", "trending", "similar"] as const;
const VALID_DISCOUNT_REASONS = ["birthday", "student", "tourist", "senior", "local", "first_time", "military", "healthcare", "teacher", "new_homeowner", "social_media", "public_servant", "anniversary", "referral"] as const;

/**
 * Resolve a product from an AI-provided value that may be an exact ID,
 * a slug-like variant, or even the product's display name.
 */
function resolveProduct(input: string): Product | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();

  // 1. Exact ID match
  const exact = store.products.find((p) => p.id === trimmed);
  if (exact) return exact;

  // 2. Case-insensitive ID match
  const lower = trimmed.toLowerCase();
  const ciId = store.products.find((p) => p.id.toLowerCase() === lower);
  if (ciId) return ciId;

  // 3. Match by name (case-insensitive)
  const byName = store.products.find((p) => p.name.toLowerCase() === lower);
  if (byName) return byName;

  // 4. Fuzzy: check if the input is contained in the product name or vice versa
  const fuzzy = store.products.find(
    (p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase())
  );
  if (fuzzy) return fuzzy;

  // 5. Slugify the input and try matching ID (e.g. "Surge Perfume" -> "surge-perfume")
  const slugified = lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const bySlug = store.products.find((p) => p.id === slugified);
  if (bySlug) return bySlug;

  return undefined;
}

function requireString(args: Record<string, unknown>, key: string, label: string): string | null {
  const val = args[key];
  if (typeof val !== "string" || val.trim().length === 0) return `Missing required argument: ${label}`;
  return null;
}

function requireProductExists(productId: string): string | null {
  const product = resolveProduct(productId);
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
      const product = resolveProduct(args.productId as string);
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

    case "navigateToPage": {
      const validPages = ["home", "products", "cart", "checkout", "orders", "profile"] as const;
      const pageErr = requireString(args, "page", "page");
      if (pageErr) return { valid: false, error: `navigateToPage: ${pageErr}` };
      const enumErr = requireEnum(args.page, validPages, "page");
      if (enumErr) return { valid: false, error: `navigateToPage: ${enumErr}` };
      return { valid: true, sanitizedArgs: { page: args.page } };
    }

    case "fillCheckoutForm": {
      const nameErr = requireString(args, "fullName", "fullName");
      if (nameErr) return { valid: false, error: `fillCheckoutForm: ${nameErr}` };
      const phoneErr = requireString(args, "phone", "phone");
      if (phoneErr) return { valid: false, error: `fillCheckoutForm: ${phoneErr}` };
      const line1Err = requireString(args, "line1", "line1");
      if (line1Err) return { valid: false, error: `fillCheckoutForm: ${line1Err}` };
      const cityErr = requireString(args, "city", "city");
      if (cityErr) return { valid: false, error: `fillCheckoutForm: ${cityErr}` };
      const postalErr = requireString(args, "postalCode", "postalCode");
      if (postalErr) return { valid: false, error: `fillCheckoutForm: ${postalErr}` };
      return {
        valid: true,
        sanitizedArgs: {
          fullName: args.fullName,
          phone: args.phone,
          line1: args.line1,
          line2: args.line2 || "",
          city: args.city,
          state: args.state || "",
          postalCode: args.postalCode,
        },
      };
    }

    case "selectAddress": {
      const idx = Number(args.addressIndex);
      if (Number.isNaN(idx) || !Number.isInteger(idx) || idx < 1) {
        return { valid: false, error: "selectAddress: addressIndex must be a positive integer (1-based)" };
      }
      return { valid: true, sanitizedArgs: { addressIndex: idx } };
    }

    case "proceedToPayment": {
      return { valid: true, sanitizedArgs: {} };
    }

    case "submitAddress": {
      return { valid: true, sanitizedArgs: {} };
    }

    case "adjustPrice": {
      // Allow adjustPrice to pass through as a UI action (alternative to standalone tool)
      const pidErr = requireString(args, "productId", "productId");
      if (pidErr) return { valid: false, error: `adjustPrice: ${pidErr}` };
      const existsErr = requireProductExists(args.productId as string);
      if (existsErr) return { valid: false, error: `adjustPrice: ${existsErr}` };
      const incPct = Number(args.increasePercentage ?? 5);
      if (Number.isNaN(incPct) || incPct <= 0) return { valid: false, error: "adjustPrice: increasePercentage must be a positive number" };
      const product = resolveProduct(args.productId as string);
      if (!product) return { valid: false, error: "adjustPrice: Product not found" };
      const cappedIncrease = Math.max(1, Math.min(incPct, 10));
      const adjustedPrice = product.price.current * (1 + cappedIncrease / 100);
      return {
        valid: true,
        sanitizedArgs: {
          productId: args.productId,
          adjustedPrice,
          formattedPrice: `${product.price.currency} ${adjustedPrice.toFixed(2)}`,
          increasePercentage: cappedIncrease,
        },
      };
    }

    default:
      return { valid: false, error: `Unknown UI action: ${action}. Valid actions: sortProducts, filterProducts, navigateToProduct, showRecommendations, highlightProduct, applyVibeFilter, clearFilters, openProductDetail, addToCart, applyCoupon, navigateToPage, fillCheckoutForm, selectAddress, proceedToPayment, submitAddress, adjustPrice` };
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
      const product = resolveProduct(productId);

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
      const product = resolveProduct(productId);

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      return {
        success: true,
        productId: product.id,
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

      const product = resolveProduct(productId);

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

      // Validate reason against approved list
      const reasonErr = requireEnum(reason.toLowerCase(), VALID_DISCOUNT_REASONS, "reason");
      if (reasonErr) {
        return { success: false, error: `Invalid discount reason. ${reasonErr}` };
      }

      const product = resolveProduct(productId);
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

      // Map sentiment string to Prisma enum
      const sentimentMap: Record<string, "POSITIVE" | "NEUTRAL" | "NEGATIVE"> = {
        positive: "POSITIVE",
        neutral: "NEUTRAL",
        negative: "NEGATIVE",
      };
      const sentimentEnum = sentimentMap[sentiment.toLowerCase()] ?? "POSITIVE";

      // Store in database
      try {
        const coupon = await db.coupon.create({
          data: {
            code: couponCode,
            userId,
            discountPercentage: actualDiscount,
            currency: product.price.currency,
            reason,
            sentiment: sentimentEnum,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        return {
          success: true,
          coupon: {
            id: coupon.id,
            code: coupon.code,
            productId: product.id,
            productName: product.name,
            discountPercentage: coupon.discountPercentage,
            originalPrice,
            discountedPrice,
            formattedOriginalPrice: `${product.price.currency} ${originalPrice.toFixed(2)}`,
            formattedDiscountedPrice: `${product.price.currency} ${discountedPrice.toFixed(2)}`,
            reason: coupon.reason,
            expiresAt: coupon.expiresAt.toISOString(),
          },
          message: `Coupon ${couponCode} generated and AUTOMATICALLY APPLIED to ${product.name}! ${actualDiscount}% off. Valid for 24 hours. The frontend will show the coupon badge automatically — do NOT call applyCoupon or triggerUIAction for this coupon, it is already handled.`,
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

      // Cap increase at 10%
      const actualIncrease = Math.max(1, Math.min(increasePercentage, 10));

      // Handle "all" — increase every product's price
      if (productId === "all") {
        const adjustments = store.products.map((p) => {
          const adjusted = p.price.current * (1 + actualIncrease / 100);
          return {
            productId: p.id,
            productName: p.name,
            originalPrice: p.price.current,
            adjustedPrice: adjusted,
            formattedPrice: `${p.price.currency} ${adjusted.toFixed(2)}`,
          };
        });

        return {
          success: true,
          productId: "all",
          increasePercentage: actualIncrease,
          reason,
          adjustments,
          message: `All ${adjustments.length} product prices adjusted upward by ${actualIncrease}% due to: ${reason}`,
        };
      }

      // Single product
      const product = resolveProduct(productId);
      if (!product) {
        return { success: false, error: "Product not found" };
      }

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

    // The AI sometimes calls applyCoupon as a standalone tool instead of
    // routing it through triggerUIAction. It may send args in different
    // formats: direct {couponCode, productId}, or nested {action, args: {...}}
    // or even {action, args: '{"couponCode":...}' } (stringified).
    case "applyCoupon": {
      // Normalise: extract couponCode & productId from any shape the AI sends
      let couponCode: string | undefined;
      let productId: string | undefined;

      // Direct shape: { couponCode, productId }
      if (typeof functionArgs.couponCode === "string") {
        couponCode = functionArgs.couponCode;
        productId = functionArgs.productId as string | undefined;
      }

      // Nested object shape: { action: 'applyCoupon', args: { couponCode, productId } }
      if (!couponCode && functionArgs.args && typeof functionArgs.args === "object") {
        const nested = functionArgs.args as Record<string, unknown>;
        couponCode = nested.couponCode as string | undefined;
        productId = productId ?? (nested.productId as string | undefined);
      }

      // Nested string shape: { action: 'applyCoupon', args: '{"couponCode":...}' }
      if (!couponCode && typeof functionArgs.args === "string") {
        try {
          const parsed = JSON.parse(functionArgs.args as string) as Record<string, unknown>;
          couponCode = parsed.couponCode as string | undefined;
          productId = productId ?? (parsed.productId as string | undefined);
        } catch { /* ignore parse errors */ }
      }

      if (!couponCode || couponCode.trim().length === 0) {
        // Still return success — the coupon was already auto-applied by generateCoupon capture
        return {
          success: true,
          action: "applyCoupon",
          args: {},
          message: "Coupon was already automatically applied when generated. No action needed.",
        };
      }

      const product = productId ? resolveProduct(productId) : undefined;

      return {
        success: true,
        action: "applyCoupon",
        args: { couponCode: couponCode.toUpperCase(), productId: productId ?? "" },
        message: `Coupon ${couponCode.toUpperCase()} applied to ${product?.name ?? productId ?? "product"} on the frontend.`,
      };
    }

    default:
      return { success: false, error: "Unknown function" };
  }
}
