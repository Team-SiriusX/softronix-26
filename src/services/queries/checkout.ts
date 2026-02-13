import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import {
  initCheckout,
  fetchAddresses,
  createAddress,
  deleteAddress,
} from "../api/checkout";
import type { CreateAddressRequest } from "../api/checkout";

// ─── Address hooks ─────────────────────────────────────────

const addressKeys = {
  all: ["addresses"] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: fetchAddresses,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressRequest) => createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

// ─── Checkout hook ────────────────────────────────────────

export function useInitCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => initCheckout(addressId),
    onSuccess: () => {
      // Invalidate orders so the new pending order shows up
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
