# Skeleton

A loading placeholder component with shimmer animation. Perfect for showing content is loading before data arrives.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Skeleton } from '@arnelirobles/rnxjs';

// Text skeleton
const skeleton = Skeleton({
    variant: 'text',
    lines: 3
});

document.getElementById('app').appendChild(skeleton);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'text'` | Skeleton type: text, circle, rectangle, card, table |
| `lines` | number | `1` | Number of lines (for text) |
| `rows` | number | `3` | Number of rows (for table) |
| `cols` | number | `3` | Number of columns (for table) |
| `width` | string | `'100%'` | Width of skeleton |
| `height` | string | `'16px'` | Height of skeleton |
| `animation` | string | `'wave'` | Animation type: wave, pulse, none |
| `className` | string | `''` | Additional CSS classes |

## Examples

### Text Skeleton

```javascript
// Single line
Skeleton({
    variant: 'text'
})

// Multiple lines
Skeleton({
    variant: 'text',
    lines: 3
})

// Custom height
Skeleton({
    variant: 'text',
    lines: 2,
    height: '20px'
})
```

### Circle Skeleton

```javascript
Skeleton({
    variant: 'circle',
    width: '48px',
    height: '48px'
})
```

### Rectangle Skeleton

```javascript
Skeleton({
    variant: 'rectangle',
    width: '200px',
    height: '120px'
})
```

### Card Skeleton

```javascript
Skeleton({
    variant: 'card',
    width: '100%',
    height: '240px'
})
```

### Table Skeleton

```javascript
Skeleton({
    variant: 'table',
    rows: 5,
    cols: 4
})
```

### With Different Animations

```javascript
// Wave animation (default)
Skeleton({
    variant: 'text',
    lines: 2,
    animation: 'wave'
})

// Pulse animation
Skeleton({
    variant: 'text',
    lines: 2,
    animation: 'pulse'
})

// No animation
Skeleton({
    variant: 'text',
    lines: 2,
    animation: 'none'
})
```

## Patterns

### Loading List

```javascript
const skeletons = [];
for (let i = 0; i < 5; i++) {
    skeletons.push(
        Skeleton({
            variant: 'text',
            lines: 2,
            className: 'mb-3'
        })
    );
}

const container = document.createElement('div');
skeletons.forEach(s => container.appendChild(s));
```

### Loading Card

```javascript
const Card = require('./Card/Card');

const skeletonCard = Card({
    children: [
        Skeleton({
            variant: 'rectangle',
            width: '100%',
            height: '160px',
            className: 'mb-3'
        }),
        Skeleton({
            variant: 'text',
            lines: 1,
            className: 'mb-2'
        }),
        Skeleton({
            variant: 'text',
            lines: 2
        })
    ]
});
```

### Loading Table

```javascript
Skeleton({
    variant: 'table',
    rows: 10,
    cols: 5
})
```

### Loading User Profile

```javascript
Skeleton({
    variant: 'circle',
    width: '64px',
    height: '64px',
    className: 'mb-3'
})

Skeleton({
    variant: 'text',
    lines: 1,
    width: '200px',
    className: 'mb-2'
})

Skeleton({
    variant: 'text',
    lines: 3
})
```

## Styling

The component uses built-in shimmer animations. Customize with CSS:

```css
/* Skeleton element */
.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
}

/* Wave animation */
.skeleton-wave {
    animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Pulse animation */
.skeleton-pulse {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
}

/* Variants */
.skeleton-circle {
    border-radius: 50%;
}

.skeleton-rectangle {
    border-radius: 4px;
}

.skeleton-card {
    border-radius: 8px;
    aspect-ratio: 4 / 3;
}
```

## Custom Colors

```css
/* Dark theme */
.skeleton.dark {
    background: linear-gradient(90deg, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%);
}

/* Custom color */
.skeleton.primary {
    background: linear-gradient(90deg, #e3f2fd 25%, #bbdefb 50%, #e3f2fd 75%);
}
```

## Performance Notes

- Pure CSS animations (no JavaScript)
- GPU-accelerated animations
- Minimal DOM footprint
- Scales efficiently with multiple skeletons

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Spinner](../Spinner/) - Animated loading indicator
- [EmptyState](../EmptyState/) - No data state
- [ErrorState](../ErrorState/) - Error display
- [Card](../Card/) - Container for content

## Tips & Tricks

### Replace with Actual Content

```javascript
let skeleton = Skeleton({
    variant: 'text',
    lines: 3
});

const container = document.getElementById('content');
container.appendChild(skeleton);

// Later, replace with real content
fetch('/api/data')
    .then(res => res.json())
    .then(data => {
        // Remove skeleton
        skeleton.remove();

        // Add real content
        const content = createContent(data);
        container.appendChild(content);
    });
```

### Timed Replacement (Demo)

```javascript
const skeleton = Skeleton({
    variant: 'card'
});

container.appendChild(skeleton);

// Simulate loading
setTimeout(() => {
    skeleton.remove();
    container.appendChild(Card({ children: [/* real content */] }));
}, 2000);
```

### Conditional Display

```javascript
function showContent(data) {
    if (!data) {
        return Skeleton({
            variant: 'text',
            lines: 2
        });
    }

    return Card({
        children: [
            // Real content
        ]
    });
}
```

### Avatar + Text Pattern

```javascript
const container = document.createElement('div');
container.className = 'd-flex gap-3';

container.appendChild(
    Skeleton({
        variant: 'circle',
        width: '40px',
        height: '40px'
    })
);

container.appendChild(
    Skeleton({
        variant: 'text',
        lines: 2,
        width: '100%'
    })
);

return container;
```

### Dark Mode Support

```javascript
function createSkeletonLoader() {
    const isDark = document.documentElement.classList.contains('dark');

    return Skeleton({
        variant: 'text',
        lines: 3,
        className: isDark ? 'skeleton-dark' : ''
    });
}
```
