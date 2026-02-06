// examples/location_api.ts

import "dotenv/config";
import { Thordata } from "../src/thordata.js";

async function main() {
  if (!process.env.THORDATA_PUBLIC_TOKEN || !process.env.THORDATA_PUBLIC_KEY) {
    console.log("Location API Demo - Skipped");
    console.log("Set THORDATA_PUBLIC_TOKEN and THORDATA_PUBLIC_KEY in .env");
    return;
  }

  const thordata = new Thordata();

  console.log("Location API Demo\n");

  // List countries (now using string parameter)
  console.log("1. Listing countries...");
  const countries = await thordata.client.listCountries("residential");
  console.log(`   Found ${countries.length} countries`);
  console.log(
    `   First 5: ${countries
      .slice(0, 5)
      .map((c: any) => c.country_code)
      .join(", ")}`,
  );

  // List states for US
  console.log("\n2. Listing US states...");
  const states = await thordata.client.listStates("US", "residential");
  console.log(`   Found ${states.length} states`);
  console.log(
    `   First 5: ${states
      .slice(0, 5)
      .map((s: any) => s.state_name)
      .join(", ")}`,
  );

  // List cities for California
  console.log("\n3. Listing California cities...");
  const cities = await thordata.client.listCities("US", "california", "residential");
  console.log(`   Found ${cities.length} cities`);
  console.log(
    `   First 5: ${cities
      .slice(0, 5)
      .map((c: any) => c.city_name)
      .join(", ")}`,
  );

  // List ASNs for US
  console.log("\n4. Listing US ASNs...");
  const asns = await thordata.client.listAsns("US", "residential");
  console.log(`   Found ${asns.length} ASNs`);
  console.log(
    `   First 3: ${asns
      .slice(0, 3)
      .map((a: any) => `${a.asn_code}: ${a.asn_name}`)
      .join(", ")}`,
  );

  console.log("\nLocation API demo completed.");
}

main().catch(console.error);
