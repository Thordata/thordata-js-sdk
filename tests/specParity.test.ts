import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";
import { ProxyPort } from "../src/enums.js";

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
