// src/models.ts
export interface SerpOptions {
  query: string;
  engine?: string;
  num?: number;
  start?: number;
  country?: string;
  language?: string;
  searchType?: string;
  device?: "desktop" | "mobile" | "tablet";
  renderJs?: boolean;
  noCache?: boolean;
  outputFormat?: "json" | "html";
  [key: string]: any;
}

export interface UniversalOptions {
  url: string;
  jsRender?: boolean;
  outputFormat?: "html" | "png" | "pdf";
  country?: string;
  blockResources?: string[];
  wait?: number;
  waitFor?: string;
  headers?: { name: string; value: string }[];
  cookies?: { name: string; value: string }[];
  [key: string]: any;
}

export interface ScraperTaskOptions {
  fileName: string;
  spiderId: string;
  spiderName: string;
  parameters: Record<string, any>;
  universalParams?: Record<string, any>;
  includeErrors?: boolean;
}

export interface WaitForTaskOptions {
  pollIntervalMs?: number;
  maxWaitMs?: number;
}
