/**
 * React Query hooks for orders.
 * Checkout mutation invalidates both cart and orders caches.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { fetchOrders, fetchOrderById, checkout } from "../api/orders";

/**
 * List all orders for the current user.
 */
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: fetchOrders,
    enabled: !!userId,
  });
}

/**
 * Fetch a single order by ID.
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

/**
 * Checkout mutation — creates an order from the cart.
 * Invalidates both cart and orders caches on success.
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
