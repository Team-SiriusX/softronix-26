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
import Image from "next/image";

// Dynamic import for 3D canvas (no SSR)
const AvatarCanvas = dynamic(() => import("@/components/chat/avatar-canvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#e8e5df] to-[#d5d0c8]">
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ttsEnabled, setTtsEnabled] = useState(true);

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
                            content: "I apologize, but I'm having trouble right now. Please try again.",
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
            <div className="relative w-full lg:w-[45%] h-[35vh] lg:h-full flex-shrink-0 bg-gradient-to-b from-[#e8e5df] to-[#d5d0c8] overflow-hidden">
                {/* Gradient overlay at top */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#e8e5df] to-transparent z-10 pointer-events-none" />

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
                        <span className="text-sm font-bold tracking-tight text-[#1c1c1c] font-[family-name:var(--font-gloock)]">
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
            <div className="flex-1 flex flex-col min-w-0 bg-[#f2efe9]">
                {/* Chat header */}
                <header className="flex-shrink-0 border-b border-[#1c1c1c]/8 px-6 py-4 bg-[#f2efe9]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-[#1c1c1c] tracking-tight font-[family-name:var(--font-gloock)]">
                                Conversation
                            </h1>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1c1c1c]/35 font-medium mt-0.5">
                                Speak or type to interact
                            </p>
                        </div>
                    </div>
                </header>

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
                                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>

                                {/* Product suggestions */}
                                {message.products && message.products.length > 0 && (
                                    <div className="flex gap-3 mt-3 overflow-x-auto pb-2 pl-1 scrollbar-hide">
                                        {message.products.map((product, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/products/${product.id}`}
                                                className="flex-shrink-0 w-40 group"
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
                    <div className="flex-shrink-0 bg-[#1c1c1c] text-[#f2efe9] px-6 py-4">
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
                    <div className="flex-shrink-0 bg-[#1c1c1c] text-[#f2efe9] px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Transcribing...</span>
                        </div>
                    </div>
                )}

                {/* Input */}
                {!isRecording && !isTranscribing && (
                    <div className="flex-shrink-0 border-t border-[#1c1c1c]/8 px-6 py-4 bg-[#f2efe9]">
                        <div className="flex items-end gap-3">
                            {/* Mic */}
                            <button
                                onClick={handleVoiceToggle}
                                disabled={isPending}
                                className={cn(
                                    "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
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
                                        "disabled:opacity-50 max-h-[140px]"
                                    )}
                                />
                            </div>

                            {/* Send */}
                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || isPending}
                                className={cn(
                                    "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
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
