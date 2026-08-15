export interface SourceInfo {
  author: string;
  name: string;
  format: string;
}

export interface AppEntry {
  name: string;
  category: string;
  emoji: string;
  policy: string;
  file: string;
  rules: number;
  types: Record<string, number>;
  source: SourceInfo;
  note: string;
}

export interface PortalData {
  repo: string;
  raw_base: string;
  apps: AppEntry[];
}
