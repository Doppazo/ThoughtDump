"use client";

import React from "react";
import { useIdeas } from "@/context/IdeasContext";
import { Idea } from "@/types";

interface WikilinkRendererProps {
  text: string;
  onSelectIdea?: (idea: Idea) => void;
  className?: string;
}

export function WikilinkRenderer({ text, onSelectIdea, className = "" }: WikilinkRendererProps) {
  const { ideas } = useIdeas();

  // Match [[Title]] syntax
  const regex = /\[\[(.*?)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    // Normal text before wikilink
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }

    const title = match[1].trim();
    // Check if an idea matches this title (case insensitive)
    const matchedIdea = ideas.find(
      (i) => i.title.toLowerCase() === title.toLowerCase()
    );

    if (matchedIdea) {
      parts.push(
        <button
          key={`wikilink-${start}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectIdea) onSelectIdea(matchedIdea);
          }}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[13px] font-semibold text-[var(--pen)] bg-[var(--pen-soft)] hover:underline mx-0.5 transition-colors align-baseline"
          title={`Open note: ${matchedIdea.title}`}
        >
          {title}
        </button>
      );
    } else {
      parts.push(
        <span
          key={`wikilink-missing-${start}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[13px] font-medium text-[var(--muted)] bg-[var(--line)]/50 line-through opacity-75 mx-0.5"
          title="Note does not exist yet"
        >
          {title}
        </span>
      );
    }

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
