// src/client.ts

import { SerpNamespace } from "./serp_engines.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import axios, { AxiosInstance } from "axios";
import https from "node:https";
import { Engine, TaskStatus } from "./enums.js";
import {
  SerpOptions,
  UniversalOptions,
  ScraperTaskOptions,
  WaitForTaskOptions,
  ProxyTypeParam,
  CountryInfo,
  StateInfo,
  CityInfo,
  AsnInfo,
  VideoTaskOptions,
  UsageStatistics,
  ProxyUserList,
  ProxyServer,
} from "./models.js";
import { ThordataError, ThordataTimeoutError, ThordataConfigError } from "./errors.js";
import {
  buildAuthHeaders,
  buildPublicHeaders,
  buildBuilderHeaders,
  handleAxiosError,
  toFormBody,
  raiseForCode,
  safeParseJson,
  withRetry,
  buildUserAgent,
} from "./utils.js";
import { resolveBaseUrls, type ThordataBaseUrls } from "./endpoints.js";
import { Proxy } from "./proxy.js";

/**
 * Configuration options for ThordataClient.
 */
export interface ThordataClientConfig {
  /** API token for SERP and Universal APIs (Optional) */
  scraperToken?: string;

  /** Public token for Web Scraper API and Location API */
  publicToken?: string;

  /** Public key for Web Scraper API and Location API */
  publicKey?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;

  /** Maximum number of retries on failure (default: 0) */
  maxRetries?: number;

  /** Custom base URLs for API endpoints */
  baseUrls?: Partial<ThordataBaseUrls>;

  /** Custom User-Agent string */
  userAgent?: string;

  /** Whether to verify SSL certificates (default: true). */
  verifySsl?: boolean;
}

/**
 * Normalize proxy type parameter to numeric value.
 */
function normalizeProxyType(proxyType: ProxyTypeParam): number {
  if (typeof proxyType === "number") {
    return proxyType;
  }
  return proxyType === "residential" ? 1 : 2;
}

/**
 * Parse THORDATA_UPSTREAM_PROXY environment variable.
 *
 * @returns Parsed upstream proxy config or null if not set
 */
function parseUpstreamProxy(): {
  protocol: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
} | null {
  const upstreamUrl = process.env.THORDATA_UPSTREAM_PROXY?.trim();
  if (!upstreamUrl) return null;

  try {
    const url = new URL(upstreamUrl);
    const protocol = url.protocol.replace(":", "");

    if (!["http", "https", "socks5", "socks5h"].includes(protocol)) {
      console.warn(`[Thordata] Unsupported upstream proxy protocol: ${protocol}`);
      return null;
    }

    return {
      protocol,
      host: url.hostname,
      port: parseInt(url.port) || (protocol.startsWith("socks") ? 1080 : 7897),
      username: url.username || undefined,
      password: url.password || undefined,
    };
  } catch {
    console.warn(`[Thordata] Failed to parse THORDATA_UPSTREAM_PROXY: ${upstreamUrl}`);
    return null;
  }
}

/**
 * Main client for interacting with Thordata APIs.
 */
export class ThordataClient {
  private scraperToken: string;
  private publicToken?: string;
  private publicKey?: string;

  private timeoutMs: number;
  private maxRetries: number;
  private http: AxiosInstance;
  private baseUrls: ThordataBaseUrls;
  private userAgent: string;

  private serpUrl: string;
  private universalUrl: string;
  private scraperBuilderUrl: string;
  private scraperStatusUrl: string;
  private scraperDownloadUrl: string;
  private videoBuilderUrl: string;

  private usageStatsUrl: string;
  private proxyUsersUrl: string;
  private whitelistUrl: string;
  private proxyListUrl: string;
  private proxyExpirationUrl: string;
  private taskListUrl: string;

  public serp: SerpNamespace;

  constructor(config: ThordataClientConfig) {
    this.scraperToken = config.scraperToken ?? "";
    this.publicToken = config.publicToken;
    this.publicKey = config.publicKey;
    this.timeoutMs = config.timeoutMs ?? 30000;
    this.maxRetries = config.maxRetries ?? 0;

    const verifySsl = config.verifySsl ?? true;

    this.http = axios.create({
      timeout: this.timeoutMs,
      httpsAgent: new https.Agent({ rejectUnauthorized: verifySsl }),
    });

    this.baseUrls = resolveBaseUrls(process.env, config.baseUrls);

    this.serpUrl = `${this.baseUrls.scraperapiBaseUrl}/request`;
    this.scraperBuilderUrl = `${this.baseUrls.scraperapiBaseUrl}/builder`;
    this.universalUrl = `${this.baseUrls.universalapiBaseUrl}/request`;
    this.scraperStatusUrl = `${this.baseUrls.webScraperApiBaseUrl}/tasks-status`;
    this.scraperDownloadUrl = `${this.baseUrls.webScraperApiBaseUrl}/tasks-download`;
    this.videoBuilderUrl = `${this.baseUrls.scraperapiBaseUrl}/video_builder`;

    const pkgVersion = (process.env.npm_package_version as string) || "0.0.0";
    this.userAgent = config.userAgent ?? buildUserAgent(pkgVersion);

    this.http.defaults.headers.common["User-Agent"] = this.userAgent;

    // Locations base URL
    const apiBase = this.baseUrls.locationsBaseUrl.replace(/\/locations$/, "");
    const whitelistBase = process.env.THORDATA_WHITELIST_BASE_URL || "https://api.thordata.com/api";
    const proxyApiBase =
      process.env.THORDATA_PROXY_API_BASE_URL || "https://openapi.thordata.com/api";

    this.usageStatsUrl = `${apiBase}/account/usage-statistics`;
    this.proxyUsersUrl = `${apiBase}/proxy-users`;
    this.whitelistUrl = `${whitelistBase}/whitelisted-ips`;
    this.proxyListUrl = `${proxyApiBase}/proxy/proxy-list`;
    this.proxyExpirationUrl = `${apiBase}/proxy/expiration-time`;
    this.taskListUrl = `${this.baseUrls.webScraperApiBaseUrl}/tasks-list`;

    // Check for upstream proxy and log info
    const upstream = parseUpstreamProxy();
    if (upstream) {
      console.log(
        `[Thordata] Upstream proxy detected: ${upstream.protocol}://${upstream.host}:${upstream.port}`,
      );
      console.log(
        `[Thordata] Note: For optimal upstream proxy support in Node.js, ` +
          `ensure your system proxy settings or use TUN mode in Clash/V2Ray.`,
      );
    }
    this.serp = new SerpNamespace(this);
  }

  /**
   * Execute request with retry logic.
   */
  private async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    return withRetry(async () => {
      try {
        return await requestFn();
      } catch (e) {
        handleAxiosError(e);
      }
    }, this.maxRetries);
  }

  // --------------------------
  // 1) SERP API
  // --------------------------

  /**
   * Perform a search using the SERP API.
   */
  async serpSearch(options: SerpOptions): Promise<Record<string, unknown>> {
    if (!this.scraperToken) {
      throw new ThordataConfigError("scraperToken is required for SERP API");
    }
    const {
      query,
      engine = Engine.GOOGLE,
      num,
      start,
      country,
      language,
      searchType,
      device,
      renderJs,
      noCache,
      outputFormat = "json",
      ...extra
    } = options;

    if (!query) {
      throw new ThordataConfigError("query is required for serpSearch");
    }

    const engineStr = String(engine).toLowerCase();

    const payload: Record<string, unknown> = {
      engine: engineStr,
      json: outputFormat.toLowerCase() === "html" ? "0" : "1",
    };

    if (engineStr === "yandex") {
      payload.text = query;
    } else {
      payload.q = query;
    }

    if (num !== undefined) payload.num = String(num);
    if (start !== undefined) payload.start = String(start);
    if (country) payload.gl = country.toLowerCase();
    if (language) payload.hl = language.toLowerCase();

    const TBM_MAP: Record<string, string> = {
      images: "isch",
      shopping: "shop",
      news: "nws",
      videos: "vid",
      isch: "isch",
      shop: "shop",
      nws: "nws",
      vid: "vid",
    };

    if (searchType) {
      const st = String(searchType).toLowerCase();
      payload.tbm = TBM_MAP[st] ?? st;
    }

    if (device) payload.device = device.toLowerCase();
    if (renderJs !== undefined) payload.render_js = renderJs ? "True" : "False";
    if (noCache !== undefined) payload.no_cache = noCache ? "True" : "False";

    Object.assign(payload, extra);

    const headers = buildAuthHeaders(this.scraperToken);

    return this.execute(async () => {
      const res = await this.http.post(this.serpUrl, toFormBody(payload), {
        headers,
      });

      if (outputFormat.toLowerCase() === "html") {
        if (typeof res.data === "string") return { html: res.data };
        if (res.data && typeof res.data === "object" && "html" in res.data) return res.data;
        return { html: String(res.data) };
      }

      const data = safeParseJson(res.data) as Record<string, unknown>;
      if (data && typeof data === "object" && "code" in data && data.code !== 200) {
        raiseForCode("SERP API error", data, res.status);
      }
      return data;
    });
  }

  // --------------------------
  // 2) Universal / Web Unlocker
  // --------------------------

  /**
   * Scrape a URL using the Universal/Web Unlocker API.
   */
  async universalScrape(
    options: UniversalOptions,
  ): Promise<string | Buffer | Record<string, unknown>> {
    if (!this.scraperToken) {
      throw new ThordataConfigError("scraperToken is required for Universal API");
    }
    const {
      url,
      jsRender = false,
      outputFormat = "html",
      country,
      blockResources,
      cleanContent,
      wait,
      waitFor,
      headers: customHeaders,
      cookies,
      ...extra
    } = options;

    if (!url) {
      throw new ThordataConfigError("url is required for universalScrape");
    }

    const format = String(outputFormat).toLowerCase();

    if (format !== "html" && format !== "png") {
      throw new ThordataConfigError(
        `Invalid outputFormat: "${outputFormat}". Supported values: "html", "png"`,
      );
    }

    const payload: Record<string, unknown> = {
      url,
      js_render: jsRender ? "True" : "False",
      type: format,
    };

    if (country) payload.country = country.toLowerCase();
    if (blockResources) payload.block_resources = blockResources;
    if (cleanContent) payload.clean_content = cleanContent;
    if (wait !== undefined) payload.wait = String(wait);
    if (waitFor) payload.wait_for = waitFor;
    if (customHeaders && customHeaders.length > 0) {
      payload.headers = JSON.stringify(customHeaders);
    }
    if (cookies && cookies.length > 0) {
      payload.cookies = JSON.stringify(cookies);
    }

    Object.assign(payload, extra);

    const headers = buildAuthHeaders(this.scraperToken);

    return this.execute(async () => {
      const res = await this.http.post(this.universalUrl, toFormBody(payload), {
        headers,
        responseType: format === "png" ? "arraybuffer" : "json",
      });

      if (format === "png") {
        return Buffer.from(res.data);
      }

      const data = safeParseJson(res.data);

      if (data && typeof data === "object" && "code" in data) {
        const dataObj = data as Record<string, unknown>;
        if (dataObj.code !== 200) {
          raiseForCode("Universal API error", dataObj, res.status);
        }
      }

      if (data && typeof data === "object" && "html" in data) {
        return (data as Record<string, unknown>).html as string;
      }

      return typeof data === "string" ? data : JSON.stringify(data);
    });
  }

  // --------------------------
  // 3) Web Scraper API
  // --------------------------

  async createScraperTask(options: ScraperTaskOptions): Promise<string> {
    this.requirePublicCreds();
    if (!this.scraperToken) {
      throw new ThordataConfigError("scraperToken is required for Task Builder");
    }
    const {
      fileName,
      spiderId,
      spiderName,
      parameters,
      universalParams,
      includeErrors = true,
    } = options;

    const payload: Record<string, unknown> = {
      file_name: fileName,
      spider_id: spiderId,
      spider_name: spiderName,
      spider_parameters: JSON.stringify([parameters]),
      spider_errors: includeErrors ? "true" : "false",
    };

    if (universalParams) {
      payload.spider_universal = JSON.stringify(universalParams);
    }

    const headers = buildBuilderHeaders(this.scraperToken, this.publicToken, this.publicKey);

    return this.execute(async () => {
      const res = await this.http.post(this.scraperBuilderUrl, toFormBody(payload), { headers });

      const data = safeParseJson(res.data) as Record<string, unknown>;
      if (!data || typeof data !== "object") {
        throw new ThordataError("Invalid response from Scraper Builder API");
      }

      if ("code" in data && data.code !== 200) {
        raiseForCode("Task creation failed", data, res.status);
      }

      const taskId = (data?.data as Record<string, unknown>)?.task_id;
      if (!taskId) {
        throw new ThordataError("Task ID missing in response");
      }
      return String(taskId);
    });
  }

  private requirePublicCreds(): void {
    if (!this.publicToken || !this.publicKey) {
      throw new ThordataConfigError(
        "publicToken and publicKey are required for Web Scraper public API calls",
      );
    }
  }

  async getTaskStatus(taskId: string): Promise<string> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = { tasks_ids: taskId };

    return this.execute(async () => {
      const res = await this.http.post(this.scraperStatusUrl, toFormBody(payload), { headers });

      const data = safeParseJson(res.data) as Record<string, unknown>;
      if (data?.code === 200 && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (String(item.task_id) === String(taskId)) {
            return (item.status as string) ?? TaskStatus.UNKNOWN;
          }
        }
      }
      return TaskStatus.UNKNOWN;
    });
  }

  async getTaskResult(taskId: string, fileType: "json" | "csv" | "xlsx" = "json"): Promise<string> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = { tasks_id: taskId, type: fileType };

    return this.execute(async () => {
      const res = await this.http.post(this.scraperDownloadUrl, toFormBody(payload), { headers });

      const data = safeParseJson(res.data) as Record<string, unknown>;
      const dataObj = data?.data as Record<string, unknown>;
      if (data?.code === 200 && dataObj?.download) {
        return dataObj.download as string;
      }

      raiseForCode("Get task result failed", data, res.status);
    });
  }

  async createVideoTask(options: VideoTaskOptions): Promise<string> {
    this.requirePublicCreds();
    if (!this.scraperToken) {
      throw new ThordataConfigError("scraperToken is required for Task Builder");
    }
    const {
      fileName,
      spiderId,
      spiderName,
      parameters,
      commonSettings,
      includeErrors = true,
    } = options;

    const payload: Record<string, unknown> = {
      file_name: fileName,
      spider_id: spiderId,
      spider_name: spiderName,
      spider_parameters: JSON.stringify([parameters]),
      spider_errors: includeErrors ? "true" : "false",
      common_settings: JSON.stringify(commonSettings),
    };

    const headers = buildBuilderHeaders(this.scraperToken, this.publicToken, this.publicKey);

    return this.execute(async () => {
      const res = await this.http.post(this.videoBuilderUrl, toFormBody(payload), { headers });

      const data = safeParseJson(res.data) as Record<string, unknown>;
      if (!data || typeof data !== "object") {
        throw new ThordataError("Invalid response from Video Builder API");
      }

      if ("code" in data && data.code !== 200) {
        raiseForCode("Video task creation failed", data, res.status);
      }

      const taskId = (data?.data as Record<string, unknown>)?.task_id;
      if (!taskId) {
        throw new ThordataError("Task ID missing in response");
      }
      return String(taskId);
    });
  }

  async waitForTask(taskId: string, options: WaitForTaskOptions = {}): Promise<string> {
    const pollIntervalMs = options.pollIntervalMs ?? 5000;
    const maxWaitMs = options.maxWaitMs ?? 10 * 60 * 1000;
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      const status = await this.getTaskStatus(taskId);
      const lower = status.toLowerCase();

      if (
        lower === TaskStatus.READY ||
        lower === TaskStatus.SUCCESS ||
        lower === TaskStatus.FINISHED
      ) {
        return status;
      }

      if (
        lower === TaskStatus.FAILED ||
        lower === TaskStatus.ERROR ||
        lower === TaskStatus.CANCELLED
      ) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new ThordataTimeoutError(`Task ${taskId} did not complete within ${maxWaitMs} ms`);
  }

  // --------------------------
  // 4) Proxy Network
  // --------------------------

  /**
   * Make an HTTP request through a proxy.
   *
   * Supported proxy protocols:
   * - https:// (recommended, required by most accounts)
   * - socks5:// or socks5h:// (SOCKS5 with remote DNS)
   * - http:// (legacy, not supported by most Thordata accounts)
   *
   * For users in mainland China or behind corporate firewalls:
   * Set THORDATA_UPSTREAM_PROXY environment variable to route through local proxy.
   * Example: THORDATA_UPSTREAM_PROXY=socks5://127.0.0.1:7897
   */
  async request(
    url: string,
    config: { proxy?: Proxy; timeout?: number; [key: string]: unknown } = {},
  ): Promise<unknown> {
    if (!url) {
      throw new ThordataConfigError("url is required for request");
    }

    const { proxy, timeout, ...rest } = config;

    const axiosConfig: Record<string, unknown> = {
      ...rest,
      timeout: timeout ?? this.timeoutMs,
    };

    if (proxy instanceof Proxy) {
      const proxyUrl = proxy.toProxyUrl();

      // Disable axios default proxy logic
      axiosConfig.proxy = false;

      const parsedUrl = new URL(proxyUrl);
      const scheme = parsedUrl.protocol; // "http:" | "https:" | "socks5:" | "socks5h:"

      // Check for upstream proxy
      const upstream = parseUpstreamProxy();

      if (upstream) {
        // When upstream proxy is detected, we need proxy chaining
        // For Node.js, this is complex - we use a simplified approach:
        // The upstream proxy (e.g., Clash) should be set as system proxy
        console.warn(
          `[Thordata] Upstream proxy detected. For best results:\n` +
            `  1. Ensure Clash/V2Ray TUN mode is enabled, OR\n` +
            `  2. Set system proxy to ${upstream.protocol}://${upstream.host}:${upstream.port}`,
        );

        // For SOCKS5 upstream, we can use nested SOCKS proxy
        if (upstream.protocol.startsWith("socks") && scheme.startsWith("socks")) {
          // Both are SOCKS - use the Thordata proxy directly
          // (assuming upstream proxy is configured at system level)
          const agent = new SocksProxyAgent(proxyUrl, {
            timeout: Number(axiosConfig.timeout) || 30000,
          });
          axiosConfig.httpAgent = agent;
          axiosConfig.httpsAgent = agent;
        } else {
          // Mixed protocols or HTTP/HTTPS
          // Let system proxy handle the upstream connection
          if (scheme.startsWith("socks")) {
            const agent = new SocksProxyAgent(proxyUrl, {
              timeout: Number(axiosConfig.timeout) || 30000,
              keepAlive: true,
            });
            axiosConfig.httpAgent = agent;
            axiosConfig.httpsAgent = agent;
          } else if (scheme === "https:") {
            const agent = new HttpsProxyAgent(proxyUrl);
            axiosConfig.httpAgent = agent;
            axiosConfig.httpsAgent = agent;
          } else {
            const agent = new HttpProxyAgent(proxyUrl);
            axiosConfig.httpAgent = agent;
            axiosConfig.httpsAgent = agent;
          }
        }
      } else {
        // No upstream proxy - direct connection to Thordata proxy
        if (scheme.startsWith("socks")) {
          const agent = new SocksProxyAgent(proxyUrl, {
            timeout: Number(axiosConfig.timeout) || 30000,
            keepAlive: true,
          });
          axiosConfig.httpAgent = agent;
          axiosConfig.httpsAgent = agent;
        } else if (scheme === "https:") {
          const agent = new HttpsProxyAgent(proxyUrl);
          axiosConfig.httpAgent = agent;
          axiosConfig.httpsAgent = agent;
        } else {
          const agent = new HttpProxyAgent(proxyUrl);
          axiosConfig.httpAgent = agent;
          axiosConfig.httpsAgent = agent;
        }
      }
    }

    return this.execute(async () => {
      const res = await this.http.get(url, axiosConfig);
      return res.data;
    });
  }

  // --- Task List ---

  async listTasks(page = 1, size = 20): Promise<{ count: number; list: any[] }> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = { page: String(page), size: String(size) };

    return this.execute(async () => {
      const res = await this.http.post(this.taskListUrl, toFormBody(payload), { headers });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("List tasks failed", data, res.status);
      return data.data ?? { count: 0, list: [] };
    });
  }

  // --- Usage Stats ---

  async getUsageStatistics(fromDate: string, toDate: string): Promise<UsageStatistics> {
    this.requirePublicCreds();
    const params = {
      token: this.publicToken!,
      key: this.publicKey!,
      from_date: fromDate,
      to_date: toDate,
    };

    return this.execute(async () => {
      const res = await this.http.get(this.usageStatsUrl, { params });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("Usage stats failed", data, res.status);
      return (data.data ?? data) as UsageStatistics;
    });
  }

  // --- Proxy Users ---

  async listProxyUsers(proxyType: ProxyTypeParam = "residential"): Promise<ProxyUserList> {
    this.requirePublicCreds();
    const params = {
      token: this.publicToken!,
      key: this.publicKey!,
      proxy_type: normalizeProxyType(proxyType),
    };

    return this.execute(async () => {
      const res = await this.http.get(`${this.proxyUsersUrl}/user-list`, { params });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("List proxy users failed", data, res.status);
      return (data.data ?? data) as ProxyUserList;
    });
  }

  async createProxyUser(
    username: string,
    pass: string,
    trafficLimit = 0,
    status = true,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<any> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = {
      username,
      password: pass,
      traffic_limit: String(trafficLimit),
      status: status ? "true" : "false",
      proxy_type: String(normalizeProxyType(proxyType)),
    };

    return this.execute(async () => {
      const res = await this.http.post(`${this.proxyUsersUrl}/create-user`, toFormBody(payload), {
        headers,
      });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("Create proxy user failed", data, res.status);
      return data.data ?? {};
    });
  }

  // --- Whitelist IP ---

  async addWhitelistIp(
    ip: string,
    status = true,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<any> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = {
      ip,
      status: status ? "true" : "false",
      proxy_type: String(normalizeProxyType(proxyType)),
    };

    return this.execute(async () => {
      const res = await this.http.post(`${this.whitelistUrl}/add-ip`, toFormBody(payload), {
        headers,
      });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("Add whitelist IP failed", data, res.status);
      return data.data ?? {};
    });
  }

  // --- Proxy List ---

  async listProxyServers(proxyType: 1 | 2): Promise<ProxyServer[]> {
    this.requirePublicCreds();
    const params = {
      token: this.publicToken!,
      key: this.publicKey!,
      proxy_type: proxyType,
    };

    return this.execute(async () => {
      const res = await this.http.get(this.proxyListUrl, { params });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("List proxy servers failed", data, res.status);
      return (data.data ?? data.list ?? []) as ProxyServer[];
    });
  }

  async getProxyExpiration(
    ips: string | string[],
    proxyType: 1 | 2,
  ): Promise<Record<string, unknown>> {
    this.requirePublicCreds();
    const ipStr = Array.isArray(ips) ? ips.join(",") : ips;

    const params = {
      token: this.publicToken!,
      key: this.publicKey!,
      proxy_type: proxyType,
      ips: ipStr,
    };

    return this.execute(async () => {
      const res = await this.http.get(this.proxyExpirationUrl, { params });
      const data = safeParseJson(res.data) as any;
      if (data?.code !== 200) raiseForCode("Get proxy expiration failed", data, res.status);
      return data.data ?? data;
    });
  }

  // --------------------------
  // 5) Location API
  // --------------------------

  private async getLocations(
    endpoint: string,
    params: Record<string, string | number> = {},
  ): Promise<unknown[]> {
    this.requirePublicCreds();

    const queryParams = new URLSearchParams({
      token: this.publicToken!,
      key: this.publicKey!,
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    });

    const url = `${this.baseUrls.locationsBaseUrl}/${endpoint}?${queryParams.toString()}`;

    return this.execute(async () => {
      const res = await this.http.get(url);
      const data = safeParseJson(res.data) as Record<string, unknown>;

      if (data?.code === 200 && Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }

      raiseForCode(`Location API (${endpoint}) failed`, data, res.status);
    });
  }

  async listCountries(proxyType: ProxyTypeParam = "residential"): Promise<CountryInfo[]> {
    return this.getLocations("countries", {
      proxy_type: normalizeProxyType(proxyType),
    }) as Promise<CountryInfo[]>;
  }

  async listStates(
    countryCode: string,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<StateInfo[]> {
    return this.getLocations("states", {
      proxy_type: normalizeProxyType(proxyType),
      country_code: countryCode.toUpperCase(),
    }) as Promise<StateInfo[]>;
  }

  async listCities(
    countryCode: string,
    stateCode?: string,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<CityInfo[]> {
    const params: Record<string, string | number> = {
      proxy_type: normalizeProxyType(proxyType),
      country_code: countryCode.toUpperCase(),
    };
    if (stateCode) {
      params.state_code = stateCode.toLowerCase();
    }
    return this.getLocations("cities", params) as Promise<CityInfo[]>;
  }

  async listAsns(
    countryCode: string,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<AsnInfo[]> {
    return this.getLocations("asn", {
      proxy_type: normalizeProxyType(proxyType),
      country_code: countryCode.toUpperCase(),
    }) as Promise<AsnInfo[]>;
  }
}
