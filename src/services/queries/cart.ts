/**
 * React Query hooks for cart operations.
 * Mutations auto-invalidate the cart cache on success.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../api/cart";
import type {
  AddToCartRequest,
  UpdateCartRequest,
  RemoveFromCartRequest,
} from "../types";

/**
 * Fetch the current user's cart.
 * Only enabled when a userId is provided (i.e. user is authenticated).
 */
export function useCart(userId?: string) {
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: fetchCart,
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 min
  });
}

/**
 * Add an item to cart. Invalidates cart cache on success.
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

/**
 * Update cart item quantity. Invalidates cart cache on success.
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCartRequest) => updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

/**
 * Remove item from cart. Invalidates cart cache on success.
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveFromCartRequest) => removeFromCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
