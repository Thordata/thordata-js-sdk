// src/models.ts

import { Engine } from "./enums";

/**
 * SERP search options.
 * 对应 Python 的 SerpRequest + docs/serp_reference.md
 */
export interface SerpOptions {
  query: string;
  engine?: Engine | "google" | "bing" | "yandex" | "duckduckgo";
  num?: number;
  start?: number;
  country?: string;          // gl
  language?: string;         // hl
  searchType?: string;       // tbm / mode
  device?: "desktop" | "mobile" | "tablet";
  renderJs?: boolean;        // render_js (SERP-side JS rendering)
  noCache?: boolean;         // no_cache
  outputFormat?: "json" | "html";

  // 其余所有参数（如 topic_token/shoprs/cc/mkt/...）直接透传
  [key: string]: any;
}

/**
 * Universal / Web Unlocker options.
 * 对应 docs/universal_reference.md
 */
export interface UniversalOptions {
  url: string;
  jsRender?: boolean;
  outputFormat?: "html" | "png";
  country?: string;
  blockResources?: string;
  cleanContent?: string;
  wait?: number;
  waitFor?: string;
  headers?: { name: string; value: string }[];
  cookies?: { name: string; value: string }[];
  [key: string]: any;
}

/**
 * Web Scraper task options.
 * 对应 Python 的 ScraperTaskConfig / create_scraper_task
 */
export interface ScraperTaskOptions {
  fileName: string;
  spiderId: string;
  spiderName: string;
  parameters: Record<string, any>;
  universalParams?: Record<string, any>;
  includeErrors?: boolean;
}

/**
 * Options for waitForTask helper.
 */
export interface WaitForTaskOptions {
  pollIntervalMs?: number;
  maxWaitMs?: number;
}