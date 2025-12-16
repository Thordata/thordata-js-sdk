# Thordata JS SDK (Node.js / TypeScript)

Official JavaScript/TypeScript SDK for [Thordata](https://www.thordata.com).

## Supports

- **SERP API** (Google/Bing/Yandex/DuckDuckGo)
- **Web Unlocker / Universal API**
- **Web Scraper API** (task-based scraping)

> **Status**: Early preview. APIs may evolve as Python SDK and docs iterate.

## Installation

### Standard Installation

```bash
npm install thordata-js-sdk
```

### Development Installation

```bash
npm install
npm run build
```

## Quick Start

### TypeScript

```typescript
import { ThordataClient, Engine } from "thordata-js-sdk";

const client = new ThordataClient({
  scraperToken: process.env.THORDATA_SCRAPER_TOKEN!,
});

// SERP example
const results = await client.serpSearch({
  query: "Thordata proxy network",
  engine: Engine.GOOGLE,
  num: 5,
});

// Universal example
const html = await client.universalScrape({
  url: "https://httpbin.org/html",
  jsRender: false,
  outputFormat: "html",
});
```

## Examples

For more usage patterns, see `examples/` directory.

---

### Available Features

#### SERP Search
- Search across multiple search engines
- Support for different search types and filters
- Real-time search results

#### Universal Scrape
- Dynamic web page scraping
- JavaScript rendering support
- Custom headers and cookies
- Proxy country selection

#### Web Scraper
- Task-based scraping
- Asynchronous processing
- Result management

### Getting Started

1. **Install the SDK**
   ```bash
   npm install thordata-js-sdk
   ```

2. **Import and initialize**
   ```typescript
   import { ThordataClient } from "thordata-js-sdk";
   const client = new ThordataClient({
     scraperToken: "your-scraper-token"
   });
   ```

3. **Start scraping**
   ```typescript
   // SERP search
   const searchResults = await client.serpSearch({
     query: "your search query",
     engine: Engine.GOOGLE
   });
   
   // Universal scraping
   const webpage = await client.universalScrape({
     url: "https://example.com"
   });
   ```

### Configuration Options

The SDK supports various configuration options for different scraping needs:

- **Engine selection**: Choose from Google, Bing, Yandex, DuckDuckGo
- **Output formats**: HTML, JSON, or screenshot formats
- **Rendering options**: Enable/disable JavaScript rendering
- **Proxy settings**: Select proxy country for geo-targeted results
- **Custom headers**: Add custom request headers
- **Timeout settings**: Configure request timeouts

### Environment Setup

Make sure to set your environment variable:

```bash
export THORDATA_SCRAPER_TOKEN=your_actual_scraper_token
```

Or use a `.env` file in your project root:

```
THORDATA_SCRAPER_TOKEN=your_actual_scraper_token
```

### Notes

- This SDK is in early preview status
- APIs may evolve as the Python SDK and documentation iterate
- Check the `examples/` directory for comprehensive usage patterns
- Ensure proper error handling in your production applications