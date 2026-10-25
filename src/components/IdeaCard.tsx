"use client";

import React from "react";
import { Idea, ThoughtType } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { useIdeas } from "@/context/IdeasContext";

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const { deleteIdea, ideas } = useIdeas();
  const type: ThoughtType = idea.type || "idea";

  // Connections
  const links = (idea.links || []).filter((l) =>
    ideas.some((target) => target.id === (l.ideaId || (l as any).id))
  );

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5 flex flex-col gap-2 relative min-w-0 cursor-pointer hover:border-[var(--muted)] shadow-[var(--shadow)] transition-colors text-left"
    >
      {/* Top Row: type pill, relative time, delete button */}
      <div className="flex items-center justify-between gap-2">
        <span className={`pill p-${type}`}>{type}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {formatRelativeTime(idea.createdAt)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteIdea(idea.id);
            }}
            className="text-[var(--muted)] hover:text-[var(--t-reminder)] text-lg leading-none p-0.5 opacity-50 hover:opacity-100 transition-opacity"
            title="Delete this thought"
            aria-label={`Delete ${idea.title}`}
          >
            ×
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="m-0 text-[16.5px] leading-snug font-bold text-[var(--ink)] text-balance">
        {idea.title}
      </h4>

      {/* Summary */}
      {idea.summary && (
        <p className="m-0 text-[14.5px] text-[var(--muted)] break-words line-clamp-3">
          {idea.summary}
        </p>
      )}

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {idea.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[11.5px] text-[var(--muted)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Connected Links */}
      {links.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-[var(--line)] pt-2 text-[13px] mt-1">
          {links.slice(0, 2).map((l) => {
            const targetId = l.ideaId || (l as any).id;
            const target = ideas.find((x) => x.id === targetId);
            if (!target) return null;
            return (
              <span
                key={targetId}
                className="text-[var(--pen)] font-bold truncate block"
              >
                ↔ {target.title}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}
