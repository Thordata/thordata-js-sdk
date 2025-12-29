import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThordataClient } from "../src/client.js";
import { ThordataAuthError } from "../src/errors.js";

describe("SERP offline (axios)", () => {
  const _envKeys = [
    // base url overrides
    "THORDATA_SCRAPERAPI_BASE_URL",
    "THORDATA_UNIVERSALAPI_BASE_URL",
    "THORDATA_WEB_SCRAPER_API_BASE_URL",
    "THORDATA_LOCATIONS_BASE_URL",

    // proxy envs that can break offline tests (axios may read these)
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "NO_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
    "no_proxy",
  ] as const;

  const _envBackup: Record<string, string | undefined> = Object.fromEntries(
    _envKeys.map((k) => [k, process.env[k]]),
  );

  beforeEach(() => {
    // Force offline tests to be deterministic (no env proxy / no baseUrl env)
    for (const k of _envKeys) delete process.env[k];
  });

  afterEach(() => {
    // restore env
    for (const k of _envKeys) {
      const v = _envBackup[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }

    // existing cleanup
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("returns data on code=200", async () => {
    nock.disableNetConnect();

    nock("https://scraperapi.thordata.com").post("/request").reply(200, { code: 200, organic: [] });

    const client = new ThordataClient({ scraperToken: "dummy" });
    const data = await client.serpSearch({ query: "pizza", engine: "google", num: 1 });

    expect(data.code).toBe(200);
    expect(Array.isArray(data.organic)).toBe(true);
  });

  it("throws typed error on code=401", async () => {
    nock.disableNetConnect();

    nock("https://scraperapi.thordata.com")
      .post("/request")
      .reply(200, { code: 401, msg: "Unauthorized" });

    const client = new ThordataClient({ scraperToken: "dummy" });

    await expect(
      client.serpSearch({ query: "pizza", engine: "google", num: 1 }),
    ).rejects.toBeInstanceOf(ThordataAuthError);
  });

  it("respects baseUrls override", async () => {
    nock.disableNetConnect();

    nock("http://127.0.0.1:18080").post("/request").reply(200, { code: 200, organic: [] });

    const client = new ThordataClient({
      scraperToken: "dummy",
      baseUrls: { scraperapiBaseUrl: "http://127.0.0.1:18080" },
    });

    const data = await client.serpSearch({ query: "pizza", engine: "google", num: 1 });
    expect(data.code).toBe(200);
  });
});
