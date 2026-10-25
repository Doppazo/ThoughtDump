"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Idea, Category, RawDump, InputType } from "@/types";
import { useAuth } from "./AuthContext";

interface ToastInfo {
  id: string;
  message: string;
  category: string;
  ideaId?: string;
}

interface IdeasContextType {
  ideas: Idea[];
  dumps: RawDump[];
  categories: Category[];
  filteredIdeas: Idea[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  isProcessing: boolean;
  toast: ToastInfo | null;
  newIdeaIds: Set<string>;
  hasExamples: boolean;
  setSelectedCategory: (cat: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearToast: () => void;
  refreshIdeas: () => Promise<void>;
  processIdea: (text: string, inputType?: InputType) => Promise<Idea>;
  processDump: (text: string, inputType?: InputType) => Promise<Idea[]>;
  toggleTodoDone: (ideaId: string) => Promise<void>;
  reprocessIdea: (ideaId: string) => Promise<Idea>;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => Promise<Idea>;
  deleteIdea: (ideaId: string) => Promise<boolean>;
  clearExamples: () => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  mergeCategories: (source: string, target: string) => Promise<void>;
  addLink: (sourceIdeaId: string, targetIdeaId: string, reason?: string) => Promise<void>;
  removeLink: (sourceIdeaId: string, targetIdeaId: string) => Promise<void>;
  summarizeCategory: (categoryName: string) => Promise<string>;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const { user, getToken } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [dumps, setDumps] = useState<RawDump[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [newIdeaIds, setNewIdeaIds] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, [user, getToken]);

  const fetchDumps = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/dumps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDumps(data.dumps || []);
      }
    } catch (err) {
      console.error("Failed to fetch dumps:", err);
    }
  }, [user, getToken]);

  const fetchIdeas = useCallback(async () => {
    if (!user) {
      setIdeas([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch("/api/ideas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
      }
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (user) {
      fetchIdeas();
      fetchCategories();
      fetchDumps();
    } else {
      setIdeas([]);
      setDumps([]);
      setCategories([]);
      setIsLoading(false);
    }
  }, [user, fetchIdeas, fetchCategories, fetchDumps]);

  const processDump = async (text: string, inputType: InputType = "text"): Promise<Idea[]> => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/ideas/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, inputType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to process thought dump");
      }

      const data = await res.json();
      const newIdeas: Idea[] = data.ideas && Array.isArray(data.ideas) ? data.ideas : [data.idea];

      const newIds = new Set<string>();
      newIdeas.forEach((i) => newIds.add(i.id));
      setNewIdeaIds(newIds);

      // Prepend ideas
      setIdeas((prev) => {
        const existingMap = new Map(prev.map((i) => [i.id, i]));
        newIdeas.forEach((i) => existingMap.set(i.id, i));
        return Array.from(existingMap.values()).sort((a, b) => b.createdAt - a.createdAt);
      });

      // Refresh dumps and categories
      await fetchCategories();
      await fetchDumps();

      const n = newIdeas.length;
      setToast({
        id: String(Date.now()),
        message: `Split into ${n} thought${n === 1 ? "" : "s"} and sorted below`,
        category: newIdeas[0]?.category || "Unsorted",
        ideaId: newIdeas[0]?.id,
      });

      return newIdeas;
    } finally {
      setIsProcessing(false);
    }
  };

  const processIdea = async (text: string, inputType: InputType = "text"): Promise<Idea> => {
    const res = await processDump(text, inputType);
    return res[0];
  };

  const toggleTodoDone = async (ideaId: string) => {
    const target = ideas.find((i) => i.id === ideaId);
    if (!target) return;
    const newDone = !target.done;

    // Optimistic update
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, done: newDone } : i))
    );

    try {
      const token = await getToken();
      await fetch("/api/ideas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ideaId, done: newDone }),
      });
    } catch (err) {
      console.error("Toggle todo error:", err);
      // rollback
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, done: target.done } : i))
      );
    }
  };

  const reprocessIdea = async (ideaId: string): Promise<Idea> => {
    const token = await getToken();
    const res = await fetch("/api/ideas/reprocess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ideaId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to reprocess idea");
    }

    const data = await res.json();
    const updated = data.idea as Idea;
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    await fetchCategories();
    return updated;
  };

  const updateIdea = async (ideaId: string, updates: Partial<Idea>): Promise<Idea> => {
    const token = await getToken();
    const res = await fetch("/api/ideas", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ideaId, ...updates }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update idea");
    }

    const data = await res.json();
    const updated = data.idea as Idea;
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    await fetchCategories();
    return updated;
  };

  const deleteIdea = async (ideaId: string): Promise<boolean> => {
    // Optimistic delete
    setIdeas((prev) => {
      const filtered = prev.filter((i) => i.id !== ideaId);
      filtered.forEach((i) => {
        i.links = (i.links || []).filter((l) => (l.ideaId || (l as any).id) !== ideaId);
      });
      return filtered;
    });

    try {
      const token = await getToken();
      const res = await fetch(`/api/ideas?id=${encodeURIComponent(ideaId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        await fetchIdeas();
        return false;
      }

      await fetchCategories();
      return true;
    } catch {
      await fetchIdeas();
      return false;
    }
  };

  const clearExamples = async () => {
    try {
      const token = await getToken();
      await fetch("/api/dumps?clearExamples=true", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Clear examples server error:", err);
    }

    // Local filter
    setIdeas((prev) =>
      prev
        .filter((i) => !String(i.id).startsWith("ex") && !i.isExample)
        .map((i) => ({
          ...i,
          links: (i.links || []).filter((l) => !String(l.ideaId || (l as any).id).startsWith("ex")),
        }))
    );
    setDumps((prev) => prev.filter((d) => !d.example));
    await fetchCategories();
  };

  const renameCategoryHandler = async (oldName: string, newName: string) => {
    const token = await getToken();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "rename", oldName, newName }),
    });

    if (!res.ok) {
      throw new Error("Failed to rename category");
    }

    await fetchIdeas();
    await fetchCategories();
    if (selectedCategory === oldName) {
      setSelectedCategory(newName);
    }
  };

  const mergeCategoriesHandler = async (source: string, target: string) => {
    const token = await getToken();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "merge", sourceCategory: source, targetCategory: target }),
    });

    if (!res.ok) {
      throw new Error("Failed to merge categories");
    }

    await fetchIdeas();
    await fetchCategories();
    if (selectedCategory === source) {
      setSelectedCategory(target);
    }
  };

  const addLink = async (sourceIdeaId: string, targetIdeaId: string, reason: string = "Connected thought") => {
    const token = await getToken();
    const res = await fetch("/api/ideas/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sourceIdeaId, targetIdeaId, reason }),
    });

    if (!res.ok) {
      throw new Error("Failed to create link");
    }

    await fetchIdeas();
  };

  const removeLink = async (sourceIdeaId: string, targetIdeaId: string) => {
    const token = await getToken();
    const res = await fetch("/api/ideas/links", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sourceIdeaId, targetIdeaId }),
    });

    if (!res.ok) {
      throw new Error("Failed to remove link");
    }

    await fetchIdeas();
  };

  const summarizeCategory = async (categoryName: string): Promise<string> => {
    const token = await getToken();
    const res = await fetch("/api/categories/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ categoryName }),
    });

    if (!res.ok) {
      throw new Error("Failed to summarize category");
    }

    const data = await res.json();
    return data.summary || "No summary available.";
  };

  const clearToast = () => setToast(null);

  const hasExamples = useMemo(() => {
    return (
      ideas.some((i) => String(i.id).startsWith("ex") || i.isExample) ||
      dumps.some((d) => d.example)
    );
  }, [ideas, dumps]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (selectedCategory && selectedCategory !== "All") {
        if (idea.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const full = `${idea.title} ${idea.summary} ${idea.category} ${(idea.tags || []).join(" ")} ${idea.originalText || ""}`.toLowerCase();
        return full.includes(q);
      }

      return true;
    });
  }, [ideas, selectedCategory, searchQuery]);

  return (
    <IdeasContext.Provider
      value={{
        ideas,
        dumps,
        categories,
        filteredIdeas,
        selectedCategory,
        searchQuery,
        isLoading,
        isProcessing,
        toast,
        newIdeaIds,
        hasExamples,
        setSelectedCategory,
        setSearchQuery,
        clearToast,
        refreshIdeas: fetchIdeas,
        processIdea,
        processDump,
        toggleTodoDone,
        reprocessIdea,
        updateIdea,
        deleteIdea,
        clearExamples,
        renameCategory: renameCategoryHandler,
        mergeCategories: mergeCategoriesHandler,
        addLink,
        removeLink,
        summarizeCategory,
      }}
    >
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error("useIdeas must be used within an IdeasProvider");
  }
  return context;
}
