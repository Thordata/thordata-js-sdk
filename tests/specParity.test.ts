import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";
import { ProxyPort } from "../src/enums.js";
import { buildAuthHeaders, buildPublicHeaders, buildBuilderHeaders } from "../src/utils.js";

function loadSpec(): any {
  const envPath = process.env.THORDATA_SDK_SPEC_PATH;
  const path = envPath ? envPath : resolve(process.cwd(), "sdk-spec", "v1.json");
  return JSON.parse(readFileSync(path, "utf-8"));
}

test("spec proxy ports match JS enums", () => {
  const spec = loadSpec();
  const products = spec.proxy.products;

  expect(ProxyPort.DEFAULT).toBe(Number(products.residential.port));
  expect(ProxyPort.MOBILE).toBe(Number(products.mobile.port));
  expect(ProxyPort.DATACENTER).toBe(Number(products.datacenter.port));
  expect(ProxyPort.ISP).toBe(Number(products.isp.port));
});

test("spec serp searchType mapping exists", () => {
  const spec = loadSpec();
  const map = spec.serp.mappings.searchTypeToTbm;

  expect(map.news).toBe("nws");
  expect(map.images).toBe("isch");
  expect(map.shopping).toBe("shop");
  expect(map.videos).toBe("vid");
});

test("spec must include auth rules", () => {
  const spec = loadSpec();
  expect(spec.auth).toBeTruthy();
  expect(typeof spec.auth).toBe("object");
});

test("auth: SERP/Universal use scraper token in `token` header (and Authorization bearer for compatibility)", () => {
  const spec = loadSpec();

  // Spec contract checks (keep these strict to avoid spec drift)
  expect(spec.auth.serp.headers.token).toBe("scraperToken");
  expect(spec.auth.universal.headers.token).toBe("scraperToken");

  // SDK behavior checks
  const h = buildAuthHeaders("SCRAPER_TOKEN");
  expect(h.token).toBe("SCRAPER_TOKEN");
  expect(h.Authorization).toBe("Bearer SCRAPER_TOKEN");
});

test("auth: Web Scraper builder must include public token/key + scraper Authorization", () => {
  const spec = loadSpec();

  expect(spec.auth.webScraper.builder.headers.token).toBe("publicToken");
  expect(spec.auth.webScraper.builder.headers.key).toBe("publicKey");
  expect(spec.auth.webScraper.builder.headers.AuthorizationBearer).toBe("scraperToken");

  const h = buildBuilderHeaders("SCRAPER_TOKEN", "PUBLIC_TOKEN", "PUBLIC_KEY");
  expect(h.token).toBe("PUBLIC_TOKEN");
  expect(h.key).toBe("PUBLIC_KEY");
  expect(h.Authorization).toBe("Bearer SCRAPER_TOKEN");
});

test("auth: Web Scraper public endpoints use public token/key", () => {
  const spec = loadSpec();

  expect(spec.auth.webScraper.status.headers.token).toBe("publicToken");
  expect(spec.auth.webScraper.status.headers.key).toBe("publicKey");

  const h = buildPublicHeaders("PUBLIC_TOKEN", "PUBLIC_KEY");
  expect(h.token).toBe("PUBLIC_TOKEN");
  expect(h.key).toBe("PUBLIC_KEY");
});
