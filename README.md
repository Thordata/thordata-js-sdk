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
*   **🛡️ Proxy Support:** HTTPS proxy support with authentication (recommended). SOCKS5 support depends on your account/endpoint configuration.
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
THORDATA_SCRAPER_TOKEN=your_scraper_token

# Optional (required for Web Scraper tasks status/download and Public/Locations APIs)
THORDATA_PUBLIC_TOKEN=your_public_token
THORDATA_PUBLIC_KEY=your_public_key

# Optional: Residential proxy credentials
THORDATA_RESIDENTIAL_USERNAME=your_username
THORDATA_RESIDENTIAL_PASSWORD=your_password

# Optional: Upstream proxy (Clash/V2Ray, corporate firewall, etc.)
# THORDATA_UPSTREAM_PROXY=socks5://127.0.0.1:7898
```

Tip: copy `.env.example` to `.env` for a full reference.

---

## 🚀 Quick Start

### 1. SERP Search

```typescript
import "dotenv/config";
import { Thordata, Engine } from "@thordata/js-sdk";

async function main() {
  const thordata = new Thordata(); // reads THORDATA_* from env
  const result = await thordata.client.serpSearch({
    query: "SpaceX launch",
    engine: Engine.GOOGLE_NEWS,
    country: "us",
    num: 5
  });
  
  console.log(result);
}

main().catch(console.error);
```

### 2. Universal Scrape (Web Unlocker)

```typescript
import "dotenv/config";
import { Thordata } from "@thordata/js-sdk";

async function main() {
  const thordata = new Thordata();
  const html = await thordata.unlocker.scrape({
    url: "https://httpbin.org/html",
    jsRender: false,
    outputFormat: "html"
  });
  
  console.log("HTML length:", typeof html === "string" ? html.length : 0);
}

main().catch(console.error);
```

### 3. Using the Proxy Network

```typescript
import "dotenv/config";
import { Thordata } from "@thordata/js-sdk";

async function main() {
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
    headers: { "Content-Type": "application/json" },
  });
  console.log(postResponse);
}

main().catch(console.error);
```

---

## ⚙️ Advanced Usage

### Browser API (Remote Browser)

```typescript
import "dotenv/config";
import { Thordata } from "@thordata/js-sdk";
import { chromium } from "playwright";

async function main() {
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
}

main().catch(console.error);
```

### Task Management (Async)

```typescript
import "dotenv/config";
import { Thordata } from "@thordata/js-sdk";

async function main() {
  const thordata = new Thordata(); // reads from env

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
}

main().catch(console.error);
```

### Public API - Account Management

```typescript
import "dotenv/config";
import { Thordata } from "@thordata/js-sdk";

// Public API does NOT require THORDATA_SCRAPER_TOKEN.
async function main() {
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
  console.log("Whitelist:", whitelist);
}

main().catch(console.error);
```

---

## 🧰 Debugging

By default, the SDK stays quiet (no noisy stdout logs). To enable debug notes (e.g. upstream proxy hints):

```typescript
import { Thordata } from "@thordata/js-sdk";

const thordata = new Thordata({ debug: true });
```

---

## 📄 License

MIT License.