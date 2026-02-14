"use client";

import { useEffect, useRef } from "react";

export function MarqueeSection() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // All animations disabled for static display
  }, []);

  return (
    <section 
      ref={marqueeRef}
      className="w-full py-12 border-y border-[#1c1c1c]/10 bg-[#f2efe9] overflow-hidden"
    >
      <div 
        ref={trackRef} 
        className="flex gap-16 items-center justify-center text-4xl md:text-6xl lg:text-8xl font-serif text-[#1c1c1c]/10 uppercase tracking-tighter"
      >
        <span>Premium Grooming</span>
        <span>•</span>
        <span>Essential Care</span>
        <span>•</span>
        <span>Timeless Style</span>
        <span>•</span>
        <span>Natural Ingredients</span>
        <span>•</span>
      </div>
    </section>
  );
}
