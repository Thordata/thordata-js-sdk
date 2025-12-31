// examples/basic_scraper_task.ts

import "dotenv/config";
import { ThordataClient } from "../src/index.js";

async function main() {
  const scraperToken = process.env.THORDATA_SCRAPER_TOKEN;
  const publicToken = process.env.THORDATA_PUBLIC_TOKEN;
  const publicKey = process.env.THORDATA_PUBLIC_KEY;

  // These are NOT universal constants; users should copy them from Dashboard -> Web Scraper Store -> API Builder.
  const spiderName = process.env.THORDATA_TASK_SPIDER_NAME;
  const spiderId = process.env.THORDATA_TASK_SPIDER_ID;
  const fileName = process.env.THORDATA_TASK_FILE_NAME || "{{TasksID}}";
  const parametersJson = process.env.THORDATA_TASK_PARAMETERS_JSON || "{}";

  if (!scraperToken || !publicToken || !publicKey) {
    console.error(
      "Please set THORDATA_SCRAPER_TOKEN, THORDATA_PUBLIC_TOKEN, THORDATA_PUBLIC_KEY in .env",
    );
    process.exit(1);
  }

  // If task-specific env vars are missing, skip the example to keep CI/offline e2e stable.
  if (!spiderName || !spiderId) {
    console.log(
      "Skipping tasks example. Set THORDATA_TASK_SPIDER_NAME and THORDATA_TASK_SPIDER_ID to run it (copy from Dashboard -> Web Scraper Store -> API Builder).",
    );
    return;
  }

  let parameters: any;
  try {
    const raw = JSON.parse(parametersJson);

    // Dashboard curl uses spider_parameters as an ARRAY string: [{...}]
    // Accept both "{...}" and "[{...}]". SDK createScraperTask expects ONE parameter object.
    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        console.error("THORDATA_TASK_PARAMETERS_JSON must not be an empty array");
        process.exit(1);
      }
      parameters = raw[0];
    } else {
      parameters = raw;
    }
  } catch {
    console.error("THORDATA_TASK_PARAMETERS_JSON must be valid JSON");
    process.exit(1);
  }

  const client = new ThordataClient({
    scraperToken,
    publicToken,
    publicKey,
  });

  console.log("🕷️  Creating Web Scraper task (live example)...");
  const taskId = await client.createScraperTask({
    // Recommended by docs: let the server substitute the actual task id.
    fileName,
    spiderId,
    spiderName,
    parameters,
  });

  console.log("Task created:", taskId);

  console.log("⏱️  Waiting for task completion...");
  const status = await client.waitForTask(taskId, {
    pollIntervalMs: 5000,
    maxWaitMs: 120_000,
  });

  console.log("Final status:", status);

  if (status.toLowerCase() === "ready" || status.toLowerCase() === "success") {
    const downloadUrl = await client.getTaskResult(taskId, "json");
    console.log("Download URL:", downloadUrl);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
