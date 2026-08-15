import type { AppEntry } from "./types";

export const CATEGORY_ORDER = [
  "Finance",
  "Communication",
  "Development",
  "Gaming",
  "Social",
  "Media",
  "AI",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  Finance: "金融",
  Communication: "通讯",
  Development: "开发",
  Gaming: "游戏",
  Social: "社交",
  Media: "媒体",
  AI: "AI",
};

interface TypeGroup {
  label: string;
  kinds: string[];
}

export const TYPE_GROUPS: TypeGroup[] = [
  { label: "域名", kinds: ["DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD"] },
  { label: "IP", kinds: ["IP-CIDR", "IP-CIDR6"] },
  { label: "User-Agent", kinds: ["USER-AGENT"] },
  { label: "进程", kinds: ["PROCESS-NAME"] },
];

const FORMAT_LABELS: Record<string, string> = {
  "surge-rule-set": "Surge 原生",
  "v2fly-domain-list": "v2fly 转换",
};

export function categoryIndex(app: AppEntry): number {
  const index = CATEGORY_ORDER.indexOf(app.category as (typeof CATEGORY_ORDER)[number]);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

export function sortedApps(apps: AppEntry[]): AppEntry[] {
  return [...apps].sort(
    (a, b) => categoryIndex(a) - categoryIndex(b) || a.name.localeCompare(b.name),
  );
}

export function typeChips(app: AppEntry): { label: string; count: number }[] {
  return TYPE_GROUPS.map((group) => ({
    label: group.label,
    count: group.kinds.reduce((sum, kind) => sum + (app.types[kind] ?? 0), 0),
  })).filter((chip) => chip.count > 0);
}

export function sourceLine(app: AppEntry): string {
  const { author, format } = app.source;
  const label = FORMAT_LABELS[format] ?? (author ? "" : "本地补充");
  if (author && label) return `来源 ${author} · ${label}`;
  if (author) return `来源 ${author}`;
  return "来源 本地补充 · supplement-only";
}

export function ruleSetLine(rawBase: string, app: AppEntry): string {
  return `RULE-SET,${rawBase}/${app.file},${app.policy}`;
}
