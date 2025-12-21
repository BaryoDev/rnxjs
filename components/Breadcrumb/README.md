# Breadcrumb

A navigation aid that shows the user's location in a hierarchical structure. Helps users understand where they are in your application and navigate back to parent sections.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Breadcrumb } from '@arnelirobles/rnxjs';

const breadcrumb = Breadcrumb({
    items: [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics', href: '/products/electronics', active: true }
    ]
});

document.getElementById('app').appendChild(breadcrumb);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | required | Array of breadcrumb items. Each item should have: `label` (string), `href` (string for links), `active` (boolean, last item) |
| `separator` | string | `'/'` | Custom separator between items (e.g., '>', ':', '→') |
| `className` | string | `''` | Additional CSS classes |

## Item Definition

Each breadcrumb item should have:

```javascript
{
    label: 'Products',     // Required: display text
    href: '/products',     // Required: link URL (ignored if active: true)
    active: false          // Optional: true for current page (default: false)
}
```

## Examples

### Basic Navigation Path

```javascript
Breadcrumb({
    items: [
        { label: 'Home', href: '/' },
        { label: 'Settings', href: '/settings', active: true }
    ]
})
```

### Deep Hierarchy

```javascript
Breadcrumb({
    items: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/settings' },
        { label: 'Account', href: '/settings/account' },
        { label: 'Security', href: '/settings/account/security', active: true }
    ]
})
```

### Custom Separator

```javascript
Breadcrumb({
    items: [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article Title', href: '/blog/article', active: true }
    ],
    separator: '→'
})
```

### With Custom Styling

```javascript
Breadcrumb({
    items: [
        { label: 'Admin', href: '/admin' },
        { label: 'Users', href: '/admin/users', active: true }
    ],
    className: 'breadcrumb-light'
})
```

## Styling

The component uses Bootstrap breadcrumb classes by default. You can customize with CSS:

```css
/* Style breadcrumb container */
.breadcrumb {
    background-color: transparent;
    padding: 0;
}

/* Style breadcrumb links */
.breadcrumb-item a {
    color: #0d6efd;
    text-decoration: none;
}

.breadcrumb-item a:hover {
    text-decoration: underline;
}

/* Style active (current) item */
.breadcrumb-item.active {
    color: #6c757d;
    font-weight: 500;
}

/* Style separator */
.breadcrumb-separator {
    color: #dee2e6;
}
```

## Accessibility

- **Semantic HTML**: Uses `<nav>` with `aria-label="breadcrumb"`
- **Proper Structure**: Ordered list (`<ol>`) for breadcrumbs
- **Link Semantics**: Uses `<a>` for navigable items
- **Active State**: Last item is visually distinct and not a link
- **Screen Readers**: List structure provides context about navigation depth

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Navigation](../Navigation/) - Full navigation menu
- [TopAppBar](../TopAppBar/) - Header with breadcrumb support
- [Sidebar](../Sidebar/) - Side navigation

## Tips & Tricks

### Dynamic Breadcrumbs from Route

```javascript
function createBreadcrumbsFromRoute(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const items = [];

    // Add home
    items.push({ label: 'Home', href: '/' });

    // Add each segment
    let path = '';
    segments.forEach(segment => {
        path += `/${segment}`;
        items.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: path,
            active: path === pathname
        });
    });

    return Breadcrumb({ items });
}

// Usage: createBreadcrumbsFromRoute(window.location.pathname)
```

### Breadcrumb with Icons

```javascript
Breadcrumb({
    items: [
        { label: '🏠 Home', href: '/' },
        { label: '📦 Products', href: '/products' },
        { label: '🖥️ Electronics', href: '/products/electronics', active: true }
    ]
})
```

### Integration with Router

```javascript
// Pseudo-code for framework integration
router.on('change', (route) => {
    const breadcrumb = Breadcrumb({
        items: route.breadcrumbs
    });
    document.getElementById('breadcrumbs').replaceWith(breadcrumb);
});
```
