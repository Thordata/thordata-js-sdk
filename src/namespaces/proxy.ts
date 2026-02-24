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
   * Perform an HTTP request through the Thordata proxy network.
   *
   * - Recommended protocols: https, socks5h
   * - Node.js does not guarantee support for every advanced TLS-in-TLS pattern;
   *   for very complex proxy chains, prefer a dedicated proxy agent or system‑level TUN.
   */
  request(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.request(url, config);
  }

  /**
   * Perform a GET request through the proxy.
   */
  get(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("GET", url, config as ProxyRequestConfig);
  }

  /**
   * Perform a POST request through the proxy.
   */
  post(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("POST", url, config);
  }

  /**
   * Perform a PUT request through the proxy.
   */
  put(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("PUT", url, config);
  }

  /**
   * Perform a DELETE request through the proxy.
   */
  delete(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("DELETE", url, config as ProxyRequestConfig);
  }

  /**
   * Perform a PATCH request through the proxy.
   */
  patch(url: string, config: ProxyRequestConfig = {}): Promise<unknown> {
    return this.client.proxyRequest("PATCH", url, config);
  }

  /**
   * Perform a HEAD request through the proxy.
   */
  head(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("HEAD", url, config as ProxyRequestConfig);
  }

  /**
   * Perform an OPTIONS request through the proxy.
   */
  options(url: string, config: Omit<ProxyRequestConfig, "data"> = {}): Promise<unknown> {
    return this.client.proxyRequest("OPTIONS", url, config as ProxyRequestConfig);
  }
}
