import type { ThordataClient } from "../client.js";

/**
 * Browser namespace for managing remote browser connections.
 *
 * This provides connection URLs for Playwright/Puppeteer integration.
 * Note: Node.js users typically prefer Playwright/Puppeteer for browser automation.
 */
export class BrowserNamespace {
  constructor(private client: ThordataClient) {}

  /**
   * Get the WebSocket connection URL for remote browser.
   *
   * This URL can be used with Playwright or Puppeteer to connect to Thordata's
   * remote browser infrastructure.
   *
   * @example
   * ```typescript
   * const browserUrl = thordata.browser.getConnectionUrl();
   *
   * // Using with Playwright
   * const browser = await chromium.connectOverCDP(browserUrl);
   *
   * // Using with Puppeteer
   * const browser = await puppeteer.connect({
   *   browserWSEndpoint: browserUrl,
   * });
   * ```
   *
   * @param username Optional browser username (defaults to env THORDATA_BROWSER_USERNAME)
   * @param password Optional browser password (defaults to env THORDATA_BROWSER_PASSWORD)
   * @returns WebSocket URL for browser connection
   */
  getConnectionUrl(username?: string, password?: string): string {
    return this.client.getBrowserConnectionUrl(username, password);
  }

  /**
   * Build browser connection URL from credentials object.
   *
   * @param credentials Browser credentials
   * @returns WebSocket URL for browser connection
   */
  buildConnectionUrl(credentials: { username: string; password: string }): string {
    return this.client.getBrowserConnectionUrl(credentials.username, credentials.password);
  }
}
