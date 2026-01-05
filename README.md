# Thordata Node.js SDK

<div align="center">

**Official Node.js/TypeScript Client for Thordata APIs**

*Proxy Network • SERP API • Web Unlocker • Web Scraper API*

[![npm version](https://img.shields.io/npm/v/thordata-js-sdk.svg)](https://www.npmjs.com/package/thordata-js-sdk)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## 📦 Installation

```bash
npm install thordata-js-sdk
```

## 🔐 Configuration

Set environment variables:

```bash
export THORDATA_SCRAPER_TOKEN="your_token"
export THORDATA_PUBLIC_TOKEN="your_public_token"
export THORDATA_PUBLIC_KEY="your_public_key"
```

## 🚀 Quick Start

```typescript
import { Thordata } from "thordata-js-sdk";

// Initialize (reads from env vars)
const client = new Thordata();

async function main() {
  // SERP Search
  const results = await client.serpSearch({
    query: "nodejs",
    engine: "google",
    country: "us"
  });
  console.log(results.organic?.[0]?.title);
}

main();
```

## 📚 Core Features

### 🌐 Proxy Network

Build proxy URLs for `axios`, `fetch`, `puppeteer`, etc.

```typescript
import { Thordata } from "thordata-js-sdk";

// Create proxy config
const proxy = Thordata.Proxy.residentialFromEnv()
  .country("jp")
  .city("tokyo")
  .sticky(30); // 30 min session

// Get URL string
console.log(proxy.toProxyUrl()); 

// Use with internal client
const response = await client.request("https://httpbin.org/ip", { proxy });
console.log(response);
```

### 🔍 SERP API

```typescript
import { Engine } from "thordata-js-sdk";

const news = await client.serpSearch({
  query: "SpaceX",
  engine: Engine.GOOGLE_NEWS,
  num: 20,
  country: "us",
  language: "en"
});
```

### 🔓 Universal Scraping API (Web Unlocker)

```typescript
const html = await client.universalScrape({
  url: "https://example.com/spa",
  jsRender: true,
  waitFor: ".loaded-content",
  blockResources: "image,media"
});
```

### 🕷️ Web Scraper API (Tasks)

```typescript
// 1. Create Task
const taskId = await client.createScraperTask({
  fileName: "task_1",
  spiderId: "universal",
  spiderName: "universal",
  parameters: { url: "https://example.com" }
});

// 2. Wait
const status = await client.waitForTask(taskId);

// 3. Download
if (status === "ready") {
  const url = await client.getTaskResult(taskId);
  console.log(url);
}
```

### 📊 Account Management

```typescript
// Usage Stats
const stats = await client.getUsageStatistics("2024-01-01", "2024-01-31");

// Manage Whitelist
await client.addWhitelistIp("1.2.3.4");

// Check ISP Proxies
const servers = await client.listProxyServers(1); // 1=ISP
```

## ⚙️ Advanced Usage

### Error Handling

The SDK throws typed errors for better control.

```typescript
import { ThordataRateLimitError, ThordataAuthError } from "thordata-js-sdk";

try {
  await client.serpSearch({ ... });
} catch (e) {
  if (e instanceof ThordataRateLimitError) {
    console.log(`Rate limited! Retry after ${e.retryAfter}s`);
  } else if (e instanceof ThordataAuthError) {
    console.log("Check your tokens!");
  }
}
```

### Configuration Options

```typescript
const client = new ThordataClient({
  scraperToken: "...",
  timeoutMs: 60000,
  maxRetries: 3, // Auto-retry on 429/5xx
});
```

## 📄 License

MIT License