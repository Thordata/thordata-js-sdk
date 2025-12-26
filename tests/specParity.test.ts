// tests/specParity.test.ts

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

  expect(ProxyPort.RESIDENTIAL).toBe(Number(products.residential.port));
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

// 新结构测试
test("auth: SERP/Universal auth requirements", () => {
  const spec = loadSpec();

  // 检查新的 auth 结构
  expect(spec.auth.apiAuth.serp.required).toContain("scraperToken");
  expect(spec.auth.apiAuth.universal.required).toContain("scraperToken");

  // SDK behavior checks
  const h = buildAuthHeaders("SCRAPER_TOKEN");
  expect(h.token).toBe("SCRAPER_TOKEN");
  expect(h.Authorization).toBe("Bearer SCRAPER_TOKEN");
});

test("auth: Web Scraper builder auth requirements", () => {
  const spec = loadSpec();

  // 检查新的 auth 结构
  expect(spec.auth.apiAuth.builder.required).toContain("scraperToken");
  expect(spec.auth.apiAuth.builder.required).toContain("publicToken");
  expect(spec.auth.apiAuth.builder.required).toContain("publicKey");

  const h = buildBuilderHeaders("SCRAPER_TOKEN", "PUBLIC_TOKEN", "PUBLIC_KEY");
  expect(h.token).toBe("PUBLIC_TOKEN");
  expect(h.key).toBe("PUBLIC_KEY");
  expect(h.Authorization).toBe("Bearer SCRAPER_TOKEN");
});

test("auth: Web Scraper public endpoints auth requirements", () => {
  const spec = loadSpec();

  // 检查新的 auth 结构
  expect(spec.auth.apiAuth.tasksStatus.required).toContain("publicToken");
  expect(spec.auth.apiAuth.tasksStatus.required).toContain("publicKey");

  const h = buildPublicHeaders("PUBLIC_TOKEN", "PUBLIC_KEY");
  expect(h.token).toBe("PUBLIC_TOKEN");
  expect(h.key).toBe("PUBLIC_KEY");
});
