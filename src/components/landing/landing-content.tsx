"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

interface LandingContentProps {
  isVisible: boolean;
}

export default function LandingContent({ isVisible }: LandingContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Frame refs
  const logoRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // Center content refs
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isVisible) {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      
      // Initial states for Scale/Zoom Effect
      gsap.set([logoRef.current, navRef.current, footerRef.current], { 
        y: -10, 
        opacity: 0 
      });
      // Set Initial state for MAIN CONTENT (Scale up from 1.5 to 1)
      // This creates a "Zoom Out" into place effect, or "Scale In" depending on perspective.
      // Matches the "Explosion" of the previous screen by settling down.
      gsap.set([headlineRef.current, ctaRef.current], { 
        scale: 1.2, 
        opacity: 0,
        filter: "blur(10px)"
      });
      gsap.set(footerRef.current, { y: 10 }); 

      // Animation sequence
      tl.to([logoRef.current, navRef.current], {
        duration: 1.5,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        delay: 0.1
      }, "start")
      .to([headlineRef.current, ctaRef.current], {
        duration: 2,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.1,
        ease: "power2.out"
      }, "start+=0.2")
      .to(footerRef.current, {
        duration: 1.5,
        y: 0,
        opacity: 1
      }, "start+=0.5");
      
    } else {
      // Hide everything initially
      gsap.set([
        logoRef.current, 
        navRef.current, 
        footerRef.current, 
        headlineRef.current, 
        ctaRef.current
      ], { opacity: 0 });
    }
  }, [isVisible]);

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-full p-8 md:p-12 z-40 pointer-events-none md:grid md:grid-cols-2 md:content-between md:h-screen text-[#292725]"
      >
        <h1 
          ref={logoRef}
          className="md:col-span-1 text-lg font-medium mb-4 md:mb-0 pointer-events-auto"
        >
          Softronix
        </h1>
        
        <nav 
          ref={navRef}
          className="md:col-span-1 md:justify-self-end space-x-6 pointer-events-auto"
        >
          <Link href="/auth/sign-in" className="hover:text-black transition-colors">Sign In</Link>
          <Link href="/auth/sign-up" className="hover:text-black transition-colors">Sign Up</Link>
          <Link href="/sample" className="hover:text-black transition-colors">Demo</Link>
        </nav>
        
        <div 
          ref={footerRef}
          className="md:col-span-2 md:justify-self-end mt-4 md:mt-0 pointer-events-auto"
        >
          <span className="text-sm opacity-60">Creative Development &bull; 2026</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="fixed inset-0 flex flex-col items-center justify-center p-8 z-30 pointer-events-none"
      >
        <div className="max-w-4xl text-center pointer-events-auto">
          <p 
            ref={headlineRef}
            className="text-3xl md:text-5xl lg:text-6xl leading-tight font-light text-[#292725]"
          >
            We are a creative agency that focuses on <span className="font-normal">human-centric</span> design and ergonomic workplace innovations.
          </p>
          <div className="mt-12 flex justify-center gap-4">
             <Link 
              ref={ctaRef}
              href="/auth/sign-up" 
              className="px-8 py-3 bg-[#a99c90] text-[#272524] rounded-full hover:bg-[#978b7f] transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
