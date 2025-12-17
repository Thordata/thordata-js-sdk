// src/client.ts

import axios, { AxiosInstance } from "axios";
import { Engine, TaskStatus } from "./enums";
import {
  SerpOptions,
  UniversalOptions,
  ScraperTaskOptions,
  WaitForTaskOptions,
  ProxyConfig,
} from "./models";
import { ThordataError, ThordataTimeoutError } from "./errors";
import {
  buildAuthHeaders,
  buildPublicHeaders,
  handleAxiosError,
  toFormBody,
  raiseForCode,
  safeParseJson,
  withRetry,
} from "./utils";

export interface ThordataClientConfig {
  scraperToken: string;
  publicToken?: string;
  publicKey?: string;
  timeoutMs?: number;
  maxRetries?: number; // Maximum number of retries
}

export class ThordataClient {
  private scraperToken: string;
  private publicToken?: string;
  private publicKey?: string;
  private timeoutMs: number;
  private maxRetries: number;
  private http: AxiosInstance;

  private serpUrl = "https://scraperapi.thordata.com/request";
  private universalUrl = "https://universalapi.thordata.com/request";
  private scraperBuilderUrl = "https://scraperapi.thordata.com/builder";
  private scraperStatusUrl =
    "https://api.thordata.com/api/web-scraper-api/tasks-status";
  private scraperDownloadUrl =
    "https://api.thordata.com/api/web-scraper-api/tasks-download";

  constructor(config: ThordataClientConfig) {
    if (!config.scraperToken) {
      throw new ThordataError("scraperToken is required");
    }
    this.scraperToken = config.scraperToken;
    this.publicToken = config.publicToken;
    this.publicKey = config.publicKey;
    this.timeoutMs = config.timeoutMs ?? 30000;
    this.maxRetries = config.maxRetries ?? 0; // Default: no retry

    this.http = axios.create({
      timeout: this.timeoutMs,
    });
  }

  /**
   * Internal helper to execute request with retry logic
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

  async serpSearch(options: SerpOptions): Promise<any> {
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
      throw new ThordataError("query is required for serpSearch");
    }

    const engineStr = String(engine).toLowerCase();

    const payload: Record<string, any> = {
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

    if (searchType) {
      const st = searchType.toLowerCase();
      const tbmMap: Record<string, string> = {
        images: "isch",
        shopping: "shop",
        news: "nws",
        videos: "vid",
      };
      payload.tbm = tbmMap[st] ?? st;
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
        if (res.data && typeof res.data === "object" && "html" in res.data)
          return res.data;
        return { html: String(res.data) };
      }

      const data = safeParseJson(res.data);
      if (
        data &&
        typeof data === "object" &&
        "code" in data &&
        data.code !== 200
      ) {
        raiseForCode("SERP API error", data, res.status);
      }
      return data;
    });
  }

  // --------------------------
  // 2) Universal / Web Unlocker
  // --------------------------

  async universalScrape(options: UniversalOptions): Promise<string | Buffer> {
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
      throw new ThordataError("url is required for universalScrape");
    }

    const payload: Record<string, any> = {
      url,
      js_render: jsRender ? "True" : "False",
      type: outputFormat.toLowerCase(),
    };

    if (country) payload.country = country.toLowerCase();
    if (blockResources) payload.block_resources = blockResources;
    if (cleanContent) payload.clean_content = cleanContent;
    if (wait !== undefined) payload.wait = String(wait);
    if (waitFor) payload.wait_for = waitFor;
    if (customHeaders && customHeaders.length > 0)
      payload.headers = JSON.stringify(customHeaders);
    if (cookies && cookies.length > 0)
      payload.cookies = JSON.stringify(cookies);

    Object.assign(payload, extra);

    const headers = buildAuthHeaders(this.scraperToken);

    return this.execute(async () => {
      const res = await this.http.post(this.universalUrl, toFormBody(payload), {
        headers,
        responseType:
          outputFormat.toLowerCase() === "png" ? "arraybuffer" : "json",
      });

      if (outputFormat.toLowerCase() === "png") {
        return Buffer.from(res.data);
      }

      const data = safeParseJson(res.data);

      if (
        data &&
        typeof data === "object" &&
        "code" in data &&
        data.code !== 200
      ) {
        raiseForCode("Universal API error", data, res.status);
      }

      if (outputFormat.toLowerCase() === "json") {
        return data;
      }

      if (data && typeof data === "object" && "html" in data) {
        return (data as any).html as string;
      }

      return typeof data === "string" ? data : JSON.stringify(data);
    });
  }

  // --------------------------
  // 3) Web Scraper API
  // --------------------------

  async createScraperTask(options: ScraperTaskOptions): Promise<string> {
    const {
      fileName,
      spiderId,
      spiderName,
      parameters,
      universalParams,
      includeErrors = true,
    } = options;

    const payload: Record<string, any> = {
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
      const res = await this.http.post(
        this.scraperBuilderUrl,
        toFormBody(payload),
        { headers }
      );

      const data = safeParseJson(res.data);
      if (!data || typeof data !== "object") {
        throw new ThordataError("Invalid response from Scraper Builder API");
      }

      if ("code" in data && data.code !== 200) {
        raiseForCode("Task creation failed", data, res.status);
      }

      const taskId = data?.data?.task_id;
      if (!taskId) {
        throw new ThordataError("Task ID missing in response");
      }
      return String(taskId);
    });
  }

  private requirePublicCreds(): void {
    if (!this.publicToken || !this.publicKey) {
      throw new ThordataError(
        "publicToken and publicKey are required for Web Scraper public API calls"
      );
    }
  }

  async getTaskStatus(taskId: string): Promise<string> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = { tasks_ids: taskId };

    return this.execute(async () => {
      const res = await this.http.post(
        this.scraperStatusUrl,
        toFormBody(payload),
        { headers }
      );

      const data = safeParseJson(res.data);
      if (data?.code === 200 && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (String(item.task_id) === String(taskId)) {
            return item.status ?? TaskStatus.UNKNOWN;
          }
        }
      }
      return TaskStatus.UNKNOWN;
    });
  }

  async getTaskResult(
    taskId: string,
    fileType: "json" | "csv" | "xlsx" = "json"
  ): Promise<string> {
    this.requirePublicCreds();
    const headers = buildPublicHeaders(this.publicToken!, this.publicKey!);
    const payload = { tasks_id: taskId, type: fileType };

    return this.execute(async () => {
      const res = await this.http.post(
        this.scraperDownloadUrl,
        toFormBody(payload),
        { headers }
      );

      const data = safeParseJson(res.data);
      if (data?.code === 200 && data?.data?.download) {
        return data.data.download as string;
      }

      raiseForCode("Get task result failed", data, res.status);
      return ""; // unreachable
    });
  }

  async waitForTask(
    taskId: string,
    options: WaitForTaskOptions = {}
  ): Promise<string> {
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

    throw new ThordataTimeoutError(
      `Task ${taskId} did not complete within ${maxWaitMs} ms`
    );
  }

  // --------------------------
  // 4) Proxy Network
  // --------------------------

  async requestViaProxy(
    url: string,
    proxyConfig: ProxyConfig,
    axiosConfig: Record<string, any> = {}
  ): Promise<any> {
    if (!url) {
      throw new ThordataError("url is required for requestViaProxy");
    }

    return this.execute(async () => {
      const res = await this.http.get(url, {
        ...axiosConfig,
        proxy: proxyConfig.toAxiosProxyConfig(),
      });
      return res.data;
    });
  }
}