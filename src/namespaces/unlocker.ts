import type { ThordataClient } from "../client.js";
import type { UniversalOptions } from "../models.js";

export class UnlockerNamespace {
  constructor(private client: ThordataClient) {}

  scrape(options: UniversalOptions): Promise<string | Buffer | Record<string, unknown>> {
    return this.client.universalScrape(options);
  }
}
