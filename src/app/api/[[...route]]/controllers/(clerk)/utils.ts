import type { Message } from "@openrouter/sdk/models";

export function repairIncompleteJson(input: string): string {
  let inString = false;
  let escaped = false;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (const char of input) {
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") braceDepth++;
    if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
    if (char === "[") bracketDepth++;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
  }

  let repaired = input;
  if (inString) repaired += '"';
  if (bracketDepth > 0) repaired += "]".repeat(bracketDepth);
  if (braceDepth > 0) repaired += "}".repeat(braceDepth);

  return repaired;
}

export function parseToolArguments(rawArguments: unknown): Record<string, unknown> {
  if (!rawArguments) return {};

  if (typeof rawArguments === "object") {
    return rawArguments as Record<string, unknown>;
  }

  if (typeof rawArguments !== "string") {
    return {};
  }

  const trimmed = rawArguments.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    try {
      const repaired = repairIncompleteJson(trimmed);
      return JSON.parse(repaired) as Record<string, unknown>;
    } catch {
      return { rawArguments: trimmed };
    }
  }
}

export function extractProviderErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const errorRecord = error as Record<string, unknown>;

  const parseJsonLike = (value: unknown): Record<string, unknown> | null => {
    if (!value) return null;

    if (typeof value === "object") {
      return value as Record<string, unknown>;
    }

    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
      return null;
    }

    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  const candidates = [
    parseJsonLike(errorRecord.rawValue),
    parseJsonLike(errorRecord.body),
    parseJsonLike((errorRecord.cause as Record<string, unknown> | undefined)?.body),
  ].filter(Boolean) as Array<Record<string, unknown>>;

  for (const candidate of candidates) {
    const errorData = candidate.error as Record<string, unknown> | undefined;
    if (!errorData) continue;

    const provider = (errorData.metadata as Record<string, unknown> | undefined)?.provider_name;
    const message = errorData.message;

    if (typeof message === "string" && message.trim()) {
      return provider && typeof provider === "string"
        ? `${provider}: ${message}`
        : message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return null;
}

export function normalizeAssistantContent(content: Message["content"]): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          const text = item.text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter((part) => part.length > 0)
      .join("\n");
  }

  return "";
}
