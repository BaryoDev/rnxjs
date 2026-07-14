/**
 * Security utilities for rnxJS
 * @module utils/security
 */

/**
 * HTML entity map for escaping
 * @type {Object.<string, string>}
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escape HTML special characters to prevent XSS
 *
 * @param {*} str - String to escape (non-strings are converted)
 * @returns {string} - Escaped string safe for HTML insertion
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 *
 * @example
 * escapeHtml(null) // Returns: ''
 * escapeHtml(123)  // Returns: '123'
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) {
    return '';
  }

  if (typeof str !== 'string') {
    str = String(str);
  }

  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char]);
}

/**
 * Escape string for use in HTML attributes
 * More aggressive escaping for attribute context
 *
 * @param {*} str - String to escape
 * @returns {string} - Escaped string safe for attribute values
 *
 * @example
 * escapeAttribute('onclick="alert(1)"')
 * // Returns safe encoded version
 */
export function escapeAttribute(str) {
  if (str === null || str === undefined) {
    return '';
  }

  if (typeof str !== 'string') {
    str = String(str);
  }

  // Escape all non-alphanumeric characters
  return str.replace(/[^a-zA-Z0-9]/g, char => {
    return '&#' + char.charCodeAt(0) + ';';
  });
}

/**
 * Escape string for use in JavaScript string context
 *
 * @param {*} str - String to escape
 * @returns {string} - Escaped string safe for JS strings
 *
 * @example
 * escapeJs("Hello 'world'")
 * // Returns: "Hello \\'world\\'"
 */
export function escapeJs(str) {
  if (str === null || str === undefined) {
    return '';
  }

  if (typeof str !== 'string') {
    str = String(str);
  }

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e');
}

/**
 * Create a template tag for safe HTML with automatic escaping
 * All interpolated values are automatically escaped
 *
 * @param {TemplateStringsArray} strings - Template literal strings
 * @param {...*} values - Interpolated values
 * @returns {string} - Safe HTML string
 *
 * @example
 * const name = '<script>alert("xss")</script>';
 * const html = safeHtml`<div>Hello, ${name}!</div>`;
 * // Returns: '<div>Hello, &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;!</div>'
 */
export function safeHtml(strings, ...values) {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    // Check if it's trusted HTML
    if (value && value.__rnxTrustedHtml === true) {
      result += value.toString();
    } else {
      result += escapeHtml(value);
    }

    result += strings[i + 1];
  }

  return result;
}

/**
 * Mark a string as trusted HTML (bypass escaping)
 * USE WITH EXTREME CAUTION - only for pre-sanitized content
 *
 * @param {string} html - Pre-sanitized HTML string
 * @returns {Object} - Trusted HTML object
 *
 * @example
 * // Only use with sanitized content!
 * import DOMPurify from 'dompurify';
 * const clean = DOMPurify.sanitize(userHtml);
 * const html = safeHtml`<div>${trustHtml(clean)}</div>`;
 */
export function trustHtml(html) {
  if (typeof html !== 'string') {
    html = String(html ?? '');
  }

  return {
    __rnxTrustedHtml: true,
    toString: () => html,
    valueOf: () => html
  };
}

/**
 * Check if a value is trusted HTML
 *
 * @param {*} value - Value to check
 * @returns {boolean} - True if trusted HTML
 */
export function isTrustedHtml(value) {
  return value && value.__rnxTrustedHtml === true;
}

/**
 * Sanitize a string for safe display
 * Removes control characters and normalizes whitespace
 *
 * @param {*} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeText(str) {
  if (str === null || str === undefined) {
    return '';
  }

  return String(str)
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes
    .replace(/\0/g, '')
    .trim();
}

/**
 * Sanitize a URL to prevent javascript: and data: attacks
 *
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Safe URL or null if unsafe
 *
 * @example
 * sanitizeUrl('javascript:alert(1)') // Returns: null
 * sanitizeUrl('https://example.com') // Returns: 'https://example.com'
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      console.warn(`[rnxJS] Blocked dangerous URL protocol: ${url.slice(0, 30)}...`);
      return null;
    }
  }

  // Allow safe protocols and relative URLs
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', '//', '/'];
  const isSafe = safeProtocols.some(p => trimmed.startsWith(p)) ||
                 !trimmed.includes(':'); // Relative URLs

  return isSafe ? url : null;
}

/**
 * Sanitize object keys to prevent prototype pollution
 *
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object (deep clone)
 *
 * @example
 * sanitizeObject({ __proto__: { polluted: true }, name: 'safe' })
 * // Returns: { name: 'safe' }
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const result = {};

  for (const key of Object.keys(obj)) {
    if (dangerous.includes(key)) {
      console.warn(`[rnxJS] Blocked dangerous object key: ${key}`);
      continue;
    }

    const value = obj[key];
    result[key] = typeof value === 'object' ? sanitizeObject(value) : value;
  }

  return result;
}

/**
 * Check if a regex pattern is safe to execute (prevent ReDoS attacks)
 *
 * Detects patterns that can cause catastrophic backtracking:
 * - Nested quantifiers (e.g., (a+)+ or (a*)*)
 * - Multiple bounded repeats (e.g., (a{1,10}){2,20})
 * - Deeply nested groups with quantifiers
 *
 * @param {string} pattern - Regex pattern to validate
 * @returns {boolean} - True if pattern is safe, false if potentially dangerous
 *
 * @example
 * isSafeRegex('(a+)+b')              // Returns: false (nested quantifiers)
 * isSafeRegex('^[a-z]+@[a-z]+\\.com$') // Returns: true (safe pattern)
 */
export function isSafeRegex(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    return false;
  }

  // Patterns that indicate potential ReDoS vulnerabilities
  const unsafePatterns = [
    /(\+\*|\*\+|\*\*|\+\+)/,              // Nested quantifiers: +*, *+, **, ++
    /(\{\d+,\d+\}){2,}/,                   // Multiple bounded repeats: {n,m}{x,y}
    /(\([^)]*[\+\*]){3,}/,                 // 3+ nested groups with quantifiers
    /(\(.*\+.*\)){2,}/,                    // Nested groups with +
    /(\(.*\*.*\)){2,}/,                    // Nested groups with *
    /(\([^)]*\+[^)]*\)\+)/,                // (group+)+ pattern
    /(\([^)]*\*[^)]*\)\*)/,                // (group*)* pattern
    /(.+)+/,                               // Literal .+ followed by +
    /(.*)+/,                               // Literal .* followed by +
  ];

  // Check for dangerous patterns
  for (const dangerous of unsafePatterns) {
    if (dangerous.test(pattern)) {
      console.warn(`[rnxJS] Unsafe regex pattern detected: ${pattern}`);
      return false;
    }
  }

  // Check pattern length (very long patterns can also be problematic)
  if (pattern.length > 500) {
    console.warn(`[rnxJS] Regex pattern too long (${pattern.length} chars), rejecting as unsafe`);
    return false;
  }

  return true;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * This is a basic sanitizer that removes dangerous elements and attributes.
 * For production use with untrusted HTML, consider using DOMPurify.
 *
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 *
 * @example
 * sanitizeHtml('<div>Safe</div><script>alert(1)</script>')
 * // Returns: '<div>Safe</div>'
 *
 * @example
 * sanitizeHtml('<img src=x onerror="alert(1)">')
 * // Returns: '<img src="x">'
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove all script tags
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'style', 'meta', 'base'];
  dangerousTags.forEach(tag => {
    const elements = temp.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });

  // Remove event handler attributes from all elements
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all on* attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Sanitize href and src attributes
    if (el.hasAttribute('href')) {
      const href = sanitizeUrl(el.getAttribute('href'));
      if (href) {
        el.setAttribute('href', href);
      } else {
        el.removeAttribute('href');
      }
    }

    if (el.hasAttribute('src')) {
      const src = sanitizeUrl(el.getAttribute('src'));
      if (src) {
        el.setAttribute('src', src);
      } else {
        el.removeAttribute('src');
      }
    }

    // Remove javascript: protocol from other attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.value && attr.value.toLowerCase().includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}
