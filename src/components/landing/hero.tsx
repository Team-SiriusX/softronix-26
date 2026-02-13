"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { World, Body, Sphere, Box, Vec3, Material, ContactMaterial } from "cannon-es";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#dad4d1");

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- CANNON.JS SETUP ---
    const world = new World();
    world.gravity.set(0, -9.82, 0);

    // Materials
    const defaultMaterial = new Material("default");
    const defaultContactMaterial = new ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.3,
        restitution: 0.7, 
      }
    );
    world.addContactMaterial(defaultContactMaterial);

    // Objects
    const spheres: { mesh: THREE.Mesh; body: Body }[] = [];
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.3,
    });

    for (let i = 0; i < 20; i++) {
        const radius = Math.random() * 0.5 + 0.5;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            sphereMaterial
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        const shape = new Sphere(radius);
        const body = new Body({
            mass: 1,
            shape: shape,
            position: new Vec3(
                (Math.random() - 0.5) * 10,
                Math.random() * 20 + 10,
                (Math.random() - 0.5) * 5
            ),
            material: defaultMaterial
        });
        world.addBody(body);
        spheres.push({ mesh, body });
    }

    // Floor (Invisible)
    const groundShape = new Box(new Vec3(50, 1, 50));
    const groundBody = new Body({
        mass: 0,
        shape: groundShape
    });
    groundBody.position.set(0, -10, 0);
    world.addBody(groundBody);
    
    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
        const delta = clock.getDelta();
        world.step(1 / 60, delta, 3);

        spheres.forEach(({ mesh, body }) => {
            mesh.position.copy(body.position as any);
            mesh.quaternion.copy(body.quaternion as any);

            // Reset if too low
            if (body.position.y < -15) {
                body.position.set(
                    (Math.random() - 0.5) * 10,
                    15,
                    (Math.random() - 0.5) * 5
                );
                body.velocity.set(0,0,0);
                body.angularVelocity.set(0,0,0);
            }
        });

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    };
    animate();

    // --- GSAP ANIMATION FOR TEXT ---
    const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        
        tl.from(textRef.current, {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out",
            delay: 0.5
        })
        .from(subRef.current, {
            y: 50,
            opacity: 0,
            duration: 1.5,
            ease: "power3.out",
        }, "-=1.2");
        
    });

    // Resize handler
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);
        ctx.revert();
        if (containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#dad4d1]">
        {/* 3D Scene Container */}
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Text Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <h1 
                ref={textRef} 
                className="text-[12vw] leading-none font-bold tracking-tighter text-[#292725] mix-blend-overlay opacity-90 select-none text-center"
            >
                DARI MOOCH
            </h1>
            <p 
                ref={subRef}
                className="text-xl md:text-2xl font-light tracking-widest uppercase text-[#555] mt-4"
            >
                Pakistan&apos;s #1 Men&apos;s Grooming Brand
            </p>
        </div>
    </div>
  );
}
