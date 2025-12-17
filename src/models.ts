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

/**
 * Proxy configuration for Thordata residential / mobile / DC / ISP proxies.
 *
 * 注意：
 * - 这里不猜 host/port（因为每个账户/产品可能不同），需要用户自己提供；
 * - 我们帮你拼接 username（td-customer-USERNAME-country-us-city-xxx-sessid-...）；
 * - 适用于 Node.js axios 的 proxy 配置。
 */

export interface ProxyConfigOptions {
  /**
   * 你的子账户用户名（不含 td-customer- 前缀），
   * 例如 Dashboard 中的 "GnrqUwwu3obt"。
   */
  baseUsername: string;
  /**
   * 对应的密码。
   */
  password: string;
  /**
   * 代理主机，例如：
   *  - pr.thordata.net
   *  - t.pr.thordata.net
   *  - vpn9wq0d.pr.thordata.net
   */
  host: string;
  /**
   * 代理端口，例如：
   *  - 9999 (Residential)
   *  - 5555 (Mobile)
   *  - 7777 (Datacenter)
   *  - 6666 (ISP)
   */
  port: number;

  // Geo-targeting
  continent?: string;  // e.g. "as", "eu"
  country?: string;    // e.g. "us", "de"
  state?: string;      // e.g. "california"
  city?: string;       // e.g. "los_angeles"
  asn?: string;        // e.g. "AS12322"

  // Session control
  sessionId?: string;       // sessid-xxx
  sessionDuration?: number; // sesstime in minutes (1-90)
}

export class ProxyConfig {
  private opts: ProxyConfigOptions;

  constructor(options: ProxyConfigOptions) {
    this.opts = { ...options };
    this.validate();
  }

  private validate() {
    const { baseUsername, password, host, port, sessionDuration } = this.opts;
    if (!baseUsername) {
      throw new Error("ProxyConfig.baseUsername is required");
    }
    if (!password) {
      throw new Error("ProxyConfig.password is required");
    }
    if (!host) {
      throw new Error("ProxyConfig.host is required");
    }
    if (!port) {
      throw new Error("ProxyConfig.port is required");
    }
    if (sessionDuration !== undefined) {
      if (sessionDuration < 1 || sessionDuration > 90) {
        throw new Error("ProxyConfig.sessionDuration must be between 1 and 90 minutes");
      }
      if (!this.opts.sessionId) {
        throw new Error("ProxyConfig.sessionDuration requires sessionId to be set");
      }
    }
  }

  /**
   * 构造包含地理/ASN/session 参数的完整用户名：
   *  td-customer-{baseUsername}-country-us-city-seattle-sessid-xxx-sesstime-10
   */
  buildUsername(): string {
    const {
      baseUsername,
      continent,
      country,
      state,
      city,
      asn,
      sessionId,
      sessionDuration,
    } = this.opts;

    const parts: string[] = [`td-customer-${baseUsername}`];

    if (continent) {
      parts.push(`continent-${continent.toLowerCase()}`);
    }
    if (country) {
      parts.push(`country-${country.toLowerCase()}`);
    }
    if (state) {
      parts.push(`state-${state.toLowerCase()}`);
    }
    if (city) {
      parts.push(`city-${city.toLowerCase()}`);
    }
    if (asn) {
      let asnValue = asn.toUpperCase();
      if (!asnValue.startsWith("AS")) {
        asnValue = `AS${asnValue}`;
      }
      parts.push(`asn-${asnValue}`);
    }
    if (sessionId) {
      parts.push(`sessid-${sessionId}`);
    }
    if (sessionDuration !== undefined) {
      parts.push(`sesstime-${sessionDuration}`);
    }

    return parts.join("-");
  }

  /**
   * 返回 axios 的 proxy 配置：
   *
   * axios.get(url, {
   *   proxy: proxyConfig.toAxiosProxyConfig(),
   * });
   */
  toAxiosProxyConfig(): {
    host: string;
    port: number;
    auth: { username: string; password: string };
  } {
    return {
      host: this.opts.host,
      port: this.opts.port,
      auth: {
        username: this.buildUsername(),
        password: this.opts.password,
      },
    };
  }

  get host(): string {
    return this.opts.host;
  }

  get port(): number {
    return this.opts.port;
  }

  get password(): string {
    return this.opts.password;
  }
}