import type { CartResponse } from "../types";

/** Response from POST /checkout/init */
export type CheckoutInitResponse = {
  clientSecret: string;
  orderId: string;
  totalAmount: number;
  message: string;
};

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode: string;
  createdAt: string;
};

export type CreateAddressRequest = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode: string;
};

export async function initCheckout(
  addressId: string
): Promise<CheckoutInitResponse> {
  const res = await fetch("/api/orders/checkout/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addressId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Checkout initialization failed");
  }
  return res.json();
}

export async function fetchAddresses(): Promise<{ data: Address[] }> {
  const res = await fetch("/api/address");
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
}

export async function createAddress(
  data: CreateAddressRequest
): Promise<{ data: Address; message: string }> {
  const res = await fetch("/api/address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create address");
  }
  return res.json();
}

export async function deleteAddress(
  id: string
): Promise<{ message: string }> {
  const res = await fetch(`/api/address/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete address");
  }
  return res.json();
}
