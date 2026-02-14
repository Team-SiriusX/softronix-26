"use client";

import Link from "next/link";
import { MessageCircle, Expand } from "lucide-react";
import ChatWidget from "./chat-widget";
import { cn } from "@/lib/utils";
import { useChatState } from "@/components/providers/chat-provider";

export default function FloatingChatButton() {
  const { isChatOpen, openChat } = useChatState();

  return (
    <>
      {/* Expand to full chat page */}
      <Link
        href="/chat"
        className={cn(
          "fixed bottom-6 right-24 z-40",
          "w-12 h-12 md:w-14 md:h-14",
          "bg-[#f2efe9] text-[#292725] border border-[#292725]/10 rounded-full shadow-lg",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          "transition-all duration-300 ease-out",
          "hover:shadow-[0_0_20px_rgba(41,39,37,0.15)]",
          "focus:outline-none focus:ring-4 focus:ring-[#292725]/20",
          isChatOpen && "scale-0 opacity-0"
        )}
        aria-label="Open full chat"
        title="Full chat with voice"
      >
        <Expand className="w-5 h-5 md:w-6 md:h-6" />
      </Link>

      {/* Floating Chat Button */}
      <button
        onClick={openChat}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 md:w-16 md:h-16",
          "bg-[#292725] text-white rounded-full shadow-2xl",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          "transition-all duration-300 ease-out",
          "hover:shadow-[0_0_30px_rgba(41,39,37,0.3)]",
          "focus:outline-none focus:ring-4 focus:ring-[#292725]/30",
          isChatOpen && "scale-0 opacity-0"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}
