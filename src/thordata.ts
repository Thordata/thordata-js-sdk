// src/thordata.ts
import { ThordataClient } from "./client.js";
import { Proxy } from "./proxy.js";

export class Thordata extends ThordataClient {
  constructor(token?: string) {
    const finalToken = token || process.env.THORDATA_TOKEN || process.env.THORDATA_SCRAPER_TOKEN;

    if (!finalToken) {
      throw new Error(
        "Thordata token not provided. Pass it to constructor or set THORDATA_TOKEN environment variable.",
      );
    }

    super({ scraperToken: finalToken });
  }

  // Expose Proxy class for easy access
  static Proxy = Proxy;
}

export default Thordata;
