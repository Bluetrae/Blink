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

/* Time-based theme: 08:00–22:00 light, 22:00–08:00 dark. Re-checks every
   minute and when the tab becomes visible again, so the page flips
   automatically across the boundary even while it stays open. */
function themeForHour(hour: number): "light" | "dark" {
  return hour >= 8 && hour < 22 ? "light" : "dark";
}

export function useTimedTheme(): void {
  useEffect(() => {
    const apply = () => {
      const next = themeForHour(new Date().getHours());
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    apply();
    try {
      localStorage.removeItem("rulink-theme");
    } catch {
      /* ignore */
    }
    const interval = window.setInterval(apply, 60_000);
    document.addEventListener("visibilitychange", apply);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);
}
