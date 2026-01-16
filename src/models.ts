// src/models.ts

import type { Engine, Device, OutputFormat } from "./enums.js";

/**
 * Options for SERP API search.
 */
export interface SerpOptions {
  /** Search query string */
  query: string;
  /**
   * Search engine to use (default: google).
   *
   * Use dedicated engines for best results:
   * - Engine.GOOGLE_NEWS instead of Engine.GOOGLE + tbm
   * - Engine.GOOGLE_SHOPPING instead of Engine.GOOGLE + tbm
   */
  engine?: Engine | string;
  /** Number of results to return */
  num?: number;
  /** Starting offset for pagination */
  start?: number;
  /** Country code (e.g., "us", "uk") - maps to `gl` parameter */
  country?: string;
  /** Language code (e.g., "en", "de") - maps to `hl` parameter */
  language?: string;
  /**
   * Search type for Google (tbm parameter).
   *
   * Only available when engine is one of:
   * google_search, google_news, google_shopping, google_images, google_videos
   *
   * Values: "nws" (news), "shop" (shopping), "isch" (images), "vid" (videos)
   *
   * Recommendation: Use dedicated engines instead (e.g., Engine.GOOGLE_NEWS)
   */
  searchType?: string;
  /** Device type for rendering */
  device?: Device | "desktop" | "mobile" | "tablet";
  /** Enable JavaScript rendering */
  renderJs?: boolean;
  /** Bypass cache */
  noCache?: boolean;
  /** Output format (default: json) */
  outputFormat?: "json" | "html";
  /** Additional engine-specific parameters */
  [key: string]: unknown;
}

/**
 * Options for Universal/Web Unlocker API.
 */
export interface UniversalOptions {
  /** Target URL to scrape */
  url: string;
  /** Enable JavaScript rendering (default: false) */
  jsRender?: boolean;
  /**
   * Output format (default: html).
   *
   * Supported values: "html", "png"
   */
  outputFormat?: OutputFormat | "html" | "png";
  /** Country code for geo-targeting (e.g., "us", "de") */
  country?: string;
  /**
   * Resource types to block loading.
   *
   * Examples: "script", "image", "css", "media"
   * Can be combined: "image,media"
   */
  blockResources?: string;
  /**
   * Content types to remove from returned results.
   *
   * Examples: "js", "css", "js,css"
   * Useful for reducing noise in LLM input.
   */
  cleanContent?: string;
  /**
   * Page loading wait time in milliseconds.
   *
   * Maximum: 100000 (100 seconds)
   */
  wait?: number;
  /**
   * CSS selector to wait for before returning.
   *
   * Higher priority than `wait` parameter.
   * Example: ".main-content"
   */
  waitFor?: string;
  /**
   * Custom request headers.
   *
   * Format: [{ name: "Header-Name", value: "header-value" }]
   */
  headers?: Array<{ name: string; value: string }>;
  /**
   * Custom cookies.
   *
   * Format: [{ name: "cookie_name", value: "cookie_value" }]
   */
  cookies?: Array<{ name: string; value: string }>;
  /** Additional parameters for future API extensions */
  [key: string]: unknown;
}

/**
 * Options for creating a Web Scraper task.
 */
export interface ScraperTaskOptions {
  /** Output file name */
  fileName: string;
  /** Spider ID */
  spiderId: string;
  /** Spider name */
  spiderName: string;
  /** Spider parameters */
  parameters: Record<string, unknown>;
  /** Universal API parameters (optional) */
  universalParams?: Record<string, unknown>;
  /** Include error records in output (default: true) */
  includeErrors?: boolean;
}

/**
 * Options for waiting on a task to complete.
 */
export interface WaitForTaskOptions {
  /** Polling interval in milliseconds (default: 5000) */
  pollIntervalMs?: number;
  /** Maximum wait time in milliseconds (default: 600000) */
  maxWaitMs?: number;
}

/**
 * Proxy type for Location API.
 *
 * String values: "residential", "unlimited"
 * Numeric values: 1 (residential), 2 (unlimited)
 */
export type ProxyTypeParam = "residential" | "unlimited" | 1 | 2;

/**
 * Country information from Location API.
 */
export interface CountryInfo {
  country_code: string;
  country_name: string;
}

/**
 * State/region information from Location API.
 */
export interface StateInfo {
  state_code: string;
  state_name: string;
}

/**
 * City information from Location API.
 */
export interface CityInfo {
  city_name: string;
}

/**
 * ASN information from Location API.
 */
export interface AsnInfo {
  asn_code: string;
  asn_name: string;
}

/**
 * Common settings for YouTube video/audio download.
 */
export interface CommonSettings {
  /** Video resolution (360p/480p/720p/1080p/1440p/2160p) */
  resolution?: string;
  /** Audio format (opus/mp3) */
  audio_format?: string;
  /** Audio bitrate (48/64/128/160/256/320) */
  bitrate?: string;
  /** Whether to download subtitles ("true"/"false") */
  is_subtitles?: string;
  /** Subtitle language code */
  subtitles_language?: string;
}

/**
 * Options for creating a video download task.
 */
export interface VideoTaskOptions {
  /** Output file name */
  fileName: string;
  /** Spider ID */
  spiderId: string;
  /** Spider name */
  spiderName: string;
  /** Spider parameters */
  parameters: Record<string, unknown>;
  /** Common settings for video/audio */
  commonSettings: CommonSettings;
  /** Include error records (default: true) */
  includeErrors?: boolean;
}

export interface UsageStatistics {
  total_usage_traffic: number;
  traffic_balance: number;
  query_days: number;
  range_usage_traffic: number;
  data: Array<Record<string, unknown>>;
}

export interface ProxyUser {
  username: string;
  status: boolean; // boolean in our model, API might return string/int
  traffic_limit: number;
  usage_traffic: number;
}

export interface ProxyUserList {
  limit: number;
  remaining_limit: number;
  user_count: number;
  list: ProxyUser[];
}

export interface ProxyServer {
  ip: string;
  port: number;
  username: string;
  password?: string;
  expiration_time?: string | number;
  region?: string;
}

/**
 * Configuration for the high-level runTask method.
 */
export interface RunTaskConfig {
  /** Maximum time to wait in milliseconds (default: 600000 = 10min) */
  maxWaitMs?: number;
  /** Initial polling interval in milliseconds (default: 2000) */
  initialPollIntervalMs?: number;
  /** Maximum polling interval in milliseconds (default: 10000) */
  maxPollIntervalMs?: number;
}
