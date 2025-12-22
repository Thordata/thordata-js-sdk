// examples/proxy_mobile.ts
import "dotenv/config";
import { Thordata } from "../src/thordata.js";

async function main() {
  if (!process.env.THORDATA_MOBILE_USERNAME || !process.env.THORDATA_MOBILE_PASSWORD) {
    console.log("Mobile Proxy Demo - Skipped");
    console.log("Set THORDATA_MOBILE_USERNAME and THORDATA_MOBILE_PASSWORD in .env");
    return;
  }

  const client = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Mobile Proxy Demo\n");

  const proxy = Thordata.Proxy.mobileFromEnv().country("gb");
  const result = await client.request(testUrl, { proxy });
  console.log("UK Mobile IP:", result.origin);
}

main().catch(console.error);
