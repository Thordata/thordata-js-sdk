// examples/universal_basic.ts

import { loadEnv, skipIfMissing, truncate } from "./internal/example.js";
import { Thordata } from "../src/index.js";
import fs from "node:fs";

async function main() {
  loadEnv();
  if (skipIfMissing("THORDATA_SCRAPER_TOKEN")) return;

  const thordata = new Thordata({
    scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
    publicToken: process.env.THORDATA_PUBLIC_TOKEN,
    publicKey: process.env.THORDATA_PUBLIC_KEY,
  });

  const out = await thordata.unlocker.scrape({
    url: "https://httpbin.org/html",
    outputFormat: "html",
    jsRender: false,
  });

  const html = typeof out === "string" ? out : JSON.stringify(out, null, 2);
  fs.writeFileSync("universal_output.html", html, "utf8");
  console.log("saved: universal_output.html");
  console.log("length:", html.length);
  console.log("preview:", truncate(html, 300));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
