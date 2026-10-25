"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useIdeas } from "@/context/IdeasContext";
import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { Mic, MicOff, Send, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { ThoughtType } from "@/types";

export default function QuickCapturePage() {
  const { user, loading, signInDemoUser } = useAuth();
  const { ideas, processDump, isProcessing } = useIdeas();

  const [text, setText] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isRecording,
    transcript,
    isTranscribing,
    startRecording,
    stopRecording,
    setTranscript,
  } = useVoiceCapture();

  // Sync transcript updates into text
  useEffect(() => {
    if (isRecording && transcript) {
      setText(transcript);
    }
  }, [isRecording, transcript]);

  // Keyboard shortcut listener: Esc clears input; Ctrl/Cmd + Shift + Space toggles voice
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setText("");
        setTranscript("");
      }

      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.shiftKey && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
        if (isRecording) {
          const recorded = await stopRecording();
          if (recorded.trim()) {
            await handleSaveDump(recorded, "voice");
          }
        } else {
          setText("");
          await startRecording();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, stopRecording, startRecording, setTranscript]);

  const handleToggleVoice = async () => {
    if (isRecording) {
      const recorded = await stopRecording();
      if (recorded.trim()) {
        await handleSaveDump(recorded, "voice");
      }
    } else {
      setText("");
      await startRecording();
    }
  };

  const handleSaveDump = async (content?: string, inputType: "voice" | "text" = "text") => {
    const raw = (content !== undefined ? content : text).trim();
    if (!raw || isProcessing) return;

    setStatusText("Sorting with AI…");
    try {
      setText("");
      setTranscript("");
      const created = await processDump(raw, inputType);
      const cat = created[0]?.category || "your second brain";
      setStatusText(`Saved to ${cat}`);
      setTimeout(() => {
        setStatusText(null);
      }, 4000);
    } catch (err) {
      console.error("Save error:", err);
      setStatusText("Failed to sort thought");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveDump(text, "text");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--pen)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--paper)] text-center space-y-4 font-body">
        <div className="w-12 h-12 rounded-2xl bg-[var(--pen)] text-white flex items-center justify-center font-display font-extrabold text-xl shadow-[var(--shadow)]">
          T
        </div>
        <h2 className="text-xl font-display font-bold text-[var(--ink)]">
          Sign in for Quick Capture
        </h2>
        <button
          onClick={signInDemoUser}
          className="border border-[var(--pen)] bg-[var(--pen)] text-white rounded-full px-5 py-2 font-bold text-sm"
        >
          Continue with Demo Account
        </button>
      </div>
    );
  }

  const busy = isProcessing || isTranscribing;
  const recentIdeas = ideas.slice(0, 5);

  return (
    <div className="min-h-screen max-w-[460px] mx-auto bg-[var(--paper)] text-[var(--ink)] flex flex-col p-4 sm:p-5 font-body select-none">
      {/* 1. Header */}
      <header className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--pen)] text-white flex items-center justify-center font-display font-extrabold text-sm">
            T
          </div>
          <span className="font-display font-extrabold text-lg text-[var(--ink)] tracking-tight">
            Thought <span className="mark">Quick</span>
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 font-mono text-xs font-semibold text-[var(--pen)] hover:underline"
        >
          <span>Open brain</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main capture section */}
      <div className="py-4 space-y-3">
        {/* 2. Mic Button */}
        <div className="flex justify-center py-1">
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={busy}
            className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200 shadow-sm ${
              isRecording
                ? "bg-[var(--t-reminder)] text-white scale-105 shadow-[var(--t-reminder)]/30 animate-pulse"
                : "border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)] text-[var(--ink)] active:scale-95"
            }`}
            title={isRecording ? "Stop & save" : "Start voice capture"}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7 text-[var(--pen)]" />}
          </button>
        </div>

        {/* 3. Notebook Lined Input */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3.5 shadow-[var(--shadow)] flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            rows={4}
            autoFocus
            disabled={busy}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={
              isRecording
                ? "Listening to voice..."
                : "Type an idea or dump your mind... (Enter saves, Shift+Enter for newline)"
            }
            className="w-full resize-none bg-transparent text-[15.5px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none lined-textarea leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <span className="font-mono text-[11px] text-[var(--muted)]">
              <kbd className="font-mono bg-[var(--paper)] border border-[var(--line)] px-1 rounded">
                Esc
              </kbd>{" "}
              clear
            </span>

            <button
              onClick={() => handleSaveDump(text, "text")}
              disabled={!text.trim() || busy}
              className="border border-[var(--pen)] bg-[var(--pen)] disabled:opacity-40 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Dump</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Status Line */}
        <div className="h-5 flex items-center justify-center text-center font-mono">
          {statusText ? (
            <span className="text-xs text-[var(--pen)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {statusText}
            </span>
          ) : isRecording ? (
            <span className="text-xs text-[var(--t-reminder)] animate-pulse">
              Listening to your thoughts…
            </span>
          ) : (
            <span className="text-[11px] text-[var(--muted)]">
              Press <kbd className="font-mono">Enter</kbd> to dump
            </span>
          )}
        </div>
      </div>

      {/* 5. List of Most Recent Thoughts */}
      <div className="flex-1 pt-3 border-t border-[var(--line)]">
        <h4 className="font-mono text-[11.5px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">
          Recent Thoughts
        </h4>

        {recentIdeas.length === 0 ? (
          <p className="text-xs text-[var(--muted)] py-4 text-center">
            No saved thoughts yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentIdeas.map((idea) => {
              const type: ThoughtType = idea.type || "note";
              return (
                <Link
                  key={idea.id}
                  href="/"
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--pen)] transition-colors group text-left"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[13.5px] font-bold text-[var(--ink)] truncate group-hover:text-[var(--pen)]">
                      {idea.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {idea.summary}
                    </p>
                  </div>
                  <span className={`pill p-${type} flex-shrink-0 text-[10px]`}>
                    {idea.category}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
