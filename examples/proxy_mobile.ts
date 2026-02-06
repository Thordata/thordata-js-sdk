// examples/proxy_mobile.ts

import "dotenv/config";
import { Thordata } from "../src/thordata.js";

interface HttpBinResponse {
  origin: string;
}

async function main() {
  if (!process.env.THORDATA_MOBILE_USERNAME || !process.env.THORDATA_MOBILE_PASSWORD) {
    console.log("Mobile Proxy Demo - Skipped");
    console.log("Set THORDATA_MOBILE_USERNAME and THORDATA_MOBILE_PASSWORD in .env");
    return;
  }

  const thordata = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Mobile Proxy Demo\n");

  const proxy = Thordata.Proxy.mobileFromEnv().country("gb");
  const result = (await thordata.proxy.request(testUrl, { proxy })) as HttpBinResponse;
  console.log("UK Mobile IP:", result.origin);
}

main().catch(console.error);
