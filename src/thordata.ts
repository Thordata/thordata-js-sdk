// src/thordata.ts

import { ThordataClient, type ThordataClientConfig } from "./client.js";
import { ThordataConfigError } from "./errors.js";
import { Proxy } from "./proxy.js";

export type ThordataConfig = Partial<ThordataClientConfig> & {
  scraperToken?: string;
  publicToken?: string;
  publicKey?: string;
};

export class Thordata {
  readonly client: ThordataClient;

  readonly serp: ThordataClient["serp"];
  readonly unlocker: ThordataClient["unlocker"];
  readonly scraperTasks: ThordataClient["scraperTasks"];
  readonly publicApi: ThordataClient["publicApi"];
  readonly proxy: ThordataClient["proxy"];
  readonly browser: ThordataClient["browser"];

  static Proxy = Proxy;

  constructor(tokenOrConfig?: string | ThordataConfig) {
    const config = Thordata.resolveConfig(tokenOrConfig);
    this.client = new ThordataClient(config);

    this.serp = this.client.serp;
    this.unlocker = this.client.unlocker;
    this.scraperTasks = this.client.scraperTasks;
    this.publicApi = this.client.publicApi;
    this.proxy = this.client.proxy;
    this.browser = this.client.browser;
  }

  private static resolveConfig(tokenOrConfig?: string | ThordataConfig): ThordataClientConfig {
    if (typeof tokenOrConfig === "string") {
      const token = tokenOrConfig.trim();
      if (!token) {
        throw new ThordataConfigError("Thordata token not provided.");
      }
      return {
        scraperToken: token,
        publicToken: process.env.THORDATA_PUBLIC_TOKEN,
        publicKey: process.env.THORDATA_PUBLIC_KEY,
      };
    }

    if (tokenOrConfig && typeof tokenOrConfig === "object") {
      return {
        ...tokenOrConfig,
        scraperToken: tokenOrConfig.scraperToken || process.env.THORDATA_SCRAPER_TOKEN,
        publicToken: tokenOrConfig.publicToken || process.env.THORDATA_PUBLIC_TOKEN,
        publicKey: tokenOrConfig.publicKey || process.env.THORDATA_PUBLIC_KEY,
      } as ThordataClientConfig;
    }

    return {
      scraperToken: process.env.THORDATA_SCRAPER_TOKEN,
      publicToken: process.env.THORDATA_PUBLIC_TOKEN,
      publicKey: process.env.THORDATA_PUBLIC_KEY,
    };
  }
}
