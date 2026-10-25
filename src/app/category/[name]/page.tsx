"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useIdeas } from "@/context/IdeasContext";
import { IdeaCard } from "@/components/IdeaCard";
import { IdeaDetailModal } from "@/components/IdeaDetailModal";
import { Idea } from "@/types";
import { getCategoryColor } from "@/lib/colors";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Folder,
  Layers,
  Network,
  Share2,
} from "lucide-react";

export default function CategoryHubPage() {
  const params = useParams();
  const router = useRouter();
  const rawName = String(params.name || "");
  const categoryName = decodeURIComponent(rawName);

  const { ideas, categories, summarizeCategory } = useIdeas();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [categorySummary, setCategorySummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Match current category object
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  }, [categories, categoryName]);

  const categoryColor = currentCategory?.color || getCategoryColor(categoryName);

  // Ideas in this category (newest first)
  const categoryIdeas = useMemo(() => {
    return ideas
      .filter((i) => i.category.toLowerCase() === categoryName.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [ideas, categoryName]);

  const categoryIdeaIds = useMemo(() => {
    return new Set(categoryIdeas.map((i) => i.id));
  }, [categoryIdeas]);

  // Connected categories: other categories whose ideas link to ideas in this one, or that this category links to
  const connectedCategories = useMemo(() => {
    const counts = new Map<string, number>();

    ideas.forEach((other) => {
      if (other.category.toLowerCase() === categoryName.toLowerCase()) {
        // Check outgoing links from this category to other categories
        (other.links || []).forEach((l) => {
          const target = ideas.find((i) => i.id === l.ideaId);
          if (target && target.category.toLowerCase() !== categoryName.toLowerCase()) {
            counts.set(target.category, (counts.get(target.category) || 0) + 1);
          }
        });
      } else {
        // Check incoming links from other categories to this category
        (other.links || []).forEach((l) => {
          if (categoryIdeaIds.has(l.ideaId)) {
            counts.set(other.category, (counts.get(other.category) || 0) + 1);
          }
        });
      }
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        color: categories.find((c) => c.name.toLowerCase() === name.toLowerCase())?.color || getCategoryColor(name),
      }))
      .sort((a, b) => b.count - a.count);
  }, [ideas, categoryName, categoryIdeaIds, categories]);

  const handleSummarize = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeCategory(categoryName);
      setCategorySummary(summary);
    } catch (err) {
      console.error("Category summary error:", err);
      setCategorySummary("Could not generate summary at this time.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="wrap py-6">
      {/* Back button & Header */}
      <header className="flex flex-col gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex"
            title="Back to desk"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/graph" className="btn text-xs flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>View in Graph</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                Category Hub
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] font-[family-name:var(--f-display)] tracking-tight">
              {categoryName}
            </h1>
            <p className="text-xs text-[var(--muted)] font-mono">
              <b>{categoryIdeas.length}</b> {categoryIdeas.length === 1 ? "note" : "notes"} in this hub
            </p>
          </div>

          <button
            type="button"
            onClick={handleSummarize}
            disabled={isSummarizing || categoryIdeas.length === 0}
            className="btn primary flex items-center gap-2 text-xs font-bold"
          >
            {isSummarizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Summarize with AI</span>
          </button>
        </div>
      </header>

      {/* AI Category Summary Box */}
      {categorySummary && (
        <section className="mt-4 p-5 rounded-2xl bg-[var(--pen-soft)] border border-[var(--pen)]/20 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold font-mono text-[var(--pen)] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Summary</span>
          </div>
          <p className="text-[15px] leading-relaxed text-[var(--ink)] whitespace-pre-line font-[family-name:var(--f-body)]">
            {categorySummary}
          </p>
        </section>
      )}

      {/* Connected Categories Section */}
      {connectedCategories.length > 0 && (
        <section className="mt-6 p-4 rounded-xl bg-white border border-[var(--line)]">
          <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[var(--pen)]" />
            <span>Connected Categories</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {connectedCategories.map((conn) => (
              <Link
                key={conn.name}
                href={`/category/${encodeURIComponent(conn.name)}`}
                className="chip flex items-center gap-1.5 hover:border-[var(--pen)] transition-colors"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conn.color }} />
                <span>{conn.name}</span>
                <span className="n">{conn.count} {conn.count === 1 ? "link" : "links"}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Notes Grid */}
      <main className="mt-6 space-y-4">
        <h3 className="text-lg font-bold text-[var(--ink)] font-[family-name:var(--f-display)]">
          Notes in this Category
        </h3>

        {categoryIdeas.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-2xl bg-white text-xs text-[var(--muted)]">
            No ideas in this category yet. Return to the desk to dump your thoughts!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categoryIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => {
                  setSelectedIdea(idea);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <IdeaDetailModal
        idea={selectedIdea}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIdea(null);
        }}
        onSelectIdea={(target) => {
          setSelectedIdea(target);
          setIsDetailOpen(true);
        }}
      />
    </div>
  );
}
