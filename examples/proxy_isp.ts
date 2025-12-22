// examples/proxy_isp.ts

import "dotenv/config";
import { Thordata } from "../src/thordata.js";

interface HttpBinResponse {
  origin: string;
}

async function main() {
  if (
    !process.env.THORDATA_ISP_HOST ||
    !process.env.THORDATA_ISP_USERNAME ||
    !process.env.THORDATA_ISP_PASSWORD
  ) {
    console.log("ISP Proxy Demo - Skipped");
    console.log("Set THORDATA_ISP_HOST, THORDATA_ISP_USERNAME, and THORDATA_ISP_PASSWORD in .env");
    return;
  }

  const client = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Static ISP Proxy Demo\n");

  const proxy = Thordata.Proxy.ispFromEnv();
  const result = (await client.request(testUrl, { proxy })) as HttpBinResponse;
  console.log("Static ISP IP:", result.origin);
  console.log("Expected IP  :", process.env.THORDATA_ISP_HOST);
}

main().catch(console.error);
