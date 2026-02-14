"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  X,
  RotateCcw,
  Inbox,
  User,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import {
  useConversations,
  useConversation,
  useSendDirectMessage,
  useUpdateConversationStatus,
} from "@/services/queries/messages";
import type {
  Conversation,
  DirectMessage,
} from "@/services/api/messages";

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarConversations, setSidebarConversations] = useState<
    Conversation[]
  >([]);

  const { data: convData, isLoading: loadingList } = useConversations();
  const { data: threadData, isLoading: loadingThread } =
    useConversation(selectedId);

  // Sync fetched conversations into local state
  useEffect(() => {
    if (convData?.data) {
      setSidebarConversations(convData.data);
    }
  }, [convData]);

  // Subscribe to admin-messages channel for real-time sidebar updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe("admin-messages");

    channel.bind("new-conversation", (data: Conversation) => {
      setSidebarConversations((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    channel.bind(
      "message-update",
      (data: { conversationId: string; lastMessage: DirectMessage }) => {
        setSidebarConversations((prev) =>
          prev
            .map((c) =>
              c.id === data.conversationId
                ? { ...c, lastMessage: data.lastMessage, updatedAt: data.lastMessage.createdAt }
                : c
            )
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
        );
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-messages");
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-53px)]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-[#e0dcd6] bg-[#f7f4f0] flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-[#e0dcd6]">
          <h2 className="text-sm font-bold text-[#1c1c1c] uppercase tracking-[0.15em]">
            Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-[#999]" />
            </div>
          ) : sidebarConversations.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-4 text-center">
              <Inbox className="w-8 h-8 text-[#ccc] mb-2" />
              <p className="text-xs text-[#999]">No conversations yet</p>
            </div>
          ) : (
            sidebarConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#e0dcd6]/60 transition-colors ${
                  selectedId === conv.id
                    ? "bg-[#e8e5df]"
                    : "hover:bg-[#edeae4]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e0dcd6] flex items-center justify-center shrink-0">
                    {conv.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conv.user.image}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#999]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#1c1c1c] truncate">
                        {conv.user?.name ?? "Unknown"}
                      </p>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider ${
                          conv.status === "OPEN"
                            ? "text-emerald-600"
                            : "text-[#999]"
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777] truncate mt-0.5">
                      {conv.lastMessage?.content ?? "No messages"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Thread Panel */}
      <div className="flex-1 flex flex-col bg-[#f2efe9]">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-10 h-10 mx-auto text-[#ccc] mb-3" />
              <p className="text-sm font-medium text-[#999]">
                Select a conversation
              </p>
            </div>
          </div>
        ) : loadingThread ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
          </div>
        ) : (
          <ThreadPanel
            conversation={threadData!.data}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ——————————————————————————————————————————————————————
   Thread Panel — shows messages and reply input
   —————————————————————————————————————————————————————— */

function ThreadPanel({
  conversation,
  onClose,
}: {
  conversation: Conversation;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<DirectMessage[]>(
    conversation.messages ?? []
  );
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState(conversation.status);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const { mutate: sendMessage, isPending: isSending } =
    useSendDirectMessage();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateConversationStatus();

  // Reset when conversation changes
  useEffect(() => {
    setMessages(conversation.messages ?? []);
    setStatus(conversation.status);
  }, [conversation]);

  // Subscribe to real-time updates for this conversation
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(
      `conversation-${conversation.id}`
    );

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

    channel.bind(
      "status-change",
      (data: { status: "OPEN" | "CLOSED" }) => {
        setStatus(data.status);
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversation.id}`);
    };
  }, [conversation.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isSending || sendingRef.current || status === "CLOSED") return;
    sendingRef.current = true;

    const optimistic: DirectMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      senderId: "admin",
      senderRole: "ADMIN",
      senderName: "Support",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");

    sendMessage(
      { conversationId: conversation.id, content: text },
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
          setMessages((prev) =>
            prev.filter((m) => m.id !== optimistic.id)
          );
          setInputValue(text);
        },
      }
    );
  }, [inputValue, isSending, status, conversation.id, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleStatus = () => {
    const newStatus = status === "OPEN" ? "CLOSED" : "OPEN";
    updateStatus({ conversationId: conversation.id, status: newStatus });
  };

  return (
    <>
      {/* Thread Header */}
      <div className="border-b border-[#e0dcd6] bg-[#f7f4f0] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#e0dcd6] flex items-center justify-center">
            {conversation.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.user.image}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-[#999]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1c1c1c]">
              {conversation.user?.name ?? "Unknown"}
            </p>
            <p className="text-[10px] text-[#999]">
              {conversation.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === "OPEN"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {status === "OPEN" ? (
              <>
                <X className="w-3 h-3" /> Close
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" /> Reopen
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#e0dcd6] transition-colors"
          >
            <X className="w-4 h-4 text-[#999]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-[#999]">No messages in this conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAdmin = msg.senderRole === "ADMIN";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isAdmin
                        ? "bg-[#292725] text-white rounded-br-md"
                        : "bg-[#e8e5df] text-[#1c1c1c] rounded-bl-md"
                    }`}
                  >
                    {!isAdmin && (
                      <p className="text-[10px] font-semibold text-[#999] mb-0.5">
                        {conversation.user?.name ?? "Customer"}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={`text-[9px] mt-1 ${
                        isAdmin ? "text-white/50" : "text-[#999]"
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

      {/* Reply Input */}
      {status === "CLOSED" ? (
        <div className="border-t border-[#e0dcd6] bg-[#f7f4f0] px-5 py-3 text-center">
          <p className="text-xs text-[#999]">
            Conversation closed · Reopen to reply
          </p>
        </div>
      ) : (
        <div className="border-t border-[#e0dcd6] bg-[#f7f4f0] px-5 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply..."
              className="flex-1 bg-[#f2efe9] text-[#1c1c1c] placeholder-[#999] text-sm rounded-xl px-4 py-2.5 border border-[#e0dcd6] outline-none focus:ring-1 focus:ring-[#1c1c1c]/20"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="p-2.5 rounded-xl bg-[#1c1c1c] text-white disabled:opacity-40 hover:bg-[#333] transition-colors"
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
    </>
  );
}
