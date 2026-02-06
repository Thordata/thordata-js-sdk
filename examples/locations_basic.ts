// examples/locations_basic.ts
import { loadEnv, skipIfMissing, printJSON } from "./internal/example.js";
import { Thordata } from "../src/index.js";

async function main() {
  loadEnv();
  if (skipIfMissing("THORDATA_SCRAPER_TOKEN")) return;

  const thordata = new Thordata({
    scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
    publicToken: process.env.THORDATA_PUBLIC_TOKEN,
    publicKey: process.env.THORDATA_PUBLIC_KEY,
  });

  // listCountries is proxy-location countries list (by proxy type)
  const out = await thordata.client.listCountries("residential");
  printJSON(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
