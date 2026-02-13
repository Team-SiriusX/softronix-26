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
export { useAddresses, useCreateAddress, useDeleteAddress, useInitCheckout } from "./queries/checkout";

// API functions (for direct use in cart store, SSR, etc.)
export { syncCart } from "./api/cart";
export { initCheckout, fetchAddresses, createAddress, deleteAddress } from "./api/checkout";
export type { CheckoutInitResponse, Address, CreateAddressRequest } from "./api/checkout";

