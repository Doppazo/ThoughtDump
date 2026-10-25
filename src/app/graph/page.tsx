"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraphView } from "@/components/GraphView";
import { IdeaDetailModal } from "@/components/IdeaDetailModal";
import { SettingsModal } from "@/components/SettingsModal";
import { useIdeas } from "@/context/IdeasContext";
import { Idea } from "@/types";
import { ArrowLeft, Network, Settings, Layers, ExternalLink } from "lucide-react";

export default function GraphPage() {
  const { ideas } = useIdeas();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  };

  return (
    <div className="wrap py-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            title="Back to desk"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--f-display)] font-extrabold text-2xl tracking-tight flex items-center gap-2">
              <span>Interactive Graph</span>
              <span className="pill p-idea font-mono text-xs">2D Force</span>
            </h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Visual map of ideas clustered around their category hubs, linked by topic and project.
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="btn text-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desk View</span>
          </Link>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn text-xs flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Graph Component */}
      <main className="mt-4">
        <GraphView onSelectIdea={handleSelectIdea} />
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
