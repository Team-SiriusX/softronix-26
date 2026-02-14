"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Viseme types ───
export interface VisemeFrame {
    aa: number;
    ee: number;
    oh: number;
}

interface UseTTSReturn {
    isSpeaking: boolean;
    currentViseme: VisemeFrame;
    speak: (text: string) => Promise<void>;
    stop: () => void;
    error: string | null;
}

// ─── Character → viseme mapping ───
// Maps characters (approximating phonemes) to mouth shape weights
const CHAR_VISEMES: Record<string, VisemeFrame> = {
    // Open vowels (jaw open)
    a: { aa: 0.45, ee: 0.0, oh: 0.0 },
    // Front vowels (smile)
    e: { aa: 0.1, ee: 0.35, oh: 0.0 },
    i: { aa: 0.05, ee: 0.4, oh: 0.0 },
    // Round vowels
    o: { aa: 0.15, ee: 0.0, oh: 0.4 },
    u: { aa: 0.05, ee: 0.0, oh: 0.35 },
    // Bilabials (lips together)
    b: { aa: 0.0, ee: 0.0, oh: 0.05 },
    p: { aa: 0.0, ee: 0.0, oh: 0.05 },
    m: { aa: 0.0, ee: 0.0, oh: 0.05 },
    // Labiodentals
    f: { aa: 0.0, ee: 0.15, oh: 0.0 },
    v: { aa: 0.0, ee: 0.15, oh: 0.0 },
    // Dentals/alveolars
    t: { aa: 0.1, ee: 0.1, oh: 0.0 },
    d: { aa: 0.1, ee: 0.1, oh: 0.0 },
    n: { aa: 0.1, ee: 0.1, oh: 0.0 },
    l: { aa: 0.15, ee: 0.1, oh: 0.0 },
    s: { aa: 0.0, ee: 0.2, oh: 0.0 },
    z: { aa: 0.0, ee: 0.2, oh: 0.0 },
    // Velars
    k: { aa: 0.15, ee: 0.0, oh: 0.0 },
    g: { aa: 0.15, ee: 0.0, oh: 0.0 },
    // Postalveolars
    r: { aa: 0.1, ee: 0.0, oh: 0.15 },
    // Glottals/wide
    h: { aa: 0.2, ee: 0.0, oh: 0.0 },
    w: { aa: 0.0, ee: 0.0, oh: 0.3 },
    y: { aa: 0.0, ee: 0.25, oh: 0.0 },
    // Th sounds
    c: { aa: 0.1, ee: 0.1, oh: 0.0 },
    j: { aa: 0.1, ee: 0.15, oh: 0.0 },
    q: { aa: 0.15, ee: 0.0, oh: 0.1 },
    x: { aa: 0.05, ee: 0.15, oh: 0.0 },
    // Silence / space / punctuation
    " ": { aa: 0.0, ee: 0.0, oh: 0.0 },
    ".": { aa: 0.0, ee: 0.0, oh: 0.0 },
    ",": { aa: 0.0, ee: 0.0, oh: 0.0 },
    "!": { aa: 0.0, ee: 0.0, oh: 0.0 },
    "?": { aa: 0.0, ee: 0.0, oh: 0.0 },
};

const SILENCE: VisemeFrame = { aa: 0, ee: 0, oh: 0 };

function getVisemeForChar(char: string): VisemeFrame {
    return CHAR_VISEMES[char.toLowerCase()] || SILENCE;
}

/**
 * Generate a viseme timeline from text.
 * Each entry has a time offset (seconds) and target viseme.
 */
function generateVisemeTimeline(
    text: string,
    rate: number
): Array<{ time: number; viseme: VisemeFrame }> {
    const timeline: Array<{ time: number; viseme: VisemeFrame }> = [];

    // Average speaking rate: ~150 words/min = ~12 chars/sec at rate 1.0
    const charsPerSecond = 12 * rate;
    const charDuration = 1 / charsPerSecond;

    // Clean text
    const clean = text.replace(/[^\w\s.,!?'-]/g, "");

    let timeOffset = 0;
    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        const viseme = getVisemeForChar(char);

        // Spaces and punctuation get longer pauses
        if (char === " ") {
            timeline.push({ time: timeOffset, viseme: SILENCE });
            timeOffset += charDuration * 1.5;
        } else if (".!?".includes(char)) {
            timeline.push({ time: timeOffset, viseme: SILENCE });
            timeOffset += charDuration * 4; // Sentence pause
        } else if (char === ",") {
            timeline.push({ time: timeOffset, viseme: SILENCE });
            timeOffset += charDuration * 2.5; // Clause pause
        } else {
            timeline.push({ time: timeOffset, viseme });
            timeOffset += charDuration;
        }
    }

    // End with closed mouth
    timeline.push({ time: timeOffset, viseme: SILENCE });

    return timeline;
}

export function useTTS(): UseTTSReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentViseme, setCurrentViseme] = useState<VisemeFrame>(SILENCE);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef(0);
    const timelineRef = useRef<Array<{ time: number; viseme: VisemeFrame }>>([]);
    const timelineIndexRef = useRef(0);

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setError(null);

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        cancelAnimationFrame(animFrameRef.current);

        const rate = 1.0;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Prefer natural-sounding voices
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
            voices.find((v) => v.name.includes("Microsoft Aria")) ||
            voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
            voices.find((v) => v.lang.startsWith("en") && v.localService) ||
            voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        utteranceRef.current = utterance;

        // Pre-compute viseme timeline
        timelineRef.current = generateVisemeTimeline(text, rate);
        timelineIndexRef.current = 0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            startTimeRef.current = performance.now();

            // Start viseme animation loop
            function animateVisemes() {
                const elapsed = (performance.now() - startTimeRef.current) / 1000;
                const timeline = timelineRef.current;

                // Find current viseme based on elapsed time
                let idx = timelineIndexRef.current;
                while (idx < timeline.length - 1 && timeline[idx + 1].time <= elapsed) {
                    idx++;
                }
                timelineIndexRef.current = idx;

                if (idx < timeline.length) {
                    const current = timeline[idx];
                    const next = idx + 1 < timeline.length ? timeline[idx + 1] : null;

                    if (next) {
                        // Interpolate between current and next viseme
                        const segDuration = next.time - current.time;
                        const segProgress = segDuration > 0
                            ? Math.min(1, (elapsed - current.time) / segDuration)
                            : 1;

                        // Smooth easing
                        const t = segProgress * segProgress * (3 - 2 * segProgress); // smoothstep

                        setCurrentViseme({
                            aa: current.viseme.aa + (next.viseme.aa - current.viseme.aa) * t,
                            ee: current.viseme.ee + (next.viseme.ee - current.viseme.ee) * t,
                            oh: current.viseme.oh + (next.viseme.oh - current.viseme.oh) * t,
                        });
                    } else {
                        setCurrentViseme(current.viseme);
                    }
                }

                animFrameRef.current = requestAnimationFrame(animateVisemes);
            }

            animateVisemes();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            cancelAnimationFrame(animFrameRef.current);
            setCurrentViseme(SILENCE);
        };

        utterance.onerror = (e) => {
            setIsSpeaking(false);
            cancelAnimationFrame(animFrameRef.current);
            setCurrentViseme(SILENCE);
            if (e.error !== "canceled") {
                setError("Speech synthesis failed");
            }
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        cancelAnimationFrame(animFrameRef.current);
        setIsSpeaking(false);
        setCurrentViseme(SILENCE);
    }, []);

    // Load voices
    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        window.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);
        return () => {
            window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
            stop();
        };
    }, [stop]);

    return { isSpeaking, currentViseme, speak, stop, error };
}
