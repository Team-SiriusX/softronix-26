"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/constants/store";

export function CategoryShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Prepare categories
  const categories = [
    { name: "Face", span: "col-span-1 md:col-span-2 lg:col-span-2", aspect: "aspect-[16/9]" },
    { name: "Hair Care", span: "col-span-1 md:col-span-1 lg:col-span-1", aspect: "aspect-[3/4]" },
    { name: "Beard", span: "col-span-1 md:col-span-1 lg:col-span-1", aspect: "aspect-[3/4]" },
    { name: "Bundles", span: "col-span-1 md:col-span-2 lg:col-span-2", aspect: "aspect-[16/9]" },
  ];

  useEffect(() => {
    // All animations disabled for static display
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[#f2efe9] py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-[100rem] mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-gloock mb-16 text-center tracking-tight">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 auto-rows-fr">
          {categories.map((cat, idx) => {
             // Find an image for the category
             const product = store.products.find(p => p.category?.some(c => c.toLowerCase() === cat.name.toLowerCase()));
             const imageSrc = product?.images?.[0] || null;

             return (
               <Link 
                  href={`/products?category=${cat.name}`} 
                  key={cat.name} 
                  className={`cat-card relative group overflow-hidden ${cat.span} ${cat.aspect} bg-[#e8e5df]`}
               >
                  {imageSrc ? (
                      <Image 
                        src={imageSrc} 
                        alt={cat.name} 
                        fill
                        className="object-cover opacity-90"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#dad5cb] text-[#a59d8f] font-sans text-xs uppercase tracking-widest">
                          {cat.name}
                      </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Text */}
                  <div className="absolute bottom-6 left-6 text-[#f2efe9] text-xs font-sans font-medium tracking-[0.2em] uppercase">
                      {cat.name}
                  </div>
               </Link>
             );
          })}
        </div>
      </div>
    </section>
  );
}
