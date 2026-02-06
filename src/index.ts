// src/index.ts

// New productized SDK
export { Thordata } from "./thordata.js";
export type { ThordataConfig } from "./thordata.js";

// Low-level client (kept for advanced users)
export { ThordataClient } from "./client.js";
export type { ThordataClientConfig } from "./client.js";

// Namespaces
export { BrowserNamespace } from "./namespaces/browser.js";
export { ProxyNamespace } from "./namespaces/proxy.js";
export type { ProxyRequestConfig } from "./namespaces/proxy.js";

// Proxy utilities
export { Proxy } from "./proxy.js";
export type { ProxyProduct, ProxyCredentials, StaticProxyConfig, ProxyOptions } from "./proxy.js";

// Enums
export {
  // Geographic
  Continent,
  Country,
  // Proxy
  ProxyHost,
  ProxyPort,
  ProxyType,
  SessionType,
  // Search
  Engine,
  GoogleTbm,
  Device,
  TimeRange,
  // Output
  OutputFormat,
  DataFormat,
  // Task
  TaskStatus,
  // Helper functions
  isTerminalStatus,
  isSuccessStatus,
  isFailureStatus,
  normalizeEnumValue,
} from "./enums.js";

// Models/Types
export type {
  SerpOptions,
  UniversalOptions,
  ScraperTaskOptions,
  WaitForTaskOptions,
  RunTaskConfig,
  ProxyTypeParam,
  CountryInfo,
  StateInfo,
  CityInfo,
  AsnInfo,
} from "./models.js";

// Errors
export {
  ThordataError,
  ThordataConfigError,
  ThordataNetworkError,
  ThordataTimeoutError,
  ThordataApiError,
  ThordataAuthError,
  ThordataRateLimitError,
  ThordataServerError,
  ThordataValidationError,
  ThordataNotCollectedError,
} from "./errors.js";
