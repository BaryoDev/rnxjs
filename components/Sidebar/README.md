# Sidebar

A collapsible navigation sidebar with nested menu support and smooth animations.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Sidebar } from '@arnelirobles/rnxjs';

const sidebar = Sidebar({
    items: [
        { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '📊' },
        { id: 'users', label: 'Users', href: '#/users', icon: '👥' },
        {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            children: [
                { id: 'profile', label: 'Profile', href: '#/settings/profile' },
                { id: 'security', label: 'Security', href: '#/settings/security' }
            ]
        }
    ],
    defaultOpen: true,
    onItemClick: (item) => console.log('Clicked:', item)
});

document.body.appendChild(sidebar);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | `[]` | Menu items array with nested children support |
| `defaultOpen` | boolean | `true` | Whether sidebar opens by default |
| `variant` | string | `'default'` | Style variant: default, dark, light, modern |
| `width` | string | `'250px'` | Width when expanded |
| `collapsedWidth` | string | `'60px'` | Width when collapsed |
| `darkMode` | boolean | `false` | Apply dark theme |
| `onItemClick` | function | `null` | Callback when item is clicked |
| `activeItem` | string | `null` | ID of initially active item |

## Item Structure

```javascript
{
    id: 'unique-id',        // Required, used for active state and callbacks
    label: 'Menu Label',    // Display text
    href: '#/route',        // Link destination
    icon: '📌',            // Optional emoji or HTML
    active: false,          // Optional, pre-set active state
    children: [             // Optional nested items
        {
            id: 'sub-id',
            label: 'Submenu Item',
            href: '#/sub-route',
            icon: '📄'
        }
    ]
}
```

## Methods

```javascript
const sidebar = Sidebar({ items: [...] });

// Toggle sidebar open/closed
sidebar.toggle();

// Check if sidebar is open
const open = sidebar.isOpen();

// Set active menu item
sidebar.setActiveItem('dashboard');
```

## Examples

### Simple Navigation

```javascript
Sidebar({
    items: [
        { id: 'home', label: 'Home', href: '#/', icon: '🏠' },
        { id: 'about', label: 'About', href: '#/about', icon: 'ℹ️' },
        { id: 'contact', label: 'Contact', href: '#/contact', icon: '✉️' }
    ],
    onItemClick: (item) => {
        console.log('Navigate to:', item.id);
    }
});
```

### Multi-Level Navigation

```javascript
Sidebar({
    items: [
        { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '📊' },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            children: [
                { id: 'all-products', label: 'All Products', href: '#/products' },
                { id: 'categories', label: 'Categories', href: '#/categories' },
                { id: 'inventory', label: 'Inventory', href: '#/inventory' }
            ]
        },
        {
            id: 'admin',
            label: 'Administration',
            icon: '🔐',
            children: [
                { id: 'users', label: 'Users', href: '#/users' },
                { id: 'roles', label: 'Roles', href: '#/roles' },
                { id: 'settings', label: 'Settings', href: '#/settings' }
            ]
        }
    ]
});
```

### Dark Mode with Active Item

```javascript
const sidebar = Sidebar({
    items: [
        { id: 'dashboard', label: 'Dashboard', href: '#/' },
        { id: 'analytics', label: 'Analytics', href: '#/analytics' }
    ],
    darkMode: true,
    defaultOpen: true,
    activeItem: 'dashboard',
    onItemClick: (item) => {
        sidebar.setActiveItem(item.id);
    }
});
```

### Responsive Sidebar

```javascript
const sidebar = Sidebar({
    items: [...],
    width: window.innerWidth < 768 ? '100%' : '280px',
    collapsedWidth: window.innerWidth < 768 ? '0' : '60px',
    defaultOpen: window.innerWidth >= 768
});
```

## Styling

```css
.sidebar {
    background-color: #fff;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    transition: width 0.3s ease;
}

.sidebar-dark {
    background-color: #212529;
    color: white;
    border-right-color: #333;
}

.sidebar-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
}

.sidebar-brand-text {
    font-weight: 600;
    font-size: 1.1rem;
}

.sidebar-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    color: inherit;
}

.sidebar-toggle:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-item {
    list-style: none;
    margin: 0.25rem 0;
}

.sidebar-item-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.sidebar-item-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-item.active > .sidebar-item-btn,
.sidebar-item.active > .sidebar-parent-toggle .sidebar-item-btn {
    background-color: #0b57d0;
    color: white;
}

.sidebar-icon {
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.sidebar-submenu {
    list-style: none;
    padding-left: 0.5rem;
    border-left: 2px solid #e0e0e0;
    margin-left: 0.5rem;
}

.sidebar-subitem {
    list-style: none;
}

.sidebar-subitem-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: inherit;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    font-size: 0.95rem;
}

.sidebar-subitem-link:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.sidebar-subitem.active > .sidebar-subitem-link {
    background-color: #d1e7ff;
    color: #0b57d0;
    font-weight: 500;
}

.sidebar-submenu-arrow {
    margin-left: auto;
    transition: transform 0.3s ease;
}

.sidebar-collapsed .sidebar-item-text,
.sidebar-collapsed .sidebar-submenu-arrow,
.sidebar-collapsed .sidebar-brand-text {
    display: none !important;
}
```

## Accessibility

- ARIA labels on toggle button
- Keyboard navigation support
- Active state indicators
- Semantic HTML structure (`<nav>`, `<ul>`, `<li>`)
- Screen reader friendly

## Performance

- Smooth CSS transitions
- Efficient event delegation
- No re-rendering overhead
- Auto-cleanup of event listeners

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 with polyfills
- Mobile browsers with touch support

## Related Components

- [TopAppBar](../TopAppBar/) - Header with menu integration
- [NavigationBar](../NavigationBar/) - Bottom navigation alternative
- [Tabs](../Tabs/) - Horizontal tab navigation
- [Breadcrumb](../Breadcrumb/) - Navigation path display
