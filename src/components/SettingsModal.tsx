"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Download,
  LogOut,
  FileCode,
  FileText,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, signOut, getToken } = useAuth();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: "markdown" | "json") => {
    setIsExporting(format);
    try {
      const token = await getToken();
      const res = await fetch(`/api/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thought-dump-${Date.now()}.${format === "json" ? "json" : "md"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportVault = async () => {
    setIsExporting("vault");
    try {
      const token = await getToken();
      const res = await fetch(`/api/export/vault`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Vault export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Thinkbox-Vault-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Vault export error:", err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow)] overflow-hidden flex flex-col max-h-[90vh] text-[var(--ink)] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--line)]">
          <h3 className="font-display font-bold text-xl text-[var(--ink)]">
            Settings & Preferences
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--paper)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Account */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--pen-soft)] text-[var(--pen)] flex items-center justify-center font-bold font-mono">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--ink)]">
                  {user?.displayName || "Student User"}
                </p>
                <p className="text-xs text-[var(--muted)] font-mono">{user?.email || "Signed in"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--t-reminder)] hover:bg-[var(--t-reminder-bg)] px-3 py-1.5 rounded-full transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Theme display */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Appearance
            </h4>
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">Notebook Paper Desk</p>
                <p className="text-xs text-[var(--muted)]">High-legibility light dot grid canvas</p>
              </div>
              <span className="pill p-task flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </span>
            </div>
          </div>

          {/* Data Export */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Export Brain Data
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Download all your thoughts, categories, and connections anytime.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport("markdown")}
                disabled={isExporting !== null}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--line)] hover:border-[var(--pen)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] transition-colors group"
              >
                <FileText className="w-4 h-4 text-[var(--pen)]" />
                <span>{isExporting === "markdown" ? "Exporting..." : "Markdown (.md)"}</span>
              </button>

              <button
                onClick={() => handleExport("json")}
                disabled={isExporting !== null}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--line)] hover:border-[var(--pen)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] transition-colors group"
              >
                <FileCode className="w-4 h-4 text-[var(--t-task)]" />
                <span>{isExporting === "json" ? "Exporting..." : "JSON (.json)"}</span>
              </button>
            </div>

            {/* Obsidian Vault (.zip) */}
            <button
              onClick={handleExportVault}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--pen)]/30 hover:border-[var(--pen)] bg-[var(--pen-soft)] text-xs font-bold text-[var(--ink)] transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--pen)] text-white flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-extrabold text-[var(--ink)]">Obsidian Vault (.zip)</p>
                  <p className="text-[11px] text-[var(--muted)] font-normal">
                    Folder with category hubs, [[wikilinks]], and graph structure
                  </p>
                </div>
              </div>
              <span className="pill p-idea text-[10px]">
                {isExporting === "vault" ? "Packing..." : "Export"}
              </span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-[var(--pen-soft)] border border-[var(--pen)]/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--pen)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              Your thoughts are kept strictly private and used only to answer your questions and organize your second brain.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--paper)] flex justify-end">
          <button
            onClick={onClose}
            className="btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
