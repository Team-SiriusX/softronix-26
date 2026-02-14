"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { X, LogIn, MessageCircle } from "lucide-react";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import ProductRecommendations from "./product-recommendations";
import HumanChat from "./human-chat";
import { cn } from "@/lib/utils";
import { Product } from "@/services";
import { toast } from "sonner";
import { useSendChatMessage, useProducts } from "./_api";
import {
  useChatState,
  useChatMessages,
} from "@/components/providers/chat-provider";
import { useUIActions } from "./use-ui-actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

export default function ChatWidget() {
  const { isChatOpen, closeChat } = useChatState();
  const { messages, setMessages } = useChatMessages();
  const [pendingProductIds, setPendingProductIds] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showHumanChat, setShowHumanChat] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { mutate: sendMessage, isPending } = useSendChatMessage();
  const { data: products } = useProducts(pendingProductIds);
  const { executeUIAction } = useUIActions();

  const handleAuthRedirect = useCallback(() => {
    setShowAuthPrompt(false);
    closeChat();
    router.push("/auth/sign-in");
  }, [closeChat, router]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isChatOpen) {
      gsap.to(containerRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to update messages when products are fetched
  useEffect(() => {
    if (products && products.length > 0 && pendingProductIds.length > 0) {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "assistant" && !lastMessage.products) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, products: products as Product[] },
          ];
        }
        return prev;
      });
      // Use a microtask to avoid setting state synchronously in the same effect
      queueMicrotask(() => setPendingProductIds([]));
    }
  }, [products, pendingProductIds, setMessages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isPending) return;

    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);

    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    sendMessage(
      {
        userMessage,
        conversationHistory,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const successData = data as any;
            const productIds: string[] = (successData.products || []).map(
              (p: { id: string }) => p.id,
            );

            const assistantMessage: Message = {
              role: "assistant",
              content: successData.response as string,
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Set product IDs to fetch them
            if (productIds.length > 0) {
              setPendingProductIds(productIds);
            }

            // Process all UI actions from the backend
            const functions = successData.functions as
              | Array<{ name: string; args: Record<string, unknown> }>
              | undefined;

            if (functions && functions.length > 0) {
              // Count adjustPrice calls for smart toast
              const adjustPriceCalls = functions.filter((fn) => fn.name === "adjustPrice");

              functions.forEach(
                (fn: { name: string; args: Record<string, unknown> }) => {
                  // Handle requireAuth special case
                  if (fn.name === "requireAuth") {
                    setShowAuthPrompt(true);
                    return;
                  }

                  // Execute all other UI actions
                  executeUIAction(fn.name, fn.args);
                },
              );

              // Show a single toast for price adjustments
              if (adjustPriceCalls.length > 0) {
                const pct = adjustPriceCalls[0].args.increasePercentage as number;
                if (adjustPriceCalls.length === 1) {
                  toast.error(
                    `Price increased by ${pct}% due to behavior. New price: ${adjustPriceCalls[0].args.formattedPrice}`,
                    { duration: 5000 }
                  );
                } else {
                  toast.error(
                    `All product prices increased by ${pct}% due to inappropriate behavior.`,
                    { duration: 5000 }
                  );
                }
              }
            }
          } else {
            throw new Error(String(data.error) || "Failed to get response");
          }
        },
        onError: (error) => {
          console.error("Chat error:", error);
          const errorMessage: Message = {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble right now. Please try again in a moment.",
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      },
    );
  };

  if (!isChatOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-40 transition-opacity"
        onClick={closeChat}
      />

      {/* Chat Widget */}
      <div
        ref={containerRef}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "w-[calc(100vw-2rem)] max-w-md h-150",
          "bg-[#dad4d1] rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden",
          "opacity-0 scale-95",
        )}
      >
        {/* Header */}
        <div className="border-b border-[#292725]/10 bg-[#dad4d1] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#292725] tracking-tight">
              Echo
            </h2>
            <p className="text-xs text-[#555] mt-0.5">
              Your AI shopping assistant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHumanChat(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#292725] bg-[#c8c2bd]/60 hover:bg-[#c8c2bd] transition-colors"
              title="Talk to a human"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Human
            </button>
            <button
              onClick={closeChat}
              className="p-2 rounded-full hover:bg-[#292725]/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-[#292725]" />
            </button>
          </div>
        </div>

        {/* Conditional: Human Chat or AI Chat */}
        {showHumanChat ? (
          <HumanChat onBack={() => setShowHumanChat(false)} />
        ) : (
          <>
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage
                  message={message.content}
                  role={message.role}
                  isLatest={index === messages.length - 1}
                />
                {message.products && message.products.length > 0 && (
                  <ProductRecommendations
                    products={message.products}
                    isLatest={index === messages.length - 1}
                  />
                )}
              </div>
            ))}
            {isPending && (
              <ChatMessage
                message="Thinking..."
                role="assistant"
                isLatest={true}
                isLoading={true}
              />
            )}
            {showAuthPrompt && (
              <div className="flex justify-start">
                <button
                  onClick={handleAuthRedirect}
                  className="flex items-center gap-2 rounded-2xl bg-[#292725] px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3a3735]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to get your discount
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container */}
        <div className="border-t border-[#292725]/10 bg-[#dad4d1] px-4 py-4">
          <ChatInput onSend={handleSendMessage} isLoading={isPending} />
        </div>
          </>
        )}
      </div>
    </>
  );
}
