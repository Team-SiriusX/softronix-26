"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import ChatWidget from "./chat-widget";
import { cn } from "@/lib/utils";
import { useChatState } from "@/components/providers/chat-provider";

export default function FloatingChatButton() {
  const { isChatOpen, openChat } = useChatState();
  const pathname = usePathname();

  // Hide floating button on admin pages or if we're already on /chat page
  const hidden = pathname.startsWith("/admin");
  const isChatPage = pathname === "/chat";

  return (
    <>
      <div className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-4",
        isChatOpen && "z-40" // Lower z-index when chat is open so widget is on top
      )}>
        {/* Full Page Chat Link */}
        {!hidden && !isChatPage && (
          <Link
            href="/chat"
            className={cn(
              "w-12 h-12 md:w-14 md:h-14",
              "bg-white text-[#292725] rounded-full shadow-lg border border-[#292725]/10",
              "flex items-center justify-center",
              "hover:scale-110 active:scale-95",
              "transition-all duration-300 ease-out",
              "hover:bg-[#f5f5f5]",
              "focus:outline-none focus:ring-4 focus:ring-[#292725]/10",
              isChatOpen && "scale-0 opacity-0 pointer-events-none translate-x-10"
            )}
            aria-label="Open full page chat"
            title="Open full page chat"
          >
            <ExternalLink className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
          </Link>
        )}

        {/* Floating Chat Button */}
        {!hidden && (
          <button
            onClick={openChat}
            className={cn(
              "w-14 h-14 md:w-16 md:h-16",
              "bg-[#292725] text-white rounded-full shadow-2xl",
              "flex items-center justify-center",
              "hover:scale-110 active:scale-95",
              "transition-all duration-300 ease-out",
              "hover:shadow-[0_0_30px_rgba(41,39,37,0.3)]",
              "focus:outline-none focus:ring-4 focus:ring-[#292725]/30",
              isChatOpen && "scale-0 opacity-0 rotate-90"
            )}
            aria-label="Open chat widget"
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}
