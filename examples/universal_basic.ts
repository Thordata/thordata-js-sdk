// examples/universal_basic.ts

import { loadEnv, skipIfMissing, truncate } from "./internal/example.js";
import { ThordataClient } from "../src/index.js";

async function main() {
  loadEnv();
  if (skipIfMissing("THORDATA_SCRAPER_TOKEN")) return;

  const client = new ThordataClient({
    scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
    publicToken: process.env.THORDATA_PUBLIC_TOKEN,
    publicKey: process.env.THORDATA_PUBLIC_KEY,
  });

  const out = await client.universalScrape({
    url: "https://httpbin.org/html",
    output_format: "html",
    js_render: false,
  });

  const s = typeof out === "string" ? out : JSON.stringify(out);
  console.log("preview:", truncate(s, 300));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
