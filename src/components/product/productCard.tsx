"use client";

import { ShoppingCart, Check, Package, CheckCircle, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/services/types";
import { useChatContext } from "@/components/providers/chat-provider";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (productId: string) => void;
  isAddingToCart?: boolean;
  isInCart?: boolean;
};

export function ProductCard({
  product,
  onAddToCart,
  isAddingToCart,
  isInCart,
}: ProductCardProps) {
  const inStock = product.stock_status === "in_stock";
  const imageUrl = product.images?.[0];
  const category = product.category?.[0] || "Grooming";
  const { getAdjustedPrice } = useChatContext();
  const adjustment = getAdjustedPrice(product.id);

  return (
    <div id={`product-${product.id}`} className="group block">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden bg-[#e8e5df]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-14 w-14 text-[#1c1c1c]/20" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute left-3 top-3 bg-[#f2efe9]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#1c1c1c] backdrop-blur-sm">
            {category}
          </div>

          {/* Discount Badge */}
          {product.price.discount_percentage &&
            product.price.discount_percentage > 0 && (
              <div className="absolute right-3 top-3 bg-[#1c1c1c] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f2efe9]">
                -{product.price.discount_percentage}%
              </div>
            )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-gloock text-lg leading-tight text-[#1c1c1c] md:text-xl">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 font-sans text-sm">
          {adjustment ? (
            <>
              <span className="font-medium text-red-600">
                {adjustment.formattedPrice}
              </span>
              <span className="text-xs text-[#5c5c5c] line-through">
                {product.price.currency} {product.price.current}
              </span>
              <span className="flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                <TrendingUp className="h-3 w-3" />
                +{adjustment.increasePercentage}%
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-[#1c1c1c]">
                {product.price.currency} {product.price.current}
              </span>
              {product.price.original && (
                <span className="text-xs text-[#5c5c5c] line-through">
                  {product.price.currency} {product.price.original}
                </span>
              )}
            </>
          )}
        </div>

        {/* Rating if available */}
        {product.reviews.average_rating && (
          <div className="flex items-center gap-1 text-xs text-[#5c5c5c]">
            <span>★</span>
            <span>{product.reviews.average_rating}</span>
            {product.reviews.count && (
              <span className="opacity-60">({product.reviews.count})</span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="pt-2">
          {isInCart ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c]/20 bg-[#1c1c1c]/5 px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#1c1c1c]"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              In Cart
            </button>
          ) : (
            <button
              onClick={() => onAddToCart?.(product.id)}
              disabled={!inStock || isAddingToCart}
              className={`w-full px-4 py-2 text-xs font-medium uppercase tracking-widest transition-all disabled:opacity-40 ${
                inStock
                  ? "border border-[#1c1c1c] bg-transparent text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
                  : "border border-[#1c1c1c]/20 bg-[#1c1c1c]/5 text-[#5c5c5c]"
              }`}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#1c1c1c]/30 border-t-[#1c1c1c]" />
                  Adding…
                </span>
              ) : (
                <>{inStock ? "Add to Cart" : "Out of Stock"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
