"use client";

import { Moon, Sun } from "@gravity-ui/icons";
import { useEffect } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
};

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeToggle = (): React.JSX.Element => {
  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);
  }, []);

  const setNextTheme = (nextTheme: Theme): void => {
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <div className="fixed right-4 top-4 z-1000 rounded-full border border-border/80 bg-surface/90 p-1 shadow-sm backdrop-blur">
      <div className="grid grid-cols-2 gap-1">
        <button
          aria-label="Switch to light theme"
          className="rounded-full p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
          type="button"
          onClick={() => setNextTheme("light")}
        >
          <Sun className="size-4" />
        </button>
        <button
          aria-label="Switch to dark theme"
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
