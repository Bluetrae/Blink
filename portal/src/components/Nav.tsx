import { useEffect, useState } from "react";
import { useTheme, type Theme } from "../hooks";

interface NavProps {
  repo: string;
}

const THEME_META: Record<Theme, { icon: string; label: string }> = {
  system: { icon: "🌗", label: "主题：跟随系统" },
  light: { icon: "☀️", label: "主题：浅色" },
  dark: { icon: "🌙", label: "主题：深色" },
};

export default function Nav({ repo }: NavProps) {
  const { theme, cycle } = useTheme();
  const meta = THEME_META[theme];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 pt-3">
      <div
        className={`mx-auto flex h-14 max-w-5xl items-center gap-4 rounded-full px-5 transition-all duration-300 ease-out ${
          scrolled ? "nav-scrolled" : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-ink">
          <img
            src="https://github.com/Bluetrae.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded-full border border-line"
          />
          Rulink
        </a>
        <nav className="ml-auto hidden gap-5 sm:flex" aria-label="主导航">
          <a href="#rulesets" className="text-sm text-mute transition hover:text-ink">规则集</a>
          <a href="#usage" className="text-sm text-mute transition hover:text-ink">使用</a>
          <a href="#about" className="text-sm text-mute transition hover:text-ink">构建与来源</a>
        </nav>
        <button
          type="button"
          onClick={cycle}
          title={meta.label}
          aria-label={meta.label}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-[15px] leading-none transition hover:bg-paper"
        >
          {meta.icon}
        </button>
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-card px-3.5 py-2 text-[13.5px] text-ink transition hover:bg-paper"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
