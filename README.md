# Thordata Node.js SDK

<div align="center">

<img src="https://img.shields.io/badge/Thordata-AI%20Infrastructure-blue?style=for-the-badge" alt="Thordata Logo">

**The Official Node.js/TypeScript Client for Thordata APIs**

*Proxy Network • SERP API • Web Unlocker • Web Scraper API*

[![npm version](https://img.shields.io/npm/v/thordata-js-sdk.svg?style=flat-square)](https://www.npmjs.com/package/thordata-js-sdk)
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

---

## 📦 Installation

```bash
npm install thordata-js-sdk
# or
yarn add thordata-js-sdk
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
import { ThordataClient, Engine } from "thordata-js-sdk";

const client = new ThordataClient({}); // Auto-loads from env

async function search() {
  const result = await client.serpSearch({
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
  const html = await client.universalScrape({
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
import { Thordata } from "thordata-js-sdk";

// Create a targeted proxy config
const proxy = Thordata.Proxy.residentialFromEnv()
  .country("gb")
  .city("london")
  .sticky(10); // 10 minutes session

const client = new Thordata();

// Request uses the proxy automatically
const response = await client.request("https://ipinfo.io/json", { proxy });
console.log(response);
```

---

## ⚙️ Advanced Usage

### Task Management (Async)

```typescript
// Create a scraping task
const taskId = await client.createScraperTask({
  fileName: "task_001",
  spiderId: "universal",
  spiderName: "universal",
  parameters: { url: "https://example.com" }
});

console.log(`Task ${taskId} created. Waiting...`);

// Poll for completion
const status = await client.waitForTask(taskId);

if (status === "ready") {
  const downloadUrl = await client.getTaskResult(taskId);
  console.log("Result:", downloadUrl);
}
```

---

## 📄 License

MIT License.