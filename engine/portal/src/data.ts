import type { AppEntry, ClientKey, PortalData } from "./types";

export const CATEGORY_ORDER = [
  "Finance",
  "Communication",
  "Development",
  "Gaming",
  "Social",
  "Media",
  "AI",
  "Web",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  Finance: "金融",
  Communication: "通讯",
  Development: "开发",
  Gaming: "游戏",
  Social: "社交",
  Media: "媒体",
  AI: "AI",
  Web: "网页",
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
    note: "规则文件不带策略名：RULE-SET 的最后一个字段由主配置决定。带域名/IP 区分的 App 会用 DOMAIN-SET（域名段）+ RULE-SET,no-resolve（IP 段）两条引用，域名恒在 IP 之前。",
  },
  {
    key: "shadowrocket",
    label: "Shadowrocket",
    badge: "INI · RULE-SET",
    fileLabel: "Shadowrocket 配置 · [Rule]",
    note: "与 Surge 同语法；策略在引用处指定。带域名/IP 区分的 App 同样拆成 DOMAIN-SET（域名段）+ RULE-SET（IP 段）两条引用。",
  },
  {
    key: "loon",
    label: "Loon",
    badge: "INI · [Remote Rule]",
    fileLabel: "Loon 配置 · [Remote Rule]",
    note: "规则文件不带策略名：policy 与 tag 在引用行指定。带域名/IP 区分的 App 会拆成两条 Remote Rule（域名段 + IP 段）。",
  },
  {
    key: "stash",
    label: "Stash",
    badge: "YAML · rule-providers",
    fileLabel: "Stash 配置 · rule-providers",
    note: "classical text 规则集复用与 Surge 相同的语法。带域名/IP 区分的 App 会为域名段用 behavior:domain、IP 段用 behavior:classical 各注册一个 provider。",
  },
  {
    key: "clash",
    label: "Clash",
    badge: "YAML · rule-providers",
    fileLabel: "Clash 配置 · rule-providers",
    note: "Mihomo 内核（Clash Meta for Android / FLClash）通用；规则经 Clash/ 目录分发。带域名/IP 区分的 App 用 behavior:domain（域名段）+ behavior:classical（IP 段）各一个 provider。",
  },
  {
    key: "egern",
    label: "Egern",
    badge: "YAML · rule_set",
    fileLabel: "Egern 配置 · rules",
    note: "使用本仓库渲染的规则集；带域名/IP 区分的 App 会在 rules 里列出多条 rule_set（域名段 + IP 段）。",
  },
  {
    key: "quantumultx",
    label: "Quantumult X",
    badge: "INI · [filter_remote]",
    fileLabel: "Quantumult X 配置 · [filter_remote]",
    note: "filter 行尾的 policy 为占位符，实际策略由引用行的 force-policy 指定；带域名/IP 区分的 App 会在 filter_remote 列出域名段与 IP 段两条引用。",
  },
];

export function clientIcon(key: ClientKey): string {
  // Relative path: the site is deployed under the GitHub Pages subpath
  // (/Blink/), and Vite only rewrites asset URLs in index.html — string
  // literals in JS keep whatever form we write.  Resolving against the
  // document URL works on Pages, a future apex domain, and the dev server.
  return `icons/${key}.jpg`;
}

export const CLIENT_KEYS: ClientKey[] = CLIENT_TABS.map((tab) => tab.key);

export function clientTab(key: ClientKey): ClientTab {
  const tab = CLIENT_TABS.find((item) => item.key === key);
  if (!tab) throw new Error(`unknown client ${key}`);
  return tab;
}

export interface ProfileFile {
  file: string;
  format: string;
  kind: string;
}

export const PROFILE_FILES: Record<ClientKey, ProfileFile> = {
  surge: { file: "Profiles/Surge.conf", format: "conf", kind: "INI · [Proxy Group]" },
  shadowrocket: { file: "Profiles/Shadowrocket.conf", format: "conf", kind: "INI · [Proxy Group]" },
  loon: { file: "Profiles/Loon.conf", format: "conf", kind: "INI · [Remote Filter]" },
  stash: { file: "Profiles/Stash.yaml", format: "yaml", kind: "YAML · proxy-groups" },
  clash: { file: "Profiles/Clash.yaml", format: "yaml", kind: "YAML · proxy-groups" },
  egern: { file: "Profiles/Egern.yaml", format: "yaml", kind: "YAML · policy_groups" },
  quantumultx: { file: "Profiles/QuantumultX.conf", format: "conf", kind: "INI · [policy]" },
};

export function profileFileUrl(rawBase: string, client: ClientKey): string {
  return `${rawBase}/${PROFILE_FILES[client].file}`;
}

// iOS 一键导入 URL Scheme（官方文档核实；QX 官方仅文档化资源导入，
// 无整体配置安装 Scheme，故返回 null 不展示按钮）。
export function profileInstallScheme(rawBase: string, client: ClientKey): string | null {
  const url = encodeURIComponent(profileFileUrl(rawBase, client));
  switch (client) {
    case "surge":
      return `surge:///install-config?url=${url}`;
    case "shadowrocket":
      return `shadowrocket://config/add/${url}`;
    case "loon":
      return `loon://import?sub=${url}`;
    case "stash":
      return `stash://install-config?url=${url}`;
    case "clash":
      return null; // Android 客户端无 URL Scheme 整体配置导入
    case "egern":
      return `egern:/profiles/new?name=${encodeURIComponent("Blink")}&url=${url}`;
    case "quantumultx":
      return null;
  }
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

export const VIEW_LABELS: Record<string, string> = {
  domainset: "域名",
  nonip: "非IP",
  ip: "IP",
};

export const VIEW_ORDER = ["domainset", "nonip", "ip"] as const;

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
      count:
        group.kinds.reduce((sum, kind) => sum + (app.types[kind] ?? 0), 0) -
        (group.label === "进程" ? dropped : 0),
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

export function clientViewFileUrl(
  rawBase: string,
  app: AppEntry,
  client: ClientKey,
  view: string,
): string {
  return `${rawBase}/${app.views[client][view].file}`;
}

function appViews(app: AppEntry, client: ClientKey): string[] {
  const views = app.views?.[client];
  if (!views) return [];
  return VIEW_ORDER.filter((view) => view in views);
}

/** Reference lines for one app in one client; uses split domain/IP files when views exist. */
export function appReferenceLines(rawBase: string, app: AppEntry, client: ClientKey): string[] {
  const viewNames = appViews(app, client);
  const mihomo = client === "stash" || client === "clash";
  if (mihomo) {
    // mihomo 系（Stash/Clash）：需在配置文件里手写 rule-providers + RULE-SET，保留该写法。
    if (viewNames.length > 0) {
      const lines: string[] = ["rule-providers:"];
      for (const view of viewNames) {
        lines.push(`  ${app.name}-${view}:`);
        lines.push("    type: http");
        lines.push(`    behavior: ${view === "domainset" ? "domain" : "classical"}`);
        lines.push("    format: text");
        lines.push(`    url: ${clientViewFileUrl(rawBase, app, client, view)}`);
        lines.push("    interval: 86400");
        lines.push(`    # ${VIEW_LABELS[view]} 段`);
      }
      lines.push("rules:");
      for (const view of viewNames) lines.push(`  - RULE-SET,${app.name}-${view},${app.policy}`);
      return lines;
    }
    const url = clientFileUrl(rawBase, app, client);
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
    ];
  }
  // 非 mihomo：卡片复制 raw 地址，用户在客户端前端导入。
  if (viewNames.length > 0) {
    return viewNames.map((view) => clientViewFileUrl(rawBase, app, client, view));
  }
  return [clientFileUrl(rawBase, app, client)];
}

export function clientSnippet(rawBase: string, app: AppEntry, client: ClientKey): string {
  return appReferenceLines(rawBase, app, client).join("\n");
}

/** Reference for a single semantic view (for the per-view copy buttons). */
export function clientViewSnippet(
  rawBase: string,
  app: AppEntry,
  client: ClientKey,
  view: string,
): string {
  const entry = app.views?.[client]?.[view];
  if (!entry) return clientSnippet(rawBase, app, client);
  const url = clientViewFileUrl(rawBase, app, client, view);
  if (client === "stash" || client === "clash") {
    // mihomo 系：保留配置文件写法（rule-providers + RULE-SET）。
    return [
      "rule-providers:",
      `  ${app.name}-${view}:`,
      "    type: http",
      `    behavior: ${view === "domainset" ? "domain" : "classical"}`,
      "    format: text",
      `    url: ${url}`,
      "    interval: 86400",
      "rules:",
      `  - RULE-SET,${app.name}-${view},${app.policy}`,
    ].join("\n");
  }
  // 非 mihomo：复制这个视图的 raw 地址，供客户端前端导入。
  return url;
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
  if (client === "stash" || client === "clash") {
    // mihomo 系：需在配置文件手写 rule-providers + RULE-SET，保留该写法。
    out.push("rule-providers:");
    for (const app of sortedApps(data.apps)) {
      const views = appViews(app, client);
      const keys = views.length ? views : [null];
      for (const view of keys) {
        const key = view ? `${app.name}-${view}` : app.name;
        const behavior = view ? (view === "domainset" ? "domain" : "classical") : "classical";
        const url = view
          ? clientViewFileUrl(data.raw_base, app, client, view)
          : clientFileUrl(data.raw_base, app, client);
        out.push(`  ${key}:`);
        out.push("    type: http");
        out.push(`    behavior: ${behavior}`);
        out.push("    format: text");
        out.push(`    url: ${url}`);
        out.push("    interval: 86400");
      }
    }
    out.push("rules:");
    for (const app of sortedApps(data.apps)) {
      const views = appViews(app, client);
      const keys = views.length ? views : [null];
      for (const view of keys)
        out.push(`  - RULE-SET,${view ? `${app.name}-${view}` : app.name},${app.policy}`);
    }
    return out.join("\n");
  }
  // 非 mihomo：复制 raw 地址，用户在客户端前端导入；按容器分组。
  for (const group of groupedApps(data)) {
    out.push(`# ${group.label}`);
    for (const app of group.apps) {
      const views = appViews(app, client);
      if (views.length) {
        for (const view of views) out.push(clientViewFileUrl(data.raw_base, app, client, view));
      } else {
        out.push(clientFileUrl(data.raw_base, app, client));
      }
    }
    out.push("");
  }
  return out.join("\n").replace(/\n+$/, "");
}
