// src/utils.ts

import { AxiosError } from "axios";
import {
  ThordataAPIError,
  ThordataAuthError,
  ThordataNetworkError,
  ThordataRateLimitError,
  ThordataTimeoutError,
} from "./errors";

/**
 * 构造 SERP/Universal API 的认证头
 */
export function buildAuthHeaders(scraperToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${scraperToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/**
 * 构造 Web Scraper 公共 API 的认证头
 */
export function buildPublicHeaders(
  publicToken: string,
  publicKey: string
): Record<string, string> {
  return {
    token: publicToken,
    key: publicKey,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/**
 * 将任意对象转换为 x-www-form-urlencoded 字符串
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
 * 从 SERP/Universal JSON 响应中提取 code/msg 并抛出对应错误
 */
export function raiseForCode(
  message: string,
  payload: any,
  statusCode?: number
): never {
  const code = typeof payload?.code === "number" ? payload.code : undefined;
  const errMsg = payload?.msg || payload?.message || message;
  const requestId = payload?.request_id;

  // 401 / 403 -> Auth
  if (code === 401 || code === 403) {
    throw new ThordataAuthError(errMsg, statusCode ?? code, code, payload);
  }

  // 402 / 429 -> Rate limit / quota
  if (code === 402 || code === 429) {
    const retryAfter =
      typeof payload?.retry_after === "number" ? payload.retry_after : undefined;
    throw new ThordataRateLimitError(
      errMsg,
      statusCode ?? code,
      code,
      payload,
      retryAfter
    );
  }

  // 5xx -> server error
  if (code && code >= 500 && code < 600) {
    throw new ThordataAPIError(errMsg, statusCode ?? code, code, payload);
  }

  // 300 / 400 等 -> 统一 APIError
  throw new ThordataAPIError(errMsg, statusCode, code, payload);
}

/**
 * 统一处理 axios 错误
 */
export function handleAxiosError(e: any): never {
  if (e instanceof AxiosError) {
    if (e.code === "ECONNABORTED") {
      throw new ThordataTimeoutError(
        `Request timed out: ${e.message}`,
        e
      );
    }
    if (!e.response) {
      throw new ThordataNetworkError(
        `Network error: ${e.message}`,
        e
      );
    }

    const status = e.response.status;
    const data = e.response.data;

    // 如果响应里有 code 字段，使用 raiseForCode
    if (data && typeof data === "object" && "code" in data) {
      raiseForCode(
        `API error: HTTP ${status}`,
        data,
        status
      );
    }

    // 否则抛 APIError
    throw new ThordataAPIError(
      `HTTP error: ${status} ${e.response.statusText}`,
      status,
      undefined,
      data
    );
  }

  // 非 axios 错误
  throw new ThordataNetworkError(
    `Unknown error: ${(e as any)?.message || String(e)}`,
    e
  );
}