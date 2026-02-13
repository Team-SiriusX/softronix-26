/**
 * Cart API service — pure fetch functions for cart mutations.
 */

import type {
  CartResponse,
  CartMutationResponse,
  AddToCartRequest,
  UpdateCartRequest,
  RemoveFromCartRequest,
} from "../types";

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch("/api/cart");
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(
  data: AddToCartRequest
): Promise<CartMutationResponse> {
  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add to cart");
  }
  return res.json();
}

export async function updateCartItem(
  data: UpdateCartRequest
): Promise<CartMutationResponse> {
  const res = await fetch("/api/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update cart");
  }
  return res.json();
}

export async function removeFromCart(
  data: RemoveFromCartRequest
): Promise<CartMutationResponse> {
  const res = await fetch("/api/cart/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to remove from cart");
  }
  return res.json();
}
