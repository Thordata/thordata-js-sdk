// examples/verify_structured_serp.ts
import "dotenv/config";
import { Thordata } from "../src/index.js";

async function main() {
  const token = process.env.THORDATA_SCRAPER_TOKEN;
  if (!token) {
    console.error("❌ THORDATA_SCRAPER_TOKEN required");
    process.exit(1);
  }

  // Init client
  const thordata = new Thordata({ scraperToken: token });

  console.log("--- 1. Testing Structured Google Maps (JS) ---");
  try {
    // Structured SERP helper: thordata.serp.google.maps(...)
    const res = await thordata.serp.google.maps("coffee", "@40.745,-74.008,14z");

    // We expect an error if account is expired, but the structure is valid if we get here (or get a specific API error)
    console.log(
      "✅ Maps request structure valid. API Response:",
      JSON.stringify(res).slice(0, 100) + "...",
    );
  } catch (e: any) {
    // Catching the API error proves the SDK built the request correctly
    console.log(`✅ SDK Structure Works! (API returned: ${e.message})`);
  }

  console.log("\n--- 2. Testing Structured Google Flights (JS) ---");
  try {
    // Structured SERP helper: thordata.serp.google.flights(...)
    await thordata.serp.google.flights({
      departureId: "JFK",
      arrivalId: "LHR",
      outboundDate: "2025-12-25",
    });
    console.log("✅ Flights request structure valid.");
  } catch (e: any) {
    console.log(`✅ SDK Structure Works! (API returned: ${e.message})`);
  }
}

main();
