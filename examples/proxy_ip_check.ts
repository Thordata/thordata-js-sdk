// examples/proxy_ip_check.ts

import "dotenv/config";
import { ThordataClient, ProxyConfig } from "../src";

async function main() {
  const scraperToken = process.env.THORDATA_SCRAPER_TOKEN;
  const proxyUser = process.env.THORDATA_PROXY_USERNAME;
  const proxyPass = process.env.THORDATA_PROXY_PASSWORD;
  const proxyHost = process.env.THORDATA_PROXY_HOST || "t.pr.thordata.net";
  const proxyPort = Number(process.env.THORDATA_PROXY_PORT || "9999");

  if (!scraperToken) {
    console.error("Please set THORDATA_SCRAPER_TOKEN in .env");
    process.exit(1);
  }

  if (!proxyUser || !proxyPass) {
    console.error(
      "Please set THORDATA_PROXY_USERNAME and THORDATA_PROXY_PASSWORD in .env"
    );
    process.exit(1);
  }

  const client = new ThordataClient({ scraperToken });

  const proxy = new ProxyConfig({
    baseUsername: proxyUser,
    password: proxyPass,
    host: proxyHost,
    port: proxyPort,
    country: "us",
  });

  // 使用 HTTP 避免 HTTPS + 证书域名不匹配问题
  const targetUrl = "http://ipinfo.thordata.com";
  // 或者用 http://httpbin.org/ip 做演示
  // const targetUrl = "http://httpbin.org/ip";

  console.log(`🌐 Requesting ${targetUrl} via Thordata proxy...`);

  const data = await client.requestViaProxy(targetUrl, proxy);
  console.log("Response JSON:", data);
}

main().catch((err) => {
  console.error("Error:", err);
});