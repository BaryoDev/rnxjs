# rnxJS App

This project was bootstrapped with [create-rnxjs-app](https://github.com/arnelirobles/rnxjs).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/main.js`: Main entry point where components are registered.
- `src/`: Your source files.
- `index.html`: The HTML entry point.
- `jsconfig.json`: Configured for better Intellisense in VS Code.

## Development

### Creating Components

rnxJS components are simple functions that return HTML strings (or createComponent instances).

```javascript
import { createComponent } from '@arnelirobles/rnxjs';

function MyComponent(props) {
    return createComponent(() => `
        <div class="p-3">
            <h2>Hello ${props.name}</h2>
        </div>
    `, props);
}

registerComponent('MyComponent', MyComponent);
```

### Styling

Bootstrap 5 is included by default. You can use standard Bootstrap classes in your templates.

## Learn More

- [rnxJS Documentation](https://github.com/arnelirobles/rnxjs)
- [Vite Documentation](https://vitejs.dev/)
