# Contributing to rnxJS

Thank you for your interest in contributing to rnxJS! We welcome all contributions, from bug reports and documentation improvements to new components and features.

## Code of Conduct

This project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). All participants are expected to uphold this code in all interactions.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Basic knowledge of JavaScript and Bootstrap

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/rnxjs.git
   cd rnxjs
   npm install
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

3. Make your changes and test locally:
   ```bash
   npm test              # Run all tests
   npm run test:watch   # Run tests in watch mode
   npm run build        # Build the project
   ```

## Contribution Types

### Reporting Bugs

Before reporting, please search [existing issues](https://github.com/arnelirobles/rnxjs/issues) to avoid duplicates.

When reporting, include:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Browser/Node.js versions
- Code example or minimal reproduction

### Suggesting Features

Open an issue describing:
- What the feature should do
- Why it would be useful
- Example usage or implementation ideas

### Submitting Changes

#### New Components

1. Create component file in `components/YourComponent/YourComponent.js`
2. Add comprehensive README at `components/YourComponent/README.md` with:
   - Installation instructions
   - Basic usage example
   - All props with types and descriptions
   - Available methods
   - Key features
   - 2-3 practical examples
   - Styling customization section
   - Browser support section
3. Add unit tests in `tests/unit/YourComponent_*.test.js`
4. Update `components/index.js` with export
5. Add CSS styles to `css/bootstrap-m3-theme.css` if needed
6. Update main `README.md` with component mention

#### Bug Fixes

1. Add a test case that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Add any necessary documentation updates

#### Documentation

- Use clear, concise language
- Include code examples
- Test that examples work
- Follow existing formatting styles
- Include proper links to related sections

## Code Style

rnxJS follows these conventions:

- **Formatting**: 2-space indentation, semicolons required
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **JSDoc**: Add comments for complex functions (not required for obvious code)
- **No build step**: Keep components runnable with CDN/imports as-is
- **Security**: Always escape user content with `escapeHtml()` from `utils/security.js`

**Example Component Structure:**
```javascript
export function MyComponent({ label, variant = 'primary' }) {
    const template = (state) => `
        <div class="my-component">
            <span>${escapeHtml(label)}</span>
        </div>
    `;

    return createComponent(template);
}
```

## Testing Requirements

- All new code must include tests
- Tests should cover:
  - Normal operation
  - Edge cases
  - Error handling
  - Integration with other components

**Test Structure:**
```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MyComponent } from '../../components/MyComponent/MyComponent.js';

describe('MyComponent', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('should render with label', (done) => {
        const component = MyComponent({ label: 'Test' });
        container.appendChild(component);

        setTimeout(() => {
            expect(container.textContent).toContain('Test');
            done();
        }, 50);
    });
});
```

## Documentation Standards

### Component README Format

```markdown
# ComponentName

Brief one-line description.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

import { ComponentName } from '@arnelirobles/rnxjs';
// ... example code

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|

## Methods

## Features

- Feature 1
- Feature 2

## Examples

### Example 1

### Example 2

## Styling

## Browser Support

## Related Components
```

### Changelog Entry Format

When submitting a PR that includes new features:

```markdown
### Version X.Y.Z (Feature Name) - Month Year

- **Category**: Feature description
- **Category**: Another feature
```

## Pull Request Process

1. Update relevant documentation and tests
2. Run `npm test` and ensure all tests pass
3. Run `npm run build` and verify no build errors
4. Write a clear PR title and description
5. Reference any related issues with "Closes #123"
6. Ensure your branch is up-to-date with main
7. Submit the PR and respond to reviews promptly

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
Description of how this was tested

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Build passes (npm run build)
- [ ] All tests pass (npm test)
```

## License

By contributing, you agree that your contributions will be licensed under the [Mozilla Public License v2.0](LICENSE).

## Questions?

- Check [existing discussions](https://github.com/arnelirobles/rnxjs/discussions)
- Open a GitHub discussion for questions
- Review documentation in [README.md](README.md)

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Project documentation as appropriate

---

**Thank you for contributing to rnxJS!** Your help makes this project better for everyone.
