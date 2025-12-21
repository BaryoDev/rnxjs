# Tooltip

A smart tooltip component with automatic positioning and configurable delay.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Tooltip } from '@arnelirobles/rnxjs';

const tooltip = Tooltip({
    element: document.getElementById('btn'),
    content: 'Click to submit form',
    position: 'top',
    variant: 'info'
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `element` | HTMLElement\|string | required | Target element or selector |
| `content` | string | required | Tooltip text |
| `position` | string | `'top'` | Position: top, bottom, left, right |
| `delay` | number | `100` | Show delay in milliseconds |
| `variant` | string | `'dark'` | Color: primary, success, danger, warning, info, dark |
| `arrow` | boolean | `true` | Show arrow pointer |
| `className` | string | `''` | Additional CSS classes |

## Methods

```javascript
const tooltip = Tooltip({
    element: '#button',
    content: 'Hello!'
});

// Show tooltip
tooltip.show();

// Hide tooltip
tooltip.hide();

// Update content
tooltip.setContent('New content');

// Remove tooltip
tooltip.destroy();
```

## Examples

### Button Tooltip

```javascript
Tooltip({
    element: document.querySelector('.save-btn'),
    content: 'Save changes',
    position: 'bottom',
    variant: 'primary'
});
```

### Help Icons

```javascript
document.querySelectorAll('.help-icon').forEach((icon) => {
    Tooltip({
        element: icon,
        content: icon.dataset.help,
        position: 'right',
        variant: 'info'
    });
});
```

### Dynamic Content

```javascript
const tooltip = Tooltip({
    element: '#status',
    content: 'Loading...'
});

// Update later
setTimeout(() => {
    tooltip.setContent('Complete!');
}, 2000);
```

### Keyboard Shortcuts

```javascript
Tooltip({
    element: '#search',
    content: 'Press Ctrl+K to search',
    position: 'bottom',
    delay: 500
});
```

## Positioning

- **top**: Above element (default)
- **bottom**: Below element
- **left**: Left of element
- **right**: Right of element

Smart positioning: Automatically adjusts if near viewport edge (future)

## Variants

- `primary` - Blue
- `success` - Green
- `danger` - Red
- `warning` - Orange
- `info` - Cyan
- `dark` - Gray (default)

## Styling

```css
.tooltip {
    background-color: #212529;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.tooltip.show {
    opacity: 1;
}

.tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: inherit;
    transform: rotate(45deg);
}
```

## Accessibility

- ARIA hidden (non-interactive)
- Keyboard accessible trigger elements
- Focus management
- Screen reader announcements

## Performance

- Lazy rendering
- Efficient positioning
- No duplicate tooltips
- Automatic cleanup

## Browser Support

- Modern browsers
- IE 11 with polyfills
- Mobile browsers (hover on touch)

## Related Components

- [Popover](../Popover/) - Interactive tooltip
- [Modal](../Modal/) - Full dialog
- [Alert](../Alert/) - Alert messages
