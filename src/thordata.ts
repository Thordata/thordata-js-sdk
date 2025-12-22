// src/thordata.ts

import { ThordataClient, ThordataClientConfig } from "./client.js";
import { ThordataConfigError } from "./errors.js";
import { Proxy } from "./proxy.js";

/**
 * Convenience wrapper for ThordataClient with automatic environment variable loading.
 */
export class Thordata extends ThordataClient {
  constructor(tokenOrConfig?: string | Partial<ThordataClientConfig>) {
    let config: ThordataClientConfig;

    if (typeof tokenOrConfig === "string") {
      config = {
        scraperToken: tokenOrConfig,
        publicToken: process.env.THORDATA_PUBLIC_TOKEN,
        publicKey: process.env.THORDATA_PUBLIC_KEY,
      };
    } else if (tokenOrConfig && typeof tokenOrConfig === "object") {
      const token = tokenOrConfig.scraperToken || process.env.THORDATA_SCRAPER_TOKEN;

      if (!token) {
        throw new ThordataConfigError(
          "Thordata token not provided. Pass it in config or set THORDATA_SCRAPER_TOKEN environment variable.",
        );
      }

      config = {
        ...tokenOrConfig,
        scraperToken: token,
        publicToken: tokenOrConfig.publicToken || process.env.THORDATA_PUBLIC_TOKEN,
        publicKey: tokenOrConfig.publicKey || process.env.THORDATA_PUBLIC_KEY,
      };
    } else {
      const token = process.env.THORDATA_SCRAPER_TOKEN;

      if (!token) {
        throw new ThordataConfigError(
          "Thordata token not provided. Pass it to constructor or set THORDATA_SCRAPER_TOKEN environment variable.",
        );
      }

      config = {
        scraperToken: token,
        publicToken: process.env.THORDATA_PUBLIC_TOKEN,
        publicKey: process.env.THORDATA_PUBLIC_KEY,
      };
    }

    super(config);
  }

  static Proxy = Proxy;
}

export default Thordata;
