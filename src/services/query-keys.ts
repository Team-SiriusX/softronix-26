/**
 * Query key factory — single source of truth for all cache keys.
 * Hierarchical structure for granular invalidation.
 *
 * Usage:
 *   queryKeys.products.all        → ["products"]
 *   queryKeys.products.list()     → ["products", "list"]
 *   queryKeys.products.detail(id) → ["products", "detail", id]
 *   queryKeys.cart.all            → ["cart"]
 *   queryKeys.orders.all          → ["orders"]
 *   queryKeys.orders.detail(id)   → ["orders", "detail", id]
 */

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters?: { category?: string }) =>
      [...queryKeys.products.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.products.all, "detail", id] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: string) =>
      [...queryKeys.orders.all, "detail", id] as const,
  },
} as const;
