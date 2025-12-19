# Thordata JS SDK (Node.js / TypeScript)

Official JavaScript/TypeScript SDK for <!--citation:1-->.

This SDK supports:

- **SERP API** (Google / Bing / Yandex / DuckDuckGo / Baidu)
- **Web Unlocker / Universal API**
- **Web Scraper API** (task-based scraping)

It is designed to be:

- **TypeScript-first**
- **ESM-ready**
- **Offline-test friendly** (base URLs can be overridden to run examples/tests against a mock server)

---

## 📦 Installation

```bash
npm install thordata-js-sdk
```

If you are developing locally:

```bash
git clone https://github.com/Thordata/thordata-js-sdk.git
cd thordata-js-sdk
npm install
npm run build
```

---

## 🔐 Configuration

Set environment variables:

```bash
export THORDATA_SCRAPER_TOKEN=your_scraper_token
export THORDATA_PUBLIC_TOKEN=your_public_token
export THORDATA_PUBLIC_KEY=your_public_key
```

Or create a `.env` file (examples may use dotenv):

```env
THORDATA_SCRAPER_TOKEN=your_scraper_token
THORDATA_PUBLIC_TOKEN=your_public_token
THORDATA_PUBLIC_KEY=your_public_key
```

---

## 🚀 Quick Start

### Create a client

```typescript
import { ThordataClient } from "thordata-js-sdk";

const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN,
  publicKey: process.env.THORDATA_PUBLIC_KEY,
});
```

---

## 🔍 SERP API

### Basic Google Search

```typescript
import { ThordataClient, Engine } from "thordata-js-sdk";

const client = new ThordataClient({ scraperToken: process.env.THORDATA_SCRAPER_TOKEN! });

const data = await client.serpSearch({
  query: "Thordata proxy network",
  engine: Engine.GOOGLE,
  num: 5,
});

const organic = data?.organic ?? [];
console.log(`Found ${organic.length} organic results`);

for (const item of organic.slice(0, 3)) {
  console.log("-", item.title, "->", item.link);
}
```

### Recommended engines for Google verticals (News / Shopping)

Thordata supports both:

- Dedicated engines (recommended): `google_news`, `google_shopping`
- Generic Google + tbm via `searchType` (alternative)

#### Google News (recommended):

```typescript
const data = await client.serpSearch({
  query: "AI regulation",
  engine: "google_news",
  country: "us",
  language: "en",
  num: 10,
  so: 1, // 0=relevance, 1=date (Google News)
});
```

#### Google Shopping (recommended):

```typescript
const data = await client.serpSearch({
  query: "iPhone 15",
  engine: "google_shopping",
  country: "us",
  language: "en",
  num: 10,
  min_price: 500,
  max_price: 1500,
});
```

#### Alternative: Google generic engine + tbm (via searchType):

```typescript
const data = await client.serpSearch({
  query: "iPhone 15",
  engine: "google",
  searchType: "shopping", // maps to tbm=shop
  country: "us",
  language: "en",
  num: 10,
});
```

Official and up-to-date parameters are documented at: https://doc.thordata.com

---

## 🔓 Web Unlocker / Universal API

### Basic HTML scraping

```typescript
const html = await client.universalScrape({
  url: "https://httpbin.org/html",
  jsRender: false,
  outputFormat: "html",
});

console.log(String(html).slice(0, 300));
```

### JS rendering + wait for selector

```typescript
const html = await client.universalScrape({
  url: "https://example.com/spa",
  jsRender: true,
  outputFormat: "html",
  waitFor: ".main-content",
});
```

### Screenshot (PNG)

```typescript
import { writeFileSync } from "node:fs";

const pngBytes = await client.universalScrape({
  url: "https://example.com",
  jsRender: true,
  outputFormat: "png",
});

writeFileSync("screenshot.png", pngBytes as Buffer);
```

---

## 🕷️ Web Scraper API (Task-based)

Requires `THORDATA_PUBLIC_TOKEN` and `THORDATA_PUBLIC_KEY`.

```typescript
const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN,
  publicKey: process.env.THORDATA_PUBLIC_KEY,
});

const taskId = await client.createScraperTask({
  fileName: "demo_task",
  spiderId: "example-spider-id",
  spiderName: "example.com",
  parameters: { url: "https://example.com" },
});

console.log("Task created:", taskId);

const status = await client.waitForTask(taskId, {
  pollIntervalMs: 5000,
  maxWaitMs: 60000,
});

console.log("Final status:", status);

if (["ready", "success", "finished"].includes(status.toLowerCase())) {
  const downloadUrl = await client.getTaskResult(taskId, "json");
  console.log("Download URL:", downloadUrl);
}
```

---

## 🔧 Errors & Response Codes

The SDK throws typed errors when the API returns a non-success code (or non-2xx HTTP status).

| Code | Typical Meaning | Error class |
|------|----------------|-------------|
| 200 | Success | - |
| 300 | Not collected | `ThordataNotCollectedError` |
| 400 | Bad request | `ThordataValidationError` |
| 401/403 | Auth/Forbidden | `ThordataAuthError` |
| 402/429 | Quota/Rate limit | `ThordataRateLimitError` |
| 5xx | Server/timeout issues | `ThordataServerError` / `ThordataTimeoutError` |

### Example error handling:

```typescript
import {
  ThordataAuthError,
  ThordataRateLimitError,
  ThordataTimeoutError,
  ThordataNotCollectedError,
} from "thordata-js-sdk";

try {
  const data = await client.serpSearch({ query: "test", engine: "google" });
  console.log(data);
} catch (e) {
  if (e instanceof ThordataAuthError) {
    console.error("Auth error: check your token.");
  } else if (e instanceof ThordataRateLimitError) {
    console.error(`Rate limited. Retry after: ${e.retryAfter ?? "N/A"} seconds.`);
  } else if (e instanceof ThordataNotCollectedError) {
    console.error("Not collected (code=300). Consider retrying.");
  } else if (e instanceof ThordataTimeoutError) {
    console.error("Request timed out.");
  } else {
    console.error("Unexpected error:", e);
  }
}
```

---

## 🌍 Base URL Overrides (for offline tests / custom routing)

You can override API base URLs via environment variables:

```bash
export THORDATA_SCRAPERAPI_BASE_URL=http://127.0.0.1:12345
export THORDATA_UNIVERSALAPI_BASE_URL=http://127.0.0.1:12345
export THORDATA_WEB_SCRAPER_API_BASE_URL=http://127.0.0.1:12345
export THORDATA_LOCATIONS_BASE_URL=http://127.0.0.1:12345
```

Or via client config:

```typescript
const client = new ThordataClient({
  scraperToken: "dummy",
  baseUrls: { scraperapiBaseUrl: "http://127.0.0.1:12345" },
});
```

---

## 🧪 Development

```bash
npm install
npm run build
npm test
```

### Run examples (compiled):

```bash
node dist/examples/basic_serp.js
node dist/examples/basic_universal.js
```

---

## 📁 Project Structure

```
thordata-js-sdk/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── models.ts
│   ├── enums.ts
│   ├── errors.ts
│   ├── retry.ts
│   ├── endpoints.ts
│   └── utils.ts
├── examples/
│   ├── basic_serp.ts
│   ├── basic_universal.ts
│   ├── basic_scraper_task.ts
│   └── serp_google_news.ts
├── tests/
│   ├── serp.offline.test.ts
│   ├── mockServer.ts
│   └── examples.e2e.test.ts
├── .github/workflows/ci.yml
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## 🔮 Roadmap

- Publish stable releases to npm
- Add async streaming / higher-level helpers for AI agents
- Expand coverage for more engines/verticals (Flights/Maps/Scholar/Jobs, etc.)
- Add integration tests (optional scheduled job with real tokens)

---