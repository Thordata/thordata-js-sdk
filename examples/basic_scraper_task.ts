// examples/basic_scraper_task.ts

import "dotenv/config";
import { ThordataClient } from "../src/index.js";

async function main() {
  const scraperToken = process.env.THORDATA_SCRAPER_TOKEN;
  const publicToken = process.env.THORDATA_PUBLIC_TOKEN;
  const publicKey = process.env.THORDATA_PUBLIC_KEY;

  if (!scraperToken || !publicToken || !publicKey) {
    console.error(
      "Please set THORDATA_SCRAPER_TOKEN, THORDATA_PUBLIC_TOKEN, THORDATA_PUBLIC_KEY in .env",
    );
    process.exit(1);
  }

  const client = new ThordataClient({
    scraperToken,
    publicToken,
    publicKey,
  });

  console.log("🕷️  Creating Web Scraper task (example only)...");
  try {
    const taskId = await client.createScraperTask({
      fileName: "demo_task",
      spiderId: "example-spider-id",
      spiderName: "example.com",
      parameters: {
        url: "https://example.com",
      },
    });

    console.log("Task created:", taskId);

    console.log("⏱️  Waiting for task completion...");
    const status = await client.waitForTask(taskId, {
      pollIntervalMs: 5000,
      maxWaitMs: 60_000,
    });

    console.log("Final status:", status);

    if (status.toLowerCase() === "ready" || status.toLowerCase() === "success") {
      const downloadUrl = await client.getTaskResult(taskId, "json");
      console.log("Download URL:", downloadUrl);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
});
