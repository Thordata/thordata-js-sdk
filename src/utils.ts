// src/utils.ts

import { AxiosError } from "axios";
import {
  ThordataError,
  ThordataApiError,
  ThordataAuthError,
  ThordataNetworkError,
  ThordataRateLimitError,
  ThordataTimeoutError,
} from "./errors.js";

export function toFormUrlEncoded(data: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
  return params.toString();
}

export function buildUserAgent(version: string): string {
  return `thordata-js-sdk/${version} (node ${process.versions.node}; ${process.platform})`;
}

/**
 * Build authorization headers for SERP/Universal API.
 */
export function buildAuthHeaders(scraperToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${scraperToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/**
 * Build authorization headers for Web Scraper Public API.
 */
export function buildPublicHeaders(publicToken: string, publicKey: string): Record<string, string> {
  return {
    token: publicToken,
    key: publicKey,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/**
 * Convert any object to x-www-form-urlencoded string.
 */
export function toFormBody(payload: Record<string, any>): string {
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
export function safeParseJson(data: any): any {
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
 * Extract code/msg from SERP/Universal JSON response and throw corresponding error.
 */
export function raiseForCode(message: string, payload: any, statusCode?: number): never {
  const code = typeof payload?.code === "number" ? payload.code : undefined;
  const errMsg = payload?.msg || payload?.message || message;

  if (code === 401 || code === 403) {
    throw new ThordataAuthError(errMsg, statusCode ?? code, code, payload);
  }

  if (code === 402 || code === 429) {
    const retryAfter = typeof payload?.retry_after === "number" ? payload.retry_after : undefined;
    throw new ThordataRateLimitError(errMsg, statusCode ?? code, code, payload, retryAfter);
  }

  if (code && code >= 500 && code < 600) {
    throw new ThordataApiError(errMsg, statusCode ?? code, code, payload);
  }

  throw new ThordataApiError(errMsg, statusCode, code, payload);
}

/**
 * Uniformly handle axios errors.
 */
export function handleAxiosError(e: any): never {
  // Fix: 如果已经是 ThordataError，直接抛出
  if (e instanceof ThordataError) {
    throw e;
  }
  if (e instanceof AxiosError) {
    if (e.code === "ECONNABORTED") {
      throw new ThordataTimeoutError(`Request timed out: ${e.message}`, e);
    }
    if (!e.response) {
      throw new ThordataNetworkError(`Network error: ${e.message}`, e);
    }

    const status = e.response.status;
    const data = e.response.data;

    // Try to parse potential JSON string in data
    const parsedData = safeParseJson(data);

    if (parsedData && typeof parsedData === "object" && "code" in parsedData) {
      raiseForCode(`API error: HTTP ${status}`, parsedData, status);
    }

    throw new ThordataApiError(
      `HTTP error: ${status} ${e.response.statusText}`,
      status,
      undefined,
      parsedData,
    );
  }

  throw new ThordataNetworkError(`Unknown error: ${(e as any)?.message || String(e)}`, e);
}

/**
 * Generic retry function with exponential backoff.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 0): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;

      // Decide whether to retry
      const shouldRetry =
        e.code === 429 ||
        (e.statusCode && e.statusCode >= 500) || // 5xx
        e.name === "ThordataTimeoutError" ||
        e.name === "ThordataNetworkError";

      if (!shouldRetry || attempt === maxRetries) {
        throw e;
      }

      // Calculate delay (exponential backoff)
      const delay = 1000 * Math.pow(2, attempt) + Math.random() * 100;

      // Respect retryAfter if available
      const waitTime = Math.max(delay, (e.retryAfter || 0) * 1000);

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  throw lastError;
}
