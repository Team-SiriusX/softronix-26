"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Star } from "lucide-react";

const reviews = [
    {
        name: "Ahmed K.",
        review: "The Beard Growth Kit actually works! Started seeing results in just 3 weeks.",
        rating: 5,
    },
    {
        name: "Bilal R.",
        review: "Surge Perfume smells amazing, lasts all day. Definitely buying again.",
        rating: 5,
    },
    {
        name: "Omer S.",
        review: "Glow Face Wash is a game changer for my skin routine.",
        rating: 5,
    },
    {
        name: "Zain M.",
        review: "Fast delivery and great packaging. Highly recommended.",
        rating: 4,
    },
    {
        name: "Hassan A.",
        review: "Finally found a hair wax that holds without making my hair look greasy.",
        rating: 5,
    },
];

export default function Testimonials() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const marquee = marqueeRef.current;
        const content = contentRef.current;
        if (!marquee || !content) return;

        // Simple GSAP marquee
        const totalWidth = content.scrollWidth;

        gsap.to(content, {
            x: -totalWidth / 2,
            duration: 20,
            ease: "none",
            repeat: -1,
        });
    }, []);

    return (
        <section className="py-24 bg-[#111] text-[#f2efe9] overflow-hidden">
            <div className="container mx-auto px-6 mb-16 text-center">
                <h2 className="text-3xl md:text-5xl font-serif mb-4">What Our Customers Say</h2>
                <p className="opacity-60 max-w-xl mx-auto">
                    Join thousands of satisfied men who have upgraded their grooming game.
                </p>
            </div>

            <div className="w-full overflow-hidden" ref={marqueeRef}>
                <div
                    ref={contentRef}
                    className="flex gap-8 w-max pl-6"
                >
                    {/* Render twice for seamless loop */}
                    {[...reviews, ...reviews].map((review, index) => (
                        <div
                            key={index}
                            className="w-[300px] md:w-[400px] flex-shrink-0 bg-[#222] p-8 rounded-lg border border-[#333]"
                        >
                            <div className="flex gap-1 mb-4 text-[#a99c90]">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "fill-current" : "opacity-30"}`}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                    />
                                ))}
                            </div>
                            <p className="text-lg font-serif mb-6 whitespace-normal leading-relaxed min-h-[80px]">
                                "{review.review}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f2efe9] text-black flex items-center justify-center font-bold">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium">{review.name}</h4>
                                    <span className="text-xs opacity-50 uppercase tracking-wider">Verified Buyer</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
