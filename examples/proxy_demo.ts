// examples/proxy_demo.ts
import "dotenv/config";
import { Thordata } from "../src/thordata.js";

async function main() {
  const client = new Thordata();
  const testUrl = "http://httpbin.org/ip";

  console.log("Thordata Proxy Demo\n");
  console.log("Each proxy product requires its own credentials.\n");

  // Test Residential Proxy
  if (process.env.THORDATA_RESIDENTIAL_USERNAME && process.env.THORDATA_RESIDENTIAL_PASSWORD) {
    try {
      const proxy = Thordata.Proxy.residentialFromEnv().country("us");
      const result = await client.request(testUrl, { proxy });
      console.log("1. Residential (US) IP:", result.origin);
    } catch (e: any) {
      console.log("1. Residential: Failed -", e.message?.slice(0, 60));
    }
  } else {
    console.log("1. Residential: Skipped (credentials not set)");
  }

  // Test Datacenter Proxy
  if (process.env.THORDATA_DATACENTER_USERNAME && process.env.THORDATA_DATACENTER_PASSWORD) {
    try {
      const proxy = Thordata.Proxy.datacenterFromEnv();
      const result = await client.request(testUrl, { proxy });
      console.log("2. Datacenter IP      :", result.origin);
    } catch (e: any) {
      console.log("2. Datacenter: Failed -", e.message?.slice(0, 60));
    }
  } else {
    console.log("2. Datacenter: Skipped (credentials not set)");
  }

  // Test Mobile Proxy
  if (process.env.THORDATA_MOBILE_USERNAME && process.env.THORDATA_MOBILE_PASSWORD) {
    try {
      const proxy = Thordata.Proxy.mobileFromEnv().country("gb");
      const result = await client.request(testUrl, { proxy });
      console.log("3. Mobile (UK) IP     :", result.origin);
    } catch (e: any) {
      console.log("3. Mobile: Failed -", e.message?.slice(0, 60));
    }
  } else {
    console.log("3. Mobile: Skipped (credentials not set)");
  }

  // Test ISP Proxy
  if (process.env.THORDATA_ISP_USERNAME && process.env.THORDATA_ISP_PASSWORD) {
    try {
      const proxy = Thordata.Proxy.ispFromEnv();
      const result = await client.request(testUrl, { proxy });
      console.log("4. ISP IP             :", result.origin);
    } catch (e: any) {
      console.log("4. ISP: Failed -", e.message?.slice(0, 60));
    }
  } else {
    console.log("4. ISP: Skipped (credentials not set)");
  }

  console.log("\nProxy demo completed.");
  console.log("To enable a proxy type, set its credentials in .env");
}

main().catch(console.error);
