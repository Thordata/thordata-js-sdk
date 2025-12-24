export type ThordataBaseUrls = {
  scraperapiBaseUrl: string;
  universalapiBaseUrl: string;
  webScraperApiBaseUrl: string;
  locationsBaseUrl: string;
};

export function resolveBaseUrls(
  env: Record<string, string | undefined>,
  overrides?: Partial<ThordataBaseUrls>,
): ThordataBaseUrls {
  const scraperapiBaseUrl =
    overrides?.scraperapiBaseUrl ??
    env.THORDATA_SCRAPERAPI_BASE_URL ??
    "https://scraperapi.thordata.com";

  const universalapiBaseUrl =
    overrides?.universalapiBaseUrl ??
    env.THORDATA_UNIVERSALAPI_BASE_URL ??
    "https://universalapi.thordata.com";

  const webScraperApiBaseUrl =
    overrides?.webScraperApiBaseUrl ??
    env.THORDATA_WEB_SCRAPER_API_BASE_URL ??
    "https://openapi.thordata.com/api/web-scraper-api";

  const locationsBaseUrl =
    overrides?.locationsBaseUrl ??
    env.THORDATA_LOCATIONS_BASE_URL ??
    "https://openapi.thordata.com/api/locations";

  return {
    scraperapiBaseUrl: scraperapiBaseUrl.replace(/\/+$/, ""),
    universalapiBaseUrl: universalapiBaseUrl.replace(/\/+$/, ""),
    webScraperApiBaseUrl: webScraperApiBaseUrl.replace(/\/+$/, ""),
    locationsBaseUrl: locationsBaseUrl.replace(/\/+$/, ""),
  };
}
