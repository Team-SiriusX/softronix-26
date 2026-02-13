"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface CircularTextProps {
  onEnter: () => void;
}

export default function CircularText({ onEnter }: CircularTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const enterBgRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !enterBtnRef.current) return;

    const texts = textRefs.current;
    
    // Initial setup
    gsap.set(texts, { transformOrigin: '50% 50%', opacity: 0 });
    gsap.set(enterBtnRef.current, { pointerEvents: 'none', opacity: 0, scale: 0.8 });

    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } })
      .addLabel('start', 0)
      .to(texts, {
        duration: 3,
        rotation: 90,
        stagger: { amount: 0.4 }
      }, 'start')
      .to(texts, {
        duration: 3,
        opacity: 1,
        stagger: { amount: 0.4 }
      }, 'start')
      .to(enterBtnRef.current, {
        duration: 3,
        opacity: 1,
        scale: 1
      }, 'start')
      .add(() => {
        if (enterBtnRef.current) {
          gsap.set(enterBtnRef.current, { pointerEvents: 'auto' });
        }
      }, 'start+=2');

    return () => {
      tl.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    if (isEntered) return;
    
    gsap.to(enterBgRef.current, {
      duration: 1.3,
      ease: 'expo',
      scale: 1.4
    });
    
    gsap.to(textRefs.current, {
      duration: 0.5,
      ease: 'expo',
      rotation: '+=120',
      scale: 0.5,
      opacity: 0.2,
      stagger: { amount: -0.15 }
    });
  };

  const handleMouseLeave = () => {
    if (isEntered) return;

    gsap.to(enterBgRef.current, {
      duration: 2,
      ease: 'elastic.out(1, 0.4)',
      scale: 1
    });

    gsap.to(textRefs.current, {
      duration: 2,
      ease: 'elastic.out(1, 0.4)',
      scale: 1,
      rotation: '-=120',
      opacity: 1,
      stagger: { amount: 0.15 }
    });
  };

  const handleClick = () => {
    if (isEntered) return;
    setIsEntered(true);
    onEnter();

    const tl = gsap.timeline({ 
      defaults: { ease: 'back.in' },
      onComplete: () => {
        if (containerRef.current) {
          gsap.set(containerRef.current, { display: 'none', visibility: 'hidden' });
        }
      }
    })
      .addLabel('start', 0)
      .to(enterBtnRef.current, {
        duration: 0.6,
        scale: 0.2,
        opacity: 0,
        pointerEvents: 'none'
      }, 'start')
      .to(textRefs.current, {
        duration: 0.8,
        scale: 1.6,
        opacity: 0,
        rotation: '-=20',
        stagger: { amount: 0.3 }
      }, 'start');
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#dad4d1] text-[#292725] z-50">
      <svg 
        ref={svgRef} 
        className="w-[206vmin] h-[206vmin] pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
        viewBox="0 0 1400 1400"
      >
        <defs>
          <path id="circle-1" d="M250,700.5A450.5,450.5 0 1 11151,700.5A450.5,450.5 0 1 1250,700.5" />
          <path id="circle-2" d="M382,700.5A318.5,318.5 0 1 11019,700.5A318.5,318.5 0 1 1382,700.5" />
          <path id="circle-3" d="M487,700.5A213.5,213.5 0 1 1914,700.5A213.5,213.5 0 1 1487,700.5" />
          <path id="circle-4" d="M567.5,700.5A133,133 0 1 1833.5,700.5A133,133 0 1 1567.5,700.5" />
        </defs>

        <text 
          ref={el => { textRefs.current[0] = el }} 
          className="uppercase fill-[#272524 origin-center"
          style={{ fontSize: '25vmin', fontFamily: 'serif', fontWeight: 400 }}
        >
          <textPath href="#circle-1" textLength="2830">Let life begin I&apos;ve cleansed all my sins&nbsp;</textPath>
        </text>
        
        <text 
          ref={el => { textRefs.current[1] = el }} 
          className="uppercase fill-[#272524] origin-center"
          style={{ fontSize: '17vmin', fontFamily: 'serif', fontWeight: 300 }}
        >
          <textPath href="#circle-2" textLength="2001">Burn all the money absolve all the lies&nbsp;</textPath>
        </text>
        
        <text 
          ref={el => { textRefs.current[2] = el }} 
          className="uppercase fill-[#272524] origin-center"
          style={{ fontSize: '13.5vmin', fontFamily: 'serif', fontWeight: 400 }}
        >
          <textPath href="#circle-3" textLength="1341">We are caged in simulations&nbsp;</textPath>
        </text>
        
        <text 
          ref={el => { textRefs.current[3] = el }} 
          className="uppercase fill-[#272524] origin-center"
          style={{ fontSize: '9.5vmin', fontFamily: 'sans-serif', fontWeight: 300 }}
        >
          <textPath href="#circle-4" textLength="836">But something has changed in us&nbsp;</textPath>
        </text>
      </svg>

      <button 
        ref={enterBtnRef}
        className="absolute left-1/2 top-1/2 -ml-11.25 -mt-11.25 w-22.5 h-22.5 bg-transparent border-0 p-0 cursor-pointer font-medium text-[#272524] z-50 focus:outline-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div ref={enterBgRef} className="absolute inset-0 rounded-full bg-[#a99c90]"></div>
        <span className="relative z-10 block">Enter</span>
      </button>
    </div>
  );
}
