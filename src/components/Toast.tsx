"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  category: string;
  onEdit?: () => void;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  onEdit,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[var(--surface)] text-[var(--ink)] px-4 py-3 rounded-xl shadow-[var(--shadow)] border border-[var(--line)] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <CheckCircle2 className="w-5 h-5 text-[var(--t-task)] flex-shrink-0" />
      <span className="text-sm font-medium font-body">{message}</span>
      {onEdit && (
        <button
          onClick={onEdit}
          className="ml-2 text-xs font-semibold text-[var(--pen)] hover:underline uppercase tracking-wide px-2 py-0.5 rounded bg-[var(--pen-soft)] font-mono"
        >
          Edit
        </button>
      )}
      <button
        onClick={onClose}
        className="ml-1 p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded-md transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
