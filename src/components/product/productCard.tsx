"use client";

import { ShoppingCart, Star, StarHalf, Check, Package, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/services/types";

type ProductCardProps = {
    product: Product;
    onAddToCart?: (productId: string) => void;
    isAddingToCart?: boolean;
    isInCart?: boolean;
};

function StarRating({ rating, count }: { rating: number; count: number }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center">
                {Array.from({ length: fullStars }, (_, i) => (
                    <Star
                        key={`full-${i}`}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                ))}
                {hasHalf && (
                    <StarHalf className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                )}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-border" />
                ))}
            </div>
            <span className="text-xs font-semibold text-foreground">
                {rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-muted-foreground">({count})</span>
        </div>
    );
}

export function ProductCard({
    product,
    onAddToCart,
    isAddingToCart,
    isInCart,
}: ProductCardProps) {
    const inStock = product.stock_status === "in_stock";
    const hasDiscount =
        product.price.original && product.price.discount_percentage;
    const imageUrl = product.images?.[0];

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/4 hover:-translate-y-1 dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-white/2">
            {/* Image */}
            <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-muted to-muted/60">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-14 w-14 text-muted-foreground/30" />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badges */}
                <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
                    {hasDiscount ? (
                        <span className="rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white shadow-md shadow-red-500/30">
                            {product.price.discount_percentage}% OFF
                        </span>
                    ) : (
                        <span />
                    )}

                    <span
                        className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold shadow-md backdrop-blur-md ${inStock
                                ? "bg-emerald-500/90 text-white shadow-emerald-500/20"
                                : "bg-zinc-800/80 text-zinc-300"
                            }`}
                    >
                        {inStock ? (
                            <>
                                <Check className="h-3 w-3" strokeWidth={3} />
                                In Stock
                            </>
                        ) : (
                            "Sold Out"
                        )}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2.5 p-4">
                {/* Category pills */}
                <div className="flex flex-wrap gap-1">
                    {product.category.slice(0, 2).map((cat) => (
                        <span
                            key={cat}
                            className="rounded-full bg-primary/7 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary dark:bg-primary/15"
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                {/* Name */}
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-card-foreground">
                    {product.name}
                </h3>

                {/* Star rating */}
                {product.reviews.average_rating !== null &&
                    product.reviews.count > 0 && (
                        <StarRating
                            rating={product.reviews.average_rating}
                            count={product.reviews.count}
                        />
                    )}

                {/* Spacer */}
                <div className="mt-auto" />

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-card-foreground">
                        {product.price.formatted}
                    </span>
                    {product.price.original && (
                        <span className="text-sm font-medium text-muted-foreground/70 line-through">
                            Rs.{product.price.original.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Add to Cart / Added to Cart */}
                {isInCart ? (
                    <button
                        disabled
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Added to Cart
                    </button>
                ) : (
                    <button
                        onClick={() => onAddToCart?.(product.id)}
                        disabled={!inStock || isAddingToCart}
                        className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${inStock
                                ? "bg-primary text-primary-foreground hover:brightness-110"
                                : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {isAddingToCart ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                Adding…
                            </span>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4" />
                                {inStock ? "Add to Cart" : "Out of Stock"}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
