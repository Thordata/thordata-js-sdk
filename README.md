# Thordata JS SDK (Node.js / TypeScript)

Official JavaScript/TypeScript SDK for Thordata APIs.

This SDK supports:

- **SERP API** (Google / Bing / Yandex / DuckDuckGo)
- **Web Unlocker / Universal API**
- **Web Scraper API** (task-based scraping)
- **Proxy Network** (Residential / Datacenter / Mobile / ISP)
- **Location API** (Geo-targeting options)

It is designed to be:

- **TypeScript-first** with full type definitions
- **ESM-ready** with CommonJS fallback
- **Offline-test friendly** (base URLs can be overridden)

---

## 📦 Installation

```bash
npm install thordata-js-sdk
```

For local development:

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
export THORDATA_TOKEN=your_scraper_token
export THORDATA_PUBLIC_TOKEN=your_public_token
export THORDATA_PUBLIC_KEY=your_public_key
```

Or create a `.env` file:

```env
THORDATA_TOKEN=your_scraper_token
THORDATA_PUBLIC_TOKEN=your_public_token
THORDATA_PUBLIC_KEY=your_public_key
```

---

## 🚀 Quick Start

Create a client:

```typescript
import { ThordataClient } from "thordata-js-sdk";

const client = new ThordataClient({
  scraperToken: process.env.THORDATA_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN,
  publicKey: process.env.THORDATA_PUBLIC_KEY,
});
```

Or use the convenience wrapper:

```typescript
import { Thordata } from "thordata-js-sdk";

// Automatically reads from environment variables
const client = new Thordata();
```

---

## 🔍 SERP API

### Supported Engines

| Engine     | Identifier | Notes                  |
| ---------- | ---------- | ---------------------- |
| Google     | google     | Base web search        |
| Bing       | bing       | Base web search        |
| Yandex     | yandex     | Uses text instead of q |
| DuckDuckGo | duckduckgo | Base web search        |

### Google Specialized Engines

For Google verticals, use dedicated engines for best results:

| Engine          | Identifier      |
| --------------- | --------------- |
| Google News     | google_news     |
| Google Shopping | google_shopping |
| Google Images   | google_images   |
| Google Videos   | google_videos   |
| Google Maps     | google_maps     |
| Google Scholar  | google_scholar  |
| Google Patents  | google_patents  |
| Google Jobs     | google_jobs     |
| Google Flights  | google_flights  |
| Google Finance  | google_finance  |
| Google Product  | google_product  |

### Basic Search

```typescript
import { ThordataClient, Engine } from "thordata-js-sdk";

const client = new ThordataClient({ scraperToken: process.env.THORDATA_TOKEN! });

const data = await client.serpSearch({
  query: "Thordata proxy network",
  engine: Engine.GOOGLE,
  country: "us",
  language: "en",
  num: 10,
});

const organic = data?.organic ?? [];
console.log(`Found ${organic.length} organic results`);
```

### Google News (Recommended: Dedicated Engine)

```typescript
const news = await client.serpSearch({
  query: "AI regulation",
  engine: Engine.GOOGLE_NEWS,
  country: "us",
  language: "en",
  num: 10,
});
```

### Google Shopping

```typescript
const shopping = await client.serpSearch({
  query: "iPhone 15",
  engine: Engine.GOOGLE_SHOPPING,
  country: "us",
  language: "en",
  num: 10,
});
```

### Alternative: Using tbm Parameter

For some Google engines, you can also use the searchType (tbm) parameter:

```typescript
import { GoogleTbm } from "thordata-js-sdk";

const images = await client.serpSearch({
  query: "cats",
  engine: Engine.GOOGLE,
  searchType: GoogleTbm.IMAGES, // or just "isch"
});
```

> **Note:** Using dedicated engines (e.g., `Engine.GOOGLE_NEWS`) is recommended over `Engine.GOOGLE + searchType` for clearer parameter contracts.

---

## 🌐 Web Unlocker / Universal API

### Supported Output Formats

| Format | Description            |
| ------ | ---------------------- |
| html   | HTML content (default) |
| png    | PNG screenshot         |

### Basic HTML Scraping

```typescript
const html = await client.universalScrape({
  url: "https://httpbin.org/html",
  jsRender: false,
  outputFormat: "html",
});

console.log(String(html).slice(0, 300));
```

### JS Rendering + Wait for Selector

```typescript
const html = await client.universalScrape({
  url: "https://example.com/spa",
  jsRender: true,
  outputFormat: "html",
  waitFor: ".main-content", // Wait for element to appear
});
```

### Block Resources for Performance

```typescript
const html = await client.universalScrape({
  url: "https://example.com",
  jsRender: true,
  blockResources: "image,media", // Block images and media
  cleanContent: "js,css", // Remove JS and CSS from output
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

### Custom Headers and Cookies

```typescript
const html = await client.universalScrape({
  url: "https://example.com/account",
  jsRender: true,
  headers: [
    { name: "User-Agent", value: "Mozilla/5.0 (ThordataBot)" },
    { name: "Accept-Language", value: "en-US,en;q=0.9" },
  ],
  cookies: [{ name: "sessionid", value: "abc123" }],
});
```

---

## 🌍 Proxy Network

Each proxy product requires separate credentials from Thordata Dashboard.

### Environment Variables

```env
# Residential Proxy (port 9999)
THORDATA_RESIDENTIAL_USERNAME=your_residential_username
THORDATA_RESIDENTIAL_PASSWORD=your_residential_password

# Datacenter Proxy (port 7777)
THORDATA_DATACENTER_USERNAME=your_datacenter_username
THORDATA_DATACENTER_PASSWORD=your_datacenter_password

# Mobile Proxy (port 5555)
THORDATA_MOBILE_USERNAME=your_mobile_username
THORDATA_MOBILE_PASSWORD=your_mobile_password

# Static ISP Proxy (port 6666)
THORDATA_ISP_HOST=your_static_ip_address
THORDATA_ISP_USERNAME=your_isp_username
THORDATA_ISP_PASSWORD=your_isp_password
```

### Residential Proxy

```typescript
import { Thordata } from "thordata-js-sdk";

const client = new Thordata();

// Basic US residential
const proxy = Thordata.Proxy.residentialFromEnv().country("us");
const result = await client.request("http://httpbin.org/ip", { proxy });
console.log("IP:", result.origin);

// Sticky session (same IP for 30 minutes)
const stickyProxy = Thordata.Proxy.residentialFromEnv()
  .country("jp")
  .city("tokyo")
  .session("my_session")
  .sticky(30);
```

### Datacenter Proxy

```typescript
const proxy = Thordata.Proxy.datacenterFromEnv();
const result = await client.request("http://httpbin.org/ip", { proxy });
```

### Mobile Proxy

```typescript
const proxy = Thordata.Proxy.mobileFromEnv().country("gb");
const result = await client.request("http://httpbin.org/ip", { proxy });
```

### Static ISP Proxy

```typescript
const proxy = Thordata.Proxy.ispFromEnv();
const result = await client.request("http://httpbin.org/ip", { proxy });
```

---

## 📍 Location API

Query available geo-targeting options. Requires `THORDATA_PUBLIC_TOKEN` and `THORDATA_PUBLIC_KEY`.

### List Countries

```typescript
// Using string parameter (recommended)
const countries = await client.listCountries("residential");

// Or numeric parameter (1 = residential, 2 = unlimited)
const countries2 = await client.listCountries(1);

console.log(`Found ${countries.length} countries`);
// [{ country_code: "US", country_name: "United States" }, ...]
```

### List States

```typescript
const states = await client.listStates("US", "residential");
console.log(`Found ${states.length} states`);
// [{ state_code: "california", state_name: "California" }, ...]
```

### List Cities

```typescript
const cities = await client.listCities("US", "california", "residential");
console.log(`Found ${cities.length} cities`);
// [{ city_name: "Los Angeles" }, { city_name: "San Francisco" }, ...]
```

### List ASNs

```typescript
const asns = await client.listAsns("US", "residential");
console.log(`Found ${asns.length} ASNs`);
// [{ asn_code: "AS7922", asn_name: "Comcast" }, ...]
```

---

## 🕷️ Web Scraper API (Task-based)

Requires `THORDATA_PUBLIC_TOKEN` and `THORDATA_PUBLIC_KEY`.

```typescript
const client = new ThordataClient({
  scraperToken: process.env.THORDATA_TOKEN!,
  publicToken: process.env.THORDATA_PUBLIC_TOKEN,
  publicKey: process.env.THORDATA_PUBLIC_KEY,
});

// Create task
const taskId = await client.createScraperTask({
  fileName: "demo_task",
  spiderId: "example-spider-id",
  spiderName: "example.com",
  parameters: { url: "https://example.com" },
});

console.log("Task created:", taskId);

// Wait for completion
const status = await client.waitForTask(taskId, {
  pollIntervalMs: 5000,
  maxWaitMs: 60000,
});

console.log("Final status:", status);

// Download results
if (["ready", "success", "finished"].includes(status.toLowerCase())) {
  const downloadUrl = await client.getTaskResult(taskId, "json");
  console.log("Download URL:", downloadUrl);
}
```

---

## 🔧 Error Handling

The SDK throws typed errors based on API response codes:

| Code    | Meaning       | Error Class               |
| ------- | ------------- | ------------------------- |
| 200     | Success       | -                         |
| 300     | Not collected | ThordataNotCollectedError |
| 400     | Bad request   | ThordataValidationError   |
| 401/403 | Auth error    | ThordataAuthError         |
| 402/429 | Rate limit    | ThordataRateLimitError    |
| 5xx     | Server error  | ThordataServerError       |

> **Billing Note:** Only requests with code == 200 are billed.

### Example

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

## ⚙️ Advanced Configuration

### SSL Verification

```typescript
const client = new ThordataClient({
  scraperToken: process.env.THORDATA_TOKEN!,
  verifySsl: false, // Only for testing with self-signed certs
});
```

### Retry Configuration

```typescript
const client = new ThordataClient({
  scraperToken: process.env.THORDATA_TOKEN!,
  maxRetries: 3, // Retry up to 3 times on transient failures
  timeoutMs: 60000, // 60 second timeout
});
```

### Base URL Overrides

For testing or custom routing:

```bash
export THORDATA_SCRAPERAPI_BASE_URL=http://127.0.0.1:12345
export THORDATA_UNIVERSALAPI_BASE_URL=http://127.0.0.1:12345
```

Or via config:

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
npm run lint
npm run format
```

### Run Examples

```bash
node dist/examples/basic_serp.js
node dist/examples/basic_universal.js
```

---

## 📁 Project Structure

```
thordata-js-sdk/
├── src/
│   ├── index.ts        # Main exports
│   ├── client.ts       # ThordataClient class
│   ├── thordata.ts     # Convenience wrapper
│   ├── proxy.ts        # Proxy configuration
│   ├── models.ts       # TypeScript interfaces
│   ├── enums.ts        # Enumerations
│   ├── errors.ts       # Error classes
│   ├── utils.ts        # Helper functions
│   └── endpoints.ts    # API endpoints
├── examples/
├── tests/
├── package.json
└── README.md
```

---

## 📚 API Reference

For detailed API documentation, visit:

- [Google Search Parameters](#)
- [Google News Parameters](#)
- [Google Shopping Parameters](#)
- [Yandex Parameters](#)
- [Universal API Parameters](#)

---

## 📄 License

MIT License - see LICENSE for details.
