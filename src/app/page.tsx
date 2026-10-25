"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useIdeas } from "@/context/IdeasContext";
import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { IdeaDetailModal } from "@/components/IdeaDetailModal";
import { SettingsModal } from "@/components/SettingsModal";
import { AuthScreen } from "@/components/AuthScreen";
import { GraphView } from "@/components/GraphView";
import { Idea, ThoughtType } from "@/types";
import {
  Mic,
  MicOff,
  Settings,
  Loader2,
  Network,
  Plus,
  Calendar,
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Flame,
  CheckSquare,
  Square,
  X,
  Layers,
  FolderPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const SAMPLE_RAMBLE =
  "ok so walking to class and I had this thought, what if there was an app that tells you which dining hall has the shortest line right now, people would use that every day. also I need to email professor Lee about the group project deadline before friday. and buy a birthday gift for my sister, maybe concert tickets? random but I wonder if students would actually pay for the laundry pickup thing or if it should be free with ads. oh and remind me to start running 3 times a week again";

function ago(t: number): string {
  const d = Date.now() - t;
  if (d < 60000) return "just now";
  if (d < 3600000) return Math.floor(d / 60000) + " min ago";
  if (d < 86400000) return Math.floor(d / 3600000) + " hr ago";
  const n = Math.floor(d / 86400000);
  return n === 1 ? "yesterday" : n + " days ago";
}

// Category palette inspired by the Tools reference image
const TILE_PALETTES = [
  { bg: "#D49A2A", text: "#FFFFFF" }, // Warm Mustard Gold (Sound Patterns)
  { bg: "#1A3B66", text: "#FFFFFF" }, // Deep Navy Cobalt (Breathing)
  { bg: "#78365B", text: "#FFFFFF" }, // Berry Plum (Quotes)
  { bg: "#7E7969", text: "#FFFFFF" }, // Warm Olive Sage (Emotions 101)
  { bg: "#69579E", text: "#FFFFFF" }, // Royal Purple (Best Self)
  { bg: "#707C1C", text: "#FFFFFF" }, // Olive Green (Movement)
  { bg: "#2645D4", text: "#FFFFFF" }, // Cobalt Blue
  { bg: "#B8375F", text: "#FFFFFF" }, // Rose Crimson
];

type TabType = "checkin" | "breakdown" | "tools";

export default function HomePage() {
  const { user, loading, getToken } = useAuth();
  const {
    ideas,
    dumps,
    isLoading,
    isProcessing,
    newIdeaIds,
    processDump,
    toggleTodoDone,
    deleteIdea,
  } = useIdeas();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>("checkin");

  // Dump input state
  const [dumpText, setDumpText] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isStatusErr, setIsStatusErr] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Tools AI Lookup state
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Breakdown time filter state
  const [breakdownPeriod, setBreakdownPeriod] = useState<"W" | "M" | "ALL">("ALL");

  // Voice capture hook
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    setTranscript,
  } = useVoiceCapture();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync speech recognition into dumpText
  useEffect(() => {
    if (isRecording && transcript) {
      setDumpText(transcript);
    }
  }, [isRecording, transcript]);

  // Group ideas by category
  const { cats, catNames, totalConnections } = useMemo(() => {
    const map: Record<string, Idea[]> = {};
    let connections = 0;

    ideas.forEach((i) => {
      const cat = i.category || "Unsorted";
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
      connections += (i.links || []).length;
    });

    const sortedNames = Object.keys(map).sort(
      (a, b) => map[b].length - map[a].length || a.localeCompare(b)
    );

    return { cats: map, catNames: sortedNames, totalConnections: connections };
  }, [ideas]);

  // Category percentage breakdown (matching image 2)
  const categoryBreakdown = useMemo(() => {
    const total = ideas.length || 1;
    return catNames.map((name, idx) => {
      const count = cats[name]?.length || 0;
      const pct = Math.round((count / total) * 100);
      const palette = TILE_PALETTES[idx % TILE_PALETTES.length];
      return {
        name,
        count,
        pct,
        color: palette.bg,
      };
    });
  }, [catNames, cats, ideas.length]);

  // To-dos extracted by AI
  const todos = useMemo(() => {
    return ideas
      .filter((i) => i.type === "task" || i.type === "reminder")
      .sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || b.createdAt - a.createdAt);
  }, [ideas]);

  // Time of day greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }, []);

  // Days of week indicator
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDayOfWeek = new Date().getDay();

  const handleToggleVoice = async () => {
    if (isRecording) {
      const recorded = await stopRecording();
      if (recorded.trim()) {
        setDumpText(recorded);
      }
    } else {
      setDumpText("");
      setTranscript("");
      await startRecording();
    }
  };

  const handleDump = async () => {
    const text = dumpText.trim();
    if (!text || isProcessing) return;

    if (isRecording) {
      await stopRecording();
    }

    setIsStatusErr(false);
    setStatusMsg("Analyzing and organizing your thoughts into your second brain…");

    try {
      const created = await processDump(text, "text");
      setDumpText("");
      setTranscript("");
      const count = created.length;
      setStatusMsg(`Sorted into ${count} thought${count === 1 ? "" : "s"} across your brain hubs.`);
    } catch (err: any) {
      setIsStatusErr(true);
      setStatusMsg(err.message || "Failed to reach AI. Please try again.");
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleDump();
    }
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : askInput).trim();
    if (!q || isAsking) return;

    setIsAsking(true);
    setAskAnswer("Consulting your knowledge base…");

    try {
      const token = await getToken();
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await res.json();
      setAskAnswer(data.answer || "No matching thoughts found.");
    } catch {
      setAskAnswer("Could not reach AI. Please try asking again.");
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--pen)]" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-body pb-28">
      {/* Top Application Bar */}
      <header className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("checkin")}
            className="font-display font-extrabold text-2xl tracking-tight text-[var(--ink)] flex items-center gap-1.5"
          >
            <span>Thought</span>
            <span className="mark">Dump</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-[var(--muted)] tabular-nums mr-2">
            <span><b>{ideas.length}</b> thoughts</span>
            <span><b>{catNames.length}</b> hubs</span>
            <span><b>{totalConnections}</b> links</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)] text-[var(--ink)] transition-colors shadow-sm"
            title="Settings & Obsidian Export"
          >
            <Settings className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>
      </header>

      {/* Main Content Area Driven by Active Tab */}
      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-2">
        {/* =========================================================================
            TAB 1: HOW ARE YOU FEELING / SPEECH CAPTURE (Main Check-in Page)
            ========================================================================= */}
        {activeTab === "checkin" && (
          <section className="flex flex-col items-center max-w-2xl mx-auto space-y-6 pt-2 animate-in fade-in duration-200">
            {/* Weekday check-in streak circles (matching Image 3) */}
            <div className="flex items-center justify-center gap-3 py-1">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === currentDayOfWeek;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[var(--muted)]">
                      {day}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                        isToday
                          ? "bg-[var(--pen)] text-white font-bold ring-4 ring-[var(--pen-soft)] shadow-sm"
                          : "bg-white border border-[var(--line)] text-[var(--muted)]"
                      }`}
                    >
                      {isToday ? <Plus className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time-of-day greeting (matching Image 3) */}
            <div className="text-center space-y-1.5 max-w-lg">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
                How are you feeling this {timeGreeting}?
              </h1>
              <p className="text-sm sm:text-base text-[var(--muted)]">
                Dump whatever is on your mind. The AI sorts it into your second brain.
              </p>
            </div>

            {/* Large Center Microphone Button (Prominent Voice Dial) */}
            <div className="py-2">
              <button
                type="button"
                onClick={handleToggleVoice}
                disabled={isProcessing}
                className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 transition-all duration-300 flex flex-col items-center justify-center shadow-lg group mx-auto ${
                  isRecording
                    ? "border-[var(--t-reminder)] bg-[var(--t-reminder-bg)] shadow-[var(--t-reminder)]/30 scale-105"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--pen)] hover:scale-102 hover:shadow-xl"
                }`}
                title={isRecording ? "Stop recording voice dump" : "Press to speak thought"}
              >
                {/* Circular inner element */}
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-[var(--t-reminder)] text-white shadow-md animate-pulse"
                      : "bg-[var(--pen-soft)] text-[var(--pen)] group-hover:bg-[var(--pen)] group-hover:text-white"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10 transition-transform group-hover:scale-110" />
                  )}
                </div>

                <span
                  className={`font-mono text-xs font-bold uppercase tracking-wider mt-2 transition-colors ${
                    isRecording ? "text-[var(--t-reminder)]" : "text-[var(--muted)] group-hover:text-[var(--pen)]"
                  }`}
                >
                  {isRecording ? "Listening..." : "Tap to speak"}
                </span>
              </button>
            </div>

            {/* Text box under microphone for typing or viewing transcription */}
            <div className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow)] p-5 flex flex-col gap-3">
              <label htmlFor="dump-text" className="font-display font-semibold text-lg text-[var(--ink)]">
                Or type what&apos;s on your mind:
              </label>

              <textarea
                ref={textareaRef}
                id="dump-text"
                rows={4}
                value={dumpText}
                onChange={(e) => setDumpText(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Ideas, to-dos, random thoughts, all mixed together. Don't organize it, that's our job."
                className="w-full min-h-[120px] resize-y border-none bg-transparent text-base sm:text-lg text-[var(--ink)] placeholder:text-[var(--muted)] outline-none lined-textarea px-1"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                <span className="font-mono text-xs text-[var(--muted)]">
                  Press <b>⌘/Ctrl + Enter</b> to dump
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDumpText(SAMPLE_RAMBLE);
                      textareaRef.current?.focus();
                      setIsStatusErr(false);
                      setStatusMsg("Example loaded. Press Dump it to sort it.");
                    }}
                    disabled={isProcessing}
                    className="border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)] rounded-full px-4 py-2 font-bold text-xs sm:text-sm text-[var(--ink)] transition-colors shadow-sm"
                  >
                    Try a messy example
                  </button>

                  <button
                    type="button"
                    onClick={handleDump}
                    disabled={isProcessing || !dumpText.trim()}
                    className="border border-[var(--pen)] bg-[var(--pen)] text-white hover:brightness-105 disabled:opacity-40 rounded-full px-6 py-2 font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    {isProcessing ? "Sorting…" : "Dump it"}
                  </button>
                </div>
              </div>

              {statusMsg && (
                <div
                  className={`font-mono text-xs sm:text-sm pt-1 ${
                    isStatusErr ? "text-[var(--t-reminder)] font-bold" : "text-[var(--pen)]"
                  }`}
                >
                  {statusMsg}
                </div>
              )}
            </div>

            {/* Streak & Dump Count Badge (matching Image 3) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--line)] shadow-sm font-mono text-xs text-[var(--muted)]">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-[var(--ink)]">{ideas.length} THOUGHTS DUMPED</span>
              <span>&bull;</span>
              <span>{catNames.length} HUBS SORTED</span>
            </div>

            {/* Recent Thoughts peek */}
            {ideas.length > 0 && (
              <div className="w-full pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--ink)]">
                    Recent Thoughts
                  </h3>
                  <button
                    onClick={() => setActiveTab("tools")}
                    className="text-xs font-mono font-bold text-[var(--pen)] hover:underline flex items-center gap-1"
                  >
                    <span>View all hubs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ideas.slice(0, 4).map((idea) => {
                    const type: ThoughtType = idea.type || "note";
                    return (
                      <article
                        key={idea.id}
                        onClick={() => {
                          setSelectedIdea(idea);
                          setIsDetailOpen(true);
                        }}
                        className="bg-white border border-[var(--line)] rounded-xl p-3.5 flex flex-col justify-between gap-2 cursor-pointer hover:border-[var(--muted)] shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`pill p-${type}`}>{type}</span>
                          <span className="font-mono text-[11px] text-[var(--muted)]">
                            {ago(idea.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[var(--ink)] line-clamp-1">
                          {idea.title}
                        </h4>
                        <p className="text-xs text-[var(--muted)] line-clamp-2">
                          {idea.summary}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            TAB 2: CHECK-IN BREAKDOWN (The Obsidian Second Brain Force Graph)
            ========================================================================= */}
        {activeTab === "breakdown" && (
          <section className="space-y-5 animate-in fade-in duration-200">
            {/* Top Period Selector (matching Image 2) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center p-1 rounded-full bg-white border border-[var(--line)] shadow-sm font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setBreakdownPeriod("W")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    breakdownPeriod === "W"
                      ? "bg-[var(--ink)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  W
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownPeriod("M")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    breakdownPeriod === "M"
                      ? "bg-[var(--ink)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownPeriod("ALL")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    breakdownPeriod === "ALL"
                      ? "bg-[var(--ink)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  &infin;
                </button>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-white border border-[var(--line)] shadow-sm font-mono text-xs text-[var(--muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--pen)]" />
                <span>All time knowledge network ({ideas.length} thoughts)</span>
              </div>
            </div>

            {/* Hero Card: Check-in breakdown */}
            <div className="bg-white border border-[var(--line)] rounded-[26px] p-5 sm:p-6 shadow-[var(--shadow)] space-y-4">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
                  Check-in breakdown
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-mono">
                  Obsidian-style 2D second brain graph. Touch any node to inspect connections and backlinks.
                </p>
              </div>

              {/* 2D Interactive Force Graph Container */}
              <div className="w-full">
                <GraphView
                  onSelectIdea={(idea) => {
                    setSelectedIdea(idea);
                    setIsDetailOpen(true);
                  }}
                />
              </div>

              {/* Category Breakdown Circles & Percentages (matching Image 2) */}
              <div className="pt-4 border-t border-[var(--line)] space-y-3">
                <h3 className="font-display font-bold text-base text-[var(--ink)]">
                  Category Distribution
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categoryBreakdown.map((cat) => (
                    <div
                      key={cat.name}
                      onClick={() => {
                        setCategoryFilter(cat.name);
                        setActiveTab("tools");
                      }}
                      className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--pen)] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-display font-extrabold text-lg text-[var(--ink)]">
                          {cat.pct}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-xs text-[var(--ink)] truncate">
                          {cat.name}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--muted)]">
                          {cat.count} {cat.count === 1 ? "thought" : "thoughts"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 3: TOOLS (Categories & AI Look up Search Bar)
            ========================================================================= */}
        {activeTab === "tools" && (
          <section className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
                Tools
              </h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                Explore your categories as tools and use AI semantic lookup.
              </p>
            </div>

            {/* AI Lookup Search Bar at Top (User Requirement: "At the top, place an AI look up search bar") */}
            <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--shadow)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--pen)] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[var(--pen)]" />
                <span>AI Look Up &amp; Ask Your Brain</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    placeholder="Search thoughts, ask questions, or synthesize connections..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--line)] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--pen)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAsking || !askInput.trim()}
                  className="border border-[var(--pen)] bg-[var(--pen)] text-white hover:brightness-105 disabled:opacity-40 rounded-full px-5 py-2 font-bold text-xs sm:text-sm transition-all"
                >
                  {isAsking ? "Searching…" : "Ask"}
                </button>
              </form>

              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {catNames[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const q = `Summarize my ${catNames[0].toLowerCase()}`;
                      setAskInput(q);
                      handleAsk(q);
                    }}
                    className="text-xs border border-[var(--line)] bg-[var(--paper)] rounded-full px-3 py-1 text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--muted)] transition-colors"
                  >
                    Summarize my {catNames[0].toLowerCase()}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const q = "What should I do first this week?";
                    setAskInput(q);
                    handleAsk(q);
                  }}
                  className="text-xs border border-[var(--line)] bg-[var(--paper)] rounded-full px-3 py-1 text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--muted)] transition-colors"
                >
                  What should I do first this week?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "Which ideas connect to each other?";
                    setAskInput(q);
                    handleAsk(q);
                  }}
                  className="text-xs border border-[var(--line)] bg-[var(--paper)] rounded-full px-3 py-1 text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--muted)] transition-colors"
                >
                  Which ideas connect to each other?
                </button>
              </div>

              {/* AI Answer Bubble */}
              {askAnswer && (
                <div className="text-sm bg-[var(--pen-soft)] border border-[var(--pen)]/20 rounded-2xl p-4 text-[var(--ink)] leading-relaxed whitespace-pre-wrap animate-in fade-in">
                  <span className="font-mono text-xs font-bold text-[var(--pen)] block mb-1">
                    AI Knowledge Synthesis:
                  </span>
                  {askAnswer}
                </div>
              )}
            </div>

            {/* Quick Action Top Carousel (matching Image 1 horizontal bar) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setCategoryFilter("All")}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl font-mono text-xs font-semibold border transition-all ${
                  categoryFilter === "All"
                    ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm"
                    : "bg-white border-[var(--line)] text-[var(--ink)] hover:border-[var(--muted)]"
                }`}
              >
                All Hubs ({ideas.length})
              </button>

              {catNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategoryFilter(name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl font-mono text-xs font-semibold border transition-all ${
                    categoryFilter === name
                      ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm"
                      : "bg-white border-[var(--line)] text-[var(--ink)] hover:border-[var(--muted)]"
                  }`}
                >
                  {name} ({cats[name]?.length || 0})
                </button>
              ))}
            </div>

            {/* Large Category Tiles Grid (matching Image 1 `media_1792950342771_4d3f3d87.jpg`) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {catNames.map((name, idx) => {
                const list = cats[name] || [];
                const palette = TILE_PALETTES[idx % TILE_PALETTES.length];
                const connectionsInCat = list.reduce(
                  (sum, i) => sum + (i.links || []).length,
                  0
                );

                return (
                  <Link
                    key={name}
                    href={`/category/${encodeURIComponent(name)}`}
                    style={{ backgroundColor: palette.bg }}
                    className="group rounded-[28px] p-6 min-h-[170px] shadow-sm flex flex-col justify-between text-white hover:scale-[1.02] transition-transform duration-200 cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      <h3 className="font-display font-extrabold text-2xl tracking-tight leading-snug group-hover:underline">
                        {name}
                      </h3>
                      {list[0] && (
                        <p className="text-xs text-white/80 mt-1 line-clamp-1 font-body">
                          &ldquo;{list[0].title}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs font-mono text-white/90">
                      <span>{list.length} {list.length === 1 ? "thought" : "thoughts"}</span>
                      <span>{connectionsInCat} links &rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* To-dos It Found Section */}
            {todos.length > 0 && (
              <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--shadow)] space-y-3">
                <h3 className="font-display font-bold text-lg text-[var(--ink)] flex items-center justify-between">
                  <span>To-dos Extracted by AI</span>
                  <span className="font-mono text-xs text-[var(--muted)] font-normal">
                    {todos.filter((t) => t.done).length}/{todos.length} done
                  </span>
                </h3>

                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => toggleTodoDone(todo.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        todo.done
                          ? "bg-[var(--paper)]/50 border-[var(--line)]/60 text-[var(--muted)]"
                          : "bg-white border-[var(--line)] hover:border-[var(--muted)] text-[var(--ink)]"
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-[var(--pen)] flex-shrink-0"
                      >
                        {todo.done ? (
                          <CheckSquare className="w-4 h-4 text-[var(--t-task)]" />
                        ) : (
                          <Square className="w-4 h-4 text-[var(--muted)]" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${todo.done ? "line-through text-[var(--muted)]" : ""}`}>
                          {todo.title}
                        </p>
                        {todo.summary && (
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {todo.summary}
                          </p>
                        )}
                      </div>
                      <span className="pill p-task text-[10px] uppercase">
                        {todo.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* =========================================================================
          FIXED BOTTOM NAVIGATION BAR (Matching the screenshots: +, Calendar, Tools)
          ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--line)] shadow-lg py-2">
        <div className="max-w-[480px] mx-auto px-6 flex items-center justify-around">
          {/* Tab 1: Check-in / Microphone Dump */}
          <button
            type="button"
            onClick={() => setActiveTab("checkin")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "checkin" ? "text-[var(--pen)] font-bold" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            title="How are you feeling / Voice Check-in"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === "checkin"
                  ? "bg-[var(--pen)] text-white shadow-md scale-105"
                  : "bg-[var(--paper)] hover:bg-[var(--line)] text-[var(--ink)]"
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-mono">Check in</span>
          </button>

          {/* Tab 2: Second Brain Breakdown Graph */}
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "breakdown" ? "text-[var(--pen)] font-bold" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            title="Obsidian Second Brain Breakdown"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === "breakdown"
                  ? "bg-[var(--pen)] text-white shadow-md scale-105"
                  : "bg-[var(--paper)] hover:bg-[var(--line)] text-[var(--ink)]"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono">Breakdown</span>
          </button>

          {/* Tab 3: Tools / Categories */}
          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "tools" ? "text-[var(--pen)] font-bold" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            title="Tools / Category Hubs & AI Search"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === "tools"
                  ? "bg-[var(--pen)] text-white shadow-md scale-105"
                  : "bg-[var(--paper)] hover:bg-[var(--line)] text-[var(--ink)]"
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono">Tools</span>
          </button>
        </div>
      </nav>

      {/* Note Detail Modal */}
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

      {/* Settings Modal (Obsidian Vault export, user logout, clear data) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
