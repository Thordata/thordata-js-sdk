// examples/proxy_datacenter.ts
import "dotenv/config";
import { Thordata } from "../src/thordata.js";

async function main() {
  if (!process.env.THORDATA_DATACENTER_USERNAME || !process.env.THORDATA_DATACENTER_PASSWORD) {
    console.log("Datacenter Proxy Demo - Skipped");
    console.log("Set THORDATA_DATACENTER_USERNAME and THORDATA_DATACENTER_PASSWORD in .env");
    return;
  }

  const client = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Datacenter Proxy Demo\n");

  const proxy = Thordata.Proxy.datacenterFromEnv();
  const result = await client.request(testUrl, { proxy });
  console.log("Datacenter IP:", result.origin);
}

main().catch(console.error);
