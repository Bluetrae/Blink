interface NavProps {
  repo: string;
}

export default function Nav({ repo }: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-15 max-w-5xl items-center gap-7 px-6">
        <a href="#top" className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-ink">
          <span className="text-lg">🧭</span> Rulink
        </a>
        <nav className="ml-auto hidden gap-5 sm:flex" aria-label="主导航">
          <a href="#rulesets" className="text-sm text-mute transition hover:text-ink">规则集</a>
          <a href="#usage" className="text-sm text-mute transition hover:text-ink">使用</a>
          <a href="#about" className="text-sm text-mute transition hover:text-ink">构建与来源</a>
        </nav>
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-line bg-white px-3.5 py-2 text-[13.5px] text-ink transition hover:bg-paper"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
