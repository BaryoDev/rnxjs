# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-14

### CSS-Framework-Agnostic Theming

- **Pluggable theme system**: all 46 components resolve styling through `ThemeProvider`
  - `setTheme('bootstrap' | 'tailwind')`, `registerTheme(custom)`, `themeProvider`, `cn`, `cls`, `twMerge` exported from the package root
  - Bootstrap remains the default theme, so existing apps look identical after upgrading
  - New built-in Tailwind theme: professional design system (indigo primary, 14px UI density, complete hover/active/focus-visible/disabled states, `motion-reduce` support, WCAG AA warning contrast)
  - Smart class merging with Tailwind/Bootstrap conflict resolution (`utils/classNames.js`)

### Accessibility

- WAI-ARIA patterns across all components: `role="dialog"`/`aria-modal` (Modal, NavigationDrawer), menu pattern (Dropdown), `tablist`/`tab`/`tabpanel` (Tabs), combobox pattern with `aria-activedescendant` (Autocomplete), `role="switch"` (Switch), `aria-sort`/`scope="col"` (DataTable), `aria-current` (Pagination, Stepper, Breadcrumb, Sidebar, NavigationBar)
- Form controls: label association (for/id), `aria-describedby` for help/error text, `aria-invalid`, `aria-required`
- Escape-to-close for Modal, Dropdown, NavigationDrawer, DatePicker; keyboard activation (Enter/Space) for interactive Chips and StatCard
- Decorative icons marked `aria-hidden`; icon-only buttons get `aria-label` fallbacks; Skeleton announces loading state

### Changed

- Every component now works when called with no arguments (forgiving `= {}` defaults)
- Tooltip: new framework-agnostic imperative API (`show()`, `hide()`, `setContent()`, `destroy()`) with no Bootstrap JS dependency
- FileUpload: rebuilt drop zone with `addFiles()` API, human-readable sizes, per-file remove buttons

### Fixed

- **toast plugin**: `clear()` and the max-toast guard looped forever (removal was deferred), freezing the tab and crashing test workers; repeated installs no longer create duplicate containers
- **storage plugin**: `persist()` now writes the initial snapshot synchronously
- **Sidebar**: component was broken at runtime (invalid `createComponent` usage), now rewritten
- **VirtualList**: reactive item updates now recompute total height and visible range
- **XSS**: escaped `error.message`/`error.stack` in ErrorBoundary fallback, `icon` in StatCard, `value` in DatePicker, style attributes in Skeleton, label/attribute values in Button and Badge

## [1.0.0] - December 2025

**The first stable release of rnxJS!**

- **34 Production Components**: Complete component library with full test coverage
- **600+ Tests**: Comprehensive test suite covering all components, reactivity, and edge cases
- **Plugin System**: Extensible architecture with 3 official plugins (Router, Toast, Storage)
- **Backend Integrations**: Official packages for Django, Rails, Laravel, and Express
- **Complete Documentation**:
  - [API Reference](./docs/API.md) with stability guarantees
  - [Migration Guide](./docs/MIGRATION.md) for jQuery users
  - [Quick Start](./docs/QUICK-START.md) for new users
  - [Benchmarks](./docs/BENCHMARKS.md) vs jQuery/Vue/React
- **Performance**: ~10KB gzipped, <100ms time to interactive

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

## [0.3.5] - December 2025

**🛡️ Critical Stability Updates**
- **Infinite Loop Prevention**: Implemented a recursion guard in `DataBinder`. Input elements are now flagged during updates to prevent state changes from re-triggering the input listener, fixing potential browser crashes.
- **Component Hydration**: Added validation checks in `loadComponents` to ensure replacement nodes are valid before attempting to mount, preventing silent failures.
- **Testing**: Added specialized regression tests for DataBinder stability and FAB rendering.

## [0.3.15] - December 2025

- **Docs**: Added "Quick Start" key and "Samples" links to README for better onboarding.

## [0.3.4] - December 2025

**🐛 Bug Fixes**
- **Data Binding Synchronization**: Fixed a race condition where `data-bind` on vanilla HTML elements (like `<h1>`, `<p>`) would sometimes fail to populate or remain empty. Data binding is now synchronous and guaranteed to run immediately after component loading.
- **FAB Rendering**: Fixed `<FAB>` component not rendering correctly in certain environments. It now correctly uses the reactive state and renders as a button with the `.m3-fab` class.

## [0.3.3] - December 2025

**🐛 Critical Bug Fixes & Improvements**

- **Circular Dependency**: Fixed circular dependency in `AutoRegistry` by refactoring internal exports.
- **Bootstrap Config**: Added `setBootstrap()` and `getBootstrap()` to manually configure Bootstrap instance (fixing issues in bundlers where `window.bootstrap` is missing).
- **CSS Exports**: `package.json` now correctly exports `./css/*` for M3 theme imports.
- **Button Props**: `Button` component now correctly passes data attributes (e.g., `data-bs-toggle`) to the DOM element.
- **M3 Colors**: Adjusted M3 Secondary colors to be more neutral/gray to fit standard expectations.
- **Docs**: Clarified `Material Symbols` dependency in README.

## [0.3.0] - December 2025

**🎨 Material Design 3 & New Components**
- **Theme**: Added `bootstrap-m3-theme.css` for M3 styling overrides.
- **New Components**: `FAB`, `NavigationDrawer`, `Switch`, `Chips`, `Slider`, `TopAppBar`, `NavigationBar`, `List`, `Search`, `SegmentedButton`, `Icon`.
- **Updates**: `Button` (M3 variants: filled, tonal, elevated, text), `Card` (M3 variants), `Input` (floating labels).
- **Icons**: Added `Icon` component and support for Bootstrap Icons.

**🧪 Testing & Stability**
- **Tests**: Added full Vitest suite for new components and Playwright E2E tests for the M3 Demo.
- **Framework Fix**: Fixed critical issue in `createComponent` where state updates detached event listeners in re-rendered DOM nodes.

## [0.2.2] - December 2025

- **Release Bump**: Version bump to retry NPM publication.
- **Includes**: All fixes from v0.2.1 (Col rename, validation fixes).

## [0.2.1] - December 2025

**🐛 Bug Fixes & Improvements**

- **Component Rename**: `<Col>` renamed to `<Column>` to avoid conflict with native HTML `<col>` void element.
- **Validation**: Fixed `onclick` and string-based event attribute validation warnings.
- **Framework**: `createComponent` now correctly identifies root-level slots.
- **Input**: `Input` component now passes through all unknown attributes (enabling `data-bind` support).

**⚠️ Breaking Changes**

- **`<Col>` is now `<Column>`**: Please update your layouts to use `<Column>` instead of `<Col>`.

## [0.2.0] - December 2025

**✨ New Features**

- **Built-in Form Validation**: Add validation rules directly to your inputs!
  ```html
  <input data-bind="user.email" data-rule="required|email" />
  <span data-bind="errors.user.email"></span>
  ```
  - Supported rules: `required`, `email`, `numeric`, `min:n`, `max:n`, `pattern:regex`
  - Errors automatically populate `state.errors`

- **Global IntelliSense**: Full VS Code autocompletion support for CDN users via `global.d.ts`.
  - Just add `/// <reference types="@arnelirobles/rnxjs" />` or rely on automatic detection.

**⚠️ Breaking Changes**

- **Reserved State Property**: The validation system now reserves `state.errors` for validation messages. If you were using `errors` for other purposes in your state root, please rename it.

## [0.1.10] - December 2025

**🐛 Bug Fixes**

- Fixed race condition in `useEffect` cleanup during rapid state updates.

## [0.1.9] - December 2025

**🎉 Major Stability Release - Production Ready!**

This release focuses on **framework stabilization**, fixing 13 identified bugs, improving error handling, and adding comprehensive test coverage. The framework is now production-ready with **61 passing tests**.

> [!IMPORTANT]
> **NO BREAKING CHANGES** - All improvements are backward compatible. Existing code will continue to work without modifications.

#### 🐛 Critical Bug Fixes

- **Memory Leak Prevention**: Fixed memory leaks in reactive state subscriptions
  - Added `$unsubscribeAll()` and `$destroy()` cleanup methods
  - Automatic subscription cleanup tracking
  - Event listeners now properly removed on component destruction

- **Security Fix**: Replaced unsafe `eval()` usage in conditional rendering
  - Implemented safer `Function` constructor with limited scope
  - Added strict mode and proper error boundaries
  - Protects against potential XSS vulnerabilities

- **Error Boundaries**: Added comprehensive error handling
  - Try-catch blocks in all critical operations
  - Helpful error messages with `[rnxJS]` prefix
  - Single component errors no longer crash the entire app

#### ✨ New Features & Improvements

- **Array Reactivity**: Array mutation methods now trigger reactivity
  ```javascript
  state.items.push(4);    // ✅ Now works!
  state.items.pop();      // ✅ Now works!
  state.items.splice(1, 1); // ✅ Now works!
  ```

- **Input Validation**: Enhanced data binding with validation
  - Path format validation
  - State object validation
  - Helpful error messages for invalid inputs

- **Type Coercion**: Number inputs now return actual numbers
  ```html
  <input type="number" data-bind="age" />
  <!-- state.age will be a number, not a string! -->
  ```

- **Circular Reference Protection**: Handles circular references safely
  - WeakSet tracking to prevent infinite loops
  - Warnings when circular references detected

- **Performance Improvements**: Proxy caching for better performance
  - Reuses proxies instead of creating new ones
  - Significant improvement for deeply nested objects

- **Lifecycle Hooks**: New `onUnmount()` hook for cleanup
  ```javascript
  component.onUnmount(() => {
    // Cleanup code here
  });
  component.destroy(); // Manually trigger cleanup
  ```

- **Data Binding Cleanup**: New `unbindData()` function
  ```javascript
  unbindData(element); // Remove all bindings
  ```

#### 🧪 Testing

- **61 comprehensive tests** covering all core functionality
- Test framework: Vitest with happy-dom
- Full coverage for: reactive state, components, data binding
- Edge cases and error scenarios tested

#### 📦 New Package Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

#### 🔧 Internal Improvements

- Better focus preservation in component re-renders
- Improved error messages and logging
- Code quality improvements
- Removed duplicate code from examples

## [0.1.8] - November 2025

**🐛 Bug Fixes**

- Fixed a `TypeError` in `createReactiveState` when using array spread syntax (e.g., `[...state.array]`) or other Symbol-based operations.

## [0.1.7] - November 2025

**✨ New Features**

- **Reactive Data Binding**: Automatic two-way data binding with `data-bind` attribute
  ```html
  <input data-bind="username" />
  <p>Hello, <span data-bind="username"></span>!</p>
  
  <script>
    const state = rnx.createReactiveState({ username: '' });
    rnx.loadComponents(document, state);
  </script>
  ```

- **`createReactiveState()`**: Create reactive state objects with Proxy-based observation
  ```javascript
  const state = rnx.createReactiveState({
    user: { name: '', email: '' }
  });
  
  // Subscribe to changes
  state.subscribe('user.email', (newValue) => {
    console.log('Email changed:', newValue);
  });
  ```

- **`bindData()`**: Manually bind data to DOM elements
  ```javascript
  rnx.bindData(document.getElementById('form'), state);
  ```

**🔧 Improvements**

- Fixed `autoRegisterComponents()` to work correctly in global bundle context
- Added lazy loading for DataBinder to reduce bundle size when not used
- Updated README with comprehensive reactive binding documentation

**📦 API Additions**

- `rnx.createReactiveState(initialState)` - Create reactive state
- `rnx.bindData(rootElement, state)` - Bind data to elements
- `loadComponents()` now accepts optional `reactiveState` parameter

## [0.1.6] - October 2025

**✨ Features**

- Bootstrap-compatible component system
- 19 built-in components (Button, Input, Card, Modal, etc.)
- Automatic component registration with `autoRegisterComponents()`
- Conditional rendering with `data-if` attribute
- Slot-based content insertion
- Global bundle for script tag usage

**📦 Components Available**

- Form: `Button`, `Input`, `Checkbox`, `Radio`, `Select`, `Textarea`, `FormGroup`
- Layout: `Container`, `Row`, `Column`
- UI: `Alert`, `Badge`, `Card`, `Modal`, `Spinner`, `Toast`, `Pagination`
- Advanced: `Tabs`, `Accordion`

**Example Usage**

```html
<Container>
  <Card>
    <Button label="Click Me" variant="primary" />
  </Card>
</Container>

<script src="https://unpkg.com/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
<script>
  rnx.autoRegisterComponents();
  rnx.loadComponents();
</script>
```

## [0.1.0 - 0.1.5]
**Initial Release**

- Core component system
- Component registration via `registerComponent()`
- Manual component loading
- Bootstrap class mapping
- ES Module support
