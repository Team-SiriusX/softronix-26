"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { store } from "@/constants/store";
import { Truck, ShieldCheck, Sprout, Star } from "lucide-react";

const features = [
    {
        icon: Truck,
        title: "Fast Delivery",
        description: `We deliver within ${store.store_info.shipping.delivery_time} across Pakistan.`,
    },
    {
        icon: ShieldCheck,
        title: "Satisfaction Guarantee",
        description: "Our products are crafted with care and backed by our quality promise.",
    },
    {
        icon: Sprout,
        title: "Premium Ingredients",
        description: "Enriched with natural extracts like Ginseng, Argan, and Castor Oil.",
    },
    {
        icon: Star,
        title: "Top Rated",
        description: "Trusted by thousands of men for their daily grooming routine.",
    },
];

export default function FeaturesSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (containerRef.current) {
            const items = containerRef.current.querySelectorAll(".feature-item");

            gsap.fromTo(items,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    }, []);

    return (
        <section className="py-24 px-6 bg-[#f2efe9] text-[#1c1c1c]">
            <div className="max-w-7xl mx-auto">
                <div
                    ref={containerRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
                >
                    {features.map((feature, index) => (
                        <div key={index} className="feature-item flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-[#e8e5df] flex items-center justify-center mb-6 group-hover:bg-[#d6d3cd] transition-colors duration-300">
                                <feature.icon className="w-8 h-8 opacity-80" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-serif mb-3">{feature.title}</h3>
                            <p className="text-sm opacity-60 leading-relaxed max-w-xs">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
