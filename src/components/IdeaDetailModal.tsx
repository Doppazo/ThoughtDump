"use client";

import React, { useState, useEffect } from "react";
import { Idea, ThoughtType } from "@/types";
import { useIdeas } from "@/context/IdeasContext";
import { WikilinkRenderer } from "./WikilinkRenderer";
import { LocalGraph } from "./LocalGraph";
import {
  X,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  AlertTriangle,
  FileText,
  Calendar,
  Link as LinkIcon,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface IdeaDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea?: (idea: Idea) => void;
  onJumpTo?: (id: string) => void;
}

export function IdeaDetailModal({ idea, isOpen, onClose, onSelectIdea, onJumpTo }: IdeaDetailModalProps) {
  const { updateIdea, deleteIdea, reprocessIdea, categories, ideas, addLink, removeLink } = useIdeas();

  const [isEditing, setIsEditing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Manual link state
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState("");

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<ThoughtType>("idea");

  useEffect(() => {
    if (idea) {
      setEditTitle(idea.title);
      setEditSummary(idea.summary);
      setEditCategory(idea.category);
      setEditType(idea.type || "note");
      setIsEditing(false);
      setShowOriginal(false);
      setShowDeleteConfirm(false);
      setIsAddingLink(false);
      setManualSearch("");
      setManualReason("");
      setSelectedTargetId("");
    }
  }, [idea]);

  if (!isOpen || !idea) return null;

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editSummary.trim()) return;
    setIsSaving(true);
    try {
      await updateIdea(idea.id, {
        title: editTitle.trim(),
        summary: editSummary.trim(),
        category: editCategory.trim() || "Unsorted",
        type: editType,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Save edit failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteIdea(idea.id);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReprocess = async () => {
    setIsSaving(true);
    try {
      await reprocessIdea(idea.id);
    } catch (err) {
      console.error("Reprocess error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateManualLink = async () => {
    if (!selectedTargetId) return;
    setIsSaving(true);
    try {
      await addLink(idea.id, selectedTargetId, manualReason.trim() || "Connected thought");
      setIsAddingLink(false);
      setManualSearch("");
      setManualReason("");
      setSelectedTargetId("");
    } catch (err) {
      console.error("Manual link error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLink = async (targetId: string) => {
    try {
      await removeLink(idea.id, targetId);
    } catch (err) {
      console.error("Remove link error:", err);
    }
  };

  const type = idea.type || "note";
  const formattedDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Filter candidates for manual linking (exclude self and already linked)
  const existingLinkedIds = new Set((idea.links || []).map((l) => l.ideaId));
  const linkCandidates = ideas.filter(
    (i) => i.id !== idea.id && !existingLinkedIds.has(i.id) &&
      (manualSearch.trim() ? i.title.toLowerCase().includes(manualSearch.toLowerCase()) : true)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[18px] shadow-[var(--shadow)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <span className={`pill p-${type}`}>{type}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]">
              {idea.category}
            </span>

            {idea.status === "unprocessed" && (
              <span className="pill p-question">Unsorted / Raw</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg transition-colors"
                title="Edit Thought"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {!isEditing && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--t-reminder)] hover:bg-[var(--paper)] rounded-lg transition-colors"
                title="Delete Thought"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg transition-colors ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showDeleteConfirm ? (
            <div className="p-5 bg-[var(--t-reminder-bg)] border border-[var(--t-reminder)]/30 rounded-xl flex flex-col items-center text-center space-y-3">
              <AlertTriangle className="w-7 h-7 text-[var(--t-reminder)]" />
              <h4 className="font-bold text-sm text-[var(--ink)]">
                Delete &quot;{idea.title}&quot;?
              </h4>
              <p className="text-xs text-[var(--muted)] max-w-sm">
                This will delete this note and remove all links and backlinks pointing to it.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="btn primary"
                  style={{ background: "var(--t-reminder)", borderColor: "var(--t-reminder)" }}
                >
                  {isSaving ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] focus:outline-none focus:border-[var(--pen)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Summary
                </label>
                <textarea
                  rows={4}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--paper)] focus:outline-none focus:border-[var(--pen)] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    list="modal-categories"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--paper)] focus:outline-none focus:border-[var(--pen)]"
                  />
                  <datalist id="modal-categories">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ThoughtType)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--paper)] focus:outline-none focus:border-[var(--pen)]"
                  >
                    <option value="idea">Idea</option>
                    <option value="task">Task</option>
                    <option value="question">Question</option>
                    <option value="reminder">Reminder</option>
                    <option value="note">Note</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setIsEditing(false)} className="btn">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={isSaving} className="btn primary">
                  <Check className="w-4 h-4 inline mr-1" />
                  <span>{isSaving ? "Saving..." : "Save changes"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title & Date */}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight font-[family-name:var(--f-display)]">
                  {idea.title}
                </h2>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--muted)] font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>
                  <span>Category: <b>{idea.category}</b></span>
                </div>
              </div>

              {/* Summary with [[Wikilink]] parsing */}
              <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                <h4 className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider font-mono mb-2">
                  Summary (Markdown Notes)
                </h4>
                <p className="text-[var(--ink)] text-[15.5px] leading-relaxed">
                  <WikilinkRenderer
                    text={idea.summary}
                    onSelectIdea={(target) => {
                      if (onSelectIdea) onSelectIdea(target);
                    }}
                  />
                </p>
              </div>

              {/* Local Graph visualization */}
              <div>
                <LocalGraph
                  currentIdea={idea}
                  allIdeas={ideas}
                  categories={categories}
                  onSelectIdea={(target) => {
                    if (onSelectIdea) onSelectIdea(target);
                  }}
                />
              </div>

              {/* Linked Ideas Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[var(--pen)]" />
                    <span>Linked Ideas ({idea.links?.length || 0})</span>
                  </h4>
                  {!isAddingLink && (
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(true)}
                      className="text-xs font-bold text-[var(--pen)] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add link manually</span>
                    </button>
                  )}
                </div>

                {/* Add link form */}
                {isAddingLink && (
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)]">Select an idea to connect:</span>
                      <button onClick={() => setIsAddingLink(false)} className="text-[var(--muted)] hover:text-[var(--ink)]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search title..."
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[var(--line)] bg-white focus:outline-none"
                    />

                    <select
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[var(--line)] bg-white focus:outline-none"
                    >
                      <option value="">-- Choose idea --</option>
                      {linkCandidates.slice(0, 25).map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          {cand.title} ({cand.category})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Reason (e.g. 'Shares market research goals')"
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[var(--line)] bg-white focus:outline-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingLink(false)} className="btn" style={{ padding: "4px 10px", fontSize: "12px" }}>
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateManualLink}
                        disabled={!selectedTargetId || isSaving}
                        className="btn primary"
                        style={{ padding: "4px 14px", fontSize: "12px" }}
                      >
                        Connect Link
                      </button>
                    </div>
                  </div>
                )}

                {idea.links && idea.links.length > 0 ? (
                  <div className="space-y-2">
                    {idea.links.map((link) => {
                      const target = ideas.find((i) => i.id === link.ideaId);
                      if (!target) return null;
                      return (
                        <div
                          key={`link-${link.ideaId}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--pen)] transition-all group"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectIdea) onSelectIdea(target);
                            }}
                            className="flex-1 text-left"
                          >
                            <p className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--pen)] transition-colors flex items-center gap-1.5">
                              <span>↔ {target.title}</span>
                              <span className="text-[10px] text-[var(--muted)] font-mono">({target.category})</span>
                            </p>
                            <p className="text-[11px] text-[var(--muted)] mt-0.5">{link.reason}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.ideaId)}
                            className="p-1 text-[var(--muted)] hover:text-[var(--t-reminder)] opacity-60 hover:opacity-100"
                            title="Remove link"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)] italic">No outgoing links from this note.</p>
                )}
              </div>

              {/* Backlinks Section */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider font-mono">
                  Backlinks &mdash; Linked from ({idea.backlinks?.length || 0})
                </h4>
                {idea.backlinks && idea.backlinks.length > 0 ? (
                  <div className="space-y-2">
                    {idea.backlinks.map((backlink) => {
                      const source = ideas.find((i) => i.id === backlink.ideaId);
                      if (!source) return null;
                      return (
                        <button
                          key={`backlink-${backlink.ideaId}`}
                          type="button"
                          onClick={() => {
                            if (onSelectIdea) onSelectIdea(source);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:bg-white hover:border-[var(--pen)] text-left transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--pen)] transition-colors">
                              ← {source.title}
                            </p>
                            <p className="text-[11px] text-[var(--muted)] mt-0.5">{backlink.reason}</p>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--muted)]">{source.category}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)] italic">No other notes point to this note yet.</p>
                )}
              </div>

              {/* Original Transcript Section */}
              <div className="pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-xs font-bold text-[var(--pen)] hover:underline flex items-center gap-1"
                >
                  <span>{showOriginal ? "Hide original transcript" : "View original transcript"}</span>
                </button>

                {showOriginal && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-[var(--line)] text-xs text-[var(--muted)] font-mono leading-relaxed">
                    {idea.originalText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
