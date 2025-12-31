// examples/serp_basic.ts
import { loadEnv, skipIfMissing, printJSON } from "./internal/example.js";
import { ThordataClient } from "../src/index.js";

async function main() {
  loadEnv();
  if (skipIfMissing("THORDATA_SCRAPER_TOKEN")) return;

  const client = new ThordataClient({
    scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
    publicToken: process.env.THORDATA_PUBLIC_TOKEN,
    publicKey: process.env.THORDATA_PUBLIC_KEY,
  });

  const out = await client.serpSearch({
    query: "pizza",
    engine: "google",
    country: "us",
    output_format: "json",
  });

  printJSON(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
