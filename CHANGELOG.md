# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-12-26

### Enterprise Readiness

- **Full TypeScript Support**: Migrated core utilities to TypeScript with strict type checking (Sprint 3 Task 3.1)
  - Converted `utils/createReactiveState.js` to TypeScript with proper type definitions
  - Converted `utils/theme.js` to TypeScript with `ThemeConfig`, `ThemeSubscriber` interfaces
  - Converted `utils/a11y.js` to TypeScript with `FocusTrap`, `DisclosureWidget` interfaces
  - Added strict TypeScript configuration with `tsconfig.json`
  - Updated Vitest configuration to handle both `.js` and `.ts` files
  - All 263 tests passing with TypeScript source files
  - Enhanced IDE support with IntelliSense, type checking, and auto-completion

- **Accessibility Utilities**: Comprehensive a11y helper functions for WCAG 2.1 AA compliance (Sprint 3 Task 3.2)
  - `isFocusable()` - Check if element can receive focus
  - `getFocusableElements()` - Get all focusable elements in container
  - `createFocusTrap()` - Trap focus within modal dialogs
  - `announce()` - Screen reader announcements with live regions
  - `createSkipLink()` - Keyboard navigation skip links
  - `setupAccessibleClick()` - Make non-interactive elements keyboard accessible
  - `createDisclosureWidget()` - Manage ARIA expanded state for accordions/dropdowns
  - Complete test coverage (28 tests)

- **Modal Component Accessibility**: Enhanced Modal component with WCAG 2.1 AA compliance (Sprint 3 Task 3.2)
  - Integrated focus trap to keep keyboard focus within modal dialog
  - Added `role="dialog"` and `aria-modal="true"` for screen reader context
  - Added `role="document"` to modal dialog wrapper
  - Automatic focus management - traps focus when modal opens
  - Focus restoration - returns focus to previously focused element on close
  - Enhanced keyboard navigation - Escape key closes modal (respects `dismissable` prop)
  - Screen reader announcements when modal opens/closes
  - Dynamic `aria-hidden` updates for accessibility tree management
  - All existing tests passing (5 tests)

- **Internationalization (i18n) System**: Full i18n support for multilingual applications (Sprint 3 Task 3.3)
  - Core i18n utility (`utils/i18n.ts`) with TypeScript support
  - Translation management with key-based lookups (dot notation: `common.buttons.save`)
  - Pluralization support using `Intl.PluralRules` API (zero, one, few, many, other forms)
  - Interpolation with placeholders (`"Welcome, {name}!"`)
  - Number, currency, date, and relative time formatting with `Intl` formatters
  - Locale switching with automatic subscriber notifications
  - Browser locale detection and localStorage persistence
  - Fallback locale support for missing translations
  - Lazy loading support for translation files
  - Data binding framework (`framework/i18nBinder.js`) with `data-i18n` attributes
  - Example locale files (English and Spanish) in `locales/` directory
  - Complete test coverage (33 tests)
  - All 296 tests passing

- **Theming System**: CSS custom properties with light/dark mode support (Sprint 3 Task 3.4)
  - Theme manager with registration, switching, and persistence
  - Built-in light and dark themes
  - System preference detection (`prefers-color-scheme`)
  - Auto-watch for system preference changes
  - localStorage persistence of user preference
  - CSS custom property tokens for colors, spacing, typography, shadows
  - Support for `prefers-reduced-motion` and `prefers-contrast: high`
  - Utility classes: `.rnx-sr-only`, `.rnx-skip-link`
  - Complete test coverage (24 tests)

- **Error Tracking and Boundaries**: Production-ready error monitoring (Sprint 3 Task 3.5)
  - Error tracking manager (`utils/errorTracking.ts`) with TypeScript support
  - `ErrorBoundary` component for catching errors in child components
  - Breadcrumb logging for debugging context (automatic timestamp, category, data)
  - Global context propagation (user info, app state, metadata)
  - Provider pattern for integration with error tracking services (Sentry, Rollbar, etc.)
  - Built-in providers: `SentryProvider`, `ConsoleProvider` (for development)
  - Custom error handler registration with `addHandler()`
  - Global error and unhandled promise rejection catching
  - `withErrorTracking()` wrapper for automatic error tracking in functions
  - ErrorBoundary features:
    - Catch errors in child components with fallback UI
    - Custom fallback rendering function
    - Error callback for custom handling
    - Automatic error tracking integration
    - Utility methods: `resetError()`, `getError()`
    - Event listener error catching
  - Complete test coverage (17 tests)

### Performance

- **Virtual Scrolling Component**: Efficient rendering for large lists (Sprint 2 Task 2.5)
  - VirtualList component for lists with 1000+ items
  - Only renders visible items + configurable buffer for smooth scrolling
  - Automatic viewport calculation and item positioning
  - Scroll event optimization (updates only on significant scroll changes)
  - Utility methods: `scrollToIndex()`, `scrollToTop()`, `scrollToBottom()`, `getVisibleRange()`
  - Reactive state integration for automatic updates
  - Customizable item height, visible count, and buffer size
  - Complete test coverage (19 tests)

- **Computed Properties**: Optimized derived state with equality checking (Sprint 2 Task 2.3)
  - Lazy evaluation with automatic caching
  - Automatic dependency tracking via Proxy
  - Equality checking to prevent unnecessary recomputations (shallow and deep equality)
  - Custom equality functions for complex data structures
  - `createComputed()` for single computed properties
  - `createComputedProperties()` for batch creation
  - Support for chained computed properties
  - Complete test coverage (30 tests)

- **Memory Leak Prevention**: Automatic cleanup and resource management (Sprint 2 Task 2.4)
  - Component auto-cleanup using MutationObserver when removed from DOM
  - Automatic disconnection of subscriptions and effects on component removal
  - Enhanced `destroy()` method with complete resource cleanup
  - Reactive state cleanup with `$unsubscribeAll()` and `$destroy()` methods
  - Proper cleanup of effect handlers and unmount callbacks
  - MutationObserver-based detection of DOM removal (supports nested removals)
  - Complete test coverage (22 tests)

- **Performance Monitoring Utilities**: Developer tools for identifying performance bottlenecks (Sprint 2 Task 2.6)
  - Core performance monitoring utility (`utils/performance.ts`) with TypeScript support
  - Mark and measure API (`rnxPerf.mark()`, `rnxPerf.measure()`) for tracking operation duration
  - Statistical reporting with count, total, min, max, and average duration
  - Slow operation warnings with configurable threshold (default: 16ms for 60fps)
  - `withPerf()` wrapper function for automatic performance tracking of sync/async functions
  - `@perf()` decorator for class methods with custom operation names
  - `logReport()` for console table output of performance statistics
  - Supports both `performance.now()` (high-resolution) and `Date.now()` (fallback)
  - Complete test coverage (29 tests)

- **Update Batching**: Implemented microtask-based batching for state updates (Sprint 2 Task 2.2)
  - Multiple synchronous state updates now batched into a single DOM update cycle
  - Reduces redundant notifications and improves performance for rapid updates
  - Example: `state.user.name = 'Alice'; state.user.email = 'a@b.c'; state.user.age = 30;` triggers one notification instead of three
  - Added `$flushSync()` utility for testing or when immediate synchronous updates are required
  - Performance improvement: Up to 1000x fewer DOM updates in scenarios with rapid state changes

- **Keyed List Diffing**: Implemented efficient O(n) list rendering with keyed reconciliation (Sprint 2 Task 2.1)
  - Similar to Vue's `v-for` with `:key` or React's key prop
  - Only creates/destroys DOM nodes that actually changed
  - Moves existing nodes instead of recreating them
  - Syntax: `data-for="item in items"` with optional `data-key="item.id"`
  - Supports nested lists and complex data structures

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
