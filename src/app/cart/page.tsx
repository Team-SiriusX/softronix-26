"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart-store";
import { useChatContext } from "@/components/providers/chat-provider";
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
    Tag,
    X,
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
    const { appliedCoupons, removeCoupon, couponDiscount, getCouponForProduct, getAdjustedPrice } = useChatContext();
    const session = useSession();
    const isAuthenticated = !!session.data?.user;

    const finalTotal = Math.max(0, total - couponDiscount);

    return (
        <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
            {/* Header */}
            <div className="border-b border-[#1c1c1c]/10 bg-[#f2efe9]">
                <div className="mx-auto max-w-[100rem] px-6 py-6 md:px-12 lg:px-24">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/products"
                            className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-opacity hover:opacity-60"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[100rem] px-6 py-12 md:px-12 lg:px-24">
                {/* Page Title */}
                <div className="mb-12 border-b border-[#1c1c1c]/10 pb-8">
                    <h1 className="font-gloock text-4xl tracking-tight text-[#1c1c1c] md:text-5xl">
                        Shopping Cart
                    </h1>
                    {itemCount > 0 && (
                        <p className="mt-2 font-sans text-sm text-[#5c5c5c]">
                            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                        </p>
                    )}
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1c1c1c]" />
                        <p className="text-sm text-[#5c5c5c]">Loading your cart…</p>
                    </div>
                ) : items.length === 0 ? (
                    /* Empty */
                    <div className="flex flex-col items-center justify-center gap-6 border border-dashed border-[#1c1c1c]/20 bg-[#f7f4f0] py-32">
                        <ShoppingBag className="h-20 w-20 text-[#1c1c1c]/20" />
                        <div className="text-center">
                            <p className="font-gloock text-2xl text-[#1c1c1c]">
                                Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-[#5c5c5c]">
                                Browse products and add items to your cart
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="mt-4 border border-[#1c1c1c] bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-all hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    /* Cart content */
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Items */}
                        <div className="space-y-4 lg:col-span-2">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-6 border-b border-[#1c1c1c]/10 pb-6"
                                >
                                    <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-[#e8e5df]">
                                        {item.product?.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name ?? "Product"}
                                                fill
                                                sizes="128px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-10 w-10 text-[#1c1c1c]/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="font-gloock text-lg text-[#1c1c1c] md:text-xl">
                                                {item.product?.name ?? item.productId}
                                            </h3>
                                            {getCouponForProduct(item.productId) ? (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <p className="font-sans text-sm text-[#5c5c5c] line-through">
                                                        {getCouponForProduct(item.productId)!.formattedOriginalPrice}
                                                    </p>
                                                    <p className="font-sans text-sm font-semibold text-green-700">
                                                        {getCouponForProduct(item.productId)!.formattedDiscountedPrice}
                                                    </p>
                                                    <span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800">
                                                        <Tag className="h-3 w-3" />
                                                        {getCouponForProduct(item.productId)!.couponCode}
                                                    </span>
                                                </div>
                                            ) : getAdjustedPrice(item.productId) ? (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <p className="font-sans text-sm text-[#5c5c5c] line-through">
                                                        {item.product?.formattedPrice ?? `Rs.${item.subtotal.toLocaleString()}`}
                                                    </p>
                                                    <p className="font-sans text-sm font-semibold text-red-700">
                                                        {getAdjustedPrice(item.productId)!.formattedPrice}
                                                    </p>
                                                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800">
                                                        +{getAdjustedPrice(item.productId)!.increasePercentage}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="mt-1 font-sans text-sm font-medium text-[#1c1c1c]">
                                                    {item.product?.formattedPrice ??
                                                        `Rs.${item.subtotal.toLocaleString()}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3 border border-[#1c1c1c]/20">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1
                                                            ? updateItem(item.productId, item.quantity - 1)
                                                            : removeItem(item.productId)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-10 w-10 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9] disabled:opacity-40"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-12 text-center text-sm font-medium text-[#1c1c1c]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateItem(item.productId, item.quantity + 1)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-10 w-10 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9] disabled:opacity-40"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                {item.subtotal > 0 && (
                                                    <span className="font-sans text-base font-semibold text-[#1c1c1c]">
                                                        Rs.{item.subtotal.toLocaleString()}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    disabled={isMutating}
                                                    className="flex h-10 w-10 items-center justify-center text-[#5c5c5c] transition-colors hover:text-[#1c1c1c] disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-6 border border-[#1c1c1c]/10 bg-[#f7f4f0] p-6">
                                <h2 className="border-b border-[#1c1c1c]/10 pb-4 font-gloock text-2xl tracking-tight text-[#1c1c1c]">
                                    Order Summary
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between font-sans text-sm">
                                        <span className="text-[#5c5c5c]">
                                            Subtotal ({itemCount}{" "}
                                            {itemCount === 1 ? "item" : "items"})
                                        </span>
                                        <span className="font-medium text-[#1c1c1c]">
                                            Rs.{total.toLocaleString()}
                                        </span>
                                    </div>
                                    {appliedCoupons.length > 0 && (
                                        <div className="space-y-2">
                                            {appliedCoupons.map((coupon) => (
                                                <div key={coupon.productId} className="flex items-center justify-between rounded bg-green-50 px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-3.5 w-3.5 text-green-700" />
                                                        <span className="text-xs font-semibold text-green-800">{coupon.couponCode}</span>
                                                        <span className="text-xs text-green-700">({coupon.discountPercentage}% off)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-green-800">
                                                            -Rs.{(coupon.originalPrice - coupon.discountedPrice).toLocaleString()}
                                                        </span>
                                                        <button
                                                            onClick={() => removeCoupon(coupon.productId)}
                                                            className="text-green-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between font-sans text-sm">
                                        <span className="text-[#5c5c5c]">Shipping</span>
                                        <span className="font-medium text-[#1c1c1c]">Free</span>
                                    </div>
                                </div>
                                <div className="flex justify-between border-t border-[#1c1c1c]/10 pt-4">
                                    <span className="font-gloock text-lg text-[#1c1c1c]">
                                        Total
                                    </span>
                                    <div className="text-right">
                                        {couponDiscount > 0 && (
                                            <span className="mr-2 font-sans text-sm text-[#5c5c5c] line-through">
                                                Rs.{total.toLocaleString()}
                                            </span>
                                        )}
                                        <span className="font-gloock text-2xl text-[#1c1c1c]">
                                            Rs.{finalTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <Link
                                        href={isAuthenticated ? "/checkout" : "#"}
                                        onClick={(e) => {
                                            if (!isAuthenticated) {
                                                e.preventDefault();
                                                alert("Please sign in to checkout.");
                                            }
                                        }}
                                        className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c] bg-[#1c1c1c] px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c]"
                                    >
                                        {!isAuthenticated
                                            ? "Sign in to Checkout"
                                            : "Proceed to Checkout"}
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        href="/products"
                                        className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c]/20 bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-all hover:border-[#1c1c1c]"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
