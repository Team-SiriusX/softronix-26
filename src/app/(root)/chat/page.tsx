"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ChatMessage from "@/components/chat/chat-message";
import ChatInput from "@/components/chat/chat-input";
import ProductRecommendations from "@/components/chat/product-recommendations";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Echo! I'm your personal grooming assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/clerk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          products: data.products || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#dad4d1] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#292725]/10 bg-[#dad4d1]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#292725] tracking-tight">
            Echo
          </h1>
          <p className="text-sm text-[#555] mt-1">
            Ask me anything about our products
          </p>
        </div>
      </header>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8"
      >
        <div className="max-w-4xl mx-auto space-y-6">
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
          {isLoading && (
            <ChatMessage
              message="Thinking..."
              role="assistant"
              isLatest={true}
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="border-t border-[#292725]/10 bg-[#dad4d1]/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
