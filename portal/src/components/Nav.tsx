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

const NAV_LINKS = [
  { href: "#rulesets", label: "规则集" },
  { href: "#usage", label: "使用" },
  { href: "#about", label: "构建与来源" },
];

export default function Nav({ repo }: NavProps) {
  const { theme, cycle } = useTheme();
  const meta = THEME_META[theme];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          scrolled || menuOpen
            ? "nav-scrolled"
            : "border border-transparent bg-transparent"
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
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-mute transition hover:text-ink">
              {link.label}
            </a>
          ))}
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
          className="hidden rounded-full border border-line bg-card px-3.5 py-2 text-[13.5px] text-ink transition hover:bg-paper sm:inline-flex"
        >
          GitHub
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-[15px] leading-none transition hover:bg-paper sm:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="移动端导航"
          className="hero-enter absolute left-6 right-6 top-[68px] overflow-hidden rounded-3xl border border-line bg-card/95 shadow-lg backdrop-blur-md sm:hidden"
          style={{ animationDuration: "0.25s" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-line px-6 py-3.5 text-sm text-ink transition last:border-b-0 hover:bg-paper"
            >
              {link.label}
            </a>
          ))}
          <a
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="block border-t border-line px-6 py-3.5 text-sm text-mute transition hover:bg-paper"
          >
            GitHub ↗
          </a>
        </nav>
      )}
    </header>
  );
}
