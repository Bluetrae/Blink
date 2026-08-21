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
  if (viewNames.length > 0) {
    const lines: string[] = [];
    if (client === "stash" || client === "clash") {
      lines.push("rule-providers:");
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
    if (client === "egern") {
      lines.push("rules:");
      for (const view of viewNames) {
        lines.push("  - rule_set:");
        lines.push(`      match: ${clientViewFileUrl(rawBase, app, client, view)}`);
        lines.push(`      policy: ${app.policy}`);
      }
      return lines;
    }
    for (const view of viewNames) {
      const url = clientViewFileUrl(rawBase, app, client, view);
      if (client === "surge") {
        lines.push(
          view === "domainset"
            ? `DOMAIN-SET,${url},${app.policy},extended-matching`
            : `RULE-SET,${url},${app.policy}${view === "ip" ? ",no-resolve" : ""}`,
        );
      } else if (client === "shadowrocket") {
        lines.push(
          view === "domainset"
            ? `DOMAIN-SET,${url},${app.policy}`
            : `RULE-SET,${url},${app.policy}`,
        );
      } else if (client === "loon") {
        lines.push(`${url}, policy=${app.policy}, tag=${app.name}-${view}, enabled=true`);
      } else if (client === "quantumultx") {
        lines.push(
          `${url}, tag=${app.name}-${view}, force-policy=${app.policy}, update-interval=172800, opt-parser=false, enabled=true`,
        );
      }
    }
    return lines;
  }
  const url = clientFileUrl(rawBase, app, client);
  switch (client) {
    case "surge":
    case "shadowrocket":
      return [`RULE-SET,${url},${app.policy}`];
    case "loon":
      return [`${url}, policy=${app.policy}, tag=${app.name}, enabled=true`];
    case "stash":
    case "clash":
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
    case "egern":
      return ["rules:", "  - rule_set:", `      match: ${url}`, `      policy: ${app.policy}`];
    case "quantumultx":
      return [
        `${url}, tag=${app.name}, force-policy=${app.policy}, update-interval=172800, opt-parser=false, enabled=true`,
      ];
  }
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
  if (client === "egern") {
    return ["rules:", "  - rule_set:", `      match: ${url}`, `      policy: ${app.policy}`].join(
      "\n",
    );
  }
  if (client === "surge") {
    return view === "domainset"
      ? `DOMAIN-SET,${url},${app.policy},extended-matching`
      : `RULE-SET,${url},${app.policy}${view === "ip" ? ",no-resolve" : ""}`;
  }
  if (client === "shadowrocket") {
    return view === "domainset"
      ? `DOMAIN-SET,${url},${app.policy}`
      : `RULE-SET,${url},${app.policy}`;
  }
  if (client === "loon") {
    return `${url}, policy=${app.policy}, tag=${app.name}-${view}, enabled=true`;
  }
  if (client === "quantumultx") {
    return `${url}, tag=${app.name}-${view}, force-policy=${app.policy}, update-interval=172800, opt-parser=false, enabled=true`;
  }
  return "";
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
  if (client === "egern") {
    out.push("rules:");
    for (const app of sortedApps(data.apps)) {
      const views = appViews(app, client);
      if (views.length) {
        for (const view of views) {
          out.push("  - rule_set:");
          out.push(`      match: ${clientViewFileUrl(data.raw_base, app, client, view)}`);
          out.push(`      policy: ${app.policy}`);
        }
      } else {
        out.push("  - rule_set:");
        out.push(`      match: ${clientFileUrl(data.raw_base, app, client)}`);
        out.push(`      policy: ${app.policy}`);
      }
    }
    return out.join("\n");
  }
  if (client === "quantumultx") {
    out.push("[filter_remote]");
    for (const app of sortedApps(data.apps))
      out.push(...appReferenceLines(data.raw_base, app, client));
    return out.join("\n");
  }
  for (const group of groupedApps(data)) {
    out.push(`# ${group.label}`);
    for (const app of group.apps) out.push(...appReferenceLines(data.raw_base, app, client));
    out.push("");
  }
  return out.join("\n").replace(/\n+$/, "");
}
