import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--f-display)", "Bricolage Grotesque", "Avenir Next", "system-ui", "sans-serif"],
        body: ["var(--f-body)", "Atkinson Hyperlegible", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--f-mono)", "JetBrains Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        dot: "var(--dot)",
        pen: "var(--pen)",
        "pen-soft": "var(--pen-soft)",
        hl: "var(--hl)",
        "t-idea": "var(--t-idea)",
        "t-idea-bg": "var(--t-idea-bg)",
        "t-task": "var(--t-task)",
        "t-task-bg": "var(--t-task-bg)",
        "t-question": "var(--t-question)",
        "t-question-bg": "var(--t-question-bg)",
        "t-reminder": "var(--t-reminder)",
        "t-reminder-bg": "var(--t-reminder-bg)",
        "t-note": "var(--t-note)",
        "t-note-bg": "var(--t-note-bg)",
      },
      boxShadow: {
        desk: "var(--shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
