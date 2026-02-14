"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/constants/store";
import { ArrowRight } from "lucide-react";

export default function BestSellers() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter best sellers
    const bestSellers = store.products.filter((p) =>
        p.category.includes("Best Sellers")
    );

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (containerRef.current && scrollRef.current) {

            const scrollContainer = scrollRef.current;
            const totalWidth = scrollContainer.scrollWidth;
            const windowWidth = containerRef.current.offsetWidth;
            const scrollAmount = totalWidth - windowWidth;

            // Horizontal scroll animation
            gsap.to(scrollContainer, {
                x: -scrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    // content scroll width - viewport width
                    end: () => "+=" + scrollAmount,
                    invalidateOnRefresh: true,
                },
            });
        }
        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        }
    }, []);

    return (
        <section ref={containerRef} className="bg-[#1a1a1a] text-[#f2efe9] overflow-hidden relative min-h-screen flex items-center">

            <div className="absolute top-12 left-12 z-10">
                <h2 className="text-sm font-medium tracking-widest uppercase opacity-60 mb-2">Curated Selection</h2>
                <h3 className="text-4xl md:text-5xl font-serif">Best Sellers</h3>
            </div>

            <div ref={scrollRef} className="flex gap-12 px-12 md:pl-[30vw] items-center h-full w-[max-content]">
                {bestSellers.map((product, index) => (
                    <div
                        key={product.id}
                        className="best-seller-card relative w-[80vw] md:w-[25vw] aspect-[3/4] flex-shrink-0 group"
                    >
                        <div className="w-full h-full relative overflow-hidden bg-[#2a2a2a]">
                            {product.images?.[0] && (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-2xl font-serif mb-1">{product.name}</h4>
                                    <p className="text-sm opacity-80">{product.price.formatted}</p>
                                </div>
                                <Link
                                    href={`/products/${product.id}`}
                                    className="w-10 h-10 rounded-full bg-[#f2efe9] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* View All Card */}
                <div className="best-seller-card relative w-[80vw] md:w-[25vw] aspect-[3/4] flex-shrink-0 flex items-center justify-center bg-[#2a2a2a] group cursor-pointer">
                    <Link href="/products" className="text-center">
                        <div className="w-16 h-16 rounded-full border border-[#f2efe9]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#f2efe9] group-hover:text-black transition-all">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-serif">View All Products</h4>
                    </Link>
                </div>
            </div>
        </section>
    );
}
