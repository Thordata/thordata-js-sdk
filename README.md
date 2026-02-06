# Thordata Node.js SDK

<div align="center">

<img src="https://img.shields.io/badge/Thordata-AI%20Infrastructure-blue?style=for-the-badge" alt="Thordata Logo">

**The Official Node.js/TypeScript Client for Thordata APIs**

*Proxy Network • SERP API • Web Unlocker • Web Scraper API*

[![npm version](https://img.shields.io/npm/v/@thordata/js-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@thordata/js-sdk)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Thordata/thordata-js-sdk/ci.yml?branch=main&style=flat-square)](https://github.com/Thordata/thordata-js-sdk/actions)

</div>

---

## 📖 Introduction

A fully typed TypeScript SDK for Thordata, optimized for Node.js environments. It provides seamless integration with Thordata's proxy network and scraping APIs.

**Key Features:**
*   **🔒 Type-Safe:** Written in TypeScript with complete definitions.
*   **🌐 Modern:** Uses `axios` and standard `https-proxy-agent` for reliable connectivity.
*   **⚡ Lazy Validation:** Zero-config initialization; only provide credentials for the features you use.
*   **🛡️ Proxy Support:** Full support for HTTPS and SOCKS5h protocols with authentication.
*   **🔍 SERP API:** Support for Google (Search, News, Jobs, Shopping, Maps, Flights, Patents, Trends) and Bing.
*   **🌐 Web Unlocker:** Universal scraping with JavaScript rendering.
*   **🤖 Browser API:** Remote browser connection support for Playwright/Puppeteer.
*   **📊 Public API:** Account management, proxy users, whitelist, and usage statistics.

---

## 📦 Installation

```bash
npm install @thordata/js-sdk
# or
yarn add @thordata/js-sdk
```

---

## 🔐 Configuration

We recommend using `dotenv` to manage credentials.

```bash
# .env file
THORDATA_SCRAPER_TOKEN=your_token
THORDATA_RESIDENTIAL_USERNAME=your_username
THORDATA_RESIDENTIAL_PASSWORD=your_password
THORDATA_PROXY_HOST=vpnXXXX.pr.thordata.net
```

---

## 🚀 Quick Start

### 1. SERP Search

```typescript
import { Thordata, Engine } from "@thordata/js-sdk";

const thordata = new Thordata({}); // Auto-loads from env

async function search() {
  const result = await thordata.client.serpSearch({
    query: "SpaceX launch",
    engine: Engine.GOOGLE_NEWS,
    country: "us",
    num: 5
  });
  
  console.log(result.news_results);
}

search();
```

### 2. Universal Scrape (Web Unlocker)

```typescript
async function scrape() {
  const html = await thordata.unlocker.scrape({
    url: "https://www.g2.com/products/thordata",
    jsRender: true,
    waitFor: ".reviews-list",
    country: "us"
  });
  
  console.log("Page HTML length:", html.length);
}
```

### 3. Using the Proxy Network

```typescript
import { Thordata } from "@thordata/js-sdk";

// Create a targeted proxy config
const proxy = Thordata.Proxy.residentialFromEnv()
  .country("gb")
  .city("london")
  .sticky(10); // 10 minutes session

const thordata = new Thordata();

// HTTP methods through proxy
const response = await thordata.proxy.get("https://ipinfo.io/json", { proxy });
console.log(response);

// POST request with data
const postResponse = await thordata.proxy.post("https://httpbin.org/post", {
  proxy,
  data: { key: "value" },
  headers: { "Content-Type": "application/json" }
});
```

---

## ⚙️ Advanced Usage

### Browser API (Remote Browser)

```typescript
import { Thordata } from "@thordata/js-sdk";
import { chromium } from "playwright";

const thordata = new Thordata();

// Get browser connection URL
const browserUrl = thordata.browser.getConnectionUrl();

// Connect with Playwright
const browser = await chromium.connectOverCDP(browserUrl);
const context = await browser.newContext();
const page = await context.newPage();

await page.goto("https://example.com");
console.log(await page.title());

await browser.close();
```

### Task Management (Async)

```typescript
import { Thordata } from "@thordata/js-sdk";

const thordata = new Thordata({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN!,
  publicKey: process.env.THORDATA_PUBLIC_KEY!,
});

// Create a scraping task
const taskId = await thordata.scraperTasks.create({
  fileName: "task_001",
  spiderId: "universal",
  spiderName: "universal",
  parameters: { url: "https://example.com" },
});

console.log(`Task ${taskId} created. Waiting...`);

// Poll for completion
const status = await thordata.scraperTasks.wait(taskId);

if (status.toLowerCase() === "ready" || status.toLowerCase() === "success") {
  const downloadUrl = await thordata.scraperTasks.result(taskId);
  console.log("Result:", downloadUrl);
}
```

### Public API - Account Management

```typescript
import { Thordata } from "@thordata/js-sdk";

const thordata = new Thordata({
  publicToken: process.env.THORDATA_PUBLIC_TOKEN!,
  publicKey: process.env.THORDATA_PUBLIC_KEY!,
});

// Get usage statistics
const stats = await thordata.publicApi.usageStatistics("2024-01-01", "2024-01-31");
console.log("Traffic used:", stats.total_usage_traffic);

// Get balance
const balance = await thordata.publicApi.trafficBalance();
console.log("Traffic balance:", balance);

// Manage proxy users
const users = await thordata.publicApi.proxyUsers.list();
console.log("Proxy users:", users);

// Create new proxy user
await thordata.publicApi.proxyUsers.create("newuser", "password123", 1000);

// Manage whitelist
await thordata.publicApi.whitelist.addIp("1.2.3.4");
const whitelist = await thordata.publicApi.whitelist.list();
```

---

## 📄 License

MIT License.