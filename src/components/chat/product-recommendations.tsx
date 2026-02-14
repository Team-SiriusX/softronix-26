"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/constants/store";

interface ProductRecommendationsProps {
  products: Product[];
  isLatest: boolean;
}

export default function ProductRecommendations({
  products,
  isLatest,
}: ProductRecommendationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isLatest) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll(".product-card");
      if (!cards) return;
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, [isLatest]);

  if (!products || products.length === 0) return null;

  return (
    <div ref={containerRef} className="mt-6 ml-0 md:ml-12">
      <p className="text-xs uppercase tracking-wider text-[#555] mb-4 font-medium">
        Recommended Products
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product, index) => {
          const priceFormatted =
            typeof product.price === "object"
              ? product.price?.formatted
              : product.price;

          return (
            <Link
              key={product.id || index}
              href={`/products/${product.id}`}
              className="product-card group block"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden border border-[#292725]/10 hover:border-[#292725]/30 transition-all duration-300 hover:shadow-lg">
                {product.images && product.images[0] && (
                  <div className="aspect-square overflow-hidden bg-white/50 relative">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-sm text-[#292725] line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  {product.reviews && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= Math.round(product.reviews?.average_rating || 0)
                                ? "text-amber-400"
                                : "text-gray-300"
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#888]">
                        {product.reviews.average_rating?.toFixed(1)} ({product.reviews.count})
                      </span>
                    </div>
                  )}
                  {priceFormatted && (
                    <p className="text-xs font-semibold text-[#555]">
                      {priceFormatted}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
