import { useMemo, useState } from "react";
import type { AppEntry, ClientKey, PortalData } from "../types";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CLIENT_TABS,
  clientFileUrl,
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
  const dropped = client === "egern" ? (stat.dropped ?? 0) : 0;
  return (
    <Reveal className="h-full" delay={Math.min(index, 6) * 40}>
      <article
        title={app.note || app.name}
        className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-paper text-xl">
            {app.emoji}
          </span>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">{app.name}</div>
            <div className="text-xs text-mute">{CATEGORY_LABELS[app.category] ?? app.category}</div>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <strong className="text-2xl font-bold tracking-tight text-accent">{stat.rules}</strong>
          <span className="text-xs text-mute">条规则</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {typeChips(app, client).map((chip) => (
            <span
              key={chip.label}
              className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-mute"
            >
              {chip.label} <b className="font-semibold text-ink">{chip.count}</b>
            </span>
          ))}
        </div>
        {dropped > 0 && (
          <p className="rounded-lg border border-line bg-paper px-2 py-1 text-[11px] leading-relaxed text-mute">
            ⚠️ {dropped} 条 PROCESS-NAME 无法在 Egern 无损表达，构建器已显式丢弃。
          </p>
        )}
        <p className="truncate text-xs text-mute" title={app.source.name || undefined}>
          {sourceLine(app)}
        </p>
        <div className="mt-auto flex gap-2 pt-0.5">
          <button
            type="button"
            onClick={copy}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
          >
            {copied ? "已复制 ✓" : "复制接入"}
          </button>
          <a
            href={clientFileUrl(rawBase, app, client)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 rounded-lg border border-line bg-card px-3 py-2 text-center text-sm text-ink transition hover:bg-paper"
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
  const apps = useMemo(() => sortedApps(data.apps), [data.apps]);
  const present = useMemo(() => new Set(apps.map((app) => app.category)), [apps]);
  const filters = ["all", ...CATEGORY_ORDER.filter((category) => present.has(category))];
  const visible = filter === "all" ? apps : apps.filter((app) => app.category === filter);
  const activeNote = CLIENT_TABS.find((tab) => tab.key === client)?.note ?? "";

  return (
    <section id="rulesets" className="scroll-mt-24 border-y border-line bg-paper px-6 py-16 sm:py-20">
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
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {CLIENT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setClient(tab.key)}
                title={tab.badge}
                className={`rounded-full border px-4 py-1.5 text-[13.5px] transition ${
                  client === tab.key
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-card text-mute hover:border-line-strong hover:text-ink"
                }`}
              >
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
              className={`rounded-full border px-4 py-1.5 text-[13.5px] transition ${
                filter === key
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-card text-mute hover:border-line-strong hover:text-ink"
              }`}
            >
              {key === "all" ? "全部" : CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
          {visible.map((app, index) => (
            <AppCard key={app.name} app={app} client={client} rawBase={data.raw_base} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
