# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-12-26

### Security

- **CRITICAL**: Fixed Remote Code Execution (RCE) vulnerability in `safeEvaluateCondition`
  - Previous versions used `new Function()` which allowed arbitrary code execution via `data-if` attributes
  - Attack vector: `<div data-if="constructor.constructor('alert(1)')()">` could execute JavaScript
  - Now uses whitelist-based expression parser that blocks dangerous patterns
  - **All users on v0.3.x and earlier should upgrade immediately**

- Added comprehensive security utilities module (`utils/security.js`):
  - `escapeHtml()` - Escape HTML entities to prevent XSS
  - `escapeAttribute()` - Safe attribute value escaping
  - `escapeJs()` - Safe JavaScript string escaping
  - `safeHtml` - Template tag with automatic escaping
  - `trustHtml()` / `isTrustedHtml()` - Opt-in for pre-sanitized content
  - `sanitizeText()` - Remove control characters and normalize input
  - `sanitizeUrl()` - Block dangerous protocols (javascript:, data:, vbscript:, file:)
  - `sanitizeObject()` - Prevent prototype pollution attacks

- Updated dependencies to fix vulnerabilities:
  - vitest: 1.x → 4.0.16
  - happy-dom: 12.x → 20.0.11
  - @vitest/coverage-v8: 1.x → 4.0.16
  - @vitest/ui: 1.x → 4.0.16

- Added SECURITY.md with vulnerability reporting process and security best practices

### Added

- New security test suite with 92 tests covering:
  - RCE attack vectors (constructor chains, prototype pollution, global access)
  - XSS prevention (HTML escaping, URL sanitization)
  - Input sanitization (objects, text, URLs)

- TypeScript definitions for all security utilities

### Changed

- License changed from MIT to MPL-2.0
- Framework no longer requires `unsafe-eval` in Content Security Policy

### Fixed

- Modal tests updated for vitest 4.x compatibility

## [0.3.16] - 2025-12-XX

- Previous stable release

---

## Security Advisory

**Versions 0.3.x and earlier contain a critical RCE vulnerability.**

If you are using rnxJS < 0.4.0, an attacker who can control the content of `data-if` attributes could execute arbitrary JavaScript in users' browsers.

**Immediate Actions:**
1. Upgrade to v0.4.0 or later
2. Review any user-generated content that might flow into `data-if` attributes
3. Implement Content Security Policy headers

For more information, see [SECURITY.md](./SECURITY.md).
