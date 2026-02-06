import type { ThordataClient } from "../client.js";
import type { Proxy as ProxyModel } from "../proxy.js";

export interface ProxyRequestConfig {
  proxy?: ProxyModel;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  responseType?: "json" | "text" | "arraybuffer";
  [key: string]: unknown;
}

export class ProxyNamespace {
  constructor(private client: ThordataClient) {}

  /**
   * 通过代理发起 HTTP 请求。
   *
   * - 推荐协议：https、socks5h
   * - Node.js 不保证 TLS-in-TLS 的所有高级用法；如需复杂代理链，建议结合成熟 agent/本地 TUN。
   */
  request(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.request(url, config);
  }

  /**
   * 通过代理发起 GET 请求。
   */
  get(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("GET", url, config as ProxyRequestConfig);
  }

  /**
   * 通过代理发起 POST 请求。
   */
  post(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("POST", url, config);
  }

  /**
   * 通过代理发起 PUT 请求。
   */
  put(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("PUT", url, config);
  }

  /**
   * 通过代理发起 DELETE 请求。
   */
  delete(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("DELETE", url, config as ProxyRequestConfig);
  }

  /**
   * 通过代理发起 PATCH 请求。
   */
  patch(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("PATCH", url, config);
  }

  /**
   * 通过代理发起 HEAD 请求。
   */
  head(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("HEAD", url, config as ProxyRequestConfig);
  }

  /**
   * 通过代理发起 OPTIONS 请求。
   */
  options(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("OPTIONS", url, config as ProxyRequestConfig);
  }
}
