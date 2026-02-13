"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="relative flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about products, recommendations, or anything else..."
        disabled={isLoading}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-2xl px-6 py-4 text-sm md:text-base",
          "bg-white/60 backdrop-blur-sm text-[#292725] placeholder:text-[#555]/50",
          "border border-[#292725]/10 focus:border-[#292725]/30",
          "focus:outline-none focus:ring-2 focus:ring-[#292725]/10",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "max-h-[200px] overflow-y-auto"
        )}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className={cn(
          "px-6 py-4 rounded-2xl font-medium text-sm md:text-base",
          "bg-[#292725] text-white",
          "hover:bg-[#292725]/90 active:scale-95",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#292725]",
          "focus:outline-none focus:ring-2 focus:ring-[#292725]/30"
        )}
      >
        Send
      </button>
    </div>
  );
}
