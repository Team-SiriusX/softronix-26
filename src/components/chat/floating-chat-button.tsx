"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ChatWidget from "./chat-widget";
import { cn } from "@/lib/utils";
import { useChatState } from "@/components/providers/chat-provider";

export default function FloatingChatButton() {
  const { isChatOpen, openChat } = useChatState();
  const pathname = usePathname();

  // Hide floating button on admin pages
  const hidden = pathname.startsWith("/admin");

  return (
    <>
      {/* Floating Chat Button */}
      {!hidden && (
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
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}
