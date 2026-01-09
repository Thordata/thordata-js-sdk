import { describe, it, expect, beforeAll } from "vitest";
import { Thordata } from "../src/thordata.js";
import { config } from "dotenv";

// 加载 .env 文件
config();

const RUN = process.env.THORDATA_INTEGRATION?.toLowerCase() === "true";
const STRICT = process.env.THORDATA_INTEGRATION_STRICT?.toLowerCase() === "true";
const TARGET = "https://ipinfo.thordata.com";

function looksLikeInterference(error: unknown): boolean {
  const s = String(error).toLowerCase();
  return [
    "wrong version number",
    "packet length too long",
    "server gave http response to https client",
    "eproto",
    "econnreset",
    "socket hang up",
    "hpe_cr_expected",
  ].some((keyword) => s.includes(keyword));
}

describe("Proxy Integration Tests", () => {
  beforeAll(() => {
    if (!RUN) {
      console.log("⏭️  Integration tests skipped (set THORDATA_INTEGRATION=true to run)");
    }
  });

  it(
    "should work with HTTPS and SOCKS5H proxy protocols",
    { skip: !RUN, timeout: 180_000 },
    async () => {
      // Check required env vars
      const host = process.env.THORDATA_PROXY_HOST;
      const username = process.env.THORDATA_RESIDENTIAL_USERNAME;
      const password = process.env.THORDATA_RESIDENTIAL_PASSWORD;

      if (!host || !username || !password) {
        console.error("Environment check:");
        console.error(`  THORDATA_PROXY_HOST: ${host ? "✓" : "✗ missing"}`);
        console.error(`  THORDATA_RESIDENTIAL_USERNAME: ${username ? "✓" : "✗ missing"}`);
        console.error(`  THORDATA_RESIDENTIAL_PASSWORD: ${password ? "✓" : "✗ missing"}`);

        throw new Error("Missing required env vars. Please create .env file with credentials.");
      }

      const client = new Thordata({
        maxRetries: 3,
        timeoutMs: 60_000,
      });

      const upstream = process.env.THORDATA_UPSTREAM_PROXY?.trim();
      let protocols: string[];

      if (upstream) {
        console.log(`🔗 Upstream proxy detected: ${upstream}`);
        protocols = ["https", "socks5h"];
      } else {
        protocols = ["https", "socks5h"];
        if (process.env.THORDATA_INTEGRATION_HTTP === "true") {
          protocols.unshift("http");
        }
      }

      for (const protocol of protocols) {
        console.log(`\n--- Testing protocol: ${protocol} ---`);

        // 为每个协议设置环境变量
        process.env.THORDATA_PROXY_PROTOCOL = protocol;
        process.env.THORDATA_RESIDENTIAL_PROXY_PROTOCOL = protocol;

        // 使用 fromEnv 方法，它会读取环境变量
        const proxy = Thordata.Proxy.residentialFromEnv().country("us");

        let lastError: unknown = null;
        let success = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`  Attempt ${attempt}/3...`);
            const result = await client.request(TARGET, { proxy, timeout: 60000 });

            expect(result).toBeTruthy();
            console.log(`  ✓ ${protocol} passed!`);

            success = true;
            lastError = null;
            break;
          } catch (error) {
            console.log(`  ✗ Error:`, error instanceof Error ? error.message : String(error));
            lastError = error;

            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }
        }

        if (!success && lastError) {
          if (!STRICT && looksLikeInterference(lastError)) {
            console.warn(`⚠️  ${protocol} skipped due to network interference (non-strict mode)`);
            continue;
          }

          throw lastError;
        }
      }
    },
  );
});
