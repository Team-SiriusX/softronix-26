"use client";

import React from "react";

interface FormattedMessageProps {
  content: string;
  className?: string;
}

/**
 * Lightweight markdown renderer for chat messages.
 * Supports: **bold**, *italic*, `code`, [links](url), line breaks, and bullet lists.
 */
export function FormattedMessage({ content, className = "" }: FormattedMessageProps) {
  const blocks = content.split("\n");

  return (
    <div className={`${className} space-y-1`}>
      {blocks.map((line, i) => {
        // Empty line = spacer
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }

        // Heading-like lines (### or ##)
        if (/^#{1,3}\s/.test(line)) {
          const text = line.replace(/^#{1,3}\s/, "");
          return (
            <p key={i} className="font-semibold mt-1">
              {parseInline(text)}
            </p>
          );
        }

        // Bullet list items (- or *)
        if (/^\s*[-*]\s/.test(line)) {
          const text = line.replace(/^\s*[-*]\s/, "");
          return (
            <div key={i} className="flex gap-1.5 pl-1">
              <span className="mt-[2px] shrink-0">•</span>
              <span>{parseInline(text)}</span>
            </div>
          );
        }

        // Numbered list items
        if (/^\s*\d+[.)]\s/.test(line)) {
          const match = line.match(/^(\s*\d+[.)]\s)(.*)/);
          if (match) {
            return (
              <div key={i} className="flex gap-1.5 pl-1">
                <span className="shrink-0">{match[1].trim()}</span>
                <span>{parseInline(match[2])}</span>
              </div>
            );
          }
        }

        // Regular paragraph
        return (
          <p key={i}>
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parse inline markdown: **bold**, *italic*, `code`, [text](url)
 */
function parseInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      tokens.push(
        <strong key={key++} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      // *italic*
      tokens.push(
        <em key={key++}>
          {match[4]}
        </em>
      );
    } else if (match[6]) {
      // `code`
      tokens.push(
        <code
          key={key++}
          className="bg-black/5 px-1.5 py-0.5 rounded text-[12px] font-mono"
        >
          {match[6]}
        </code>
      );
    } else if (match[8] && match[9]) {
      // [text](url)
      tokens.push(
        <a
          key={key++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}
