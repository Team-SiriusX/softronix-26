"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import "./styles.css";
import { items, backgroundTexts, createTypeTransition } from "./utils";

interface KineticLandingProps {
  isVisible: boolean;
}

export default function KineticLanding({ isVisible }: KineticLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const typeContainerRef = useRef<HTMLDivElement>(null);
  const typeLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const itemsWrapRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const articleRefs = useRef<(HTMLElement | null)[]>([]);
  const backCtrlRef = useRef<HTMLButtonElement>(null);

  const [currentItem, setCurrentItem] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const typeTransition = useRef<any>(null); // Store the transition instance

  // Initial Entrance Effect (Fade In)
  useEffect(() => {
    if (isVisible && containerRef.current) {
       containerRef.current.classList.add('visible');
    }
  }, [isVisible]);

  // Setup Type Transition Instance
  useEffect(() => {
    if (typeContainerRef.current) {
        // Filter out null refs just in case
        const lines = typeLinesRef.current.filter(el => el !== null) as HTMLElement[];
        typeTransition.current = createTypeTransition(typeContainerRef.current, lines);
    }
  }, []);

  const openItem = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentItem(index);

    const tl = gsap.timeline({
        onComplete: () => setIsAnimating(false)
    });
    
    // Calculate delays based on total duration of text transition
    const textInTimeline = typeTransition.current.in();
    const typeTransDuration = textInTimeline.totalDuration();
    
    tl.addLabel('start', 0)
      .addLabel('typeTransition', 0.3)
      .addLabel('articleOpening', typeTransDuration * 0.75 + 0.3); // math based on labels

    // 1. Fade out items
    // Get all item elements
    const validItems = itemRefs.current.filter(el => el !== null) as HTMLElement[];
    
    tl.to(validItems, {
        duration: 0.8,
        ease: 'power2.inOut',
        opacity: 0,
        y: (i) => (i % 2 ? '25%' : '-25%')
    }, 'start')
    
    // 2. Fade out frame
    .to(frameRef.current, {
        duration: 0.8,
        ease: 'power3.out',
        opacity: 0,
        pointerEvents: 'none'
    }, 'start');

    // 3. Play Type Transition
    tl.add(textInTimeline.play(), 'typeTransition');

    // 4. Setup Article Entrance
    const article = articleRefs.current[index];
    if (article) {
        // Parts of the article
        const title = article.querySelector('.k-article__title');
        const number = article.querySelector('.k-article__number');
        const intro = article.querySelector('.k-article__intro');
        const desc = article.querySelector('.k-article__description');
        const imgWrap = article.querySelector('.k-article__img-wrap');
        const img = article.querySelector('.k-article__img');

        // Add current class
        tl.add(() => {
             // Activate back button and disable items wrap
             if (backCtrlRef.current) gsap.set(backCtrlRef.current, { pointerEvents: 'auto' });
             if (itemsWrapRef.current) gsap.set(itemsWrapRef.current, { pointerEvents: 'none' });
             article.classList.add('k-article--current');
        }, 'articleOpening');

        // Show back button
        tl.to(backCtrlRef.current, {
            duration: 0.7,
            opacity: 1
        }, 'articleOpening');

        // Initial set for article elements
        tl.set([title, number, intro, desc], { opacity: 0, y: '50%' }, 'articleOpening');
        tl.set(imgWrap, { y: '100%' }, 'articleOpening'); // reveal relative to wrapper?
        tl.set(img, { y: '-100%' }, 'articleOpening');    // unreveal effect

        // Animate in article text
        tl.to([title, number, intro, desc], {
            duration: 1,
            ease: 'expo.out', // 'expo' in GSAP 3 is expo.out by default
            opacity: 1,
            y: '0%',
            stagger: 0.04
        }, 'articleOpening');

        // Reveal image
        tl.to([imgWrap, img], {
            duration: 1,
            ease: 'expo.out',
            y: '0%'
        }, 'articleOpening');
    }
  };

  const closeItem = () => {
    if (isAnimating || currentItem === -1) return;
    setIsAnimating(true);
    
    const index = currentItem;
    const article = articleRefs.current[index];
    if (!article) return;

     const tl = gsap.timeline({
        onComplete: () => {
            setIsAnimating(false);
            setCurrentItem(-1);
        }
    });

    const textOutTimeline = typeTransition.current.out();
    const typeTransDuration = textOutTimeline.totalDuration();

    tl.addLabel('start', 0)
      .addLabel('typeTransition', 0.5)
      .addLabel('showItems', typeTransDuration * 0.7 + 0.5);

    // Elements
    const title = article.querySelector('.k-article__title');
    const number = article.querySelector('.k-article__number');
    const intro = article.querySelector('.k-article__intro');
    const desc = article.querySelector('.k-article__description');
    const imgWrap = article.querySelector('.k-article__img-wrap');
    const img = article.querySelector('.k-article__img');

    // 1. Hide Back Button
    tl.to(backCtrlRef.current, {
        duration: 0.7,
        ease: 'power1.out',
        opacity: 0
    }, 'start');

    // 2. Hide Article Elements
    tl.to([title, number, intro, desc], {
        duration: 1,
        ease: 'power4.in',
        opacity: 0,
        y: '50%',
        stagger: -0.04
    }, 'start');

    // 3. Un-reveal Image
    tl.to(imgWrap, {
        duration: 1,
        ease: 'power4.in',
        y: '100%'
    }, 'start');
    tl.to(img, {
        duration: 1,
        ease: 'power4.in',
        y: '-100%'
    }, 'start');

    // 4. Cleanup classes
    tl.add(() => {
         if (backCtrlRef.current) gsap.set(backCtrlRef.current, { pointerEvents: 'none' });
         if (itemsWrapRef.current) gsap.set(itemsWrapRef.current, { pointerEvents: 'auto' });
         article.classList.remove('k-article--current');
    }); // No label, runs after previous tweens complete or we need to be careful? 
    // Actually in the original code, this was added normally so it runs after animations.
    // BUT we have 'typeTransition' at 0.5s.
    // The original code has the .add() after the image hiding code, but without a position parameter, so it runs at the END of the sequence calculated so far.
    
    // 5. Play Type Transition Out
    tl.add(textOutTimeline.play(), 'typeTransition');

    // 6. Show Frame & Items
    tl.to(frameRef.current, {
        duration: 0.8,
        ease: 'power3.out',
        opacity: 1,
        onStart: () => { if(frameRef.current) gsap.set(frameRef.current, { pointerEvents: 'auto' }); }
    }, 'showItems');

    const validItems = itemRefs.current.filter(el => el !== null) as HTMLElement[];
    tl.to(validItems, {
        duration: 1,
        ease: 'power3.inOut',
        opacity: 1,
        y: '0%'
    }, 'showItems');

  };

  // Hover effects for items
  const handleItemMouseEnter = (index: number) => {
      if (isAnimating || currentItem !== -1) return;
      const item = itemRefs.current[index];
      if (!item) return;
      
      const img = item.querySelector('.k-item__img');
      const title = item.querySelector('.k-item__caption-title');
      const desc = item.querySelector('.k-item__caption-description');

      gsap.to([img, title, desc], {
          duration: 1,
          ease: 'expo.out',
          y: (i) => i * 8 - 4,
          overwrite: 'auto'
      });
  };

  const handleItemMouseLeave = (index: number) => {
      if (isAnimating || currentItem !== -1) return;
      const item = itemRefs.current[index];
      if (!item) return;

      const img = item.querySelector('.k-item__img');
      const title = item.querySelector('.k-item__caption-title');
      const desc = item.querySelector('.k-item__caption-description');

      gsap.to([img, title, desc], {
          duration: 1,
          ease: 'expo.out',
          y: 0,
          overwrite: 'auto'
      });
  };

  return (
    <div ref={containerRef} className="kinetic-container">
      {/* Background Type Animation */}
      <div ref={typeContainerRef} className="k-type" aria-hidden="true">
        {backgroundTexts.map((text, i) => (
            <div 
                key={i} 
                className="k-type__line"
                ref={el => { typeLinesRef.current[i] = el }}
            >
                {text}
            </div>
        ))}
      </div>

      {/* Frame / Header */}
      <div ref={frameRef} className="k-frame">
        <div className="k-frame__title-wrap">
            <h1 className="k-frame__title">Softronix Agency</h1>
            <p className="k-frame__tagline">Elegance in Motion &bull; 2026</p>
        </div>
        <div className="k-frame__author">
            <Link href="/contact" className="hover:text-black">Contact Us</Link>
        </div>
        <nav className="k-frame__links">
            <Link href="/auth/sign-in">Sign In</Link>
            <Link href="/auth/sign-up">Sign Up</Link>
        </nav>
      </div>

      {/* Grid Items */}
      <section ref={itemsWrapRef} className="k-item-wrap">
        {items.map((item, index) => (
            <figure 
                key={item.id} 
                className="k-item"
                ref={el => { itemRefs.current[index] = el }}
                onClick={() => openItem(index)}
                onMouseEnter={() => handleItemMouseEnter(index)}
                onMouseLeave={() => handleItemMouseLeave(index)}
            >
                {/* We use standard img tag for exacting match to css structure, or next/image? 
                    The CSS assumes .k-item__img is an img tag. next/image renders an img tag. 
                    Let's use a standard img for simplicity with the GSAP references 
                */}
                <img className="k-item__img" src={item.img} alt={item.title} />
                <figcaption className="k-item__caption">
                    <h2 className="k-item__caption-title">{item.number} &mdash; {item.title}</h2>
                    <p className="k-item__caption-description">{item.intro}</p>
                </figcaption>
            </figure>
        ))}
      </section>

      {/* Articles (Full View) */}
      <section className="k-article-wrap">
        <button 
            ref={backCtrlRef} 
            className="k-back k-unbutton" 
            onClick={closeItem}
            aria-label="Back to grid"
        >
            <svg viewBox="0 0 50 9" width="100%"><path d="M0 4.5l5-3M0 4.5l5 3M50 4.5h-77"></path></svg>
        </button>

        {items.map((item, index) => (
            <article 
                key={item.id} 
                className="k-article"
                id={item.id}
                ref={el => { articleRefs.current[index] = el }}
            >
                <div className="k-article__img-wrap">
                    <div 
                        className="k-article__img" 
                        style={{ backgroundImage: `url(${item.img})` }}
                    ></div>
                </div>
                <span className="k-article__number">{item.number}</span>
                <h2 className="k-article__title">{item.title}</h2>
                <p className="k-article__intro">{item.intro}</p>
                <p className="k-article__description">{item.description}</p>
            </article>
        ))}
      </section>
    </div>
  );
}
