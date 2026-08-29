# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## House Rules

These are standing rules. Follow them without being asked and without asking
for confirmation.

### No attribution

Never add `Co-Authored-By: Claude`, a `Claude-Session:` trailer, a "Generated
with Claude Code" line, a robot emoji, or a claude.ai link to a commit message,
PR body, code comment, or any file in this repo. Commits are authored as
Arnel Robles <arnelirobles@gmail.com>, never as Claude.

`.claude/settings.json` turns the built-in footers off and sets the identity.
`.githooks/commit-msg` rejects anything that gets through.

### No em dashes or en dashes

Not in commit messages, not in file contents, not in chat replies. Use a comma,
a colon, or split the sentence. If existing content has one, revise it rather
than working around it. `.githooks/pre-commit` blocks staged file content and
`.githooks/commit-msg` blocks commit messages.

### Be brief

Answer in as few words as the question needs. Lead with the answer, not the
method. Specifically:

- No preamble, no restating the request, no summarising what you just did at
  the end of a message that already showed it.
- Report findings, not the search. Skip narration of tool calls that worked.
- Tables and headings only when comparing several things. A one line answer
  beats a formatted report.
- Commit bodies stay under roughly ten lines. Say what was wrong and why the
  change fixes it, then stop.

### Decide, do not ask

Make the routine call yourself and state the assumption in one line. Ask only
when proceeding either way would be unsafe or would waste real work. Never ask
which of these house rules to apply.

### Commits

Subjects use `type: lowercase imperative summary`. Enable the hooks once per
clone: `git config core.hooksPath .githooks`

## Project Overview

rnxJS is a Bootstrap-native reactive framework designed for production apps. It provides zero-build, CDN-ready reactive components and data binding for backend developers (Django, Rails, Laravel, Express) and internal tools. The framework includes 46+ production-ready components, a reactive state system, and official backend integrations.

## Core Architecture

### Reactive System
The framework's reactivity is built on ES6 Proxies with a subscription-based change detection system:

- **`utils/createReactiveState.js`**: Core reactive state implementation using Proxy with:
  - Path-based subscriptions (e.g., `state.subscribe('user.email', callback)`)
  - Microtask-batched notifications to prevent redundant updates
  - Deep nesting support with proxy caching
  - Circular reference protection using WeakSet
  - Array mutation detection (push, pop, splice, etc.)

- **`utils/createComponent.js`**: Component lifecycle management with:
  - Template rendering with state injection
  - Focus preservation during re-renders (critical for input fields)
  - `useEffect` hooks with cleanup functions
  - `onUnmount` hooks for resource cleanup
  - Auto-cleanup via MutationObserver when removed from DOM
  - Slot-based content insertion via `[data-slot]`

### Framework Core
Located in `framework/` directory:

- **`ComponentLoader.js`**: Recursive component hydration engine
  - Processes custom HTML tags and replaces them with rendered components
  - Handles conditional rendering via `data-if` with safe expression evaluation (blocks eval, Function, prototype pollution)
  - Case-insensitive tag matching (handles both `<FAB>` and `<fab>`)
  - Error boundaries to prevent single component failures from crashing the app

- **`DataBinder.js`**: Two-way and one-way data binding system
  - Two-way binding for form elements (input, textarea, select)
  - One-way binding for display elements (span, div, p)
  - Built-in validation with `data-rule` attribute (required, email, numeric, min, max, pattern)
  - Type coercion for number inputs
  - Infinite loop prevention via `_isUpdating` flag
  - List rendering via `data-for` with keyed diffing

- **`ListRenderer.js`**: Efficient list rendering with keyed diffing algorithm
  - Syntax: `data-for="item in items"` or `data-for="(item, index) in items"`
  - Optional keying: `data-key="item.id"`
  - Nested bindings support within list items

- **`Registry.js`**: Component registration system
  - Maps tag names to component functions
  - Used by `loadComponents` to resolve custom tags

- **`AutoRegistry.js`**: Automatic component registration
  - `autoRegisterComponents()` registers all 46+ built-in components

### Component System
All components in `components/` directory follow this pattern:
- Export a function that accepts props
- Return a DOM element created via `createComponent(templateFn, props)`
- Use Bootstrap classes for styling with optional M3 theme support
- Support `data-bind`, `data-ref`, and all standard HTML attributes

Component categories:
- **Core**: Button, Input, Card, Modal, Alert, Badge, Spinner, Toast, etc.
- **Forms**: Input, Checkbox, Radio, Select, Textarea, Switch, Slider, FileUpload
- **Layout**: Container, Row, Column, Sidebar
- **Material (M3)**: FAB, NavigationDrawer, Chips, TopAppBar, List, Icon
- **Advanced**: DataTable, Tabs, Accordion, Pagination, Stepper, Dropdown, Tooltip

### Plugin System
Located in `plugins/` directory:
- **`router.js`**: Client-side routing with hash-based navigation
- **`toast.js`**: Toast notification system
- **`storage.js`**: LocalStorage/SessionStorage wrapper with reactivity

Plugins extend functionality via `PluginManager.register(plugin)` in `utils/plugins.js`.

### Backend Integrations
Located in `packages/` directory:
- `django-rnx`: Django template tags and asset management
- `rails-rnx`: Rails view helpers and asset pipeline integration
- `laravel-rnx`: Laravel Blade directives
- `express-rnx`: Express.js middleware

## Development Commands

### Building
```bash
npm run build
```
Generates two bundles using esbuild:
- `dist/rnx.esm.js` - ES module for bundlers
- `dist/rnx.global.js` - IIFE for CDN/script tags (exposes `window.rnx`)

### Testing
```bash
npm test                # Run all tests once
npm run test:watch      # Watch mode for development
npm run test:ui         # Interactive UI for test exploration
npm run test:coverage   # Generate coverage report
```

Test suite uses Vitest with happy-dom environment. 600+ tests covering:
- Core reactivity (state changes, subscriptions, array mutations)
- All 46+ components
- Data binding (two-way, one-way, validation)
- List rendering and diffing
- Edge cases (race conditions, memory leaks, rapid updates)

**Important**: When adding new features, write corresponding tests in `tests/` following existing patterns.

### Running Examples
Examples are in `examples/` directory. Open HTML files directly in browser (no build step required for CDN examples).

## Key Implementation Details

### Data Binding Precedence
1. `data-for` list rendering is processed first
2. Components are hydrated recursively
3. `data-bind` is applied after component loading (via `bindData()`)

### Security Considerations
- All user input in `data-if` expressions is sanitized
- Dangerous patterns blocked: `eval`, `Function`, `__proto__`, `constructor`
- Only simple expressions allowed: property access, comparisons, logical operators
- XSS protection via `utils/security.js` (escapeHtml, sanitizeUrl, etc.)

### Performance Optimizations
- Microtask batching for state updates (prevents redundant renders)
- Proxy caching to avoid recreating proxies for nested objects
- Focus preservation during re-renders (saves cursor position)
- Keyed diffing for list rendering (minimizes DOM operations)

### Event Handler Patterns
Components accept event handlers in two ways:
1. String attributes: `onclick="handleClick()"` (passed as data attribute)
2. Function props: Not recommended; use reactive state changes instead

### Avoiding Infinite Loops
Critical flags to prevent recursion:
- `element._isUpdating` in DataBinder prevents input → state → input loops
- `element._rnxHydrated` prevents re-hydration of already-processed components

## Common Development Workflows

### Adding a New Component
1. Create `components/NewComponent/NewComponent.js`
2. Export component function following existing patterns
3. Add to `components/index.js`
4. Add to `framework/AutoRegistry.js`
5. Write tests in `tests/newComponent.test.js`
6. Document in `docs/COMPONENTS.md`

### Debugging Reactivity Issues
- Check browser console for `[rnxJS]` prefixed warnings
- Verify state is created with `createReactiveState()`
- Ensure `loadComponents(root, state)` is called with state parameter
- Check subscription path matches state structure
- Use `state.$unsubscribeAll()` to cleanup when debugging memory leaks

### Testing Custom Components
Use happy-dom for DOM testing:
```javascript
import { createReactiveState, registerComponent, loadComponents } from '@arnelirobles/rnxjs';

const state = createReactiveState({ value: 'test' });
document.body.innerHTML = '<MyComponent data-bind="value"></MyComponent>';
registerComponent('MyComponent', MyComponent);
loadComponents(document.body, state);
```

### Publishing Changes
This is a production library (v2.0.0). Changes require:
1. Tests must pass: `npm test`
2. Build must succeed: `npm run build`
3. Update version in `package.json`
4. Update `CHANGELOG.md`
5. For backend packages, update corresponding package versions in `packages/`

Publishing runs from `.github/workflows/npm-publish.yml` and is triggered by
creating a GitHub release. It reruns the suite and the build, checks the
release tag against `package.json`, then publishes.

Auth is npm trusted publishing over OIDC. There is no `NPM_TOKEN` secret and
nothing to rotate. The job needs `id-token: write` and npm 11.5.1 or newer,
and npm only accepts the publish when the repo, owner and workflow filename
match the trusted publisher configured on the package. Renaming or moving
`npm-publish.yml` breaks releases until that publisher is updated on npmjs.com.

## TypeScript Support

TypeScript definitions in `index.d.ts` and `global.d.ts`. The library is written in JavaScript but provides full TypeScript typings for consumers.

## Critical Files Not to Modify Lightly

- `framework/DataBinder.js` - Complex state synchronization logic with infinite loop prevention
- `framework/ComponentLoader.js` - Recursive hydration with security checks
- `utils/createReactiveState.js` - Core reactivity with batching and proxy caching
- `utils/createComponent.js` - Lifecycle management with focus preservation

Changes to these files require extensive testing as they affect the entire framework.
