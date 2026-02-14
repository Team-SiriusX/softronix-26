import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: POST /api/voice/transcribe
 * Proxies audio to Groq's Whisper API for speech-to-text.
 * Keeps the GROQ_API_KEY server-side.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // Forward to Groq Whisper API
        const groqFormData = new FormData();
        groqFormData.append("file", audioFile, "recording.webm");
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("response_format", "json");
        groqFormData.append("temperature", "0.0");

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return NextResponse.json(
                { error: "GROQ_API_KEY not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${groqApiKey}`,
                },
                body: groqFormData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq Whisper error:", errorText);
            return NextResponse.json(
                { error: "Transcription failed", details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ transcript: data.text });
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
