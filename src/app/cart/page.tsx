"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSession } from "@/lib/auth-client";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowLeft,
    Loader2,
    Package,
    ChevronRight,
} from "lucide-react";

export default function CartPage() {
    const {
        items,
        itemCount,
        total,
        updateItem,
        removeItem,
        isLoading,
        isMutating,
    } = useCartStore();
    const session = useSession();
    const isAuthenticated = !!session.data?.user;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/products"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        Shopping Cart
                    </h1>
                    {itemCount > 0 && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                        </p>
                    )}
                </div>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading your cart…</p>
                </div>
            ) : items.length === 0 ? (
                /* Empty */
                <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-card/50 py-24">
                    <div className="rounded-2xl bg-muted/50 p-6">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">
                            Your cart is empty
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse products and add items to your cart
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                /* Cart content */
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Items */}
                    <div className="space-y-3 lg:col-span-2">
                        {items.map((item) => (
                            <div
                                key={item.productId}
                                className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                                    {item.product?.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name ?? "Product"}
                                            fill
                                            sizes="112px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <p className="line-clamp-2 text-sm font-semibold text-card-foreground sm:text-base">
                                            {item.product?.name ?? item.productId}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-primary">
                                            {item.product?.formattedPrice ??
                                                `Rs.${item.subtotal.toLocaleString()}`}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() =>
                                                    item.quantity > 1
                                                        ? updateItem(item.productId, item.quantity - 1)
                                                        : removeItem(item.productId)
                                                }
                                                disabled={isMutating}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateItem(item.productId, item.quantity + 1)
                                                }
                                                disabled={isMutating}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.subtotal > 0 && (
                                                <span className="text-sm font-semibold text-foreground">
                                                    Rs.{item.subtotal.toLocaleString()}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                disabled={isMutating}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-card-foreground">
                                Order Summary
                            </h2>
                            <div className="space-y-3 border-b border-border pb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal ({itemCount}{" "}
                                        {itemCount === 1 ? "item" : "items"})
                                    </span>
                                    <span className="font-medium text-foreground">
                                        Rs.{total.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-base font-bold text-foreground">
                                    Total
                                </span>
                                <span className="text-xl font-extrabold text-foreground">
                                    Rs.{total.toLocaleString()}
                                </span>
                            </div>

                            <Link
                                href={isAuthenticated ? "/checkout" : "#"}
                                onClick={(e) => {
                                    if (!isAuthenticated) {
                                        e.preventDefault();
                                        alert("Please sign in to checkout.");
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                            >
                                {!isAuthenticated
                                    ? "Sign in to Checkout"
                                    : "Proceed to Checkout"}
                                <ChevronRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/products"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
