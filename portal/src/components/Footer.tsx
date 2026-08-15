interface FooterProps {
  repo: string;
}

export default function Footer({ repo }: FooterProps) {
  const links = [
    { label: "GitHub", href: repo },
    { label: "README", href: `${repo}/blob/main/README.md` },
    { label: "审计档案", href: `${repo}/blob/main/SOURCE_AUDITS.md` },
    { label: "第三方声明", href: `${repo}/blob/main/THIRD_PARTY_NOTICES.md` },
  ];
  return (
    <footer className="border-t border-line px-6 py-9">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold">🧭 Rulink · 个人使用的 Surge App Rule-Set 分发仓库</p>
        <nav className="flex flex-wrap justify-center gap-4 text-[13.5px]" aria-label="页脚链接">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mute transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs text-mute">本页数据随每日构建自动刷新 · 使用前请结合自己的 Surge 日志自行验证</p>
      </div>
    </footer>
  );
}
