// examples/basic_serp.ts

import "dotenv/config";
import { ThordataClient, Engine } from "../src"; // 开发时可以用 "../src"

async function main() {
  const token = process.env.THORDATA_SCRAPER_TOKEN;
  if (!token) {
    console.error("Please set THORDATA_SCRAPER_TOKEN in .env");
    process.exit(1);
  }

  const client = new ThordataClient({ scraperToken: token });

  console.log("🔍 Google Search: 'Thordata proxy network'");
  const results = await client.serpSearch({
    query: "Thordata proxy network",
    engine: Engine.GOOGLE,
    num: 5,
  });

  const organic = results?.organic_results ?? results?.organic ?? [];
  console.log(`Found ${organic.length} organic results`);
  for (const item of organic.slice(0, 3)) {
    console.log("-", item.title, "->", item.link);
  }
}

main().catch((err) => {
  console.error("Error:", err);
});