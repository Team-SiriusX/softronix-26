"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { store } from "@/constants/store";

gsap.registerPlugin(ScrollTrigger);

export default function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const products = store.products.slice(0, 4);

  useEffect(() => {
    const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray(".product-card");
        
        gsap.fromTo(cards, 
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-4 md:px-8 bg-[#dad4d1] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-16 text-[#292725] tracking-tight">
          Featured Originals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div 
                key={index} 
                className="product-card group relative flex flex-col gap-4"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white/50 relative">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-[#292725]">{product.name}</h3>
                    <p className="text-sm text-[#555] mt-1 line-clamp-2">{product.description}</p>
                </div>
                {/* Use formatted price to avoid object errors */}
                <span className="text-sm font-semibold text-[#292725]">{product.price.formatted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
