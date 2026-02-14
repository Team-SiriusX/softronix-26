"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/constants/store";

export default function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get more products to flood the section
  const displayProducts = store.products.slice(0, 12);

  useEffect(() => {
    // All animations disabled for static display
  }, []);

  return (
    <section 
        ref={containerRef} 
        className="w-full bg-[#f2efe9] px-6 py-24 md:py-32"
    >
      <div className="max-w-[120rem] mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 border-b border-[#1c1c1c]/10 pb-8">
            <h2 className="text-4xl md:text-5xl font-gloock text-[#1c1c1c] tracking-tight">
              Collection
            </h2>
        </div>

        {/* Product Grid - Clean & Minimal */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
          {displayProducts.map((product, index) => {
             if (!product) return null;
             const category = product.category?.[0] || 'Grooming';
             
             return (
            <Link 
                href={`/products/${product.id}`}
                key={product.id || index} 
                className="product-item group block"
            >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e8e5df] mb-4">
                    {product.images?.[0] ? (
                        <Image 
                            src={product.images[0]} 
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover object-center"
                        />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center bg-[#dad5cb] text-[#a59d8f] text-xs">
                            No Image
                        </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-[#f2efe9]/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-widest font-medium text-[#1c1c1c]">
                        {category}
                    </div>
                    
                    {/* Discount Badge */}
                    {product.price.discount_percentage && product.price.discount_percentage > 0 && (
                        <div className="absolute top-3 right-3 bg-[#1c1c1c] text-[#f2efe9] px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                           -{product.price.discount_percentage}%
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                    <h3 className="font-gloock text-lg md:text-xl text-[#1c1c1c] leading-tight">
                        {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 font-sans text-sm">
                       <span className="font-medium text-[#1c1c1c]">
                           {product.price.currency} {product.price.current}
                       </span>
                       {product.price.original && (
                           <span className="line-through text-[#5c5c5c] text-xs">
                               {product.price.currency} {product.price.original}
                           </span>
                       )}
                    </div>

                    {/* Rating if available */}
                    {product.reviews.average_rating && (
                        <div className="flex items-center gap-1 text-[#5c5c5c] text-xs">
                            <span>★</span>
                            <span>{product.reviews.average_rating}</span>
                            {product.reviews.count && (
                                <span className="opacity-60">({product.reviews.count})</span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
          )})}
        </div>

        {/* View All Link */}
        <div className="mt-20 text-center">
            <Link 
                href="/products" 
                className="inline-block text-sm uppercase tracking-[0.2em] border-b border-[#1c1c1c]/30 pb-1 hover:border-[#1c1c1c] transition-colors font-medium"
            >
                View All Products
            </Link>
        </div>

      </div>
    </section>
  );
}
