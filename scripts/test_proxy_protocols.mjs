import { Thordata } from "../dist/src/thordata.js";
import { config } from "dotenv";

config({ path: ".env" });

const TARGET = "https://ipinfo.thordata.com";

async function testProtocol(protocol) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${protocol.toUpperCase()}`);
  console.log("=".repeat(60));

  const host = process.env.THORDATA_PROXY_HOST;
  const username = process.env.THORDATA_RESIDENTIAL_USERNAME;
  const password = process.env.THORDATA_RESIDENTIAL_PASSWORD;
  const port = parseInt(process.env.THORDATA_PROXY_PORT || "9999");

  if (!host || !username || !password) {
    console.error("❌ Missing required environment variables");
    console.error(
      "Required: THORDATA_PROXY_HOST, THORDATA_RESIDENTIAL_USERNAME, THORDATA_RESIDENTIAL_PASSWORD",
    );
    return false;
  }

  const client = new Thordata({ timeoutMs: 30000 });

  // 设置环境变量，让 fromEnv 可以读取
  process.env.THORDATA_PROXY_PROTOCOL = protocol;
  process.env.THORDATA_RESIDENTIAL_PROXY_PROTOCOL = protocol;

  // 使用 fromEnv 创建代理
  const proxy = Thordata.Proxy.residentialFromEnv().country("us");

  const proxyUrl = proxy.toProxyUrl();
  const sanitized = proxyUrl.replace(/:[^:@]+@/, ":****@");
  console.log(`Proxy URL: ${sanitized}`);

  try {
    const result = await client.request(TARGET, { proxy, timeout: 30000 });

    if (result && typeof result === "object") {
      console.log("✅ Success!");
      console.log("Response:", JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log("⚠️  Unexpected response type:", typeof result);
      return false;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause.message);
    }
    if (error.stack) {
      console.error("Stack:", error.stack.split("\n").slice(0, 5).join("\n"));
    }
    return false;
  }
}

async function main() {
  console.log("Thordata Proxy Protocol Verification (JavaScript)");
  console.log("==================================================\n");

  const upstream = process.env.THORDATA_UPSTREAM_PROXY;
  if (upstream) {
    console.log(`🔗 Upstream proxy detected: ${upstream}`);
    console.log("   Ensure Clash/V2Ray TUN mode is enabled or system proxy is set.\n");
  }

  const protocols = ["https", "socks5h"];
  const results = {};

  for (const protocol of protocols) {
    results[protocol] = await testProtocol(protocol);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("Summary");
  console.log("=".repeat(60));

  for (const [protocol, success] of Object.entries(results)) {
    console.log(`${protocol.padEnd(10)}: ${success ? "✅ PASS" : "❌ FAIL"}`);
  }

  const allPassed = Object.values(results).every((v) => v);
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
