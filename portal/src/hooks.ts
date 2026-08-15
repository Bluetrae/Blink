import { useCallback, useEffect, useRef, useState } from "react";

function fallbackCopy(text: string): void {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  document.body.removeChild(area);
}

export function useCopy(
  text: string,
  copiedMs = 1600,
): { copied: boolean; copy: () => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(() => {
    const done = () => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), copiedMs);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(done)
        .catch(() => {
          fallbackCopy(text);
          done();
        });
    } else {
      fallbackCopy(text);
      done();
    }
  }, [text, copiedMs]);

  return { copied, copy };
}

export type Theme = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "rulink-theme";

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function useTheme(): {
  theme: Theme;
  resolved: "light" | "dark";
  cycle: () => void;
} {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") return saved;
    } catch {
      /* ignore */
    }
    return "system";
  });

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
    };
    apply();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((current) =>
      current === "system" ? "light" : current === "light" ? "dark" : "system",
    );
  }, []);

  return { theme, resolved: resolveTheme(theme), cycle };
}
