"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { preloadImages } from "@/lib/utils";
import "./entrance-animation.css";

export default function EntranceAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine image selector and path setup
    // Images are in public root, accessible via /1.jpg etc.
    // CSS applies background-image provided inline in JSX.
    
    const container = containerRef.current;
    if (!container) return;

    // Preload images
    preloadImages(".card__img").then(() => {
      setLoading(false);
      initAnimation();
    });

    const initAnimation = () => {
      const debug = false;
      if (debug) {
        container.querySelector("[data-debug]")?.classList.add("debug");
      }

      const breakPoint = "53em";
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: `(min-width: ${breakPoint})`,
          isMobile: `(max-width: ${breakPoint})`,
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          const image = container.querySelector(".card__img") as HTMLElement;
          if (!image) return;

          const cardList = gsap.utils.toArray(".card", container);
          const count = cardList.length;
          const sliceAngle = (2 * Math.PI) / count;

          // Distance from the image center to the screen center.
          const radius1 = 50 + image.clientHeight / 2;
          const radius2 = isDesktop ? 250 - radius1 : 180 - radius1;

          gsap
            .timeline()
            .from(cardList, {
              y: window.innerHeight / 2 + image.clientHeight * 1.5,
              rotateX: -180,
              stagger: 0.1,
              duration: 0.5,
              opacity: 0.8,
              scale: 3,
            })
            .set(cardList, {
              transformOrigin: `center ${radius1 + image.clientHeight / 2}px`,
            })
            .set(".group", {
              transformStyle: "preserve-3d",
            })
            .to(cardList, {
              y: -radius1,
              duration: 0.5,
              ease: "power1.out",
            })
            .to(
              cardList,
              {
                rotation: (index: number) => {
                  return (index * 360) / count;
                },
                rotateY: 0,
                duration: 1,
                ease: "power1.out",
              },
              "<"
            )
            .to(cardList, {
              // Expand the radius
              x: (index: number) => {
                return Math.round(
                  radius2 * Math.cos(sliceAngle * index - Math.PI / 4)
                );
              },
              y: (index: number) => {
                return (
                  Math.round(radius2 * Math.sin(sliceAngle * index - Math.PI / 4)) -
                  radius1
                );
              },
              rotation: (index: number) => {
                return (index + 1) * (360 / count);
              },
            })
            .to(
              cardList,
              {
                rotateY: 0,
                opacity: 0.8,
                duration: 1,
              },
              "<"
            )
            .from(
              ".headings",
              {
                opacity: 0,
                filter: "blur(60px)",
                duration: 1,
              },
              "<"
            )
            .to(cardList, {
              repeat: -1,
              duration: 2,
              onRepeat: () => {
                // Removed flip animation
              },
            })
            .to(
              ".group",
              {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: "none",
              },
              "<-=2"
            );

          return () => {
          };
        }
      );
      
      return () => {
        mm.revert();
      };
    };
    
    // We only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
        ref={containerRef} 
        className={`entrance-container demo-1 ${loading ? "loading" : ""}`}
    >
        <div data-debug>
            <div></div>
        </div>
        <main>
            <header className="frame">
                <h1 className="frame__title">Entrance Animation for Images</h1>
                <a className="frame__back" href="https://tympanus.net/codrops/?p=76798">Article</a>
                <a className="frame__archive" href="https://tympanus.net/codrops/demos/">All demos</a>
                <a className="frame__github" href="https://github.com/d3adrabbit/EntranceAnimationForImages">GitHub</a>
                <nav className="frame__tags">
                    <a href="https://tympanus.net/codrops/demos/?tag=intro">#intro</a>
                    <a href="https://tympanus.net/codrops/demos/?tag=stack">#stack</a>
                </nav>
                <nav className="frame__demos">
                    <span>Variation 1</span>
                    <a href="index2.html">Variation 2</a>
                    <a href="index3.html">Variation 3</a>
                </nav>
            </header>
            
            <div className="content">
                <div className="scene">
                    <div className="group">
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/1.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/2.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/3.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/4.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/5.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/6.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/7.jpg)" }}></div>
                        </div>
                        <div className="card">
                            <div className="card__img" style={{ backgroundImage: "url(/8.jpg)" }}></div>
                        </div>
                    </div>
                </div>

                <div className="headings">
                    <h1 className="headings__main gloock-regular">ECHO</h1>
                  
                    <h5 className="headings_subtitle gloock-regular">Leave a Mark.</h5>
                </div>
            </div>
        </main>
    </div>
  );
}
