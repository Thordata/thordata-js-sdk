import nock from "nock";
import { afterEach, describe, expect, it } from "vitest";
import { ThordataClient } from "../src/client";
import { ThordataAuthError } from "../src/errors";

describe("SERP offline (axios)", () => {
  afterEach(() => {
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
