# rnxJS API Reference

> Complete API documentation with stability guarantees for v1.0.0

## API Stability Promise

Starting with v1.0.0, rnxJS follows **Semantic Versioning**:

- **MAJOR** (v2.0.0): Breaking changes, API removals
- **MINOR** (v1.1.0): New features, backward-compatible
- **PATCH** (v1.0.1): Bug fixes only

### Stability Levels

| Level | Meaning | Example |
|-------|---------|---------|
| **Stable** | Won't change in v1.x | `createReactiveState()` |
| **Stable (Signature)** | Signature locked, behavior may improve | `bindData()` |
| **Experimental** | May change in minor versions | Prefixed with `$` or `_` |

---

## Core API

### createReactiveState(initialData)

**Stability: Stable**

Creates a reactive state object with automatic change tracking.

```javascript
import { createReactiveState } from '@arnelirobles/rnxjs';

const state = createReactiveState({
    user: { name: 'John', age: 30 },
    items: [1, 2, 3],
    config: { theme: 'dark' }
});

// Access properties
console.log(state.user.name); // 'John'

// Modify properties (triggers subscribers)
state.user.name = 'Jane';

// Array mutations are tracked
state.items.push(4);
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `initialData` | `Object` | Initial state object |

#### Returns

`Proxy<Object>` - Reactive state proxy with the following methods:

| Method | Description |
|--------|-------------|
| `subscribe(path, callback)` | Subscribe to changes at path |
| `$unsubscribeAll()` | Remove all subscriptions |
| `$destroy()` | Cleanup and release resources |

#### Subscription Example

```javascript
const state = createReactiveState({ count: 0 });

// Subscribe to specific path
const unsubscribe = state.subscribe('count', (newValue, oldValue) => {
    console.log(`Count changed: ${oldValue} → ${newValue}`);
});

state.count = 1; // Logs: "Count changed: 0 → 1"

// Cleanup
unsubscribe();
```

#### Nested Path Subscription

```javascript
const state = createReactiveState({
    user: { profile: { email: 'john@example.com' } }
});

state.subscribe('user.profile.email', (email) => {
    console.log('Email updated:', email);
});

state.user.profile.email = 'jane@example.com';
```

---

### createComponent(templateFn, props)

**Stability: Stable**

Creates a reactive component with lifecycle management.

```javascript
import { createComponent } from '@arnelirobles/rnxjs';

function Counter({ initialCount = 0 }) {
    let count = initialCount;

    const template = () => `
        <div class="counter">
            <span data-ref="display">${count}</span>
            <button data-ref="increment">+</button>
        </div>
    `;

    const component = createComponent(template, { count });

    component.useEffect(() => {
        const btn = component.refs.increment;
        const handler = () => {
            count++;
            component.setState({ count });
        };
        btn.addEventListener('click', handler);
        return () => btn.removeEventListener('click', handler);
    });

    return component.element;
}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `templateFn` | `Function` | Returns HTML string |
| `props` | `Object` | Initial properties |

#### Returns

`Object` with:

| Property/Method | Description |
|-----------------|-------------|
| `element` | The DOM element |
| `refs` | Object of `data-ref` elements |
| `setState(newProps)` | Update and re-render |
| `useEffect(effectFn)` | Add side effect |
| `onUnmount(cleanupFn)` | Register cleanup |

---

### bindData(container, state)

**Stability: Stable (Signature)**

Binds reactive state to DOM elements within a container.

```javascript
import { createReactiveState, bindData } from '@arnelirobles/rnxjs';

const state = createReactiveState({
    user: { name: 'John', email: 'john@example.com' },
    message: ''
});

// HTML with data-bind attributes
const container = document.getElementById('app');
container.innerHTML = `
    <p>Name: <span data-bind="user.name"></span></p>
    <input data-bind="message" placeholder="Type here...">
`;

// Bind state to DOM
bindData(container, state);

// Changes to state automatically update DOM
state.user.name = 'Jane'; // Updates <span>

// Input changes update state (two-way binding)
```

#### Data Binding Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-bind="path"` | Bind to state path | `data-bind="user.name"` |
| `data-if="path"` | Conditional render | `data-if="isLoggedIn"` |
| `data-for="items"` | List rendering | `data-for="users"` |
| `data-rule="rules"` | Validation rules | `data-rule="required\|email"` |

#### Validation Rules

```html
<input data-bind="email" data-rule="required|email">
<input data-bind="age" data-rule="required|numeric|min:18|max:120">
<input data-bind="password" data-rule="required|min:8|pattern:^(?=.*[A-Z])">
```

Available rules:
- `required` - Field must have value
- `email` - Valid email format
- `numeric` - Numbers only
- `min:n` - Minimum value/length
- `max:n` - Maximum value/length
- `pattern:regex` - Custom regex pattern

Validation errors are stored in `state.errors`:

```javascript
state.subscribe('errors', (errors) => {
    console.log(errors); // { email: 'Invalid email', age: 'Minimum is 18' }
});
```

---

### loadComponents(container, state)

**Stability: Stable**

Loads and initializes all registered components in a container.

```javascript
import { loadComponents, createReactiveState } from '@arnelirobles/rnxjs';

const state = createReactiveState({ user: { name: 'John' } });

// HTML with custom components
document.body.innerHTML = `
    <Button variant="primary" label="Save" />
    <Card title="Welcome">
        <p>Hello, <span data-bind="user.name"></span></p>
    </Card>
`;

// Initialize all components
loadComponents(document.body, state);
```

---

### registerComponent(tagName, componentFn)

**Stability: Stable**

Registers a custom component for use in HTML.

```javascript
import { registerComponent } from '@arnelirobles/rnxjs';

function MyWidget({ title, content }) {
    const div = document.createElement('div');
    div.className = 'my-widget';
    div.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    return div;
}

registerComponent('MyWidget', MyWidget);

// Now use in HTML
// <MyWidget title="Hello" content="World" />
```

---

### autoRegisterComponents()

**Stability: Stable**

Auto-registers all built-in rnxJS components.

```javascript
import { autoRegisterComponents } from '@arnelirobles/rnxjs';

// Register all 34 built-in components
autoRegisterComponents();

// Now use any component in HTML
// <Button />, <Card />, <DataTable />, etc.
```

---

## Security API

### escapeHtml(str)

**Stability: Stable**

Escapes HTML special characters to prevent XSS.

```javascript
import { escapeHtml } from '@arnelirobles/rnxjs';

const userInput = '<script>alert("xss")</script>';
const safe = escapeHtml(userInput);
// '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

### safeHtml\`template\`

**Stability: Stable**

Tagged template literal for auto-escaping interpolated values.

```javascript
import { safeHtml } from '@arnelirobles/rnxjs';

const userName = '<b>John</b>';
const html = safeHtml`<div>Hello, ${userName}!</div>`;
// '<div>Hello, &lt;b&gt;John&lt;/b&gt;!</div>'
```

### trustHtml(html)

**Stability: Stable**

Marks HTML as trusted (bypasses escaping). Use with caution!

```javascript
import { trustHtml, safeHtml } from '@arnelirobles/rnxjs';

const trustedContent = trustHtml('<b>Bold text</b>');
const html = safeHtml`<div>${trustedContent}</div>`;
// '<div><b>Bold text</b></div>' (not escaped)
```

### sanitizeUrl(url)

**Stability: Stable**

Sanitizes URLs to prevent `javascript:` and `data:` attacks.

```javascript
import { sanitizeUrl } from '@arnelirobles/rnxjs';

sanitizeUrl('https://example.com'); // 'https://example.com'
sanitizeUrl('javascript:alert(1)'); // '' (blocked)
sanitizeUrl('data:text/html,...');  // '' (blocked)
```

---

## Plugin API

### plugins.use(plugin, options)

**Stability: Stable**

Registers a plugin with the rnxJS plugin system.

```javascript
import { plugins, toastPlugin } from '@arnelirobles/rnxjs';

// Register with options
plugins.use(toastPlugin, {
    position: 'top-right',
    duration: 3000
});

// Or use factory pattern
plugins.use(toastPlugin({ position: 'bottom-left' }));
```

### Plugin Structure

```javascript
const myPlugin = {
    name: 'my-plugin',

    // Called when plugin is registered
    install(context) {
        // context.addHook, context.runHook, context.plugins
        console.log('Plugin installed!');
    },

    // Optional: hook handlers
    hooks: {
        'component:mounted': (ctx) => { /* ... */ },
        'state:changed': (ctx) => { /* ... */ }
    }
};
```

### Built-in Plugins

#### routerPlugin

```javascript
import { plugins, routerPlugin } from '@arnelirobles/rnxjs';

plugins.use(routerPlugin, {
    mode: 'hash',           // 'hash' or 'history'
    routes: {
        '/': 'home',
        '/users': 'users',
        '/users/:id': 'user-detail'
    },
    defaultRoute: '/'
});

// Navigate programmatically
window.rnxRouter.push('/users/123');
window.rnxRouter.back();
```

#### toastPlugin

```javascript
import { plugins, toastPlugin } from '@arnelirobles/rnxjs';

plugins.use(toastPlugin, {
    position: 'top-right',  // Position on screen
    duration: 3000,         // Auto-dismiss (ms)
    maxToasts: 5            // Maximum visible toasts
});

// Show notifications
window.rnx.toast.success('Saved!');
window.rnx.toast.error('Failed to save');
window.rnx.toast.warning('Are you sure?');
window.rnx.toast.info('Loading...');
```

#### storagePlugin

```javascript
import { plugins, storagePlugin } from '@arnelirobles/rnxjs';

plugins.use(storagePlugin, {
    prefix: 'myapp_',       // Key prefix
    storage: localStorage   // or sessionStorage
});

// Persist state paths
window.rnx.storage.persist(state, 'userPrefs', ['theme', 'language']);

// Direct access
window.rnx.storage.set('key', { data: 'value' });
const data = window.rnx.storage.get('key');
```

---

## Components API

### Common Props

All components accept these common props:

| Prop | Type | Description |
|------|------|-------------|
| `class` | `string` | Additional CSS classes |
| `id` | `string` | Element ID |
| `style` | `string` | Inline styles |
| `data-*` | `string` | Data attributes |

### Button

```javascript
import { Button } from '@arnelirobles/rnxjs';

const btn = Button({
    label: 'Click Me',
    variant: 'primary',  // primary, secondary, success, danger, warning, info
    size: 'lg',          // sm, md, lg
    disabled: false,
    block: false,        // Full width
    onclick: () => alert('Clicked!')
});
```

### Input

```javascript
import { Input } from '@arnelirobles/rnxjs';

const input = Input({
    type: 'text',        // text, email, password, number, date, etc.
    placeholder: 'Enter value',
    value: '',
    disabled: false,
    readonly: false,
    label: 'Field Label',
    helpText: 'Helper text below input'
});
```

### Card

```javascript
import { Card } from '@arnelirobles/rnxjs';

const card = Card({
    title: 'Card Title',
    subtitle: 'Subtitle',
    children: '<p>Card content</p>',
    footer: '<button>Action</button>',
    headerClass: 'bg-primary text-white'
});
```

### DataTable

```javascript
import { DataTable } from '@arnelirobles/rnxjs';

const table = DataTable({
    columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' }
    ],
    rows: [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
    ],
    pageSize: 10,
    sortable: true,
    pageable: true,
    onSort: (column, direction) => { /* ... */ },
    onPageChange: (page) => { /* ... */ }
});
```

### Modal

```javascript
import { Modal } from '@arnelirobles/rnxjs';

const modal = Modal({
    title: 'Confirm Action',
    children: '<p>Are you sure?</p>',
    footer: true,
    size: 'md',          // sm, md, lg, xl
    backdrop: true,
    keyboard: true,      // Close on Escape
    onClose: () => { /* ... */ }
});

// Show/hide
modal.show();
modal.hide();
```

### Complete Component List

**Bootstrap Components (18)**:
Alert, Badge, Button, Card, Checkbox, Column, Container, FormGroup, Icon, Input, List, Modal, Pagination, Radio, Row, Select, Spinner, Textarea

**Material Design 3 (10)**:
FAB, NavigationDrawer, Switch, Chips, TopAppBar, NavigationBar, Slider, Search, SegmentedButton, List

**Data & Display (6)**:
DataTable, StatCard, Skeleton, EmptyState, ErrorState, DatePicker

**Enhancement (6)**:
FileUpload, ProgressBar, Tooltip, Sidebar, Stepper, Dropdown

**Advanced (4)**:
VirtualList, Autocomplete, Breadcrumb, ErrorBoundary

---

## TypeScript Support

### Type Definitions

rnxJS includes TypeScript declarations (`index.d.ts`):

```typescript
import {
    createReactiveState,
    ReactiveState,
    createComponent,
    Component
} from '@arnelirobles/rnxjs';

interface User {
    name: string;
    email: string;
}

interface AppState {
    user: User;
    items: string[];
}

const state: ReactiveState<AppState> = createReactiveState({
    user: { name: 'John', email: 'john@example.com' },
    items: []
});

// Type-safe access
state.user.name = 'Jane';  // ✅
state.user.age = 30;       // ❌ Type error
```

---

## Experimental APIs

These APIs may change in minor versions:

| API | Description |
|-----|-------------|
| `state.$batch(fn)` | Batch multiple updates |
| `state.$snapshot()` | Get plain object copy |
| `component.$forceUpdate()` | Force re-render |
| `_internal.*` | Internal utilities |

---

## Deprecated APIs

| API | Deprecated In | Removed In | Replacement |
|-----|---------------|------------|-------------|
| None | - | - | - |

*No APIs have been deprecated yet. This section will be updated as the framework evolves.*

---

## Migration Notes

### From v0.x to v1.0.0

No breaking changes. All v0.x APIs remain compatible.

### Future Deprecation Policy

1. Deprecated APIs will be announced in CHANGELOG
2. Deprecation warnings logged to console for 2 minor versions
3. Removal only in major versions
4. Migration guide provided for each deprecation

---

## Related Documentation

- [Benchmarks](./BENCHMARKS.md)
- [Migration from jQuery](./MIGRATION.md)
- [Quick Start Guide](./QUICK-START.md)
- [Contributing](../CONTRIBUTING.md)
