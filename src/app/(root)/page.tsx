"use client";

import EntranceAnimation from "@/components/landing/EntranceAnimation";
import { MarqueeSection } from "@/components/landing/marquee-section";
import { AboutSection } from "@/components/landing/about-section";
import ProductShowcase from "@/components/landing/product-showcase";
import { CategoryShowcase } from "@/components/landing/category-showcase";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="bg-[#f2efe9] min-h-screen selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
      <EntranceAnimation />
      <MarqueeSection />
      <AboutSection />
      <ProductShowcase />
      <CategoryShowcase />
      <Footer />
    </main>
  );
}


