"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/constants/store";

export default function SpotlightSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    // Using "Surge Perfume" as the spotlight product for its premium appeal
    const product = store.products.find(p => p.id === "surge-perfume") || store.products[1];

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const matchMedia = gsap.matchMedia();

        matchMedia.add("(min-width: 768px)", () => {
            if (containerRef.current) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "+=150%",
                        pin: true,
                        scrub: 1,
                    }
                });

                tl.to(".spotlight-text", {
                    y: -50,
                    opacity: 0,
                    duration: 1
                })
                    .to(".spotlight-image", {
                        scale: 1.2,
                        duration: 2,
                    }, "<")
                    .from(".spotlight-details", {
                        y: 100,
                        opacity: 0,
                        duration: 1.5
                    }, "-=1");
            }
        });

        return () => matchMedia.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#111] text-[#f2efe9]">
            <div className="absolute inset-0 z-0 spotlight-image">
                {product.images?.[0] && (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-90" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                <div className="spotlight-text mb-12">
                    <h5 className="text-sm md:text-base tracking-[0.3em] uppercase opacity-70 mb-4">The Masterpiece</h5>
                    <h2 className="text-5xl md:text-8xl font-[family-name:var(--font-gloock)] leading-none">
                        {product.name.split(" ")[0]} <br />
                        <span className="italic font-serif">{product.name.split(" ")[1]}</span>
                    </h2>
                </div>

                <div className="spotlight-details max-w-xl space-y-8">
                    <p className="text-lg md:text-xl font-light opacity-80 leading-relaxed">
                        {product.extendedDescription || product.description}
                    </p>

                    <div className="flex items-center justify-center gap-6">
                        <Link
                            href={`/products/${product.id}`}
                            className="inline-block px-10 py-4 border border-[#f2efe9]/30 hover:bg-[#f2efe9] hover:text-[#111] transition-all duration-500 rounded-full text-sm uppercase tracking-widest backdrop-blur-sm"
                        >
                            Discover Essence
                        </Link>
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs opacity-50 uppercase tracking-wide">Price</span>
                            <span className="text-xl font-[family-name:var(--font-gloock)]">{product.price.formatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
