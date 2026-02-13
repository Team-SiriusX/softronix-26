"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price?: {
    formatted?: string;
  } | string;
  images?: string[];
  url?: string;
}

interface ProductRecommendationsProps {
  products: Product[];
  isLatest: boolean;
}

export default function ProductRecommendations({ products, isLatest }: ProductRecommendationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isLatest) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll(".product-card");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product, index) => {
          const priceFormatted = typeof product.price === 'object' 
            ? product.price?.formatted 
            : product.price;
          
          return (
            <Link
              key={product.id || index}
              href={product.url || "#"}
              target="_blank"
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
                  <h3 className="font-medium text-sm text-[#292725] line-clamp-2 mb-2">
                    {product.name}
                  </h3>
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
