// examples/serp_google_news.ts

import "dotenv/config";
import { ThordataClient, Engine } from "../src/index.js";

async function main() {
  const token = process.env.THORDATA_SCRAPER_TOKEN;
  if (!token) {
    console.error("❌ Error: THORDATA_SCRAPER_TOKEN not found in .env");
    process.exit(1);
  }

  const client = new ThordataClient({
    scraperToken: token,
    maxRetries: 3,
  });

  // 1. Basic News Search
  console.log("\n📰 1. Basic Google News Search: 'AI regulation'");
  try {
    const results = await client.serpSearch({
      query: "AI regulation",
      engine: Engine.GOOGLE_NEWS,
      country: "us",
      language: "en",
      num: 5,
    });
    printNewsResults(results);
  } catch (e) {
    const error = e as Error;
    console.error("❌ Search failed:", error.message);
  }

  // 2. Advanced News Filters
  console.log("\n📰 2. Advanced Filters (Sort by Date)");
  try {
    const results = await client.serpSearch({
      query: "Artificial Intelligence",
      engine: Engine.GOOGLE_NEWS,
      country: "us",
      language: "en",
      num: 5,
      so: 1,
    });
    printNewsResults(results);
  } catch (e) {
    const error = e as Error;
    console.error("❌ Advanced search failed:", error.message);
  }
}

interface NewsItem {
  rank?: number;
  source?: string;
  title?: string;
  date?: string;
  link?: string;
}

function printNewsResults(results: Record<string, unknown>) {
  const news = (results?.news ?? []) as NewsItem[];

  console.log(`✅ Found ${news.length} news items:`);

  news.slice(0, 5).forEach((item) => {
    console.log(`   ${item.rank}. [${item.source}] ${item.title}`);
    console.log(`      📅 ${item.date}`);
    console.log(`      🔗 ${item.link}`);
  });
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
});
