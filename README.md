
# rnxJS

[![npm version](https://img.shields.io/npm/v/@arnelirobles/rnxjs)](https://www.npmjs.com/package/@arnelirobles/rnxjs)
[![npm downloads](https://img.shields.io/npm/dm/@arnelirobles/rnxjs)](https://www.npmjs.com/package/@arnelirobles/rnxjs)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@arnelirobles/rnxjs)](https://bundlephobia.com/package/@arnelirobles/rnxjs)
[![License](https://img.shields.io/npm/l/@arnelirobles/rnxjs)](https://github.com/arnelirobles/rnxjs/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-84%20passing-brightgreen)](https://github.com/arnelirobles/rnxjs)

**The Bootstrap-Native Framework for Production Apps.**

> Build Reactive Bootstrap Apps without a Build Step.
> Designed for Backend Developers (Django, Rails, Laravel) and Internal Tools.

---

## 🚀 Zero to Hero: Build Your First App

Welcome to rnxJS! In this 5-minute tutorial, we'll build a reactive **Employee Directory** with a search filter. No Webpack, no Bundlers, just HTML and JS.

### Step 1: The Setup (`index.html`)

Create an `index.html` file and include Bootstrap + rnxJS.

```html
<!DOCTYPE html>
<html>
<head>
    <title>rnxJS App</title>
    <!-- 1. Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- 2. Material Icons (Optional, for FAB/Icons) -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <!-- 3. rnxJS M3 Theme (Optional, for Material Styling) -->
    <link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">
</head>
<body class="bg-light">

    <!-- App Container -->
    <Container class="py-5" id="app">
        <!-- We will put our content here -->
    </Container>

    <!-- 4. rnxJS Library -->
    <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### Step 2: The Logic (`app.js`)

Create `app.js`. We'll initialize our **Reactive State**.

```javascript
// app.js
const { createReactiveState, autoRegisterComponents, loadComponents } = rnx;

// 1. Define your data model
const state = createReactiveState({
    searchQuery: '',
    employees: [
        { id: 1, name: 'Alice Johnson', role: 'Engineer', dept: 'Tech' },
        { id: 2, name: 'Bob Smith', role: 'Designer', dept: 'Creative' },
        { id: 3, name: 'Charlie Kim', role: 'Manager', dept: 'Sales' },
    ],
    // Computed property (derived state works by manually updating or logical getters)
    // For simplicity in rnxJS v0, we handle filtering in the view or listeners
});

// 2. Register Bootstrap Components
autoRegisterComponents();

// 3. Hydrate the DOM
loadComponents(document.body, state);
```

### Step 3: The UI

Update the `<Container>` in `index.html`. We use `data-bind` to sync inputs and text.

```html
<Container class="py-5" id="app">
    <Card class="mb-4">
        <h2 class="mb-3">Employee Directory</h2>
        
        <!-- Search Input: Two-way binding to 'searchQuery' -->
        <FormGroup>
            <Input 
                placeholder="Search employees..." 
                data-bind="searchQuery" 
            />
            <small class="text-muted">
                Searching for: <span data-bind="searchQuery" class="fw-bold"></span>
            </small>
        </FormGroup>
    </Card>

    <Row id="employee-list">
        <!-- We will render the list here dynamically -->
    </Row>

    <!-- Floating Action Button -->
    <FAB icon="add" variant="primary" onclick="alert('Add Employee Clicked!')"></FAB>
</Container>
```

### Step 4: Making it Dynamic

rnxJS works great with vanilla JS logic. Let's add a listener to filter the list.

```javascript
// Add this to app.js

function renderList() {
    const listContainer = document.getElementById('employee-list');
    const query = state.searchQuery.toLowerCase();
    
    // Filter logic
    const filtered = state.employees.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.role.toLowerCase().includes(query)
    );

    // Vanilla JS rendering (fast and simple)
    listContainer.innerHTML = filtered.map(emp => `
        <div class="col-md-4 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${emp.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${emp.dept}</h6>
                    <p class="card-text">${emp.role}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Subscribe to search changes to re-render
state.subscribe('searchQuery', renderList);

// Initial render
renderList();
```

🎉 **That's it!** You have a reactive app with search, Bootstrap styling, and Material components.

---

## 📖 Core Concepts & API

### 1. Reactive State
The heart of rnxJS is the `createReactiveState` function. It wraps your object in a Proxy to detect changes.

```javascript
const state = rnx.createReactiveState({
    user: { name: 'Arnel', points: 100 },
    items: ['Apple', 'Banana']
});
```

**Key Features:**
- **Deeply Nested**: Works on `state.user.name`.
- **Arrays**: `push`, `pop`, `splice` trigger updates automatically.
- **`state.subscribe(path, callback)`**: Listen for changes.
    - Path examples: `'user.name'`, `'items'`, `'items.0'`.
- **`state.$unsubscribeAll()`**: Cleanup all listeners (useful for Single Page Apps).

### 2. Data Binding (`data-bind`)
Connect your DOM to State without event listeners.

| Element                  | Binding Type | Behavior                                                |
| :----------------------- | :----------- | :------------------------------------------------------ |
| `<input>`, `<textarea>`  | **Two-Way**  | Updates state on typing; updates value on state change. |
| `<select>`               | **Two-Way**  | Updates selection state.                                |
| `<checkbox>`             | **Two-Way**  | Binds to boolean state.                                 |
| `<div>`, `<span>`, `<p>` | **One-Way**  | Updates `textContent` when state changes.               |

**Validation (`data-rule`)**:
Add rules to inputs to populate `state.errors`.
```html
<input data-bind="email" data-rule="required|email" />
<span class="text-danger" data-bind="errors.email"></span>
```
Rules: `required`, `email`, `numeric`, `min:5`, `max:10`, `pattern:^A.*`.

### 3. Components (`rnxJS Components`)
rnxJS provides 20+ Bootstrap/Material components.

**Standard**: `<Button>`, `<Card>`, `<Modal>`, `<Alert>`, `<Badge>`, `<Spinner>`, `<Toast>`.
**Forms**: `<Input>`, `<Checkbox>`, `<Radio>`, `<Select>`, `<Textarea>`, `<Switch>`, `<Slider>`.
**Layout**: `<Container>`, `<Row>`, `<Column>`.
**Material (M3)**: `<FAB>`, `<Chips>`, `<NavigationDrawer>`, `<TopAppBar>`, `<List>`, `<Icon>`.

**Usage:**
1. **Auto Register**: `rnx.autoRegisterComponents()` registers all of them.
2. **Manual Register**: `rnx.registerComponent('MyBtn', Button)`.
3. **Props**: Attributes are passed as props. `data-bind` works on components too!
   ```html
   <Input label="Name" data-bind="user.name" />
   <!-- Renders a labeled input group bound to user.name -->
   ```

### 4. Lifecycle Hooks
When creating custom components, use hooks to manage resources.

```javascript
const component = createComponent(templateFn, props);

component.useEffect((self) => {
    console.log('Mounted!');
    
    const interval = setInterval(() => console.log('Tick'), 1000);
    
    // Return cleanup function (called on unmount)
    return () => clearInterval(interval);
});

component.onUnmount(() => {
    console.log('Destroyed');
});
```

---

## 🛠 Project Structure

For a clean codebase, we recommend this folder structure:

```text
/
├── index.html        # Entry point
├── css/
│   └── styles.css    # Custom styles / overlays
├── js/
│   ├── app.js        # Main logic (State init, Load)
│   ├── components/   # Custom components
│   │   └── UserCard.js
│   └── utils/        # Helpers
└── assets/
```

### Building Custom Components
Create reusable functional components:

```javascript
// js/components/UserCard.js
import { createComponent } from '@arnelirobles/rnxjs';

export function UserCard({ name, role }) {
    // Template
    const template = (state) => `
        <div class="card shadow-sm">
            <div class="card-body">
                <h3>${name}</h3>
                <p class="text-muted">${role}</p>
            </div>
        </div>
    `;

    return createComponent(template);
}

// Register it
import { registerComponent } from '@arnelirobles/rnxjs';
registerComponent('UserCard', UserCard);
```

Use it in HTML: `<UserCard name="John" role="Dev"></UserCard>`

---

## 📦 Installation Options

### 1. NPM (Recommended for Vite/Webpack)

```bash
npm install @arnelirobles/rnxjs
```

```javascript
import { createReactiveState, loadComponents } from '@arnelirobles/rnxjs';
import '@arnelirobles/rnxjs/css/bootstrap-m3-theme.css'; // Optional M3 theme
```

### 2. CDN (No Build)

Use `unpkg` or `jsdelivr`.

```html
<!-- Library -->
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>

<!-- M3 Theme CSS -->
<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">
```

---

## 🚀 Why rnxJS?

| Feature            | rnxJS                  | React/Vue     | jQuery     |
| :----------------- | :--------------------- | :------------ | :--------- |
| **Reactivity**     | ✅ Proxy-based          | ✅ Virtual DOM | ❌ Manual   |
| **Build Step**     | ❌ Optional             | ✅ Required    | ❌ No       |
| **UI Library**     | ✅ Included (Bootstrap) | ❌ External    | ❌ External |
| **Learning Curve** | Low (HTML/JS)          | High          | Medium     |
| **Size**           | ~10KB                  | ~130KB+       | ~30KB      |

**Perfect for:**
- **Backend Devs**: Django/Rails/Laravel developers who want interactivity without a separate SPA repo.
- **Internal Tools**: rapidly build admin panels using standard Bootstrap.
- **Prototypes**: "Zero to Hero" in minutes.

---

## Icons

rnxJS now uses **Bootstrap Icons** by default. Ensure you include the Bootstrap Icons stylesheet in your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
```

When using the `icon` prop in components like `Button`, `FAB`, `Icon`, etc., simply provide the icon name (e.g., `moon-stars`, `check-circle`). The library automatically applies the `bi bi-[name]` classes.

```html
<Button icon="moon-stars" label="Theme" />
<Icon name="check-circle" color="text-success" />
```

### My `<FAB>` or custom component isn't rendering
- Ensure you have called `rnx.autoRegisterComponents()` or manually registered it via `rnx.registerComponent('FAB', FAB)`.
- Check if you have the Material Symbols font included if icons are missing: `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />`
- If using `data-if`, ensure the condition evaluates to true.

### Data Binding isn't working on some elements
- As of **v0.3.4**, `data-bind` is synchronous. Ensure `loadComponents(document, state)` is called **after** the DOM is ready (e.g., at the end of `<body>` or inside `DOMContentLoaded`).
- Check your browser console for warnings like `[rnxJS] Invalid data-bind path`.
- Ensure your state object was created with `createReactiveState`.

### "Bootstrap is not defined" error
- Use `setBootstrap(window.bootstrap)` if you are using a bundler and Bootstrap isn't attached to the global window object.

---

## 📋 Changelog

### Version 0.3.5 (Stability Hardening) - December 2025

**🛡️ Critical Stability Updates**
- **Infinite Loop Prevention**: Implemented a recursion guard in `DataBinder`. Input elements are now flagged during updates to prevent state changes from re-triggering the input listener, fixing potential browser crashes.
- **Component Hydration**: Added validation checks in `loadComponents` to ensure replacement nodes are valid before attempting to mount, preventing silent failures.
- **Testing**: Added specialized regression tests for DataBinder stability and FAB rendering.

---

### Version 0.3.4 (Hotfix Release) - December 2025

**🐛 Bug Fixes**
- **Data Binding Synchronization**: Fixed a race condition where `data-bind` on vanilla HTML elements (like `<h1>`, `<p>`) would sometimes fail to populate or remain empty. Data binding is now synchronous and guaranteed to run immediately after component loading.
- **FAB Rendering**: Fixed `<FAB>` component not rendering correctly in certain environments. It now correctly uses the reactive state and renders as a button with the `.m3-fab` class. 

---

### Version 0.3.3 (Critical Fixes) - December 2025

**🐛 Critical Bug Fixes & Improvements**

- **Circular Dependency**: Fixed circular dependency in `AutoRegistry` by refactoring internal exports.
- **Bootstrap Config**: Added `setBootstrap()` and `getBootstrap()` to manually configure Bootstrap instance (fixing issues in bundlers where `window.bootstrap` is missing).
- **CSS Exports**: `package.json` now correctly exports `./css/*` for M3 theme imports.
- **Button Props**: `Button` component now correctly passes data attributes (e.g., `data-bs-toggle`) to the DOM element.
- **M3 Colors**: Adjusted M3 Secondary colors to be more neutral/gray to fit standard expectations.
- **Docs**: Clarified `Material Symbols` dependency in README.

---

### Version 0.3.0 (Material Design 3) - December 2025

**🎨 Material Design 3 & New Components**
- **Theme**: Added `bootstrap-m3-theme.css` for M3 styling overrides.
- **New Components**: `FAB`, `NavigationDrawer`, `Switch`, `Chips`, `Slider`, `TopAppBar`, `NavigationBar`, `List`, `Search`, `SegmentedButton`, `Icon`.
- **Updates**: `Button` (M3 variants: filled, tonal, elevated, text), `Card` (M3 variants), `Input` (floating labels).
- **Icons**: Added `Icon` component and support for Bootstrap Icons.

**🧪 Testing & Stability**
- **Tests**: Added full Vitest suite for new components and Playwright E2E tests for the M3 Demo.
- **Framework Fix**: Fixed critical issue in `createComponent` where state updates detached event listeners in re-rendered DOM nodes.

---

### Version 0.2.2 (NPM Release) - December 2025

- **Release Bump**: Version bump to retry NPM publication.
- **Includes**: All fixes from v0.2.1 (Col rename, validation fixes).

---

### Version 0.2.1 (Maintenance Release) - December 2025

**🐛 Bug Fixes & Improvements**

- **Component Rename**: `<Col>` renamed to `<Column>` to avoid conflict with native HTML `<col>` void element.
- **Validation**: Fixed `onclick` and string-based event attribute validation warnings.
- **Framework**: `createComponent` now correctly identifies root-level slots.
- **Input**: `Input` component now passes through all unknown attributes (enabling `data-bind` support).

**⚠️ Breaking Changes**

- **`<Col>` is now `<Column>`**: Please update your layouts to use `<Column>` instead of `<Col>`.

---

### Version 0.2.0 (Feature Release) - December 2025

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

---

### Version 0.1.10 - December 2025

**🐛 Bug Fixes**

- Fixed race condition in `useEffect` cleanup during rapid state updates.

---

### Version 0.1.9 - December 2025

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

---

### Version 0.1.8 - November 2025

**🐛 Bug Fixes**

- Fixed a `TypeError` in `createReactiveState` when using array spread syntax (e.g., `[...state.array]`) or other Symbol-based operations.

---

### Version 0.1.7 - November 2025

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

---

### Version 0.1.6 - October 2025

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

---

### Version 0.1.0 - 0.1.5

**Initial Release**

- Core component system
- Component registration via `registerComponent()`
- Manual component loading
- Bootstrap class mapping
- ES Module support

---



## 📃 License

MPL-2.0 © Arnel Isiderio Robles
