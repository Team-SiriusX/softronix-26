/**
 * Orders API service — pure fetch functions.
 */

import type { OrdersResponse, Order, CheckoutResponse } from "../types";

export async function fetchOrders(): Promise<OrdersResponse> {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function fetchOrderById(
  id: string
): Promise<{ data: Order }> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export async function checkout(): Promise<CheckoutResponse> {
  const res = await fetch("/api/orders/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Checkout failed");
  }
  return res.json();
}
