// src/utils.ts

import { AxiosError } from "axios";
import {
  ThordataError,
  ThordataApiError,
  ThordataAuthError,
  ThordataNetworkError,
  ThordataRateLimitError,
  ThordataServerError,
  ThordataTimeoutError,
  ThordataValidationError,
  ThordataNotCollectedError,
} from "./errors.js";

/**
 * Build User-Agent string for SDK requests.
 */
export function buildUserAgent(version: string): string {
  return `thordata-js-sdk/${version} (node ${process.versions.node}; ${process.platform})`;
}

// Scraper APIs (SERP/Universal) use the Account Settings token.
// Interface docs require `token` header, while other docs/examples use `Authorization: Bearer ...`.
// We send both for maximum compatibility.
export function buildAuthHeaders(scraperToken: string): Record<string, string> {
  if (!scraperToken) {
    throw new Error("scraperToken is required");
  }

  return {
    token: scraperToken,
    Authorization: `Bearer ${scraperToken}`,
  };
}

// Public APIs (tasks-status/tasks-download and other Public API endpoints) use My Account token/key.
export function buildPublicHeaders(publicToken: string, publicKey: string): Record<string, string> {
  if (!publicToken || !publicKey) {
    throw new Error("publicToken and publicKey are required");
  }

  return {
    token: publicToken,
    key: publicKey,
  };
}

// Web Scraper builder requires BOTH: public token/key + scraper Authorization (per interface docs).
// For backward compatibility, if public credentials are missing we still return Authorization only.
export function buildBuilderHeaders(
  scraperToken: string,
  publicToken?: string,
  publicKey?: string,
): Record<string, string> {
  if (!scraperToken) {
    throw new Error("scraperToken is required");
  }

  if (publicToken && publicKey) {
    return {
      token: publicToken,
      key: publicKey,
      Authorization: `Bearer ${scraperToken}`,
    };
  }

  // Backward compatible fallback (some docs show only Authorization).
  return {
    Authorization: `Bearer ${scraperToken}`,
  };
}

/**
 * Convert object to x-www-form-urlencoded string.
 */
export function toFormBody(payload: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  return params.toString();
}

/**
 * Safely parse JSON response.
 * Handles cases where API returns double-encoded JSON or strings with artifacts.
 */
export function safeParseJson(data: unknown): unknown {
  if (typeof data === "object" && data !== null) {
    return data;
  }
  if (typeof data === "string") {
    try {
      const cleanData = data.trim().replace(/^`|`$/g, "");
      return JSON.parse(cleanData);
    } catch {
      return data;
    }
  }
  return data;
}

/**
 * Extract error info from API response and throw corresponding typed error.
 *
 * @param message - Base error message
 * @param payload - API response payload (may contain code/msg)
 * @param statusCode - HTTP status code
 * @throws Appropriate ThordataError subclass
 */
export function raiseForCode(message: string, payload: unknown, statusCode?: number): never {
  const payloadObj = payload as Record<string, unknown> | null;
  const apiCode = typeof payloadObj?.code === "number" ? payloadObj.code : undefined;
  const errMsg = (payloadObj?.msg || payloadObj?.message || message) as string;
  const effective =
    apiCode !== undefined && apiCode !== 200
      ? apiCode
      : statusCode !== undefined && statusCode !== 200
        ? statusCode
        : (apiCode ?? statusCode);

  // Extract retryAfter if present
  const retryAfter =
    typeof payloadObj?.retry_after === "number" ? payloadObj.retry_after : undefined;

  // Code 300: Data not collected
  if (effective === 300) {
    throw new ThordataNotCollectedError(errMsg, apiCode, statusCode, payload);
  }

  // Code 400/422: Validation error
  if (effective === 400 || effective === 422) {
    throw new ThordataValidationError(errMsg, apiCode, statusCode, payload);
  }

  // Code 401/403: Authentication error
  if (effective === 401 || effective === 403) {
    throw new ThordataAuthError(errMsg, apiCode, statusCode, payload);
  }

  // Code 402/429: Rate limit error
  if (effective === 402 || effective === 429) {
    throw new ThordataRateLimitError(errMsg, apiCode, statusCode, payload, retryAfter);
  }

  // Code 5xx: Server error
  if (effective && effective >= 500 && effective < 600) {
    throw new ThordataServerError(errMsg, apiCode, statusCode, payload);
  }

  // Default: Generic API error
  throw new ThordataApiError(errMsg, apiCode, statusCode, payload);
}

/**
 * Uniformly handle axios errors and convert to ThordataError.
 */
export function handleAxiosError(e: unknown): never {
  // Already a ThordataError, re-throw as-is
  if (e instanceof ThordataError) {
    throw e;
  }

  if (e instanceof AxiosError) {
    // Timeout
    if (e.code === "ECONNABORTED") {
      throw new ThordataTimeoutError(`Request timed out: ${e.message}`, e);
    }

    // No response received (network error)
    if (!e.response) {
      throw new ThordataNetworkError(`Network error: ${e.message}`, e);
    }

    const status = e.response.status;
    const data = e.response.data;

    // Try to parse potential JSON string in data
    const parsedData = safeParseJson(data);

    // If response contains API error code, use raiseForCode
    if (parsedData && typeof parsedData === "object" && "code" in parsedData) {
      raiseForCode(`API error: HTTP ${status}`, parsedData, status);
    }

    // Default HTTP error
    throw new ThordataApiError(
      `HTTP error: ${status} ${e.response.statusText}`,
      status,
      undefined,
      parsedData,
    );
  }

  // Unknown error
  const errorMessage = e instanceof Error ? e.message : String(e);
  throw new ThordataNetworkError(`Unknown error: ${errorMessage}`, e);
}

/**
 * Generic retry function with exponential backoff.
 *
 * @param fn - Async function to execute
 * @param maxRetries - Maximum number of retries (0 = no retry)
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 0): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastError = e;

      // Determine if error is retryable
      const isRetryable =
        e instanceof ThordataRateLimitError ||
        e instanceof ThordataServerError ||
        e instanceof ThordataTimeoutError ||
        e instanceof ThordataNetworkError;

      // Don't retry if not retryable or max attempts reached
      if (!isRetryable || attempt === maxRetries) {
        throw e;
      }

      // Calculate delay (exponential backoff with jitter)
      const baseDelay = 1000 * Math.pow(2, attempt);
      const jitter = Math.random() * 100;
      let waitTime = baseDelay + jitter;

      // Respect retryAfter if available
      if (e instanceof ThordataRateLimitError && e.retryAfter) {
        waitTime = Math.max(waitTime, e.retryAfter * 1000);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
