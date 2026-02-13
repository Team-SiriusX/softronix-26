"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  role: "user" | "assistant";
  isLatest: boolean;
  isLoading?: boolean;
}

export default function ChatMessage({ message, role, isLatest, isLoading }: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageRef.current || !isLatest) return;

    const ctx = gsap.context(() => {
      gsap.from(messageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, [isLatest]);

  return (
    <div
      ref={messageRef}
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
          role === "user"
            ? "bg-[#292725] text-white"
            : "bg-white/60 text-[#292725] backdrop-blur-sm"
        )}
      >
        {isLoading ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
