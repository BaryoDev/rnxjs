# Dropdown

A flexible dropdown menu component with keyboard navigation, smart positioning, and customizable items.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Dropdown } from '@arnelirobles/rnxjs';

const dropdown = Dropdown({
    label: 'Actions',
    items: [
        { id: 'edit', label: 'Edit', icon: '✏️' },
        { id: 'delete', label: 'Delete', icon: '🗑️' },
        { id: 'share', label: 'Share', icon: '📤' }
    ],
    onSelect: (item) => console.log('Selected:', item)
});

document.body.appendChild(dropdown);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `'Menu'` | Button display text |
| `items` | Array | `[]` | Menu items array |
| `position` | string | `'bottom-left'` | Dropdown position: bottom-left, bottom-right, top-left, top-right |
| `onSelect` | function | `null` | Callback when item is selected |
| `trigger` | string | `'click'` | Trigger type: click or hover |
| `icon` | string | `null` | Optional icon before label |
| `variant` | string | `'default'` | Style variant: default, outline, minimal, danger |
| `disabled` | boolean | `false` | Disable dropdown |

## Item Structure

```javascript
{
    id: 'unique-id',        // Used in onSelect callback
    label: 'Item Label',    // Display text
    icon: '✏️',            // Optional emoji or HTML
    href: '#/path',         // Optional link (prevents default if no callback)
    badge: '3',             // Optional badge text
    active: false,          // Optional, pre-set active state
    disabled: false,        // Optional, disable specific item
    divider: true           // Optional, creates visual separator (no label needed)
}
```

## Methods

```javascript
const dropdown = Dropdown({ items: [...] });

// Open dropdown
dropdown.open();

// Close dropdown
dropdown.close();

// Toggle dropdown state
dropdown.toggle();

// Check if dropdown is open
const open = dropdown.isOpen();
```

## Examples

### Basic Menu

```javascript
Dropdown({
    label: 'File',
    items: [
        { id: 'new', label: 'New', icon: '📄' },
        { id: 'open', label: 'Open', icon: '📂' },
        { id: 'save', label: 'Save', icon: '💾' },
        { divider: true },
        { id: 'exit', label: 'Exit', icon: '🚪' }
    ],
    onSelect: (item) => {
        console.log('Action:', item.id);
    }
});
```

### User Account Menu

```javascript
Dropdown({
    label: 'Account',
    icon: '👤',
    position: 'bottom-right',
    items: [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'help', label: 'Help', icon: '❓' },
        { divider: true },
        { id: 'logout', label: 'Logout', icon: '🚪' }
    ],
    onSelect: (item) => {
        if (item.id === 'logout') {
            // Handle logout
        }
    }
});
```

### Action Dropdown with Badges

```javascript
Dropdown({
    label: 'Notifications',
    icon: '🔔',
    position: 'bottom-left',
    items: [
        { id: 'messages', label: 'Messages', badge: '5' },
        { id: 'alerts', label: 'Alerts', badge: '2' },
        { id: 'updates', label: 'Updates', badge: '1' },
        { divider: true },
        { id: 'mark-read', label: 'Mark all as read' }
    ],
    onSelect: (item) => {
        console.log('View:', item.id);
    }
});
```

### Danger Actions

```javascript
Dropdown({
    label: 'More Options',
    variant: 'danger',
    items: [
        { id: 'archive', label: 'Archive', icon: '📦' },
        { id: 'move-trash', label: 'Move to Trash', icon: '🗑️' },
        { divider: true },
        { id: 'delete-permanent', label: 'Delete Permanently', icon: '⚠️', disabled: false }
    ],
    onSelect: (item) => {
        if (item.id === 'delete-permanent') {
            if (confirm('Are you sure?')) {
                // Delete item
            }
        }
    }
});
```

### Context Menu Style

```javascript
Dropdown({
    label: 'Edit',
    icon: '✏️',
    position: 'bottom-left',
    items: [
        { id: 'cut', label: 'Cut', icon: '✂️' },
        { id: 'copy', label: 'Copy', icon: '📋' },
        { id: 'paste', label: 'Paste', icon: '📌' },
        { divider: true },
        { id: 'select-all', label: 'Select All' }
    ],
    onSelect: (item) => {
        console.log('Edit action:', item.id);
    }
});
```

## Styling

```css
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.dropdown-trigger:hover:not(:disabled) {
    background-color: #efefef;
    border-color: #ccc;
}

.dropdown-trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.dropdown-trigger[aria-expanded="true"] {
    background-color: #e8e8e8;
    border-color: #999;
}

.dropdown-arrow {
    display: inline-flex;
    transition: transform 0.3s ease;
}

.dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 200px;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-bottom-left {
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
}

.dropdown-bottom-right {
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
}

.dropdown-top-left {
    bottom: 100%;
    left: 0;
    margin-bottom: 0.5rem;
}

.dropdown-top-right {
    bottom: 100%;
    right: 0;
    margin-bottom: 0.5rem;
}

.dropdown-list {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
}

.dropdown-item {
    list-style: none;
    margin: 0;
}

.dropdown-item.divider {
    border-top: 1px solid #e0e0e0;
    margin: 0.5rem 0;
    height: 0;
    padding: 0;
}

.dropdown-item-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.dropdown-item:not(.disabled) .dropdown-item-link:hover {
    background-color: #f5f5f5;
}

.dropdown-item.active .dropdown-item-link {
    background-color: #e3f2fd;
    color: #0b57d0;
    font-weight: 500;
}

.dropdown-item.disabled .dropdown-item-link {
    opacity: 0.5;
    cursor: not-allowed;
}

.dropdown-item-icon {
    display: inline-flex;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.dropdown-item-text {
    flex: 1;
}

.dropdown-item-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #0b57d0;
    color: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
}

/* Variants */
.dropdown-outline .dropdown-trigger {
    background-color: transparent;
    border: 1px solid #666;
}

.dropdown-outline .dropdown-trigger:hover {
    background-color: #f5f5f5;
}

.dropdown-minimal .dropdown-trigger {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #666;
    border-radius: 0;
}

.dropdown-danger .dropdown-trigger {
    background-color: #fee;
    border-color: #f44336;
    color: #d32f2f;
}

.dropdown-danger .dropdown-trigger:hover {
    background-color: #fdd;
}
```

## Keyboard Navigation

- **Tab**: Navigate to dropdown button
- **Enter/Space**: Open/close dropdown
- **Arrow Down**: Open dropdown and focus first item
- **Arrow Up/Down**: Navigate between items
- **Arrow Up** (on first item): Return focus to button
- **Escape**: Close dropdown

## Accessibility

- Full keyboard support
- ARIA labels (`aria-haspopup`, `aria-expanded`)
- Screen reader announcements
- Focus management
- Active item indicators

## Performance

- Smooth animations with CSS
- Efficient event delegation
- Automatic cleanup
- No re-rendering overhead

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 with polyfills
- Mobile browsers with touch support

## Related Components

- [Button](../Button/) - Base button component
- [Menu](../Menu/) - Persistent menu alternative
- [Modal](../Modal/) - Dialog alternative
- [Popover](../Popover/) - Tooltip alternative
