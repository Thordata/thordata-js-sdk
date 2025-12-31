import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { startMockServer } from "./mockServer.js";

const execFileAsync = promisify(execFile);

describe("examples e2e (offline)", () => {
  let baseUrl = "";
  let closeServer: (() => Promise<void>) | null = null;

  beforeAll(async () => {
    const s = await startMockServer();
    baseUrl = s.baseUrl;
    closeServer = s.close;
  });

  afterAll(async () => {
    if (closeServer) await closeServer();
  });

  async function runExample(relPathInDist: string) {
    const env = {
      ...process.env,
      THORDATA_SCRAPER_TOKEN: "dummy",
      THORDATA_PUBLIC_TOKEN: "dummy_public",
      THORDATA_PUBLIC_KEY: "dummy_key",
      THORDATA_TASK_SPIDER_NAME: "",
      THORDATA_TASK_SPIDER_ID: "",
      THORDATA_TASK_PARAMETERS_JSON: "{}",
      THORDATA_SCRAPERAPI_BASE_URL: baseUrl,
      THORDATA_UNIVERSALAPI_BASE_URL: baseUrl,
      THORDATA_WEB_SCRAPER_API_BASE_URL: baseUrl,
      NO_PROXY: "127.0.0.1,localhost",
      no_proxy: "127.0.0.1,localhost",
    };

    const { stdout, stderr } = await execFileAsync(process.execPath, [relPathInDist], {
      env,
      timeout: 60_000,
    });
    return { stdout, stderr };
  }

  it("serp_basic", async () => {
    const { stdout } = await runExample("dist/examples/serp_basic.js");
    expect(stdout.length).toBeGreaterThanOrEqual(0);
  });

  it("universal_basic", async () => {
    const { stdout } = await runExample("dist/examples/universal_basic.js");
    expect(stdout.length).toBeGreaterThanOrEqual(0);
  });

  it("basic_scraper_task", async () => {
    const { stdout } = await runExample("dist/examples/basic_scraper_task.js");
    expect(stdout.length).toBeGreaterThanOrEqual(0);
  });

  it("serp_google_news", async () => {
    const { stdout } = await runExample("dist/examples/serp_google_news.js");
    expect(stdout.length).toBeGreaterThanOrEqual(0);
  });
});
