# Changelog

## [0.3.0] - 2025-12-22

### Breaking Changes

- Environment variable renamed: `THORDATA_TOKEN` -> `THORDATA_SCRAPER_TOKEN`

### Added

- Complete Engine enum with all Google (22), Bing (7), Yandex (2), DuckDuckGo (2) engines
- GoogleTbm enum for tbm parameter
- Continent, Country, ProxyHost, ProxyPort enums
- Location API with string parameter support
- SSL verification option (verifySsl config)
- Comprehensive JSDoc comments

### Fixed

- Remove self-referencing dependency in package.json
- Move dotenv to devDependencies
- Remove unused zod dependency
- Fix OutputFormat to only support html/png

## [0.2.0] - Previous release

- Initial public release
