// src/auth.ts

export type Headers = Record<string, string>;

export interface Credentials {
  scraperToken: string;
  publicToken?: string;
  publicKey?: string;
}

/**
 * Build headers for SERP/Universal scraping APIs.
 * Docs require a `token` header (Account Settings token).
 * Some docs/examples also use `Authorization: Bearer ...`, so we send both for compatibility.
 */
export function buildScraperHeaders(creds: Credentials): Headers {
  if (!creds.scraperToken) {
    throw new Error("scraperToken is required");
  }

  return {
    token: creds.scraperToken,
    Authorization: `Bearer ${creds.scraperToken}`,
  };
}

/**
 * Build headers for Public APIs (Web Scraper task status/download/list, etc.).
 * These APIs require `token` + `key` from Dashboard -> My Account.
 */
export function buildPublicHeaders(creds: Credentials): Headers {
  if (!creds.publicToken || !creds.publicKey) {
    throw new Error("publicToken and publicKey are required");
  }

  return {
    token: creds.publicToken,
    key: creds.publicKey,
  };
}

/**
 * Build headers for Web Scraper builder endpoint.
 * Interface docs require `token` + `key` (My Account) AND `Authorization: Bearer ...` (scraper token).
 */
export function buildBuilderHeaders(creds: Credentials): Headers {
  return {
    ...buildPublicHeaders(creds),
    Authorization: `Bearer ${creds.scraperToken}`,
  };
}
