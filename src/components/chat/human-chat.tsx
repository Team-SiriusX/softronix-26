"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, ArrowLeft, Loader2, Lock } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getPusherClient } from "@/lib/pusher-client";
import {
  useCreateConversation,
  useSendDirectMessage,
} from "@/services/queries/messages";
import type { DirectMessage } from "@/services/api/messages";

interface HumanChatProps {
  onBack: () => void;
}

export default function HumanChat({ onBack }: HumanChatProps) {
  const session = useSession();
  const user = session.data?.user;
  const isAuthenticated = !!user;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);

  const { mutate: createConversation, isPending: isCreating } =
    useCreateConversation();
  const { mutate: sendMessage, isPending: isSending } =
    useSendDirectMessage();

  // Initialize conversation on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    createConversation(undefined, {
      onSuccess: (data) => {
        const conv = data.data;
        setConversationId(conv.id);
        setMessages(conv.messages ?? []);
        setStatus(conv.status);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", (data: DirectMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        // Replace any optimistic temp message for same content/sender
        const tempIdx = prev.findIndex(
          (m) => m.id.startsWith("temp-") && m.content === data.content && m.senderId === data.senderId
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    channel.bind("status-change", (data: { status: "OPEN" | "CLOSED" }) => {
      setStatus(data.status);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !conversationId || isSending || sendingRef.current || status === "CLOSED") return;
    sendingRef.current = true;

    // Optimistic update
    const optimistic: DirectMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id ?? "",
      senderRole: "USER",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");

    sendMessage(
      { conversationId, content: text },
      {
        onSuccess: (data) => {
          sendingRef.current = false;
          setMessages((prev) => {
            const hasReal = prev.some((m) => m.id === data.data.id);
            if (hasReal) {
              // Pusher already delivered — just remove the temp
              return prev.filter((m) => m.id !== optimistic.id);
            }
            // Replace optimistic with real
            return prev.map((m) => (m.id === optimistic.id ? data.data : m));
          });
        },
        onError: () => {
          sendingRef.current = false;
          // Remove optimistic message on failure
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setInputValue(text);
        },
      }
    );
  }, [inputValue, conversationId, isSending, status, user?.id, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[#292725]/10 bg-[#dad4d1] px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#292725]/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#292725]" />
          </button>
          <h3 className="text-sm font-semibold text-[#292725]">
            Talk to Support
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <Lock className="w-10 h-10 mx-auto text-[#999] mb-3" />
            <p className="text-sm font-medium text-[#292725]">
              Sign in required
            </p>
            <p className="text-xs text-[#777] mt-1">
              Please sign in to chat with our support team.
            </p>
            <a
              href="/auth/sign-in"
              className="inline-block mt-4 px-5 py-2 bg-[#292725] text-white text-xs font-semibold rounded-lg hover:bg-[#3a3735] transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading conversation
  if (isCreating || !conversationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[#292725]/10 bg-[#dad4d1] px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#292725]/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#292725]" />
          </button>
          <h3 className="text-sm font-semibold text-[#292725]">
            Talk to Support
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#292725]/10 bg-[#dad4d1] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#292725]/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#292725]" />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-[#292725]">
              Support Chat
            </h3>
            <p className="text-[10px] text-[#777] mt-0.5">
              {status === "OPEN" ? "● Online" : "Conversation closed"}
            </p>
          </div>
        </div>
        {status === "OPEN" && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#292725]/5 flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-[#999]" />
            </div>
            <p className="text-sm font-medium text-[#292725]">
              Start a conversation
            </p>
            <p className="text-xs text-[#777] mt-1">
              Send a message and our team will reply shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.senderRole === "USER";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-[#292725] text-white rounded-br-md"
                        : "bg-[#c8c2bd] text-[#292725] rounded-bl-md"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-[10px] font-semibold text-[#555] mb-0.5">
                        {msg.senderName ?? "Support"}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={`text-[9px] mt-1 ${
                        isOwn ? "text-white/50" : "text-[#999]"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {status === "CLOSED" ? (
        <div className="border-t border-[#292725]/10 bg-[#dad4d1] px-4 py-3">
          <p className="text-xs text-center text-[#999]">
            This conversation has been closed by support.
          </p>
        </div>
      ) : (
        <div className="border-t border-[#292725]/10 bg-[#dad4d1] px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-[#c8c2bd]/50 text-[#292725] placeholder-[#999] text-sm rounded-xl px-4 py-2.5 border-none outline-none focus:ring-1 focus:ring-[#292725]/20"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="p-2.5 rounded-xl bg-[#292725] text-white disabled:opacity-40 hover:bg-[#3a3735] transition-colors"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
