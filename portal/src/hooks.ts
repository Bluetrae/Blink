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
