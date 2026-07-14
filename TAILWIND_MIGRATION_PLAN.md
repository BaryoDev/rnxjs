# rnxJS Tailwind CSS Migration & Architecture Improvement Plan

**Version:** 2.0 Roadmap
**Target Release:** Q2 2026
**Philosophy:** Professional, Minimal, Clean - Blazor-inspired extensibility

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Issues to Fix First](#critical-issues-to-fix-first)
3. [Architecture Redesign](#architecture-redesign)
4. [Tailwind Migration Strategy](#tailwind-migration-strategy)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Breaking Changes & Migration Guide](#breaking-changes--migration-guide)

---

## Executive Summary

### Goals

1. **Migrate from Bootstrap to Tailwind CSS** while maintaining component API compatibility
2. **Make framework CSS-agnostic** with pluggable theme system (support Bootstrap, Tailwind, custom)
3. **Fix critical security vulnerabilities** (XSS, ReDoS, memory leaks)
4. **Improve architecture** with better abstractions and extensibility
5. **Adopt Tailwind's design philosophy**: Professional, minimal, clean, mobile-first
6. **Enable Blazor-style class customization**: Allow developers to override component styles via props

### Success Metrics

- ✅ Zero hard-coded CSS framework dependencies in components
- ✅ All 8 critical/high security issues resolved
- ✅ <5KB gzipped base framework (before components)
- ✅ 100% backward compatibility for component APIs
- ✅ Support Bootstrap AND Tailwind themes simultaneously
- ✅ Mobile-first responsive by default
- ✅ Full test coverage (700+ tests)

---

## Critical Issues to Fix First

**⚠️ STOP-SHIP ISSUES - Must fix before any migration work**

### 1. Security Vulnerabilities (CRITICAL)

#### Issue 1.1: XSS in Modal Footer (Severity: CRITICAL)
**File:** `components/Modal/Modal.js:21`

```javascript
// CURRENT (UNSAFE)
footerContent = footerSlotNode.innerHTML;  // ❌ XSS vulnerability

// FIX
import { sanitizeHtml } from '../../utils/security.js';
footerContent = sanitizeHtml(footerSlotNode.innerHTML);  // ✅ Safe
```

#### Issue 1.2: XSS in VirtualList renderItem (Severity: CRITICAL)
**File:** `components/VirtualList/VirtualList.js:102`

```javascript
// CURRENT (UNSAFE)
content.innerHTML = itemsHtml.join('');  // ❌ XSS if renderItem doesn't escape

// FIX: Add safe rendering option
const renderSafe = ({ renderItem, renderItemSafe }) => {
  if (renderItemSafe) {
    // Use textContent-based rendering
    return renderItemSafe(item, i);
  } else {
    // Document requirement to escape HTML
    return renderItem(item, i);  // Developer must escape
  }
};
```

**Documentation Update:**
```javascript
/**
 * @param {Function} renderItem - MUST escape HTML! Use escapeHtml() from rnx/security
 * @param {Function} renderItemSafe - Safe alternative, auto-escaped (text only)
 */
```

#### Issue 1.3: ReDoS in Validation Patterns (Severity: HIGH)
**File:** `framework/DataBinder.js:144`

```javascript
// CURRENT (UNSAFE)
const regex = new RegExp(param);  // ❌ Can cause ReDoS

// FIX: Add regex validation
import { isSafeRegex } from '../../utils/security.js';

if (name === 'pattern') {
    try {
        if (!isSafeRegex(param)) {
            console.error('[rnxJS] Unsafe regex pattern rejected:', param);
            return 'Invalid validation rule';
        }
        const regex = new RegExp(param);
        // ...
```

**New utility function:**
```javascript
// utils/security.js
export function isSafeRegex(pattern) {
    // Block catastrophic backtracking patterns
    const unsafePatterns = [
        /(\+\*|\*\+)/,           // Nested quantifiers
        /(\{\d+,\d+\}){2,}/,     // Multiple bounded repeats
        /(\([^)]*\+){3,}/        // Nested groups with +
    ];

    return !unsafePatterns.some(p => p.test(pattern));
}
```

### 2. Memory Leaks (HIGH)

#### Issue 2.1: Event Listener Cleanup Failures
**Files:** Dropdown, Sidebar, ErrorState, Stepper

```javascript
// CURRENT (BROKEN)
return () => {
    trigger?.removeEventListener('click', null);  // ❌ Does nothing!
};

// FIX: Store handler references
const handlers = {
    triggerClick: (e) => { /* ... */ },
    documentClick: (e) => { /* ... */ }
};

trigger.addEventListener('click', handlers.triggerClick);
document.addEventListener('click', handlers.documentClick);

return () => {
    trigger?.removeEventListener('click', handlers.triggerClick);  // ✅
    document?.removeEventListener('click', handlers.documentClick);  // ✅
};
```

#### Issue 2.2: ListRenderer Subscription Leak
**File:** `framework/ListRenderer.js:517`

```javascript
// CURRENT (LEAKS)
state.subscribe(arrayPath, () => renderer.render());  // ❌ Never cleaned up

// FIX
const unsubscribe = state.subscribe(arrayPath, () => renderer.render());

// Store in renderer
renderer._cleanup = () => {
    if (unsubscribe) unsubscribe();
};

// Call in destroy()
destroy() {
    this.clear();
    if (this._cleanup) this._cleanup();
}
```

### 3. Race Conditions (MEDIUM)

#### Issue 3.1: Circular Reference Detection
**File:** `utils/createReactiveState.js:191`

```javascript
// CURRENT (SHARED STATE BUG)
const visitedObjects = new WeakSet(); // ❌ Global shared state

// FIX: Per-state instance
export function createReactiveState(initialState = {}) {
    const visitedObjects = new WeakSet(); // ✅ Scoped to this state

    function createReactiveProxy(target, basePath = '') {
        if (visitedObjects.has(target)) {
            return target;
        }
        visitedObjects.add(target);

        // After processing this subtree, remove it
        // (only keep in set during active traversal)
    }
}
```

---

## Architecture Redesign

### Current Architecture Issues

1. ❌ **Tight coupling**: Components hard-code Bootstrap classes
2. ❌ **No abstraction layer**: Direct string concatenation of CSS classes
3. ❌ **Framework lock-in**: Cannot swap CSS frameworks without rewriting all components
4. ❌ **Limited extensibility**: Developers can't easily customize component styles
5. ❌ **Inconsistent patterns**: Some components use `className`, others use `class`, some both
6. ❌ **No class composition**: Can't merge user classes with component classes intelligently

### New Architecture: CSS-Agnostic Component System

```
┌─────────────────────────────────────────────────────────┐
│                    User Application                      │
│  (Chooses theme: 'tailwind' | 'bootstrap' | custom)     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Theme Provider (Context)                    │
│  - Loads selected theme configuration                    │
│  - Provides classResolver() to components               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Component (e.g., Button, Card)                 │
│  - Accepts props: variant, size, className, etc.        │
│  - Calls classResolver() to get CSS classes             │
│  - Merges user className with resolved classes          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Class Resolver (Smart Merger)               │
│  - Resolves component + variant to base classes         │
│  - Merges with user-provided className                  │
│  - Handles class conflicts (e.g., color overrides)      │
└────────────────────────┬────────────────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           ↓                            ↓
┌─────────────────────┐      ┌─────────────────────┐
│  Bootstrap Theme    │      │  Tailwind Theme     │
│  Configuration      │      │  Configuration      │
├─────────────────────┤      ├─────────────────────┤
│ button: {           │      │ button: {           │
│   base: 'btn',      │      │   base: 'px-4 py-2',│
│   variants: {       │      │   variants: {       │
│     primary: '...'  │      │     primary: '...'  │
│   }                 │      │   }                 │
│ }                   │      │ }                   │
└─────────────────────┘      └─────────────────────┘
```

### Key Components of New Architecture

#### 1. Theme Configuration Schema

**File:** `themes/schema.js`

```javascript
/**
 * Theme Configuration Schema
 *
 * Each theme exports component class definitions with:
 * - base: Base classes always applied
 * - variants: Named style variations (primary, secondary, etc.)
 * - sizes: Size modifiers (sm, md, lg)
 * - states: State classes (disabled, active, loading)
 * - modifiers: Boolean modifiers (block, outline, etc.)
 */

export const ThemeSchema = {
  // Component name
  button: {
    base: 'string',              // Base classes
    variants: {
      [key: string]: 'string'    // Variant classes
    },
    sizes: {
      [key: string]: 'string'    // Size classes
    },
    states: {
      disabled: 'string',
      active: 'string',
      loading: 'string'
    },
    modifiers: {
      block: 'string',
      outline: 'string'
    }
  },
  // ... more components
};
```

#### 2. Bootstrap Theme Configuration

**File:** `themes/bootstrap/index.js`

```javascript
export const bootstrapTheme = {
  name: 'bootstrap',
  version: '5.3',

  components: {
    button: {
      base: 'btn',
      variants: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-info',
        light: 'btn-light',
        dark: 'btn-dark',
        link: 'btn-link',
        // M3 variants (for backward compatibility)
        filled: 'btn-primary',
        outlined: 'btn-outline-primary',
        text: 'btn-link',
        elevated: 'btn-primary elevated',
        tonal: 'btn-secondary'
      },
      sizes: {
        sm: 'btn-sm',
        lg: 'btn-lg'
      },
      states: {
        disabled: 'disabled',
        active: 'active'
      },
      modifiers: {
        block: 'w-100',
        outline: 'btn-outline'  // Modifier to make any variant outlined
      }
    },

    card: {
      base: 'card',
      variants: {
        default: '',
        elevated: 'shadow',
        outlined: 'border'
      },
      parts: {
        header: 'card-header',
        body: 'card-body',
        footer: 'card-footer',
        title: 'card-title',
        subtitle: 'card-subtitle',
        text: 'card-text'
      }
    },

    input: {
      base: 'form-control',
      sizes: {
        sm: 'form-control-sm',
        lg: 'form-control-lg'
      },
      states: {
        disabled: 'disabled',
        readonly: 'readonly',
        invalid: 'is-invalid',
        valid: 'is-valid'
      },
      parts: {
        wrapper: 'mb-3',
        label: 'form-label',
        group: 'input-group',
        text: 'form-text'
      }
    }

    // ... all 46+ components
  },

  utilities: {
    spacing: {
      m: (size) => `m-${size}`,
      mt: (size) => `mt-${size}`,
      mr: (size) => `me-${size}`,
      mb: (size) => `mb-${size}`,
      ml: (size) => `ms-${size}`,
      p: (size) => `p-${size}`,
      // ... more spacing
    },
    layout: {
      flex: 'd-flex',
      flexCol: 'd-flex flex-column',
      flexRow: 'd-flex flex-row',
      grid: 'd-grid',
      block: 'd-block',
      inline: 'd-inline',
      inlineBlock: 'd-inline-block',
      hidden: 'd-none'
    },
    sizing: {
      w: (size) => `w-${size}`,
      h: (size) => `h-${size}`,
      wFull: 'w-100',
      hFull: 'h-100'
    }
  }
};
```

#### 3. Tailwind Theme Configuration

**File:** `themes/tailwind/index.js`

```javascript
export const tailwindTheme = {
  name: 'tailwind',
  version: '3.4',

  components: {
    button: {
      base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg',

      variants: {
        // Tailwind's professional, clean aesthetic
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
        info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',

        // Outlined variants (minimal, clean)
        outlined: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
        outlinedPrimary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',

        // Ghost/text variants (minimal)
        ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
        ghostPrimary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',

        // Link variant
        link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-0'
      },

      sizes: {
        xs: 'text-xs px-2.5 py-1.5',
        sm: 'text-sm px-3 py-2',
        md: 'text-base px-4 py-2.5',
        lg: 'text-lg px-5 py-3',
        xl: 'text-xl px-6 py-3.5'
      },

      states: {
        disabled: 'opacity-50 cursor-not-allowed',
        active: 'ring-2',
        loading: 'opacity-70 cursor-wait'
      },

      modifiers: {
        block: 'w-full',
        rounded: 'rounded-full',
        square: 'aspect-square p-2.5',
        icon: 'gap-2'
      }
    },

    card: {
      base: 'bg-white border border-slate-200 rounded-lg overflow-hidden',

      variants: {
        default: '',
        elevated: 'shadow-lg border-0',
        outlined: 'border-2',
        flat: 'shadow-none border-0'
      },

      parts: {
        header: 'px-6 py-4 border-b border-slate-200 bg-slate-50',
        body: 'px-6 py-4',
        footer: 'px-6 py-4 border-t border-slate-200 bg-slate-50',
        title: 'text-xl font-semibold text-slate-900',
        subtitle: 'text-sm text-slate-600',
        text: 'text-slate-700'
      }
    },

    input: {
      base: 'block w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',

      sizes: {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2.5',
        lg: 'text-lg px-5 py-3'
      },

      states: {
        disabled: 'bg-slate-100 cursor-not-allowed',
        readonly: 'bg-slate-50',
        invalid: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        valid: 'border-green-500 focus:border-green-500 focus:ring-green-500'
      },

      parts: {
        wrapper: 'mb-4',
        label: 'block text-sm font-medium text-slate-700 mb-1.5',
        group: 'flex',
        helpText: 'text-sm text-slate-600 mt-1.5',
        errorText: 'text-sm text-red-600 mt-1.5'
      }
    },

    // Mobile-first responsive utilities
    container: {
      base: 'mx-auto px-4 sm:px-6 lg:px-8',
      sizes: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full'
      }
    }

    // ... all 46+ components
  },

  utilities: {
    spacing: {
      m: (size) => `m-${size}`,
      mt: (size) => `mt-${size}`,
      mr: (size) => `mr-${size}`,
      mb: (size) => `mb-${size}`,
      ml: (size) => `ml-${size}`,
      p: (size) => `p-${size}`,
      // ... more spacing
    },
    layout: {
      flex: 'flex',
      flexCol: 'flex flex-col',
      flexRow: 'flex flex-row',
      grid: 'grid',
      block: 'block',
      inline: 'inline',
      inlineBlock: 'inline-block',
      hidden: 'hidden'
    },
    sizing: {
      w: (size) => `w-${size}`,
      h: (size) => `h-${size}`,
      wFull: 'w-full',
      hFull: 'h-full'
    }
  }
};
```

#### 4. Theme Provider

**File:** `utils/ThemeProvider.js`

```javascript
/**
 * Theme Provider
 *
 * Manages active theme and provides class resolution for components.
 * Supports multiple themes simultaneously (e.g., Bootstrap + Tailwind in same app).
 */

import { bootstrapTheme } from '../themes/bootstrap/index.js';
import { tailwindTheme } from '../themes/tailwind/index.js';

class ThemeProvider {
  constructor() {
    this.themes = new Map();
    this.activeTheme = null;
    this.subscribers = new Set();

    // Register default themes
    this.registerTheme(bootstrapTheme);
    this.registerTheme(tailwindTheme);

    // Default to Tailwind (new default)
    this.setTheme('tailwind');
  }

  /**
   * Register a custom theme
   */
  registerTheme(theme) {
    if (!theme.name || !theme.components) {
      throw new Error('[rnxJS] Invalid theme configuration');
    }

    this.themes.set(theme.name, theme);
    console.info(`[rnxJS] Theme registered: ${theme.name}`);
  }

  /**
   * Set active theme
   */
  setTheme(themeName) {
    const theme = this.themes.get(themeName);

    if (!theme) {
      console.error(`[rnxJS] Theme "${themeName}" not found. Available themes:`, Array.from(this.themes.keys()));
      return;
    }

    this.activeTheme = theme;
    this.notifySubscribers();

    console.info(`[rnxJS] Active theme: ${themeName}`);
  }

  /**
   * Get active theme
   */
  getTheme() {
    return this.activeTheme;
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.activeTheme));
  }

  /**
   * Resolve classes for a component
   *
   * @param {string} component - Component name (e.g., 'button')
   * @param {Object} options - Component options (variant, size, etc.)
   * @param {string} userClasses - User-provided className
   * @returns {string} - Resolved class string
   */
  resolveClasses(component, options = {}, userClasses = '') {
    const theme = this.activeTheme;

    if (!theme) {
      console.warn('[rnxJS] No active theme. Classes will not be resolved.');
      return userClasses;
    }

    const componentConfig = theme.components[component];

    if (!componentConfig) {
      console.warn(`[rnxJS] Component "${component}" not found in theme "${theme.name}"`);
      return userClasses;
    }

    const classes = [];

    // 1. Base classes
    if (componentConfig.base) {
      classes.push(componentConfig.base);
    }

    // 2. Variant classes
    if (options.variant && componentConfig.variants) {
      const variantClass = componentConfig.variants[options.variant];
      if (variantClass) {
        classes.push(variantClass);
      }
    }

    // 3. Size classes
    if (options.size && componentConfig.sizes) {
      const sizeClass = componentConfig.sizes[options.size];
      if (sizeClass) {
        classes.push(sizeClass);
      }
    }

    // 4. State classes
    if (componentConfig.states) {
      Object.keys(componentConfig.states).forEach(state => {
        if (options[state]) {
          classes.push(componentConfig.states[state]);
        }
      });
    }

    // 5. Modifier classes
    if (componentConfig.modifiers) {
      Object.keys(componentConfig.modifiers).forEach(modifier => {
        if (options[modifier] === true || options[modifier] === 'true') {
          classes.push(componentConfig.modifiers[modifier]);
        }
      });
    }

    // 6. User-provided classes (highest priority)
    if (userClasses) {
      classes.push(userClasses);
    }

    return classes.filter(Boolean).join(' ');
  }

  /**
   * Resolve utility classes
   *
   * @param {string} utilityType - Utility category (spacing, layout, sizing)
   * @param {string} utilityName - Utility name
   * @param {*} value - Utility value (optional)
   * @returns {string} - Resolved utility class
   */
  resolveUtility(utilityType, utilityName, value = null) {
    const theme = this.activeTheme;

    if (!theme || !theme.utilities || !theme.utilities[utilityType]) {
      return '';
    }

    const utility = theme.utilities[utilityType][utilityName];

    if (typeof utility === 'function') {
      return utility(value);
    }

    return utility || '';
  }
}

// Singleton instance
export const themeProvider = new ThemeProvider();

// Convenience exports
export const { resolveClasses, resolveUtility, setTheme, registerTheme } = themeProvider;
```

#### 5. Smart Class Merger (Conflict Resolution)

**File:** `utils/classNames.js`

```javascript
/**
 * Smart class name merger with conflict resolution
 *
 * Handles Tailwind-style class conflicts (e.g., bg-blue-500 vs bg-red-500)
 * Later classes override earlier classes for the same property.
 */

const classGroups = {
  // Tailwind class groups
  bg: /^bg-/,
  text: /^text-(?!xs|sm|base|lg|xl)/,  // text-color, not text-size
  textSize: /^text-(xs|sm|base|lg|xl|2xl|3xl)/,
  border: /^border-(?!\d)/,  // border-color, not border-width
  borderWidth: /^border-(\d|t-|r-|b-|l-)/,
  rounded: /^rounded/,
  shadow: /^shadow/,
  p: /^p-/,
  px: /^px-/,
  py: /^py-/,
  pt: /^pt-/,
  pr: /^pr-/,
  pb: /^pb-/,
  pl: /^pl-/,
  m: /^m-/,
  mx: /^mx-/,
  my: /^my-/,
  mt: /^mt-/,
  mr: /^mr-/,
  mb: /^mb-/,
  ml: /^ml-/,
  w: /^w-/,
  h: /^h-/,

  // Bootstrap class groups
  bgBs: /^bg-(primary|secondary|success|danger|warning|info|light|dark)/,
  textBs: /^text-(primary|secondary|success|danger|warning|info|light|dark|muted)/,
  btnBs: /^btn-(primary|secondary|success|danger|warning|info|light|dark|outline-)/,
};

/**
 * Merge class names with intelligent conflict resolution
 *
 * @param {...string} classNames - Class name strings to merge
 * @returns {string} - Merged class string with conflicts resolved
 */
export function cn(...classNames) {
  const classMap = new Map();

  // Process all class names
  classNames
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .forEach(className => {
      if (!className) return;

      // Find which group this class belongs to
      let groupKey = null;

      for (const [group, pattern] of Object.entries(classGroups)) {
        if (pattern.test(className)) {
          groupKey = group;
          break;
        }
      }

      // If it belongs to a group, it can override previous classes in same group
      if (groupKey) {
        classMap.set(groupKey, className);
      } else {
        // Independent class, doesn't conflict with anything
        classMap.set(className, className);
      }
    });

  return Array.from(classMap.values()).join(' ');
}

/**
 * Class name builder (shorthand)
 *
 * Usage:
 *   cls('base-class', { 'conditional-class': condition }, userClassName)
 */
export function cls(...args) {
  const classes = [];

  args.forEach(arg => {
    if (!arg) return;

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([className, condition]) => {
        if (condition) {
          classes.push(className);
        }
      });
    }
  });

  return cn(...classes);
}
```

#### 6. Refactored Component Example (Button)

**File:** `components/Button/Button.js`

```javascript
import { createComponent } from '../../utils/createComponent.js';
import { themeProvider } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Button Component
 *
 * @param {Object} props
 * @param {string} props.variant - Button variant (primary, secondary, success, etc.)
 * @param {string} props.size - Button size (xs, sm, md, lg, xl)
 * @param {boolean} props.block - Full-width button
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.icon - Icon name (optional)
 * @param {string} props.label - Button text
 * @param {string} props.className - User-provided classes (Blazor-style)
 * @param {string} props.type - Button type (button, submit, reset)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  icon = '',
  label = '',
  className = '',
  class: cls = '',
  type = 'button',
  ...rest
}) {
  // Resolve classes from active theme
  const resolvedClasses = themeProvider.resolveClasses('button', {
    variant,
    size,
    block: block === true || block === 'true',
    disabled: disabled === true || disabled === 'true',
    loading: loading === true || loading === 'true'
  }, className || cls);

  // Build icon HTML if provided
  const iconHtml = icon ? `<i class="bi bi-${escapeHtml(icon)}"></i>` : '';

  const template = () => `
    <button
      type="${type}"
      class="${resolvedClasses}"
      ${disabled || loading ? 'disabled' : ''}
      ${Object.entries(rest).map(([key, value]) => {
        // Pass through data attributes and other props
        if (key.startsWith('data-') || key.startsWith('aria-')) {
          return `${key}="${escapeHtml(String(value))}"`;
        }
        return '';
      }).join(' ')}
    >
      ${loading ? '<span class="spinner"></span>' : iconHtml}
      ${label ? `<span>${escapeHtml(label)}</span>` : ''}
      <span data-slot></span>
    </button>
  `;

  return createComponent(template, { resolvedClasses, icon, label, ...rest });
}
```

**Usage Examples:**

```javascript
// Default (Tailwind theme active)
<Button variant="primary" label="Click Me" />
// Renders: <button class="inline-flex items-center ... bg-blue-600 text-white ...">

// With user customization (Blazor-style)
<Button
  variant="primary"
  size="lg"
  className="my-custom-class hover:scale-105"
  label="Custom Button"
/>
// User classes merged intelligently with theme classes

// Theme switching
import { setTheme } from '@arnelirobles/rnxjs';

setTheme('bootstrap');  // Switch to Bootstrap theme
setTheme('tailwind');   // Switch to Tailwind theme
setTheme('my-custom');  // Switch to custom theme
```

---

## Tailwind Migration Strategy

### Phase 1: Foundation (Week 1-2)

**Goal:** Build CSS-agnostic infrastructure without breaking existing functionality

#### Tasks:

1. **Create theme system**
   - [ ] `utils/ThemeProvider.js` - Theme management
   - [ ] `utils/classNames.js` - Smart class merger
   - [ ] `themes/schema.js` - Theme configuration schema
   - [ ] `themes/bootstrap/index.js` - Bootstrap theme (preserve current behavior)
   - [ ] Unit tests for theme system (50+ tests)

2. **Create Tailwind theme**
   - [ ] `themes/tailwind/index.js` - Full Tailwind configuration
   - [ ] `themes/tailwind/components.js` - All 46+ component mappings
   - [ ] `themes/tailwind/utilities.js` - Utility class helpers
   - [ ] Design system documentation

3. **Security fixes**
   - [ ] Fix Modal XSS vulnerability
   - [ ] Fix VirtualList XSS vulnerability
   - [ ] Add `isSafeRegex()` utility
   - [ ] Fix ReDoS in validation
   - [ ] Add security tests (20+ tests)

4. **Memory leak fixes**
   - [ ] Fix event listener cleanup in Dropdown
   - [ ] Fix event listener cleanup in Sidebar
   - [ ] Fix event listener cleanup in ErrorState
   - [ ] Fix event listener cleanup in Stepper
   - [ ] Fix ListRenderer subscription leak
   - [ ] Add memory leak tests (10+ tests)

### Phase 2: Component Migration (Week 3-6)

**Goal:** Migrate all 46+ components to use ThemeProvider

#### Migration Pattern:

```javascript
// BEFORE
let btnClass = 'btn';
if (variant === 'primary') btnClass += ' btn-primary';

// AFTER
const classes = themeProvider.resolveClasses('button', { variant });
```

#### Component Groups:

**Group 1: Core UI (Week 3)**
- [ ] Button
- [ ] Badge
- [ ] Alert
- [ ] Spinner
- [ ] Icon

**Group 2: Forms (Week 4)**
- [ ] Input
- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Slider
- [ ] FileUpload

**Group 3: Layout (Week 4)**
- [ ] Container
- [ ] Row
- [ ] Column
- [ ] Card
- [ ] Sidebar

**Group 4: Complex Components (Week 5)**
- [ ] Modal
- [ ] Dropdown
- [ ] Tabs
- [ ] Accordion
- [ ] DataTable
- [ ] Pagination
- [ ] Stepper

**Group 5: Material Components (Week 6)**
- [ ] FAB
- [ ] NavigationDrawer
- [ ] TopAppBar
- [ ] NavigationBar
- [ ] Chips
- [ ] List
- [ ] Search
- [ ] SegmentedButton

**Group 6: Advanced (Week 6)**
- [ ] Tooltip
- [ ] Breadcrumb
- [ ] DatePicker
- [ ] Autocomplete
- [ ] StatCard
- [ ] Skeleton
- [ ] EmptyState
- [ ] ErrorState
- [ ] ProgressBar
- [ ] VirtualList

### Phase 3: Tailwind Design Implementation (Week 7-8)

**Goal:** Implement professional, minimal, clean Tailwind design system

#### Design Principles:

1. **Mobile-First Responsive**
   ```javascript
   // All components responsive by default
   base: 'px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4'
   ```

2. **Professional Color Palette**
   ```javascript
   primary: 'bg-blue-600 hover:bg-blue-700',    // Professional blue
   secondary: 'bg-slate-600 hover:bg-slate-700', // Neutral gray
   success: 'bg-green-600 hover:bg-green-700',   // Clear success
   danger: 'bg-red-600 hover:bg-red-700',        // Clear danger
   ```

3. **Clean Typography**
   ```javascript
   fontFamily: 'Inter, system-ui, sans-serif',
   headings: 'font-semibold tracking-tight',
   body: 'font-normal text-slate-700',
   ```

4. **Minimal Shadows**
   ```javascript
   elevated: 'shadow-md',         // Subtle elevation
   card: 'shadow-sm',             // Minimal card shadow
   modal: 'shadow-xl',            // Clear modal depth
   ```

5. **Smooth Transitions**
   ```javascript
   base: 'transition-all duration-200',
   hover: 'hover:scale-[1.02]',
   focus: 'focus:ring-2 focus:ring-offset-2',
   ```

#### Tailwind Configuration File

**File:** `tailwind.config.js` (for users)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@arnelirobles/rnxjs/dist/**/*.js'  // Include rnxJS
  ],
  theme: {
    extend: {
      colors: {
        // Professional palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Main primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'rnx': '0.5rem',  // Consistent with rnxJS
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),  // Better form styling
  ],
}
```

### Phase 4: Testing & Documentation (Week 9-10)

**Goal:** Ensure quality and provide migration guides

#### Tasks:

1. **Testing**
   - [ ] Unit tests for all migrated components (700+ tests total)
   - [ ] Visual regression tests (Playwright)
   - [ ] Cross-browser testing
   - [ ] Mobile responsiveness testing
   - [ ] Theme switching tests
   - [ ] Performance benchmarks (< 5KB base framework)

2. **Documentation**
   - [ ] Migration guide (Bootstrap → Tailwind)
   - [ ] Theme customization guide
   - [ ] Component API docs (with both themes)
   - [ ] Blazor-style class customization guide
   - [ ] Mobile-first responsive examples
   - [ ] Code samples for all components

3. **Examples**
   - [ ] Full Tailwind dashboard example
   - [ ] Mobile-first landing page
   - [ ] Form-heavy application
   - [ ] Data table with filtering
   - [ ] Theme switching demo

### Phase 5: Release & Migration Support (Week 11-12)

**Goal:** Ship v2.0 with smooth migration path

#### Release Checklist:

- [ ] All security issues fixed
- [ ] All memory leaks fixed
- [ ] All 46+ components migrated
- [ ] 700+ tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Migration guide tested
- [ ] Backward compatibility verified
- [ ] Beta release for community testing
- [ ] Final v2.0.0 release

---

## Breaking Changes & Migration Guide

### Breaking Changes in v2.0

1. **Default theme changed from Bootstrap to Tailwind**
   - Migration: Explicitly set Bootstrap theme in your app
   ```javascript
   import { setTheme } from '@arnelirobles/rnxjs';
   setTheme('bootstrap');  // Keep Bootstrap theme
   ```

2. **`className` prop now uses smart class merging**
   - Before: Classes appended blindly
   - After: Conflicting classes resolved (later wins)
   - Migration: Review custom `className` usage for conflicts

3. **Some component props renamed for consistency**
   - `class` → `className` (standardized)
   - Migration: Search and replace in codebase

4. **M3 theme is now an optional add-on**
   - Before: Included by default
   - After: Import separately
   - Migration:
   ```javascript
   import '@arnelirobles/rnxjs/themes/material3/index.css';
   ```

5. **Icon system changed from Material Symbols to Bootstrap Icons (Tailwind) or configurable**
   - Migration: Update icon names or configure icon adapter

### Migration Steps

#### Step 1: Update package

```bash
npm install @arnelirobles/rnxjs@2.0.0
```

#### Step 2: Choose your theme

**Option A: Stay with Bootstrap (no visual changes)**
```javascript
// In your main app file
import { setTheme } from '@arnelirobles/rnxjs';
import 'bootstrap/dist/css/bootstrap.min.css';  // Keep Bootstrap CSS

setTheme('bootstrap');
```

**Option B: Migrate to Tailwind**
```javascript
// In your main app file
import { setTheme } from '@arnelirobles/rnxjs';
import './styles/tailwind.css';  // Your Tailwind build

setTheme('tailwind');

// Components will automatically use Tailwind classes
```

#### Step 3: Update component usage

No changes needed! Component APIs are 100% backward compatible.

```javascript
// This works the same in v1.0 and v2.0
<Button variant="primary" size="lg" label="Click Me" />
```

#### Step 4: Test customizations

If you used `className` heavily, test for class conflicts:

```javascript
// v1.0: Both classes applied
<Button className="btn-lg" size="sm" />  // Conflict!

// v2.0: Smart merge, size="sm" wins
<Button className="custom-class" size="sm" />  // Works correctly
```

---

## Implementation Checklist

### Pre-Work (Critical Fixes)

- [ ] Fix Modal XSS (1 day)
- [ ] Fix VirtualList XSS (1 day)
- [ ] Fix ReDoS in validation (1 day)
- [ ] Fix event listener leaks (2 days)
- [ ] Fix ListRenderer leak (1 day)
- [ ] Fix circular reference bug (1 day)
**Total: 1 week**

### Phase 1: Foundation (2 weeks)

- [ ] ThemeProvider implementation
- [ ] classNames utilities
- [ ] Bootstrap theme configuration
- [ ] Tailwind theme configuration
- [ ] Security utilities enhancement
- [ ] Unit tests (100+ tests)

### Phase 2: Component Migration (4 weeks)

- [ ] Core UI components (5)
- [ ] Form components (8)
- [ ] Layout components (5)
- [ ] Complex components (6)
- [ ] Material components (8)
- [ ] Advanced components (10)
**Total: 42 components**

### Phase 3: Design Implementation (2 weeks)

- [ ] Tailwind design system
- [ ] Mobile-first responsive patterns
- [ ] Professional color palette
- [ ] Typography system
- [ ] Component examples

### Phase 4: Testing (2 weeks)

- [ ] Unit tests (700+ total)
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Cross-browser testing
- [ ] Mobile testing

### Phase 5: Documentation (1 week)

- [ ] Migration guide
- [ ] API documentation
- [ ] Examples
- [ ] Video tutorials

### Phase 6: Release (1 week)

- [ ] Beta release
- [ ] Community feedback
- [ ] Final fixes
- [ ] v2.0.0 release

**Total Timeline: 12 weeks (3 months)**

---

## Success Criteria

### Technical

- ✅ Zero hard-coded CSS framework classes in components
- ✅ All 8 critical/high issues fixed
- ✅ Framework base < 5KB gzipped
- ✅ 700+ tests passing
- ✅ Bootstrap AND Tailwind themes working
- ✅ 100% backward compatible APIs

### Design

- ✅ Professional, minimal, clean aesthetic (Tailwind philosophy)
- ✅ Mobile-first responsive
- ✅ Blazor-style class customization
- ✅ Consistent design system
- ✅ Accessibility (WCAG 2.1 AA)

### Developer Experience

- ✅ Easy theme switching (1 line of code)
- ✅ Simple component customization via className
- ✅ Clear migration guide
- ✅ Comprehensive documentation
- ✅ Active community support

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize critical fixes** (start immediately)
3. **Set up project board** (GitHub Projects)
4. **Assign resources** (developers, designers, QA)
5. **Begin Phase 1** (foundation work)

---

## Questions for Discussion

1. Should we maintain Bootstrap theme indefinitely, or sunset it in v3.0?
2. Do we want to support other CSS frameworks (Bulma, Foundation, etc.)?
3. Should we create a visual theme builder tool for custom themes?
4. Do we need a codemod tool to automate v1→v2 migration?
5. Should v2.0 be a gradual rollout (2.0-beta, 2.0-rc) or big bang release?

---

**Plan Version:** 1.0
**Last Updated:** 2026-01-10
**Author:** Claude (Anthropic)
**Status:** Draft - Pending Review
