# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-05

### Added

- **User-Agent Standardization**: Updated User-Agent to `thordata-js-sdk/{version} node/{ver} ({platform}/{arch})`.
- **Proxy Expiration**: Added `getProxyExpiration` method to `ThordataClient`.

### Fixed

- **Type Safety**: Improved TypeScript definitions and removed `any` usage in critical paths.
- **Error Handling**: Enhanced `handleAxiosError` to extract detailed error messages from API responses (404/500).
- **Dependencies**: Moved `http-proxy-agent` and `https-proxy-agent` to `dependencies` for proper runtime proxy support.
