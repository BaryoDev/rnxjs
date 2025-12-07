# rnxJS

Minimalist Vanilla JS component system that doesn’t promise anything — just works.

> Designed by [@arnelirobles](https://www.npmjs.com/~arnelirobles)  
> Built to be Bootstrap-compatible and framework-free.

---

## ✨ Features

- ✅ Use components like `<Button>`, `<Input>`, `<Card>` in pure HTML
- ✅ Automatically maps attributes to props
- ✅ Supports `<slot>` content and nesting
- ✅ Recursive rendering of custom components
- ✅ Conditional rendering via `data-if`
- ✅ **Reactive data binding with `data-bind`** 🆕
- ✅ Lightweight: No virtual DOM, no bundler required
- ✅ Works with Bootstrap styles by default

---

## 🚀 Getting Started

### 📦 Install

```bash
npm install @arnelirobles/rnxjs
```

### 🌐 CDN / Script Tag (No Build Tools)

Simply download `dist/rnx.global.js` or use a CDN (once published) and include it:

```html
<script src="dist/rnx.global.js"></script>
<script>
  // Access everything via the global 'rnx' object
  rnx.autoRegisterComponents();
  rnx.loadComponents();
</script>
```

---

### 🧪 Example Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <Button label="Click Me" variant="primary" />

    <script type="module" src="/main.js"></script>
  </body>
</html>
```

```js
// main.js (ES Module approach)
import {
  autoRegisterComponents,
  loadComponents
} from '@arnelirobles/rnxjs';

autoRegisterComponents();
loadComponents();
```

**Or using the global bundle:**

```html
<!-- index.html -->
<body>
  <Button label="Click Me" variant="primary" />
  
  <script src="dist/rnx.global.js"></script>
  <script>
    rnx.autoRegisterComponents();
    rnx.loadComponents();
  </script>
</body>
```

---

## 📚 Component Examples

```html
<Input name="email" placeholder="Your email" />
<Checkbox label="I agree" />
<Alert variant="danger">Something went wrong!</Alert>
<FormGroup>
  <Label>Email</Label>
  <Input name="email" />
</FormGroup>
```

All components follow Bootstrap classes under the hood.

---

## ⚡ Reactive Data Binding

**rnxJS** now includes automatic two-way data binding! Use the `data-bind` attribute to sync form inputs with JavaScript state — no manual event handlers needed.

### 🎯 Quick Example

```html
<input data-bind="user.name" placeholder="Your name" />
<p>Hello, <span data-bind="user.name"></span>!</p>
```

```js
import { createReactiveState, autoRegisterComponents, loadComponents } from '@arnelirobles/rnxjs';

// Create reactive state
const state = createReactiveState({
  user: { name: '' }
});

// Load components with state
autoRegisterComponents();
loadComponents(document, state);
```

Type in the input and watch the `<span>` update automatically! ✨

### 🔄 Two-Way Binding

Works with all form elements:

```html
<!-- Text inputs -->
<input type="text" data-bind="user.email" />

<!-- Checkboxes -->
<input type="checkbox" data-bind="preferences.newsletter" />

<!-- Textareas -->
<textarea data-bind="message.text"></textarea>

<!-- Select dropdowns -->
<select data-bind="user.country">
  <option value="us">USA</option>
  <option value="uk">UK</option>
</select>
```

### 🎨 Nested Properties

Access deeply nested data with dot notation:

```html
<input data-bind="user.profile.address.city" />
<p data-bind="user.profile.address.city"></p>
```

### 📖 Display Binding (One-Way)

Any non-input element with `data-bind` will automatically display the value:

```html
<h1 data-bind="title"></h1>
<p data-bind="description"></p>
<span data-bind="user.status"></span>
```

### 🎬 Reactive Subscriptions

React to state changes programmatically:

```js
const state = createReactiveState({ count: 0 });

// Subscribe to changes
state.subscribe('count', (newValue) => {
  console.log('Count changed to:', newValue);
});

// Update state
state.count++; // Triggers subscription
```

### 🚀 Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
  <Container>
    <h2>User Profile</h2>
    
    <FormGroup>
      <label>Name:</label>
      <input type="text" class="form-control" data-bind="user.name" />
    </FormGroup>
    
    <FormGroup>
      <label>Email:</label>
      <input type="email" class="form-control" data-bind="user.email" />
    </FormGroup>
    
    <Alert variant="success">
      Welcome, <strong data-bind="user.name">Guest</strong>!<br>
      Your email: <span data-bind="user.email">not provided</span>
    </Alert>
  </Container>

  <script type="module" src="/main.js"></script>
</body>
</html>
```

```js
// main.js
import { createReactiveState, autoRegisterComponents, loadComponents } from '@arnelirobles/rnxjs';

const state = createReactiveState({
  user: { name: '', email: '' }
});

autoRegisterComponents();
loadComponents(document, state);
```

**See `examples/binding-demo.html` for more advanced examples!**

---

## 🧠 Philosophy

**rnxJS** is for developers who:
- Prefer native HTML + JS over big frameworks
- Love Bootstrap’s UI system
- Want fast, zero-setup components that work instantly
- Enjoy simplicity, not promises

---

## 🛠 For Developers

If you want to create your own component:

```js
import { createComponent } from '@arnelirobles/rnxjs';

export function MyButton(props) {
  return createComponent(() => \`
    <button class="btn btn-\${props.variant || 'primary'}">
      \${props.label}
    </button>
  \`, props);
}
```

Then register:

```js
import { registerComponent } from '@arnelirobles/rnxjs';
registerComponent('MyButton', MyButton);
```

---

## 💡 Future Plans

- `create-rnxjs-app` scaffolding CLI ✅ (Available)
- `rnxORM` for Dapper/LINQ-style querying in JS
- Built-in form validation helpers
- ~~Optional state management layer~~ ✅ (Reactive binding now available!)
- Full IntelliSense support via `global.d.ts`

---

## 📋 Changelog

### Version 0.1.7 (Current) - November 2025

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
- Layout: `Container`, `Row`, `Col`
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

## ⚠️ Deprecation Notices

Currently, there are **no deprecated features**. All APIs are stable and will be maintained for backward compatibility.

**Future Deprecations** (planned for v1.0):

None planned. We're committed to backward compatibility.

---

## 📃 License

MPL-2.0 © Arnel Isiderio Robles
