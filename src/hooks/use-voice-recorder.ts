"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecorderReturn {
    isRecording: boolean;
    isTranscribing: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    cancelRecording: () => void;
    error: string | null;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            streamRef.current = stream;
            chunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(100); // Collect every 100ms
            setIsRecording(true);
        } catch (err) {
            console.error("Failed to start recording:", err);
            setError("Microphone access denied. Please allow microphone usage.");
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current;
            if (!mediaRecorder || mediaRecorder.state === "inactive") {
                resolve(null);
                return;
            }

            mediaRecorder.onstop = async () => {
                setIsRecording(false);

                // Stop all tracks
                streamRef.current?.getTracks().forEach((track) => track.stop());

                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                chunksRef.current = [];

                if (audioBlob.size < 1000) {
                    setError("Recording too short. Please try again.");
                    resolve(null);
                    return;
                }

                // Send to transcription API
                setIsTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "recording.webm");

                    const response = await fetch("/api/voice/transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Transcription failed");
                    }

                    const data = await response.json();
                    setIsTranscribing(false);
                    resolve(data.transcript || null);
                } catch (err) {
                    console.error("Transcription error:", err);
                    setError("Failed to transcribe audio. Please try again.");
                    setIsTranscribing(false);
                    resolve(null);
                }
            };

            mediaRecorder.stop();
        });
    }, []);

    const cancelRecording = useCallback(() => {
        const mediaRecorder = mediaRecorderRef.current;
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
        chunksRef.current = [];
        setIsRecording(false);
        setIsTranscribing(false);
    }, []);

    return {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        cancelRecording,
        error,
    };
}
