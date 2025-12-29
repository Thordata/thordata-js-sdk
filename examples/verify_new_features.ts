// examples/verify_new_features.ts

import "dotenv/config";
import { ThordataClient } from "../src/index.js";

async function main() {
  const args = process.argv.slice(2);
  const testName = args[0] || "all";

  const scraperToken = process.env.THORDATA_SCRAPER_TOKEN;
  const publicToken = process.env.THORDATA_PUBLIC_TOKEN;
  const publicKey = process.env.THORDATA_PUBLIC_KEY;

  if (!scraperToken) {
    console.error("❌ THORDATA_SCRAPER_TOKEN required");
    process.exit(1);
  }

  const client = new ThordataClient({
    scraperToken,
    publicToken,
    publicKey,
  });

  console.log("========================================");
  console.log("Thordata SDK - New Features Verification");
  console.log("========================================");

  const tests: Record<string, () => Promise<boolean>> = {
    video_task: async () => {
      console.log("\n--- Testing: Video Task Creation ---");
      try {
        const taskId = await client.createVideoTask({
          fileName: "test_{{VideoID}}",
          spiderId: "youtube_video_by-url",
          spiderName: "youtube.com",
          parameters: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          commonSettings: { resolution: "720p", is_subtitles: "false" },
        });
        console.log(`✅ Video task created: ${taskId}`);
        return true;
      } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
        return false;
      }
    },

    usage_stats: async () => {
      console.log("\n--- Testing: Usage Statistics ---");
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        const fmt = (d: Date) => d.toISOString().split("T")[0];

        const stats = await client.getUsageStatistics(fmt(weekAgo), fmt(now));
        console.log(`✅ Stats Retrieved:`);
        console.log(`   Balance: ${(stats.traffic_balance / 1024 ** 3).toFixed(2)} GB`);
        return true;
      } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
        return false;
      }
    },

    proxy_users: async () => {
      console.log("\n--- Testing: Proxy Users ---");
      try {
        const users = await client.listProxyUsers("residential");
        console.log(`✅ Users Retrieved: ${users.user_count}`);
        if (users.list.length > 0) {
          console.log(`   User 1: ${users.list[0].username}`);
        }
        return true;
      } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
        return false;
      }
    },

    proxy_servers: async () => {
      console.log("\n--- Testing: Proxy Servers (ISP) ---");
      try {
        const servers = await client.listProxyServers(1); // 1 = ISP
        console.log(`✅ ISP Servers: ${servers.length}`);
        if (servers.length > 0) {
          console.log(`   Server 1: ${servers[0].ip}:${servers[0].port}`);
        }
        return true;
      } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
        return false;
      }
    },
  };

  let passed = 0;
  let total = 0;

  for (const [name, fn] of Object.entries(tests)) {
    if (testName === "all" || testName === name) {
      total++;
      if (await fn()) passed++;
    }
  }

  console.log("\n========================================");
  console.log(`Summary: ${passed}/${total} passed`);
  console.log("========================================");

  process.exit(passed === total ? 0 : 1);
}

main().catch(console.error);
