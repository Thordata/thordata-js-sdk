// examples/proxy_residential.ts

import "dotenv/config";
import { Thordata } from "../src/thordata.js";

interface HttpBinResponse {
  origin: string;
}

async function main() {
  if (!process.env.THORDATA_RESIDENTIAL_USERNAME || !process.env.THORDATA_RESIDENTIAL_PASSWORD) {
    console.log("Residential Proxy Demo - Skipped");
    console.log("Set THORDATA_RESIDENTIAL_USERNAME and THORDATA_RESIDENTIAL_PASSWORD in .env");
    return;
  }

  const client = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Residential Proxy Demo\n");

  // Basic usage
  const proxy1 = Thordata.Proxy.residentialFromEnv().country("us");
  const r1 = (await client.request(testUrl, { proxy: proxy1 })) as HttpBinResponse;
  console.log("US Residential IP:", r1.origin);

  // With sticky session
  const proxy2 = Thordata.Proxy.residentialFromEnv()
    .country("jp")
    .city("tokyo")
    .session("my_session")
    .sticky(30);
  const r2 = (await client.request(testUrl, { proxy: proxy2 })) as HttpBinResponse;
  console.log("Tokyo Sticky IP  :", r2.origin);
}

main().catch(console.error);
