"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Use the model.jpeg image from public folder
  const brandImage = "/model.jpeg";

  useEffect(() => {
    // All animations disabled for static display
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[#f2efe9] py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
         {/* Left: Content */}
         <div className="flex flex-col gap-8 max-w-2xl px-4 lg:px-12">
            <span className="reveal-text block text-xs font-medium tracking-[0.2em] uppercase opacity-60 font-sans">
              Our Philosophy
            </span>
            <h2 className="reveal-text text-5xl md:text-7xl lg:text-8xl font-gloock text-[#1c1c1c] leading-[0.9] -tracking-[0.02em]">
              Crafted for the <br/><span className="italic font-serif font-light text-[#5c5c5c]">Modern Gentleman.</span>
            </h2>
            <div className="reveal-text h-[1px] w-24 bg-[#1c1c1c] opacity-20 my-4" />
            <p className="reveal-text text-lg md:text-xl font-sans text-[#5c5c5c] leading-relaxed max-w-lg">
              We believe that grooming is an art form. Our products are meticulously formulated with premium natural ingredients to enhance your daily ritual, not complicate it.
            </p>
         </div>

         {/* Right: Image */}
         <div ref={imageRef} className="relative aspect-[4/5] w-full overflow-hidden bg-[#e8e5df]">
             <Image 
                 src={brandImage} 
                 alt="Grooming Ritual"
                 fill
                 className="object-cover"
                 onError={(e) => {
                     // Fallback purely CSS if image missing
                     e.currentTarget.style.opacity = '0';
                 }}
             />
             <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
         </div>
      </div>
    </section>
  );
}
