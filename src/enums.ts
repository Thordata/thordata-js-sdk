// src/enums.ts

/**
 * Enumerations for the Thordata JS SDK.
 *
 * This module provides type-safe enumerations for all Thordata API parameters,
 * making it easier to discover available options via IDE autocomplete.
 */

// =============================================================================
// Continent Enum
// =============================================================================

/**
 * Continent codes for geo-targeting.
 */
export enum Continent {
  AFRICA = "af",
  ANTARCTICA = "an",
  ASIA = "as",
  EUROPE = "eu",
  NORTH_AMERICA = "na",
  OCEANIA = "oc",
  SOUTH_AMERICA = "sa",
}

// =============================================================================
// Proxy Host Enum
// =============================================================================

/**
 * Available proxy gateway hosts.
 */
export enum ProxyHost {
  DEFAULT = "pr.thordata.net",
  NORTH_AMERICA = "t.na.thordata.net",
  EUROPE = "t.eu.thordata.net",
}

/**
 * Available proxy gateway ports.
 */
export enum ProxyPort {
  RESIDENTIAL = 9999,
  MOBILE = 5555,
  DATACENTER = 7777,
  ISP = 6666,
}

// =============================================================================
// Search Engine Enums
// =============================================================================

/**
 * Supported search engines for SERP API.
 *
 * Engine naming convention:
 * - Base search: {engine}_search (e.g., google_search, bing_search)
 * - Verticals: {engine}_{vertical} (e.g., google_news, bing_images)
 * - Sub-verticals: {engine}_{vertical}_{sub} (e.g., google_scholar_cite)
 */
export enum Engine {
  // ===================
  // Google
  // ===================
  /** Google web search (basic) */
  GOOGLE = "google",
  /** Google Search with full options */
  GOOGLE_SEARCH = "google_search",
  GOOGLE_AI_MODE = "google_ai_mode",
  GOOGLE_WEB = "google_web",
  GOOGLE_SHOPPING = "google_shopping",
  GOOGLE_LOCAL = "google_local",
  GOOGLE_VIDEOS = "google_videos",
  GOOGLE_NEWS = "google_news",
  GOOGLE_FLIGHTS = "google_flights",
  GOOGLE_IMAGES = "google_images",
  GOOGLE_LENS = "google_lens",
  GOOGLE_TRENDS = "google_trends",
  GOOGLE_HOTELS = "google_hotels",
  GOOGLE_PLAY = "google_play",
  GOOGLE_JOBS = "google_jobs",
  GOOGLE_SCHOLAR = "google_scholar",
  GOOGLE_SCHOLAR_CITE = "google_scholar_cite",
  GOOGLE_SCHOLAR_AUTHOR = "google_scholar_author",
  GOOGLE_MAPS = "google_maps",
  GOOGLE_FINANCE = "google_finance",
  GOOGLE_FINANCE_MARKETS = "google_finance_markets",
  GOOGLE_PATENTS = "google_patents",
  GOOGLE_PATENTS_DETAILS = "google_patents_details",

  // ===================
  // Bing
  // ===================
  /** Bing web search (basic) */
  BING = "bing",
  BING_SEARCH = "bing_search",
  BING_IMAGES = "bing_images",
  BING_VIDEOS = "bing_videos",
  BING_NEWS = "bing_news",
  BING_MAPS = "bing_maps",
  BING_SHOPPING = "bing_shopping",

  // ===================
  // Yandex
  // ===================
  /** Yandex web search (basic) */
  YANDEX = "yandex",
  YANDEX_SEARCH = "yandex_search",

  // ===================
  // DuckDuckGo
  // ===================
  /** DuckDuckGo web search (basic) */
  DUCKDUCKGO = "duckduckgo",
  DUCKDUCKGO_SEARCH = "duckduckgo_search",
}

/**
 * Google tbm (to be matched) parameter values.
 *
 * Only available when using specific Google engines that support tbm.
 */
export enum GoogleTbm {
  NEWS = "nws",
  SHOPPING = "shop",
  IMAGES = "isch",
  VIDEOS = "vid",
}

/**
 * Device types for SERP API.
 */
export enum Device {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TABLET = "tablet",
}

/**
 * Time range filters for search results.
 */
export enum TimeRange {
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

// =============================================================================
// Proxy Enums
// =============================================================================

/**
 * Types of proxy networks available.
 */
export enum ProxyType {
  RESIDENTIAL = 1,
  UNLIMITED = 2,
  DATACENTER = 3,
  ISP = 4,
  MOBILE = 5,
}

/**
 * Proxy session types for connection persistence.
 */
export enum SessionType {
  ROTATING = "rotating",
  STICKY = "sticky",
}

// =============================================================================
// Output Format Enums
// =============================================================================

/**
 * Output formats for Universal Scraping API.
 *
 * Currently supported: html, png
 */
export enum OutputFormat {
  HTML = "html",
  PNG = "png",
}

/**
 * Data formats for task result download.
 */
export enum DataFormat {
  JSON = "json",
  CSV = "csv",
  XLSX = "xlsx",
}

// =============================================================================
// Task Status Enums
// =============================================================================

/**
 * Possible statuses for async scraping tasks.
 */
export enum TaskStatus {
  PENDING = "pending",
  RUNNING = "running",
  READY = "ready",
  SUCCESS = "success",
  FINISHED = "finished",
  FAILED = "failed",
  ERROR = "error",
  CANCELLED = "cancelled",
  UNKNOWN = "unknown",
}

/**
 * Check if a status is terminal (no more updates expected).
 */
export function isTerminalStatus(status: TaskStatus | string): boolean {
  const terminal = [
    TaskStatus.READY,
    TaskStatus.SUCCESS,
    TaskStatus.FINISHED,
    TaskStatus.FAILED,
    TaskStatus.ERROR,
    TaskStatus.CANCELLED,
  ];
  return terminal.includes(status as TaskStatus);
}

/**
 * Check if a status indicates success.
 */
export function isSuccessStatus(status: TaskStatus | string): boolean {
  const success = [TaskStatus.READY, TaskStatus.SUCCESS, TaskStatus.FINISHED];
  return success.includes(status as TaskStatus);
}

/**
 * Check if a status indicates failure.
 */
export function isFailureStatus(status: TaskStatus | string): boolean {
  const failure = [TaskStatus.FAILED, TaskStatus.ERROR];
  return failure.includes(status as TaskStatus);
}

// =============================================================================
// Country Enum (Common Countries)
// =============================================================================

/**
 * Common country codes for geo-targeting.
 */
export enum Country {
  // North America
  US = "us",
  CA = "ca",
  MX = "mx",

  // Europe
  GB = "gb",
  DE = "de",
  FR = "fr",
  ES = "es",
  IT = "it",
  NL = "nl",
  PL = "pl",
  RU = "ru",
  UA = "ua",
  SE = "se",
  NO = "no",
  DK = "dk",
  FI = "fi",
  CH = "ch",
  AT = "at",
  BE = "be",
  PT = "pt",
  IE = "ie",
  CZ = "cz",
  GR = "gr",

  // Asia Pacific
  CN = "cn",
  JP = "jp",
  KR = "kr",
  IN = "in",
  AU = "au",
  NZ = "nz",
  SG = "sg",
  HK = "hk",
  TW = "tw",
  TH = "th",
  VN = "vn",
  ID = "id",
  MY = "my",
  PH = "ph",
  PK = "pk",
  BD = "bd",

  // South America
  BR = "br",
  AR = "ar",
  CL = "cl",
  CO = "co",
  PE = "pe",
  VE = "ve",

  // Middle East & Africa
  AE = "ae",
  SA = "sa",
  IL = "il",
  TR = "tr",
  ZA = "za",
  EG = "eg",
  NG = "ng",
  KE = "ke",
  MA = "ma",
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely convert an enum or string to its lowercase string value.
 */
export function normalizeEnumValue<T extends string>(value: T | { toString(): string }): string {
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  return String(value).toLowerCase();
}
