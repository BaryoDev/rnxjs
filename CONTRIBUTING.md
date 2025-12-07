# Contributing to rnxJS

First off, thank you for considering contributing to rnxJS! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** - Descriptive title for the issue
- **Steps to reproduce** - Exact steps to reproduce the problem
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened  
- **Environment** - Browser, OS, rnxJS version
- **Code sample** - Minimal reproduction if possible

### 💡 Suggesting Features

Feature requests are welcome! Please provide:

- **Use case** - Why this feature would be useful
- **Proposed solution** - How you envision it working
- **Alternatives** - Other solutions you've considered
- **Examples** - Code examples if applicable

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Add tests if applicable
4. Ensure all tests pass (`npm test`)
5. Update documentation as needed
6. Submit a pull request!

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/rnxjs.git
cd rnxjs

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build distribution files
npm run build
```

### Project Structure

```
rnxjs/
├── components/        # Bootstrap component implementations
├── framework/         # Core framework files
│   ├── ComponentLoader.js
│   ├── DataBinder.js
│   ├── Registry.js
│   └── AutoRegistry.js
├── utils/             # Utility functions
│   ├── createComponent.js
│   └── createReactiveState.js
├── tests/             # Test files
├── examples/          # Example HTML files
├── dist/              # Built files (generated)
└── index.js           # Main entry point
```

## Coding Guidelines

### JavaScript Style

- Use **ES6+ features** (const/let, arrow functions, etc.)
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** are optional but be consistent
- Add **JSDoc comments** for public APIs

### Example

```javascript
/**
 * Creates a reactive state object
 * @param {Object} initialState - Initial state object
 * @returns {Proxy} - Reactive state proxy
 */
export function createReactiveState(initialState = {}) {
  // Implementation
}
```

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for good coverage
- Use descriptive test names

```javascript
describe('createReactiveState', () => {
  it('should create a reactive state object', () => {
    const state = createReactiveState({ count: 0 });
    expect(state.count).toBe(0);
  });
});
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat: add onUnmount lifecycle hook

Added onUnmount method to components for cleanup.
Resolves #123
```

```
fix: prevent memory leak in subscriptions

Subscriptions are now properly tracked and cleaned up
when components are destroyed.
```

## Pull Request Process

1. **Update documentation** - README, JSDoc, etc.
2. **Add tests** - For new features or bug fixes
3. **Run tests** - Ensure all tests pass (`npm test`)
4. **Build** - Run `npm run build` to verify build works
5. **Update changelog** - Add entry to CHANGELOG.md if significant
6. **Submit PR** - With clear description of changes

### PR Template

When creating a PR, please include:

- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Implementation approach
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/arnelirobles/rnxjs/discussions)
- Ask in an [Issue](https://github.com/arnelirobles/rnxjs/issues)
- Reach out to [@arnelirobles](https://github.com/arnelirobles)

## License

By contributing, you agree that your contributions will be licensed under the MPL-2.0 License.
