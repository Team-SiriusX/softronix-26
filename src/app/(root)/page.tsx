"use client";

import { useEffect, useState } from "react";
import CircularText from "@/components/landing/circular-text";
import KineticLanding from "@/components/landing/kinetic";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Dynamically import LocomotiveScroll to avoid SSR issues
    // and initialize it only after component mount
    (async () => {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#dad4d1]">
      <CircularText onEnter={() => setShowContent(true)} />
      
      {/* Kinetic Landing Section */}
      <KineticLanding isVisible={showContent} />
    </main>
  );
}

