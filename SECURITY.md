# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| 0.3.x   | :warning: Critical fixes only |
| < 0.3   | :x:                |

## Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

Please report security vulnerabilities by emailing the maintainer directly or opening a private security advisory on GitHub.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix timeline**: Depends on severity (critical: ASAP, high: 1 week, medium: 2 weeks)

---

## Security Best Practices

### XSS Prevention

**Always escape user input before rendering in templates:**

```javascript
import { escapeHtml, safeHtml } from 'rnxjs';

// BAD - vulnerable to XSS
function UserCard({ name }) {
  return `<div class="card">${name}</div>`;
}

// GOOD - escaped
function UserCard({ name }) {
  return `<div class="card">${escapeHtml(name)}</div>`;
}

// BEST - template tag auto-escapes
function UserCard({ name }) {
  return safeHtml`<div class="card">${name}</div>`;
}
```

### Trusted HTML

If you need to insert pre-sanitized HTML, use `trustHtml()`:

```javascript
import { safeHtml, trustHtml } from 'rnxjs';
import DOMPurify from 'dompurify';

function RichContent({ html }) {
  // First sanitize with a proper sanitizer
  const clean = DOMPurify.sanitize(html);
  // Then mark as trusted
  return safeHtml`<div class="content">${trustHtml(clean)}</div>`;
}
```

### URL Sanitization

Always sanitize URLs from user input:

```javascript
import { sanitizeUrl } from 'rnxjs';

function Link({ href, text }) {
  const safeHref = sanitizeUrl(href);
  if (!safeHref) {
    return `<span>${escapeHtml(text)}</span>`;
  }
  return `<a href="${escapeHtml(safeHref)}">${escapeHtml(text)}</a>`;
}
```

### data-if Expressions

The `data-if` attribute only supports safe expression patterns. Function calls and code execution are blocked:

```html
<!-- SUPPORTED expressions -->
<div data-if="isVisible">...</div>
<div data-if="user.role === 'admin'">...</div>
<div data-if="!loading">...</div>
<div data-if="count > 0 && isActive">...</div>
<div data-if="status === 'active' || status === 'pending'">...</div>

<!-- BLOCKED (returns false, logs warning) -->
<div data-if="someFunction()">...</div>
<div data-if="fetch('...')">...</div>
<div data-if="eval('...')">...</div>
<div data-if="constructor.constructor('...')()">...</div>
```

### Content Security Policy

Recommended CSP headers for rnxJS applications:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
```

**Note**: As of v0.4.0, rnxJS does **NOT** require `unsafe-eval`. The `data-if` expressions are parsed safely without using `eval()` or `new Function()`.

---

## Security Utilities Reference

### escapeHtml(str)

Escapes HTML special characters to prevent XSS:

```javascript
escapeHtml('<script>alert("xss")</script>')
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

### escapeAttribute(str)

More aggressive escaping for HTML attribute context:

```javascript
escapeAttribute('onclick="alert(1)"')
// Returns: 'onclick&#61;&#34;alert&#40;1&#41;&#34;'
```

### escapeJs(str)

Escapes string for JavaScript string context:

```javascript
escapeJs("Hello 'world'")
// Returns: "Hello \\'world\\'"
```

### safeHtml\`...\`

Template tag that auto-escapes all interpolated values:

```javascript
const userInput = '<script>xss</script>';
safeHtml`<div>${userInput}</div>`
// Returns: '<div>&lt;script&gt;xss&lt;/script&gt;</div>'
```

### sanitizeUrl(url)

Blocks dangerous URL protocols:

```javascript
sanitizeUrl('javascript:alert(1)')  // Returns: null
sanitizeUrl('data:text/html,...')   // Returns: null
sanitizeUrl('https://example.com')  // Returns: 'https://example.com'
sanitizeUrl('/path/to/page')        // Returns: '/path/to/page'
```

### sanitizeObject(obj)

Removes prototype pollution attack vectors:

```javascript
sanitizeObject({ __proto__: { bad: true }, name: 'safe' })
// Returns: { name: 'safe' }
```

---

## Changelog

### v0.4.0 (Security Release)

- **FIXED**: Remote Code Execution (RCE) vulnerability in `data-if` expression evaluation
- **ADDED**: `escapeHtml()`, `safeHtml`, and other XSS prevention utilities
- **ADDED**: `sanitizeUrl()` to block javascript: and data: URLs
- **ADDED**: `sanitizeObject()` to prevent prototype pollution
- **REMOVED**: Use of `new Function()` - no longer requires `unsafe-eval` CSP
- **UPDATED**: All dependencies to fix known vulnerabilities

### Previous Versions

Versions prior to 0.4.0 contained a critical RCE vulnerability in the `data-if` expression parser. **Upgrade immediately.**
