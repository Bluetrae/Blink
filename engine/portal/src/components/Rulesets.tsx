import { useMemo, useState } from "react";
import type { AppEntry, ClientKey, PortalData } from "../types";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CLIENT_TABS,
  clientFileUrl,
  clientIcon,
  clientSnippet,
  sortedApps,
  sourceLine,
  typeChips,
} from "../data";
import { useCopy } from "../hooks";
import Reveal from "./Reveal";

function AppCard({
  app,
  client,
  rawBase,
  index,
}: {
  app: AppEntry;
  client: ClientKey;
  rawBase: string;
  index: number;
}) {
  const snippet = clientSnippet(rawBase, app, client);
  const { copied, copy } = useCopy(snippet);
  const stat = app.clients[client];
  const dropped = client === "egern" || client === "quantumultx" ? (stat.dropped ?? 0) : 0;
  return (
    <Reveal className="h-full" delay={Math.min(index, 6) * 40}>
      <article
        title={app.note || app.name}
        className="flex h-full flex-col gap-2.5 rounded-2xl border border-line bg-card p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper">
            {app.icon ? (
              <img
                src={app.icon}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base">{app.emoji}</span>
            )}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold tracking-tight">{app.name}</div>
            <div className="truncate text-[11px] text-mute">
              {CATEGORY_LABELS[app.category] ?? app.category}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <strong className="text-xl font-bold tracking-tight text-accent">{stat.rules}</strong>
          <span className="text-[11px] text-mute">条规则</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {typeChips(app, client).map((chip) => (
            <span
              key={chip.label}
              className="rounded-full border border-line bg-paper px-1.5 py-0.5 text-[11px] text-mute"
            >
              {chip.label} <b className="font-semibold text-ink">{chip.count}</b>
            </span>
          ))}
        </div>
        {app.self_use && (
          <p className="rounded-lg border border-accent-soft bg-accent-soft px-1.5 py-1 text-[10px] leading-relaxed text-accent">
            ⚠️ 作者自用直播源 · 请按自身直播源自行配置
          </p>
        )}
        {dropped > 0 && (
          <p className="rounded-lg border border-line bg-paper px-1.5 py-1 text-[10px] leading-relaxed text-mute">
            ⚠️ {dropped} 条 PROCESS-NAME 无法在 {client === "egern" ? "Egern" : "Quantumult X"}{" "}
            无损表达，构建器已显式丢弃。
          </p>
        )}
        <p className="truncate text-[11px] text-mute" title={app.source.name || undefined}>
          {sourceLine(app)}
        </p>
        <div className="mt-auto flex gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={copy}
            className="flex-1 rounded-lg bg-accent px-2 py-1.5 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:bg-accent-strong hover:shadow-md hover:shadow-accent/30 active:scale-[0.96]"
          >
            {copied ? "已复制 ✓" : "复制接入"}
          </button>
          <a
            href={clientFileUrl(rawBase, app, client)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 rounded-lg border border-line bg-card px-2 py-1.5 text-center text-[13px] text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-paper active:translate-y-0 active:scale-[0.96]"
          >
            查看{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export default function Rulesets({ data }: { data: PortalData }) {
  const [client, setClient] = useState<ClientKey>("surge");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const apps = useMemo(() => sortedApps(data.apps), [data.apps]);
  const present = useMemo(() => new Set(apps.map((app) => app.category)), [apps]);
  const filters = ["all", ...CATEGORY_ORDER.filter((category) => present.has(category))];
  const visible = filter === "all" ? apps : apps.filter((app) => app.category === filter);
  const activeNote = CLIENT_TABS.find((tab) => tab.key === client)?.note ?? "";
  const shown = expanded ? visible : visible.slice(0, 10);
  const collapsible = visible.length > 10;

  return (
    <section
      id="rulesets"
      className="scroll-mt-24 border-y border-line bg-paper px-6 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mx-auto mb-8 max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">规则集</h2>
            <p className="mt-2.5 text-mute">
              全部由构建器生成，绝不手工维护；范围优先于数量，不为覆盖而吞入无关 CDN。
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-5 py-2 text-[13.5px] font-bold tracking-wide text-accent shadow-sm">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              先选择你要导入的客户端，再复制接入
            </span>
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-2.5">
            {CLIENT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setClient(tab.key)}
                title={tab.badge}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13.5px] font-medium transition-all duration-200 ease-out active:scale-[0.96] ${
                  client === tab.key
                    ? "border-accent bg-accent text-white shadow-sm hover:shadow-md hover:shadow-accent/30"
                    : "border-line bg-card text-mute hover:-translate-y-0.5 hover:border-line-strong hover:text-ink active:translate-y-0"
                }`}
              >
                <img
                  src={clientIcon(tab.key)}
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px] rounded-[5px] object-cover"
                />
                {tab.label}
              </button>
            ))}
          </div>
          <p className="mx-auto mb-7 max-w-2xl text-center text-[13px] text-mute">{activeNote}</p>
        </Reveal>
        <div className="mb-7 flex flex-wrap justify-center gap-2">
          {filters.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-[13.5px] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] ${
                filter === key
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-line bg-card text-mute hover:border-line-strong hover:text-ink"
              }`}
            >
              {key === "all" ? "全部" : CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-3">
          {shown.map((app, index) => (
            <AppCard
              key={app.name}
              app={app}
              client={client}
              rawBase={data.raw_base}
              index={index}
            />
          ))}
        </div>
        {collapsible && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-6 py-2.5 text-sm text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sm active:translate-y-0 active:scale-[0.96]"
            >
              {expanded ? "收起" : `展开全部 ${visible.length} 个 App`}
              <span
                className={`inline-block text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
