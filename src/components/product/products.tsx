"use client";

import { useRef, useEffect } from "react";
import { ProductCard } from "./productCard";
import { Loader2, PackageSearch } from "lucide-react";
import { useProducts } from "@/services/queries/products";
import { useCartStore } from "@/hooks/use-cart-store";

export function Products() {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // ─── Queries & cart store ────────────────────────────────
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useProducts();

    const { isInCart, addItem, isMutating, mutatingProductId } = useCartStore();

    // Flatten pages
    const products = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.total ?? 0;

    // ─── Infinite scroll observer ────────────────────────────
    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "300px" }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ─── Loading skeleton ────────────────────────────────────
    if (isLoading) {
        return (
            <div className="w-full space-y-8">
                <div className="space-y-1">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {Array.from({ length: 10 }, (_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-2xl border border-border/40 bg-card"
                        >
                            <div className="aspect-4/3 rounded-t-2xl bg-muted" />
                            <div className="space-y-3 p-4">
                                <div className="flex gap-1">
                                    <div className="h-4 w-14 rounded-full bg-muted" />
                                    <div className="h-4 w-16 rounded-full bg-muted" />
                                </div>
                                <div className="h-5 w-3/4 rounded bg-muted" />
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-7 w-28 rounded bg-muted" />
                                <div className="h-10 w-full rounded-xl bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ─── Error state ─────────────────────────────────────────
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <PackageSearch className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg font-semibold text-foreground">
                    Failed to load products
                </p>
                <p className="text-sm text-muted-foreground">
                    Please try refreshing the page.
                </p>
            </div>
        );
    }

    // ─── Main render ─────────────────────────────────────────
    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Our Products
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                            {products.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground">{total}</span>{" "}
                        products
                    </p>
                </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={(id) => addItem(id)}
                        isAddingToCart={isMutating && mutatingProductId === product.id}
                        isInCart={isInCart(product.id)}
                    />
                ))}
            </div>

            {/* Scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-6">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2.5 rounded-full bg-muted/60 px-5 py-2.5 backdrop-blur-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Loading more…
                        </span>
                    </div>
                )}
                {!hasNextPage && products.length > 0 && (
                    <div className="rounded-full bg-muted/40 px-5 py-2 text-sm text-muted-foreground">
                        You&apos;ve seen all {total} products ✨
                    </div>
                )}
            </div>
        </div>
    );
}
