"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const AGENT_STEPS = [
  "Analyzing your request",
  "Searching product catalog",
  "Evaluating best matches",
  "Preparing response",
];

interface AgentWorkingOverlayProps {
  isActive: boolean;
  /** "full" for /chat page (covers the right panel), "widget" for floating chat */
  variant?: "full" | "widget";
}

export function AgentWorkingOverlay({ isActive, variant = "widget" }: AgentWorkingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle through steps
  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setDots("");
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % AGENT_STEPS.length);
    }, 2200);

    dotsRef.current = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (dotsRef.current) clearInterval(dotsRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-500",
        "bg-[#f2efe9]/20",
        variant === "widget" && "rounded-b-2xl"
      )}
    >
      {/* Pulsing ring */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-[#1c1c1c]/10 flex items-center justify-center">
          {/* Spinning arc */}
          <svg className="absolute w-16 h-16 animate-spin" style={{ animationDuration: "2.5s" }} viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="#1c1c1c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="50 140"
            />
          </svg>
          {/* Inner pulse */}
          <div className="w-8 h-8 rounded-full bg-[#1c1c1c] animate-pulse flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f2efe9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center px-4">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1c1c1c]/40 mb-2">
          Echo Agent
        </p>
        <p className="text-sm font-medium text-[#1c1c1c]/80 min-w-[180px]">
          {AGENT_STEPS[currentStep]}{dots}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5 mt-5">
        {AGENT_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === currentStep
                ? "w-6 bg-[#1c1c1c]/60"
                : i < currentStep
                  ? "w-2 bg-[#1c1c1c]/25"
                  : "w-2 bg-[#1c1c1c]/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
