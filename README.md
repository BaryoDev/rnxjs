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

- `create-rnxjs-app` scaffolding CLI
- `rnxORM` for Dapper/LINQ-style querying in JS
- Built-in form validation helpers
- Optional state management layer
- Full IntelliSense support via `global.d.ts`

---

## 📃 License

MPL-2.0 © Arnel Isiderio Robles
