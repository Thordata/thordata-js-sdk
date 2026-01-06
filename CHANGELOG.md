# Changelog

All notable changes to this project will be documented in this file.

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
