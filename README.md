# Thordata JS SDK (Node.js / TypeScript)

Official JavaScript/TypeScript SDK for [Thordata](https://www.thordata.com).

Supports:

- **SERP API** (Google / Bing / Yandex / DuckDuckGo)
- **Web Unlocker / Universal API**
- **Web Scraper API** (task-based scraping)

> Status: early preview. APIs may evolve as the Python SDK and docs iterate.

---

## 📦 Installation

The current version is primarily for development and internal integration, not yet published to npm. You can use it through the following methods:

### 1. Local Development (Recommended)

```bash
git clone https://github.com/Thordata/thordata-js-sdk.git
cd thordata-js-sdk

npm install
npm run build
```

Reference via relative path in your project (e.g., monorepo scenario):

```typescript
import { ThordataClient, Engine } from "../thordata-js-sdk/dist";
```

### 2. Future npm Release (Planned)

```bash
npm install thordata-js-sdk
```

```typescript
import { ThordataClient, Engine } from "thordata-js-sdk";
```

## 🔐 Configuration

The SDK primarily depends on the following environment variables (examples directory uses dotenv):

```env
# Thordata Scraper Token (required for SERP / Universal / Web Scraper Builder)
THORDATA_SCRAPER_TOKEN=your_scraper_token_here

# Web Scraper Public API (task status/result download)
THORDATA_PUBLIC_TOKEN=your_public_token_here
THORDATA_PUBLIC_KEY=your_public_key_here
```

For development, you can copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
# Then edit .env
```

Examples use `import "dotenv/config"` to automatically load `.env`.

## 🚀 Quick Start

### 1. Initialize Client

```typescript
import { ThordataClient } from "thordata-js-sdk"; // or "../src" / "../dist"

const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN, // optional
  publicKey: process.env.THORDATA_PUBLIC_KEY,     // optional
});
```

## 🔍 SERP API Example

**Supported:**

- **Google**: Search / Shopping / Local / Videos / News / Product / Flights / Images / Lens / Trends / Hotels / Play / Jobs / Scholar / Maps / Finance / Patents
- **Bing**: Search / News / Shopping / Maps / Images / Videos
- **Yandex**: Search
- **DuckDuckGo**: Search

### Simple Google Search:

```typescript
import { ThordataClient, Engine } from "thordata-js-sdk";

const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
});

async function main() {
  const results = await client.serpSearch({
    query: "Thordata proxy network",
    engine: Engine.GOOGLE,
    num: 5,
  });

  const organic = results?.organic_results ?? results?.organic ?? [];
  console.log(`Found ${organic.length} organic results`);

  for (const item of organic.slice(0, 3)) {
    console.log("-", item.title, "->", item.link);
  }
}

main().catch(console.error);
```

For more complex Google News examples, refer to Python SDK documentation:

`docs/serp_reference.md` (Python repository)

In JS SDK, all SERP parameters are passed through fields in `serpSearch({ ... })` or via `...extra`, for example:

```typescript
await client.serpSearch({
  query: "AI regulation",
  engine: Engine.GOOGLE,
  searchType: "news",
  country: "us",
  language: "en",
  topic_token: "TOPIC_TOKEN",
  publication_token: "PUB_TOKEN",
  section_token: "SECTION_TOKEN",
  story_token: "STORY_TOKEN",
  so: 1, // 0=relevance, 1=date
});
```

## 🌐 Web Unlocker / Universal API Example

### Basic HTML Scraping (No JS Rendering):

```typescript
const html = await client.universalScrape({
  url: "https://httpbin.org/html",
  jsRender: false,
  outputFormat: "html",
});

console.log(String(html).slice(0, 300));
```

### Enable JS Rendering + Wait for Element Loading:

```typescript
const html = await client.universalScrape({
  url: "https://example.com/spa",
  jsRender: true,
  outputFormat: "html",
  waitFor: ".main-content", // Wait for this CSS selector to appear
});
```

### Pass Custom Headers / Cookies:

```typescript
const html = await client.universalScrape({
  url: "https://example.com/account",
  jsRender: true,
  outputFormat: "html",
  headers: [
    { name: "User-Agent", value: "Mozilla/5.0 (ThordataDemo/1.0)" },
    { name: "X-Demo-Header", value: "DemoValue" },
  ],
  cookies: [
    { name: "session", value: "abc123" },
  ],
});
```

### PNG Screenshot:

```typescript
const pngBytes = await client.universalScrape({
  url: "https://example.com",
  jsRender: true,
  outputFormat: "png",
});

import { writeFileSync } from "fs";
writeFileSync("screenshot.png", pngBytes as Buffer);
```

For more parameter descriptions, see Python SDK documentation:

`docs/universal_reference.md`

## 🕷️ Web Scraper API Example (Task-based Scraping)

Note: Requires `THORDATA_PUBLIC_TOKEN` and `THORDATA_PUBLIC_KEY`

```typescript
const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN,
  publicKey: process.env.THORDATA_PUBLIC_KEY,
});

async function runTask() {
  const taskId = await client.createScraperTask({
    fileName: "demo_task",
    spiderId: "example-spider-id",   // Get from Thordata Dashboard
    spiderName: "example.com",
    parameters: {
      url: "https://example.com",
    },
  });

  console.log("Task created:", taskId);

  const status = await client.waitForTask(taskId, {
    pollIntervalMs: 5000,
    maxWaitMs: 60000,
  });
  console.log("Final status:", status);

  if (status.toLowerCase() === "ready" || status.toLowerCase() === "success") {
    const downloadUrl = await client.getTaskResult(taskId, "json");
    console.log("Download URL:", downloadUrl);
  }
}
```

## 🔧 Error Handling & Response Codes

### API Response Codes

The SDK will automatically throw the corresponding exception based on the code field returned by the API. Common status codes are as follows:

| Code | Status | Exception | Description |
|------|--------|-----------|-------------|
| 200 | Success | - | Request successful, data retrieved. |
| 300 | Not collected | `ThordataAPIError` | Failed to parse/process response (no valid data). |
| 400 | Bad Request | `ThordataAPIError` | Invalid parameters. |
| 401 | Unauthorized | `ThordataAuthError` | Check your scraper token. |
| 403 | Forbidden | `ThordataAuthError` | Access denied. |
| 404 | Not Found | `ThordataAPIError` | Resource does not exist. |
| 429 | Too Many Requests | `ThordataRateLimitError` | Rate limit exceeded. Check `e.retryAfter`. |
| 500 | Internal Server Error | `ThordataAPIError` | Server-side error. |
| 504 | Timeout | `ThordataTimeoutError` | Gateway timed out waiting for upstream. |

### Handling Errors

```ts
import {
  ThordataAuthError,
  ThordataRateLimitError,
  ThordataTimeoutError,
} from "thordata-js-sdk";

try {
  const result = await client.serpSearch({ query: "test" });
} catch (e) {
  if (e instanceof ThordataAuthError) {
    console.error("Please check your API token");
  } else if (e instanceof ThordataRateLimitError) {
    console.error(`Rate limited! Retry after ${e.retryAfter} seconds`);
  } else if (e instanceof ThordataTimeoutError) {
    console.error("Request timed out, consider retrying");
  } else {
    console.error("Other error:", e);
  }
}
```

## 📁 Project Structure

```
thordata-js-sdk/
├── src/
│   ├── index.ts       # Public exports
│   ├── client.ts      # ThordataClient (SERP / Universal / Scraper)
│   ├── models.ts      # SerpOptions / UniversalOptions / ScraperTaskOptions
│   ├── enums.ts       # Engine / TaskStatus
│   ├── errors.ts      # ThordataError family
│   └── utils.ts       # Helper functions (headers, form body, error handling)
├── examples/
│   ├── basic_serp.ts
│   ├── basic_universal.ts
│   └── basic_scraper_task.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run examples (dev mode, using ts-node + ../src)
npx ts-node examples/basic_serp.ts
npx ts-node examples/basic_universal.ts
```

## 🔮 Roadmap

- Publish to npm
- Add unit tests (Jest/Vitest)
- Add basic CI (GitHub Actions)
- Keep documentation in sync with Python SDK (SERP / Universal / Web Scraper)