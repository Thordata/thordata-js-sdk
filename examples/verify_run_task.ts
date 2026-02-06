// examples/verify_run_task.ts
import "dotenv/config";
import { Thordata } from "../src/index.js";

async function main() {
  const scraperToken = process.env.THORDATA_SCRAPER_TOKEN;
  const publicToken = process.env.THORDATA_PUBLIC_TOKEN;
  const publicKey = process.env.THORDATA_PUBLIC_KEY;

  // Use variables from .env (Web Scraper Store -> API Builder)
  const spiderId = process.env.THORDATA_TASK_SPIDER_ID;
  const spiderName = process.env.THORDATA_TASK_SPIDER_NAME;
  const paramsJson = process.env.THORDATA_TASK_PARAMETERS_JSON || "{}";

  if (!scraperToken || !publicToken || !publicKey || !spiderId) {
    console.error("❌ Missing required .env variables (Tokens or Spider ID).");
    process.exit(1);
  }

  // Parse parameters safely
  let parameters: any = {};
  try {
    const raw = JSON.parse(paramsJson);
    parameters = Array.isArray(raw) ? raw[0] : raw;
  } catch {
    console.warn("⚠️ Invalid JSON params, using empty object");
  }

  const thordata = new Thordata({ scraperToken, publicToken, publicKey });

  console.log(`\n--- Testing Node.js runTask [${spiderName}] ---`);

  try {
    const url = await thordata.scraperTasks.run(
      {
        fileName: `node_test_${Date.now()}`,
        spiderId,
        spiderName: spiderName || "unknown",
        parameters,
        includeErrors: true,
      },
      {
        initialPollIntervalMs: 3000, // Start slower
        maxWaitMs: 600_000,
      },
    );

    console.log(`✅ Success! Download URL: ${url}`);
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
  }
}

main();
