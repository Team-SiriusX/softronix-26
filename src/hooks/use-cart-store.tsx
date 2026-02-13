"use client";

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { queryKeys } from "@/services/query-keys";
import {
    fetchCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart,
    syncCart as apiSyncCart,
} from "@/services/api/cart";
import type { LocalCartItem, CartResponse } from "@/services/types";
import { useLocalStorage } from "./use-local-storage";

// ─── Context shape ─────────────────────────────────────────

type CartItem = {
    productId: string;
    quantity: number;
    product?: {
        name: string;
        price: number;
        image: string | null;
        formattedPrice: string;
    } | null;
    subtotal: number;
};

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    total: number;
    isInCart: (productId: string) => boolean;
    addItem: (productId: string, quantity?: number) => void;
    updateItem: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    isLoading: boolean;
    isMutating: boolean;
    mutatingProductId: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

// ─── localStorage helpers ──────────────────────────────────

const LOCAL_CART_KEY = "softronix-cart";

function getLocalProducts(): Map<string, { name: string; price: number; image: string | null; formattedPrice: string }> {
    // Cache static imports on the client only
    return new Map();
}

// ─── Provider ──────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
    const session = useSession();
    const userId = session.data?.user?.id;
    const isAuthenticated = !!userId;
    const queryClient = useQueryClient();
    const hasSynced = useRef(false);

    // Guest cart in localStorage
    const [localItems, setLocalItems] = useLocalStorage<LocalCartItem[]>(
        LOCAL_CART_KEY,
        []
    );

    // DB cart query — only when authenticated
    const cartQuery = useQuery({
        queryKey: queryKeys.cart.all,
        queryFn: fetchCart,
        enabled: isAuthenticated,
        staleTime: 1000 * 60,
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: apiAddToCart,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
    });

    const updateMutation = useMutation({
        mutationFn: apiUpdateCartItem,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
    });

    const removeMutation = useMutation({
        mutationFn: apiRemoveFromCart,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
    });

    const syncMutation = useMutation({
        mutationFn: apiSyncCart,
        onSuccess: () => {
            setLocalItems([]);
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        },
    });

    // ─── Sync local → DB on login ───────────────────────────
    useEffect(() => {
        if (isAuthenticated && localItems.length > 0 && !hasSynced.current) {
            hasSynced.current = true;
            syncMutation.mutate({ items: localItems });
        }
        if (!isAuthenticated) {
            hasSynced.current = false;
        }
    }, [isAuthenticated, localItems, syncMutation]);

    // ─── Unified items ──────────────────────────────────────
    const dbItems: CartItem[] =
        cartQuery.data?.data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product,
            subtotal: item.subtotal,
        })) ?? [];

    const guestItems: CartItem[] = localItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: null,
        subtotal: 0,
    }));

    const items = isAuthenticated ? dbItems : guestItems;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = isAuthenticated
        ? cartQuery.data?.data.total ?? 0
        : 0;

    // ─── Actions ─────────────────────────────────────────────
    const isInCart = useCallback(
        (productId: string) => items.some((i) => i.productId === productId),
        [items]
    );

    const addItem = useCallback(
        (productId: string, quantity = 1) => {
            if (isAuthenticated) {
                addMutation.mutate({ productId, quantity });
            } else {
                setLocalItems((prev) => {
                    const existing = prev.find((i) => i.productId === productId);
                    if (existing) {
                        return prev.map((i) =>
                            i.productId === productId
                                ? { ...i, quantity: i.quantity + quantity }
                                : i
                        );
                    }
                    return [...prev, { productId, quantity }];
                });
            }
        },
        [isAuthenticated, addMutation, setLocalItems]
    );

    const updateItem = useCallback(
        (productId: string, quantity: number) => {
            if (isAuthenticated) {
                updateMutation.mutate({ productId, quantity });
            } else {
                setLocalItems((prev) =>
                    prev.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    )
                );
            }
        },
        [isAuthenticated, updateMutation, setLocalItems]
    );

    const removeItem = useCallback(
        (productId: string) => {
            if (isAuthenticated) {
                removeMutation.mutate({ productId });
            } else {
                setLocalItems((prev) =>
                    prev.filter((i) => i.productId !== productId)
                );
            }
        },
        [isAuthenticated, removeMutation, setLocalItems]
    );

    const isMutating =
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        syncMutation.isPending;

    const mutatingProductId =
        (addMutation.isPending && addMutation.variables?.productId) ||
        (updateMutation.isPending && updateMutation.variables?.productId) ||
        (removeMutation.isPending && removeMutation.variables?.productId) ||
        null;

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                total,
                isInCart,
                addItem,
                updateItem,
                removeItem,
                isLoading: cartQuery.isLoading && isAuthenticated,
                isMutating,
                mutatingProductId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCartStore() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCartStore must be used within a CartProvider");
    }
    return ctx;
}
