"use client";

import { Moon, Sun } from "@gravity-ui/icons";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const getPreferredTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
};

const ThemeToggle = (): React.JSX.Element => {
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return getPreferredTheme();
  });

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const setNextTheme = (nextTheme: Theme): void => {
    setActiveTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <div className="fixed right-4 top-4 z-[1000] rounded-full border border-border/80 bg-surface/90 p-1 shadow-sm backdrop-blur">
      <div className="grid grid-cols-2 gap-1">
        <button
          aria-label="Switch to light theme"
          aria-pressed={activeTheme === "light"}
          className="rounded-full p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
          type="button"
          onClick={() => setNextTheme("light")}
        >
          <Sun className="size-4" />
        </button>
        <button
          aria-label="Switch to dark theme"
          aria-pressed={activeTheme === "dark"}
          className="rounded-full p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
          type="button"
          onClick={() => setNextTheme("dark")}
        >
          <Moon className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
