"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>("light");
  const resolvedTheme: "light" = "light";

  useEffect(() => {
    // Force light mode on root element
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.setAttribute("data-theme", "light");
    try {
      localStorage.setItem("thinkbox_theme", "light");
    } catch {
      // ignore
    }
  }, []);

  const setTheme = () => {
    // Light mode only
  };

  const toggleTheme = () => {
    // Light mode only
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
