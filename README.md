# Thordata JS SDK (Node.js / TypeScript)

Official JavaScript/TypeScript SDK for Thordata APIs.

[![npm version](https://img.shields.io/npm/v/thordata-js-sdk.svg)](https://www.npmjs.com/package/thordata-js-sdk)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Supports:
- **SERP API** (Google / Bing / Yandex)
- **Web Unlocker** (Universal API)
- **Web Scraper API** (Text & Video Tasks)
- **Proxy Network** (Residential / Datacenter / Mobile / ISP)
- **Account Management** (Usage, Users, Whitelist)

---

## 📦 Installation

```bash
npm install thordata-js-sdk
```

---

## 🔐 Configuration

```bash
export THORDATA_SCRAPER_TOKEN=your_token
export THORDATA_PUBLIC_TOKEN=your_public_token
export THORDATA_PUBLIC_KEY=your_public_key
```

---

## 🚀 Quick Start

```typescript
import { Thordata } from "thordata-js-sdk";

const client = new Thordata(); // Reads from env vars

// SERP Search
const results = await client.serpSearch({
  query: "Thordata SDK",
  engine: "google",
  country: "us"
});
console.log(results.organic?.[0]?.link);
```

---

## 📖 Features

### SERP API

```typescript
const news = await client.serpSearch({
  query: "AI News",
  engine: "google_news",
  num: 10
});
```

### Web Unlocker (Universal)

```typescript
const html = await client.universalScrape({
  url: "https://example.com",
  jsRender: true,
  waitFor: ".content"
});
```

### Web Scraper API (Async)

```typescript
// Create Task
const taskId = await client.createScraperTask({
  fileName: "task1",
  spiderId: "universal",
  spiderName: "universal",
  parameters: { url: "https://example.com" }
});

// Video Task (New)
const vidId = await client.createVideoTask({
  fileName: "video1",
  spiderId: "youtube_video_by-url",
  spiderName: "youtube.com",
  parameters: { url: "..." },
  commonSettings: { resolution: "1080p" }
});

// Wait & Result
const status = await client.waitForTask(taskId);
if (status === "ready") {
  const url = await client.getTaskResult(taskId);
  console.log(url);
}
```

### Account Management

```typescript
// Usage Stats
const stats = await client.getUsageStatistics("2024-01-01", "2024-01-31");
console.log("Balance:", stats.traffic_balance);

// Proxy Users
const users = await client.listProxyUsers("residential");

// Whitelist
await client.addWhitelistIp("1.2.3.4");
```

### Proxy Configuration

```typescript
// Residential Proxy
const proxy = Thordata.Proxy.residentialFromEnv().country("us");
await client.request("https://httpbin.org/ip", { proxy });
```

---

## 📄 License

MIT License
