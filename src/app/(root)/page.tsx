"use client";

import { useState } from "react";
import CircularText from "@/components/landing/circular-text";
import KineticLanding from "@/components/landing/kinetic";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  return (
    <main className="relative min-h-screen bg-[#dad4d1] overflow-hidden">
      {/* Show circular text helper only if content isn't fully entered? 
          Actually, the circular text component handles its own disappearance.
          We just need to mount the KineticLanding behind it or render it when ready.
      */}
      <CircularText onEnter={() => setShowContent(true)} />
      
      {/* We mount it always so it handles its CSS opacity transition via the prop */}
      <KineticLanding isVisible={showContent} />
    </main>
  );
}

