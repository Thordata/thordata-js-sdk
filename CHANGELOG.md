# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-02-02

### Added

- **Browser API** (P1):
  - New `thordata.browser.getConnectionUrl()` for remote browser connections.
  - Support for Playwright/Puppeteer integration via WebSocket.
  - Environment variable support: `THORDATA_BROWSER_USERNAME`, `THORDATA_BROWSER_PASSWORD`.

- **Enhanced SERP Engines**:
  - Added `client.serp.google.jobs(...)` for Google Jobs search.
  - Added `client.serp.google.shopping(...)` for Google Shopping with optional product ID.
  - Added `client.serp.google.patents(...)` for Google Patents search.
  - Added `client.serp.google.trends(...)` for Google Trends search.

- **Extended Public API**:
  - `thordata.publicApi.trafficBalance()` - Get traffic balance.
  - `thordata.publicApi.walletBalance()` - Get wallet balance.
  - `thordata.publicApi.whitelist.deleteIp(...)` - Remove IP from whitelist.
  - `thordata.publicApi.whitelist.list()` - List all whitelisted IPs.
  - `thordata.publicApi.proxyUsers.update(...)` - Update proxy user.
  - `thordata.publicApi.proxyUsers.delete(...)` - Delete proxy user.
  - `thordata.publicApi.proxyUsers.usage(...)` - Get user usage statistics.
  - `thordata.publicApi.proxyUsers.usageHour(...)` - Get hourly usage statistics.

- **Enhanced Proxy Network** (P1):
  - Added HTTP method wrappers: `thordata.proxy.get()`, `post()`, `put()`, `delete()`, `patch()`, `head()`, `options()`.
  - Full support for request headers, query params, request body, and response type configuration.
  - **Note**: SOCKS5h proxy is recommended; TLS-in-TLS support is handled via standard agents with upstream proxy support via `THORDATA_UPSTREAM_PROXY` env var.

### Changed

- **Proxy Namespace**: `thordata.proxy.request()` now uses the new `proxyRequest` method internally for consistent handling.
- **Type Exports**: Added `BrowserNamespace` and `ProxyRequestConfig` to public exports.

## [2.1.1] - 2026-02-24

### Fixed

- **Proxy requests**: fixed a bug where proxy HTTP requests could fail with `Invalid URL` in Node.js (missing axios `url` field).
- **Configuration**: `Thordata` can now be constructed without `THORDATA_SCRAPER_TOKEN` (Public API / Proxy / Browser usage is now truly lazy-validated per feature).
- **Package entrypoints**: fixed npm export paths to match build outputs (`dist/src/*`).
- **Networking errors**: improved error message for common SOCKS failures (`Socket closed`) with actionable hints.

### Changed

- **Logging**: upstream proxy hints are now only printed when `debug: true` is passed to the client/wrapper config.
- **CI workflows**: removed submodule checkout since the repository no longer uses git submodules.
- **Repo cleanup**: removed internal verification scripts, redundant examples, and legacy debug artifacts to keep the repo minimal.

## [2.0.0] - 2026-01-30

### Changed (Breaking)

- **Package Name**: Renamed npm package from `thordata-js-sdk` to `@thordata/js-sdk`.
- **Main Entry**: Introduced a new high-level `Thordata` wrapper that composes an internal `ThordataClient` instead of extending it.
  - Old usage such as `new Thordata().serpSearch(...)` should be migrated to either:
    - `new Thordata().client.serpSearch(...)`, or
    - `new ThordataClient(...).serpSearch(...)`.

### Added

- **Namespaced APIs** for more productized usage:
  - `thordata.unlocker.scrape(...)` for Web Unlocker / Universal API.
  - `thordata.scraperTasks.create / wait / result / run / list(...)` for Web Scraper Tasks.
  - `thordata.publicApi.usageStatistics / whitelist.addIp / proxyUsers.list/create / proxy.listServers/expiration`.
  - `thordata.proxy.request(url, { proxy })` for high-level proxy HTTP requests.
- **SERP Engines Namespace**:
  - `client.serp.google.search/news/maps/flights(...)`
  - `client.serp.bing.search/news(...)`

## [1.1.0] - 2026-01-06

### Added
- **Proxy Expiration**: Added `getProxyExpiration` method to check proxy validity.
- **User-Agent Standard**: Standardized User-Agent format to `thordata-js-sdk/{version} node/{ver} ({platform}/{arch})`.
- **Documentation**: Rewrote `README.md` with clear "Core Features" and "Advanced Usage" sections.

### Fixed
- **Error Handling**: Enhanced `handleAxiosError` to extract detailed error messages from non-200 API responses (e.g., 404/500 bodies).
- **Dependencies**: Moved `http-proxy-agent` and `https-proxy-agent` to `dependencies` to ensure proxies work out-of-the-box.
- **Linting**: Fixed unused variables and tightened TypeScript checks.

## [1.0.1] - 2026-01-05

### Added

- **User-Agent Standardization**: Updated User-Agent to `thordata-js-sdk/{version} node/{ver} ({platform}/{arch})`.
- **Proxy Expiration**: Added `getProxyExpiration` method to `ThordataClient`.

### Fixed

- **Type Safety**: Improved TypeScript definitions and removed `any` usage in critical paths.
- **Error Handling**: Enhanced `handleAxiosError` to extract detailed error messages from API responses (404/500).
- **Dependencies**: Moved `http-proxy-agent` and `https-proxy-agent` to `dependencies` for proper runtime proxy support.
