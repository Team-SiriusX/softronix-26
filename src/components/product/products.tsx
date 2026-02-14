"use client";

import { useProductFilters } from "@/components/providers/chat-provider";
import { useCartStore } from "@/hooks/use-cart-store";
import { useProducts } from "@/services/queries/products";
import { Loader2, PackageSearch } from "lucide-react";
import { useEffect, useRef } from "react";
import { ProductCard } from "./productCard";

export function Products() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { filters } = useProductFilters();

  // ─── Queries & cart store ────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useProducts(filters);

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
      { threshold: 0.1, rootMargin: "300px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ─── Loading skeleton ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full space-y-12">
        <div className="border-b border-[#1c1c1c]/10 pb-8">
          <div className="h-12 w-64 animate-pulse rounded bg-[#e8e5df]" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-[#e8e5df]" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] w-full animate-pulse rounded bg-[#e8e5df]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#e8e5df]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#e8e5df]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <PackageSearch className="h-16 w-16 text-[#1c1c1c]/20" />
        <p className="font-gloock text-2xl text-[#1c1c1c]">
          Failed to load products
        </p>
        <p className="text-sm text-[#5c5c5c]">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="border-b border-[#1c1c1c]/10 pb-8">
        <h1 className="font-gloock text-4xl tracking-tight text-[#1c1c1c] md:text-5xl">
          All Products
        </h1>
        <p className="mt-2 font-sans text-sm text-[#5c5c5c]">
          Showing{" "}
          <span className="font-semibold text-[#1c1c1c]">
            {products.length}
          </span>{" "}
          of <span className="font-semibold text-[#1c1c1c]">{total}</span>{" "}
          products
        </p>
      </div>

      {/* Product grid - matching landing page */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:grid-cols-4">
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
      <div ref={sentinelRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#5c5c5c]">
            <Loader2 className="h-4 w-4 animate-spin text-[#1c1c1c]" />
            Loading more…
          </div>
        )}
        {!hasNextPage && products.length > 0 && (
          <div className="px-6 py-3 text-sm text-[#5c5c5c]">
            You&apos;ve seen all {total} products
          </div>
        )}
      </div>
    </div>
  );
}
