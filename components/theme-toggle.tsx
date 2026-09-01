"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("mindbill-docs-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("mindbill-docs-theme") as Theme | null;
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(resolved);
    const frame = window.requestAnimationFrame(() => setTheme(resolved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      className="icon-button"
      type="button"
      aria-label={`Use ${next} theme`}
      title={`Use ${next} theme`}
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
