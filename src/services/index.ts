/**
 * Public API for the services layer.
 * Import everything from "@/services" for clean, centralized access.
 */

// Types
export type * from "./types";

// Query keys
export { queryKeys } from "./query-keys";

// React Query hooks
export { useProducts, useProduct } from "./queries/products";
export { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart } from "./queries/cart";
export { useOrders, useOrder, useCheckout } from "./queries/orders";
