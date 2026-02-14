"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatSession {
  id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "echo-chat-history";
const MAX_SESSIONS = 50;

function generateId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(messages: { role: string; content: string }[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "New conversation";
  const text = firstUserMsg.content.trim();
  return text.length > 50 ? text.slice(0, 50) + "…" : text;
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions.slice(0, MAX_SESSIONS))
    );
  } catch {
    // Storage full — trim older sessions
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessions.slice(0, 20))
      );
    } catch {
      // give up silently
    }
  }
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = loadSessions();
    setSessions(loaded);
  }, []);

  // Persist whenever sessions change (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveSessions(sessions);
  }, [sessions]);

  /** Save the current messages as a session (create or update) */
  const saveSession = useCallback(
    (
      messages: { role: "user" | "assistant"; content: string }[],
      sessionId?: string | null
    ) => {
      // Only save if there's at least one user message
      if (!messages.some((m) => m.role === "user")) return sessionId ?? null;

      const now = new Date().toISOString();

      if (sessionId) {
        // Update existing
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                  title: deriveTitle(messages),
                  updatedAt: now,
                }
              : s
          )
        );
        return sessionId;
      } else {
        // Create new
        const id = generateId();
        const session: ChatSession = {
          id,
          title: deriveTitle(messages),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          createdAt: now,
          updatedAt: now,
        };
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(id);
        return id;
      }
    },
    []
  );

  /** Delete a session */
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
    },
    [activeSessionId]
  );

  /** Clear all sessions */
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  /** Get a session by ID */
  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id) ?? null,
    [sessions]
  );

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    saveSession,
    deleteSession,
    clearAllSessions,
    getSession,
  };
}
