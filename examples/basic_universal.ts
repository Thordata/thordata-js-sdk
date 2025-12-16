// examples/basic_universal.ts

import "dotenv/config";
import { ThordataClient } from "../src";

async function main() {
  const token = process.env.THORDATA_SCRAPER_TOKEN;
  if (!token) {
    console.error("Please set THORDATA_SCRAPER_TOKEN in .env");
    process.exit(1);
  }

  const client = new ThordataClient({ scraperToken: token });

  console.log("🌐 Universal Scrape: https://httpbin.org/html");
  const html = await client.universalScrape({
    url: "https://httpbin.org/html",
    jsRender: false,
    outputFormat: "html",
  });

  console.log("Preview:");
  console.log(String(html).slice(0, 300));
}

main().catch((err) => {
  console.error("Error:", err);
});