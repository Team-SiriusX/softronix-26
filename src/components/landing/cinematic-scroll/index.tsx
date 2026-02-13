'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Texture, Color, Vec2 } from 'ogl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cylinderVertex, cylinderFragment, particleVertex, particleFragment } from './shaders';
import { createCylinderGeometry, createParticleGeometry, drawImageCover, getPositionClasses } from './utils';
import { images, imageConfig, cylinderConfig, particleConfig, perspectives } from './data';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !textRef.current) return;

    // Cleanup previous instances to prevent duplication if React strict mode double-invokes
    canvasRef.current.innerHTML = '';

    let renderer: Renderer;
    let gl: any;
    let scene: Transform;
    let camera: Camera;
    let cylinder: Mesh;
    let particles: Mesh;
    let texture: Texture;
    let animationId: number;
    let scrollTrigger: ScrollTrigger;

    // Configuration
    const config = {
      imageStats: imageConfig,
      cylinderStats: cylinderConfig,
      particleStats: particleConfig,
    };

    // Initialize OGL
    const init = () => {
      renderer = new Renderer({ 
        alpha: true, 
        dpr: Math.min(window.devicePixelRatio, 2) 
      });
      
      gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0); 
      
      canvasRef.current!.appendChild(gl.canvas);
      
      scene = new Transform();
      camera = new Camera(gl, { fov: 35 });
      camera.position.set(0, 0, 10);
      
      resize();
      window.addEventListener('resize', resize);
    };

    const resize = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    const createTexture = async () => {
        const canvas = document.createElement('canvas');
        const count = images.length;
        const totalWidth = config.imageStats.width * count;
        const height = config.imageStats.height;
        
        canvas.width = totalWidth;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#dad4d1'; 
        ctx.fillRect(0, 0, totalWidth, height);

        const loadedImages = await Promise.all(
            images.map(src => {
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });
            })
        );

        loadedImages.forEach((img, i) => {
             const xOffset = config.imageStats.width * i;
             drawImageCover(ctx, img, xOffset, 0, config.imageStats.width, height);
        });

        texture = new Texture(gl, {
            image: canvas,
            width: totalWidth,
            height: height,
            generateMipmaps: true,
        });
    };

    const createScene = () => {
        const geometry = createCylinderGeometry(
            gl, 
            config.cylinderStats.radius, 
            config.cylinderStats.height, 
            images.length, 
            30
        );

        const program = new Program(gl, {
            vertex: cylinderVertex,
            fragment: cylinderFragment,
            uniforms: {
                tMap: { value: texture },
                uCount: { value: images.length },
                uTime: { value: 0 },
            },
            transparent: true,
            cullFace: null,
        });

        cylinder = new Mesh(gl, { geometry, program });
        cylinder.position.y = 0;
        cylinder.setParent(scene);

        const pGeometry = createParticleGeometry(gl, config.particleStats.numParticles);
        const pProgram = new Program(gl, {
            vertex: particleVertex,
            fragment: particleFragment,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Color('#292725') },
            },
            transparent: true,
            depthTest: false,
        });

        particles = new Mesh(gl, { geometry: pGeometry, program: pProgram });
        particles.setParent(scene);
    };

    const initScroll = () => {
        const sections = perspectives.length;
        const totalHeight = 500; // 500vh
        
        containerRef.current!.style.height = `${totalHeight}vh`;

        const textItems = Array.from(textRef.current!.children);
        
        gsap.set(textItems, { opacity: 0, y: 30, filter: 'blur(10px)' });
        gsap.set(textItems[0], { opacity: 1, y: 0, filter: 'blur(0px)' }); // First one visible

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                pin: canvasRef.current,
            }
        });

        // 1. Rotate cylinder
        tl.to(cylinder.rotation, {
            y: Math.PI * 2,
            duration: 1,
            ease: "none"
        }, 0);

        // 2. Camera movement
        tl.to(camera.position, {
            y: -2,
            duration: 1,
            ease: "none"
        }, 0);

        // 3. Text transitions
        // We divide the timelines into equal parts based on perspectives
        perspectives.forEach((_, i) => {
            if (i === 0) return; // First one handled by initial state
            
            const step = 1 / (perspectives.length - 1);
            const start = (i - 1) * step;
            const end = i * step; 
            
            // Fade OUT previous
            tl.to(textItems[i-1], {
                opacity: 0,
                y: -30,
                filter: 'blur(10px)',
                duration: step * 0.4, // fast exit
            }, start + step * 0.1); 

            // Fade IN current
            tl.fromTo(textItems[i], 
                { opacity: 0, y: 40, filter: 'blur(10px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: step * 0.4 },
                end - step * 0.4 // enter before end of segment
            );
        });
        
        scrollTrigger = tl.scrollTrigger!;
    };

    const update = (t: number) => {
        animationId = requestAnimationFrame(update);
        const time = t * 0.001;

        if (cylinder) {
             cylinder.program.uniforms.uTime.value = time;
        }

        if (particles) {
            particles.program.uniforms.uTime.value = time;
            particles.rotation.y = time * 0.05;
        }

        renderer.render({ scene, camera });
    };

    const start = async () => {
        init();
        await createTexture();
        createScene();
        initScroll();
        setLoading(false);
        update(0);
    };

    start();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
        if(scrollTrigger) scrollTrigger.kill();
        // Force kill all ST triggers just in case
        ScrollTrigger.getAll().forEach(t => t.kill());

        if (gl && gl.canvas && gl.canvas.parentNode) {
            gl.canvas.parentNode.removeChild(gl.canvas);
        }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#dad4d1]">
      {/* Overlay Text Container - Now Behind Canvas (z-0) for depth */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 flex flex-col justify-center items-center px-4 md:px-20">
          <div ref={textRef} className="relative w-full max-w-[1400px] mx-auto h-[400px] flex items-center justify-center">
             {perspectives.map((item, i) => (
                 <div 
                    key={i} 
                    className={`absolute w-full flex flex-col ${getPositionClasses(item.position)}`}
                 >
                     <div className="font-[family-name:var(--font-playfair-display)] flex flex-col leading-[0.85]">
                         <span className="text-[13vw] md:text-[9rem] lg:text-[12rem] font-bold tracking-tight whitespace-nowrap text-transparent [-webkit-text-stroke:1px_#1a1a1a] md:[-webkit-text-stroke:2px_#1a1a1a]">
                             {item.title}
                         </span>
                         <span className="text-[13vw] md:text-[9rem] lg:text-[12rem] font-bold tracking-tight whitespace-nowrap -mt-2 md:-mt-6 italic text-transparent [-webkit-text-stroke:1px_#1a1a1a] md:[-webkit-text-stroke:2px_#1a1a1a]">
                             {item.subtitle}
                         </span>
                     </div>
                     <span className="font-[family-name:var(--font-playfair-display)] text-xl md:text-3xl tracking-[0.2em] mt-8 font-normal text-[#1a1a1a]">
                         {item.year}
                     </span>
                 </div>
             ))}
          </div>
      </div>

      {/* Sticky Canvas Container - In Front (z-10) */}
      <div 
        ref={canvasRef} 
        className="h-screen w-full sticky top-0 left-0 overflow-hidden z-10 pointer-events-none"
      />
      
      {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#dad4d1] text-[#292725] font-[family-name:var(--font-playfair-display)] text-2xl">
              Loading Experience...
          </div>
      )}
    </div>
  );
}
