"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Apply theme to document element
  const applyTheme = useCallback((resolved: "light" | "dark") => {
    setResolvedTheme(resolved);
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  }, []);

  // Compute resolved theme from current setting
  const resolveTheme = useCallback((selectedTheme: Theme): "light" | "dark" => {
    if (selectedTheme === "system") {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    }
    return selectedTheme;
  }, []);

  // Initialize theme from localStorage or system on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("thoughtdump_theme") as Theme | null;
      const initialTheme: Theme = stored && ["light", "dark", "system"].includes(stored) ? stored : "light";
      setThemeState(initialTheme);
      applyTheme(resolveTheme(initialTheme));
    } catch {
      applyTheme("light");
    }
  }, [applyTheme, resolveTheme]);

  // Listen to system theme changes if theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("thoughtdump_theme", newTheme);
    } catch {
      // ignore
    }
    applyTheme(resolveTheme(newTheme));
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
