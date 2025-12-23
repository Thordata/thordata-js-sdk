// src/client.ts

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
} from "./models.js";
import { ThordataError, ThordataTimeoutError, ThordataConfigError } from "./errors.js";
import {
  buildAuthHeaders,
  buildPublicHeaders,
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
  /** API token for SERP and Universal APIs */
  scraperToken: string;
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
  /**
   * Whether to verify SSL certificates (default: true).
   * Set to false only for testing with self-signed certificates.
   */
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

  constructor(config: ThordataClientConfig) {
    if (!config.scraperToken) {
      throw new ThordataConfigError("scraperToken is required");
    }

    this.scraperToken = config.scraperToken;
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

    const pkgVersion = (process.env.npm_package_version as string) || "0.0.0";
    this.userAgent = config.userAgent ?? buildUserAgent(pkgVersion);

    this.http.defaults.headers.common["User-Agent"] = this.userAgent;
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
   *
   * Supported engines: google, bing, yandex, duckduckgo
   * Plus Google specialized engines: google_news, google_shopping, etc.
   *
   * @example
   * ```typescript
   * // Basic Google search
   * const results = await client.serpSearch({
   *   query: "pizza",
   *   engine: Engine.GOOGLE,
   *   country: "us",
   * });
   *
   * // Google News (recommended: use dedicated engine)
   * const news = await client.serpSearch({
   *   query: "AI regulation",
   *   engine: Engine.GOOGLE_NEWS,
   * });
   * ```
   */
  async serpSearch(options: SerpOptions): Promise<Record<string, unknown>> {
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

    // Yandex uses 'text' instead of 'q'
    if (engineStr === "yandex") {
      payload.text = query;
    } else {
      payload.q = query;
    }

    if (num !== undefined) payload.num = String(num);
    if (start !== undefined) payload.start = String(start);
    if (country) payload.gl = country.toLowerCase();
    if (language) payload.hl = language.toLowerCase();

    // tbm parameter (only for specific Google engines)
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
   *
   * @example
   * ```typescript
   * // Basic HTML scraping
   * const html = await client.universalScrape({
   *   url: "https://example.com",
   *   jsRender: false,
   * });
   *
   * // With JS rendering and wait for element
   * const html = await client.universalScrape({
   *   url: "https://example.com/spa",
   *   jsRender: true,
   *   waitFor: ".main-content",
   * });
   *
   * // Screenshot
   * const png = await client.universalScrape({
   *   url: "https://example.com",
   *   jsRender: true,
   *   outputFormat: "png",
   * });
   * ```
   */
  async universalScrape(
    options: UniversalOptions,
  ): Promise<string | Buffer | Record<string, unknown>> {
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

    // Validate output format
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

      // Return HTML string
      if (data && typeof data === "object" && "html" in data) {
        return (data as Record<string, unknown>).html as string;
      }

      return typeof data === "string" ? data : JSON.stringify(data);
    });
  }

  // --------------------------
  // 3) Web Scraper API
  // --------------------------

  /**
   * Create a new Web Scraper task.
   */
  async createScraperTask(options: ScraperTaskOptions): Promise<string> {
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

    const headers = buildAuthHeaders(this.scraperToken);

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

  /**
   * Verify that public credentials are available.
   */
  private requirePublicCreds(): void {
    if (!this.publicToken || !this.publicKey) {
      throw new ThordataConfigError(
        "publicToken and publicKey are required for Web Scraper public API calls",
      );
    }
  }

  /**
   * Get the status of a Web Scraper task.
   */
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

  /**
   * Get the download URL for a completed task's results.
   */
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

  /**
   * Wait for a task to complete.
   */
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
      axiosConfig.proxy = proxy.toAxiosConfig();
    }

    return this.execute(async () => {
      const res = await this.http.get(url, axiosConfig);
      return res.data;
    });
  }

  // --------------------------
  // 5) Location API
  // --------------------------

  /**
   * Internal method to call locations API.
   */
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

  /**
   * List all supported countries for a proxy type.
   */
  async listCountries(proxyType: ProxyTypeParam = "residential"): Promise<CountryInfo[]> {
    return this.getLocations("countries", {
      proxy_type: normalizeProxyType(proxyType),
    }) as Promise<CountryInfo[]>;
  }

  /**
   * List states/regions for a country.
   */
  async listStates(
    countryCode: string,
    proxyType: ProxyTypeParam = "residential",
  ): Promise<StateInfo[]> {
    return this.getLocations("states", {
      proxy_type: normalizeProxyType(proxyType),
      country_code: countryCode.toUpperCase(),
    }) as Promise<StateInfo[]>;
  }

  /**
   * List cities for a country (and optionally state).
   */
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

  /**
   * List ASNs for a country.
   */
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
