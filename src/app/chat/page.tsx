"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Mic,
    Send,
    Loader2,
    Sparkles,
    X,
    Volume2,
    VolumeX,
    History,
    Plus,
    Trash2,
    MessageSquare,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/services";
import { useSendChatMessage, useProducts } from "@/components/chat/_api";
import {
    useChatMessages,
} from "@/components/providers/chat-provider";
import { useUIActions } from "@/components/chat/use-ui-actions";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useTTS } from "@/hooks/use-tts";
import { useChatHistory } from "@/hooks/use-chat-history";
import { FormattedMessage } from "@/components/chat/formatted-message";
import { AgentWorkingOverlay } from "@/components/chat/agent-working-overlay";
import Image from "next/image";

// Dynamic import for 3D canvas (no SSR)
const AvatarCanvas = dynamic(() => import("@/components/chat/avatar-canvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#e8e5df] to-[#d5d0c8]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#1c1c1c]/30" />
                <span className="text-xs uppercase tracking-widest text-[#1c1c1c]/40 font-medium">Loading Avatar</span>
            </div>
        </div>
    ),
});

interface Message {
    role: "user" | "assistant";
    content: string;
    products?: Product[];
}

export default function FullChatPage() {
    const router = useRouter();
    const { messages, setMessages } = useChatMessages();
    const [pendingProductIds, setPendingProductIds] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ttsEnabled, setTtsEnabled] = useState(true);

    const {
        sessions,
        activeSessionId,
        setActiveSessionId,
        saveSession,
        deleteSession,
        clearAllSessions,
        getSession,
    } = useChatHistory();
    const sessionIdRef = useRef<string | null>(null);

    const { mutate: sendMessage, isPending } = useSendChatMessage();
    const { data: products } = useProducts(pendingProductIds);
    const { executeUIAction } = useUIActions();
    const {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        cancelRecording,
        error: voiceError,
    } = useVoiceRecorder();
    const {
        isSpeaking,
        currentViseme,
        speak,
        stop: stopSpeaking,
        error: ttsError,
    } = useTTS();

    // Entrance animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power2.out" }
            );
        }
    }, []);

    // Auto-save messages to history when they change
    useEffect(() => {
        if (messages.some((m) => m.role === "user")) {
            const id = saveSession(messages, sessionIdRef.current);
            if (id) sessionIdRef.current = id;
        }
    }, [messages, saveSession]);

    // Load a past session
    const loadSession = useCallback(
        (id: string) => {
            const session = getSession(id);
            if (!session) return;
            // Strip products (not stored in history)
            setMessages(session.messages.map((m) => ({ role: m.role, content: m.content })));
            sessionIdRef.current = id;
            setActiveSessionId(id);
            setShowHistory(false);
        },
        [getSession, setMessages, setActiveSessionId]
    );

    // Start new conversation
    const handleNewChat = useCallback(() => {
        setMessages([
            {
                role: "assistant",
                content: "Welcome to Echo! I'm your personal grooming assistant. How can I help you today?",
            },
        ]);
        sessionIdRef.current = null;
        setActiveSessionId(null);
        setShowHistory(false);
    }, [setMessages, setActiveSessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Update messages when products are fetched
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
            queueMicrotask(() => setPendingProductIds([]));
        }
    }, [products, pendingProductIds, setMessages]);

    const handleSend = useCallback(
        (text: string) => {
            if (!text.trim() || isPending) return;

            // Stop any current TTS
            stopSpeaking();

            const newUserMessage: Message = { role: "user", content: text };
            setMessages((prev) => [...prev, newUserMessage]);
            setInput("");

            const conversationHistory = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            sendMessage(
                { userMessage: text, conversationHistory },
                {
                    onSuccess: (data) => {
                        if (data.success) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const successData = data as any;
                            const productIds: string[] = (successData.products || []).map(
                                (p: { id: string }) => p.id
                            );

                            const responseText = successData.response as string;
                            const assistantMessage: Message = {
                                role: "assistant",
                                content: responseText,
                            };
                            setMessages((prev) => [...prev, assistantMessage]);

                            if (productIds.length > 0) setPendingProductIds(productIds);

                            // Speak the response (drives avatar lip sync)
                            if (ttsEnabled && responseText) {
                                speak(responseText);
                            }

                            const functions = successData.functions as
                                | Array<{ name: string; args: Record<string, unknown> }>
                                | undefined;
                            if (functions && functions.length > 0) {
                                functions.forEach(
                                    (fn: { name: string; args: Record<string, unknown> }) => {
                                        executeUIAction(fn.name, fn.args);
                                    }
                                );
                            }
                        } else {
                            throw new Error(String(data.error) || "Failed to get response");
                        }
                    },
                    onError: () => {
                        const errorMessage: Message = {
                            role: "assistant",
                            content: "Thank you for your interest! Echo was developed as the winning project for the GCU Softronix Hackathon. 🏆 As the competition has concluded, our development team has now decommissioned the live API services.",
                        };
                        setMessages((prev) => [...prev, errorMessage]);
                    },
                }
            );
        },
        [isPending, messages, sendMessage, setMessages, executeUIAction, ttsEnabled, speak, stopSpeaking]
    );

    const handleVoiceToggle = async () => {
        if (isRecording) {
            const transcript = await stopRecording();
            if (transcript) {
                handleSend(transcript);
            }
        } else {
            await startRecording();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    return (
        <div
            ref={containerRef}
            className="h-screen w-full bg-[#f2efe9] flex flex-col lg:flex-row overflow-hidden opacity-0"
        >
            {/* ── LEFT: 3D Avatar ── */}
            <div className="relative w-full lg:w-[45%] h-[35vh] lg:h-full shrink-0 bg-linear-to-b from-[#e8e5df] to-[#d5d0c8] overflow-hidden">
                {/* Gradient overlay at top */}
                <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#e8e5df] to-transparent z-10 pointer-events-none" />

                {/* Back button */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider hidden md:inline">Back</span>
                    </button>
                </div>

                {/* TTS toggle */}
                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={() => {
                            if (isSpeaking) stopSpeaking();
                            setTtsEnabled(!ttsEnabled);
                        }}
                        className={cn(
                            "p-3 rounded-full backdrop-blur-sm shadow-sm transition-all",
                            ttsEnabled
                                ? "bg-[#1c1c1c] text-[#f2efe9]"
                                : "bg-white/80 text-[#1c1c1c]"
                        )}
                        title={ttsEnabled ? "Mute voice" : "Enable voice"}
                    >
                        {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                </div>

                {/* 3D Scene */}
                <AvatarCanvas
                    isSpeaking={isSpeaking}
                    viseme={currentViseme}
                    className="w-full h-full"
                />

                {/* Brand pill */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-white/50">
                        <Sparkles className="w-4 h-4 text-[#1c1c1c]/50" />
                        <span className="text-sm font-bold tracking-tight text-[#1c1c1c] font-gloock">
                            Echo
                        </span>
                        {isSpeaking && (
                            <div className="flex gap-0.5 ml-1">
                                <span className="w-1 h-3 bg-[#1c1c1c]/60 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                                <span className="w-1 h-4 bg-[#1c1c1c]/60 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                                <span className="w-1 h-2 bg-[#1c1c1c]/60 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                            </div>
                        )}
                        {!isSpeaking && (
                            <div className="flex items-center gap-1 ml-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold">Ready</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Chat Panel ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f2efe9] relative">
                {/* Agent working overlay */}
                <AgentWorkingOverlay isActive={isPending} variant="full" />

                {/* Chat header */}
                <header className="shrink-0 border-b border-[#1c1c1c]/8 px-6 py-4 bg-[#f2efe9] z-30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-[#1c1c1c] tracking-tight font-gloock">
                                Conversation
                            </h1>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1c1c1c]/35 font-medium mt-0.5">
                                Speak or type to interact
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNewChat}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-[#1c1c1c]/60 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/5 transition-colors"
                                title="New conversation"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">New</span>
                            </button>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors",
                                    showHistory
                                        ? "bg-[#1c1c1c] text-[#f2efe9]"
                                        : "text-[#1c1c1c]/60 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/5"
                                )}
                                title="Chat history"
                            >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">History</span>
                                {sessions.length > 0 && !showHistory && (
                                    <span className="ml-0.5 w-4 h-4 rounded-full bg-[#1c1c1c]/10 text-[#1c1c1c]/60 flex items-center justify-center text-[8px] font-bold">
                                        {sessions.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── History Panel (slides over messages) ── */}
                {showHistory && (
                    <div className="absolute inset-0 top-15.25 z-20 bg-[#f2efe9] flex flex-col animate-in slide-in-from-right-4 duration-200">
                        {/* History header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c]/8">
                            <div>
                                <h2 className="text-sm font-bold text-[#1c1c1c] uppercase tracking-[0.15em]">
                                    Chat History
                                </h2>
                                <p className="text-[9px] text-[#1c1c1c]/35 uppercase tracking-wider mt-0.5">
                                    {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            {sessions.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm("Clear all chat history?")) clearAllSessions();
                                    }}
                                    className="text-[10px] uppercase tracking-wider text-red-400 hover:text-red-500 font-semibold transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Session list */}
                        <div className="flex-1 overflow-y-auto">
                            {sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                    <MessageSquare className="w-8 h-8 text-[#1c1c1c]/10 mb-3" />
                                    <p className="text-xs font-medium text-[#1c1c1c]/40">
                                        No previous conversations
                                    </p>
                                    <p className="text-[10px] text-[#1c1c1c]/25 mt-1">
                                        Your chat history will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {sessions.map((session) => {
                                        const isActive = sessionIdRef.current === session.id;
                                        const msgCount = session.messages.filter((m) => m.role === "user").length;
                                        const timeAgo = formatTimeAgo(session.updatedAt);
                                        return (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "group flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-colors",
                                                    isActive
                                                        ? "bg-[#1c1c1c]/5"
                                                        : "hover:bg-[#1c1c1c]/3"
                                                )}
                                                onClick={() => loadSession(session.id)}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    isActive ? "bg-[#1c1c1c] text-[#f2efe9]" : "bg-[#1c1c1c]/5 text-[#1c1c1c]/30"
                                                )}>
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-[#1c1c1c] truncate">
                                                        {session.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-[#1c1c1c]/30">
                                                            {msgCount} message{msgCount !== 1 ? "s" : ""}
                                                        </span>
                                                        <span className="text-[9px] text-[#1c1c1c]/20">·</span>
                                                        <span className="text-[9px] text-[#1c1c1c]/30">
                                                            {timeAgo}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteSession(session.id);
                                                        }}
                                                        className="p-1.5 rounded-md hover:bg-red-50 text-[#1c1c1c]/20 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <ChevronRight className="w-3 h-3 text-[#1c1c1c]/15" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="px-6 py-6 space-y-5">
                        {messages.map((message, index) => (
                            <div key={index}>
                                <div
                                    className={cn(
                                        "flex",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[85%] rounded-2xl px-5 py-3.5",
                                            message.role === "user"
                                                ? "bg-[#1c1c1c] text-[#f2efe9] shadow-md"
                                                : "bg-white/70 backdrop-blur-sm text-[#1c1c1c] border border-[#1c1c1c]/5 shadow-sm"
                                        )}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="flex items-center gap-1.5 mb-1.5 opacity-35">
                                                <Sparkles className="w-3 h-3" />
                                                <span className="text-[8px] uppercase tracking-[0.15em] font-bold">Echo</span>
                                            </div>
                                        )}
                                        <FormattedMessage content={message.content} className="text-[13px] leading-relaxed" />
                                    </div>
                                </div>

                                {/* Product suggestions */}
                                {message.products && message.products.length > 0 && (
                                    <div className="flex gap-3 mt-3 overflow-x-auto pb-2 pl-1 scrollbar-hide">
                                        {message.products.map((product, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/products/${product.id}`}
                                                className="shrink-0 w-40 group"
                                            >
                                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#e8e5df] shadow-sm">
                                                    {product.images?.[0] && (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    )}
                                                </div>
                                                <div className="mt-2 px-0.5">
                                                    <h4 className="text-xs font-medium truncate">{product.name}</h4>
                                                    <span className="text-[10px] opacity-40">{product.price.formatted}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Thinking */}
                        {isPending && (
                            <div className="flex justify-start">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-sm border border-[#1c1c1c]/5">
                                    <div className="flex items-center gap-1.5 mb-1.5 opacity-35">
                                        <Sparkles className="w-3 h-3" />
                                        <span className="text-[8px] uppercase tracking-[0.15em] font-bold">Echo</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-[#1c1c1c]/20 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-[#1c1c1c]/20 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-[#1c1c1c]/20 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Errors */}
                        {(voiceError || ttsError) && (
                            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                                {voiceError || ttsError}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Recording state */}
                {isRecording && (
                    <div className="shrink-0 bg-[#1c1c1c] text-[#f2efe9] px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-medium">Listening...</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={cancelRecording} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleVoiceToggle}
                                    className="px-5 py-2 bg-[#f2efe9] text-[#1c1c1c] rounded-full text-sm font-semibold"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transcribing state */}
                {isTranscribing && (
                    <div className="shrink-0 bg-[#1c1c1c] text-[#f2efe9] px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Transcribing...</span>
                        </div>
                    </div>
                )}

                {/* Input */}
                {!isRecording && !isTranscribing && (
                    <div className="shrink-0 border-t border-[#1c1c1c]/8 px-6 py-4 bg-[#f2efe9]">
                        <div className="flex items-end gap-3">
                            {/* Mic */}
                            <button
                                onClick={handleVoiceToggle}
                                disabled={isPending}
                                className={cn(
                                    "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                                    "bg-[#1c1c1c]/5 hover:bg-[#1c1c1c]/10 text-[#1c1c1c]",
                                    "disabled:opacity-30 disabled:cursor-not-allowed"
                                )}
                                title="Tap to speak"
                            >
                                <Mic className="w-5 h-5" />
                            </button>

                            {/* Text */}
                            <div className="flex-1">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type or speak..."
                                    rows={1}
                                    disabled={isPending}
                                    className={cn(
                                        "w-full rounded-2xl px-5 py-3 text-sm resize-none",
                                        "bg-white/70 backdrop-blur-sm text-[#1c1c1c]",
                                        "border border-[#1c1c1c]/8 focus:border-[#1c1c1c]/25",
                                        "focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]/8",
                                        "transition-all duration-200 placeholder:text-[#1c1c1c]/25",
                                        "disabled:opacity-50 max-h-35"
                                    )}
                                />
                            </div>

                            {/* Send */}
                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || isPending}
                                className={cn(
                                    "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                                    "bg-[#1c1c1c] text-[#f2efe9]",
                                    "hover:bg-[#333] active:scale-95",
                                    "disabled:opacity-20 disabled:cursor-not-allowed"
                                )}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
/** Format a date string into a relative "time ago" label */
function formatTimeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(dateStr).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
    });
}