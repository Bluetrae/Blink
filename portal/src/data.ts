import type { AppEntry, ClientKey, PortalData } from "./types";

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

export interface ClientTab {
  key: ClientKey;
  label: string;
  badge: string;
  fileLabel: string;
  note: string;
}

export const CLIENT_TABS: ClientTab[] = [
  {
    key: "surge",
    label: "Surge",
    badge: "INI · RULE-SET",
    fileLabel: "Surge 主配置 · [Rule]",
    note: "规则文件不带策略名：RULE-SET 的最后一个字段由主配置决定。",
  },
  {
    key: "shadowrocket",
    label: "Shadowrocket",
    badge: "INI · RULE-SET",
    fileLabel: "Shadowrocket 配置 · [Rule]",
    note: "与 Surge 同语法；规则文件不带策略名，策略在引用处指定。",
  },
  {
    key: "loon",
    label: "Loon",
    badge: "INI · [Remote Rule]",
    fileLabel: "Loon 配置 · [Remote Rule]",
    note: "规则文件不带策略名：policy 与 tag 在引用行指定。",
  },
  {
    key: "stash",
    label: "Stash",
    badge: "YAML · rule-providers",
    fileLabel: "Stash 配置 · rule-providers",
    note: "classical text 规则集直接复用与 Surge 相同的 .list 文件，policy 在 RULE-SET 行指定。",
  },
  {
    key: "egern",
    label: "Egern",
    badge: "YAML · rule_set",
    fileLabel: "Egern 配置 · rules",
    note: "使用本仓库渲染的 Egern YAML 规则集；PROCESS-NAME 无法无损表达，由构建器显式丢弃并计数。",
  },
  {
    key: "quantumultx",
    label: "Quantumult X",
    badge: "INI · [filter_remote]",
    fileLabel: "Quantumult X 配置 · [filter_remote]",
    note: "QX 规则行尾的 policy 为占位符，实际策略由引用行的 force-policy 指定；PROCESS-NAME 无法表达，由构建器显式丢弃并计数。",
  },
];

export function clientIcon(key: ClientKey): string {
  return `/icons/${key}.jpg`;
}

export const CLIENT_KEYS: ClientKey[] = CLIENT_TABS.map((tab) => tab.key);

export function clientTab(key: ClientKey): ClientTab {
  const tab = CLIENT_TABS.find((item) => item.key === key);
  if (!tab) throw new Error(`unknown client ${key}`);
  return tab;
}

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

export function typeChips(app: AppEntry, client: ClientKey): { label: string; count: number }[] {
  if (client === "egern") {
    const dropped = app.clients.egern.dropped ?? 0;
    return TYPE_GROUPS.map((group) => ({
      label: group.label,
      count: group.kinds.reduce((sum, kind) => sum + (app.types[kind] ?? 0), 0)
        - (group.label === "进程" ? dropped : 0),
    })).filter((chip) => chip.count > 0);
  }
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

export function clientFileUrl(rawBase: string, app: AppEntry, client: ClientKey): string {
  return `${rawBase}/${app.clients[client].file}`;
}

export function clientSnippet(rawBase: string, app: AppEntry, client: ClientKey): string {
  const url = clientFileUrl(rawBase, app, client);
  switch (client) {
    case "surge":
    case "shadowrocket":
      return `RULE-SET,${url},${app.policy}`;
    case "loon":
      return `${url}, policy=${app.policy}, tag=${app.name}, enabled=true`;
    case "stash":
      return [
        "rule-providers:",
        `  ${app.name}:`,
        "    type: http",
        "    behavior: classical",
        "    format: text",
        `    url: ${url}`,
        "    interval: 86400",
        "rules:",
        `  - RULE-SET,${app.name},${app.policy}`,
      ].join("\n");
    case "egern":
      return ["rules:", "  - rule_set:", `      match: ${url}`, `      policy: ${app.policy}`].join("\n");
    case "quantumultx":
      return `${url}, tag=${app.name}, force-policy=${app.policy}, update-interval=172800, opt-parser=false, enabled=true`;
  }
}

function groupedApps(data: PortalData): Array<{ label: string; apps: AppEntry[] }> {
  const groups: Array<{ label: string; apps: AppEntry[] }> = [];
  for (const category of CATEGORY_ORDER) {
    const apps = sortedApps(data.apps).filter((app) => app.category === category);
    if (apps.length > 0) groups.push({ label: CATEGORY_LABELS[category] ?? category, apps });
  }
  return groups;
}

export function allSnippets(data: PortalData, client: ClientKey): string {
  const out: string[] = [];
  if (client === "stash") {
    out.push("rule-providers:");
    for (const app of sortedApps(data.apps)) {
      out.push(`  ${app.name}:`);
      out.push("    type: http");
      out.push("    behavior: classical");
      out.push("    format: text");
      out.push(`    url: ${clientFileUrl(data.raw_base, app, client)}`);
      out.push("    interval: 86400");
    }
    out.push("rules:");
    for (const app of sortedApps(data.apps)) out.push(`  - RULE-SET,${app.name},${app.policy}`);
    return out.join("\n");
  }
  if (client === "egern") {
    out.push("rules:");
    for (const app of sortedApps(data.apps)) {
      out.push(`  - rule_set:`);
      out.push(`      match: ${clientFileUrl(data.raw_base, app, client)}`);
      out.push(`      policy: ${app.policy}`);
    }
    return out.join("\n");
  }
  if (client === "quantumultx") {
    out.push("[filter_remote]");
    for (const app of sortedApps(data.apps)) out.push(clientSnippet(data.raw_base, app, client));
    return out.join("\n");
  }
  for (const group of groupedApps(data)) {
    out.push(`# ${group.label}`);
    for (const app of group.apps) out.push(clientSnippet(data.raw_base, app, client));
    out.push("");
  }
  return out.join("\n").replace(/\n+$/, "");
}
