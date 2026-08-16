export type ClientKey = "surge" | "loon" | "shadowrocket" | "stash" | "egern" | "quantumultx";

export interface SourceInfo {
  author: string;
  name: string;
  format: string;
}

export interface AppClientStat {
  file: string;
  rules: number;
  dropped?: number;
}

export interface AppEntry {
  name: string;
  category: string;
  emoji: string;
  icon?: string;
  self_use?: boolean;
  policy: string;
  file: string;
  rules: number;
  types: Record<string, number>;
  clients: Record<ClientKey, AppClientStat>;
  source: SourceInfo;
  note: string;
}

export interface PortalData {
  repo: string;
  raw_base: string;
  apps: AppEntry[];
}
