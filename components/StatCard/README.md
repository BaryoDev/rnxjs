# StatCard

A statistic display card component perfect for dashboard headers. Shows a metric value with optional icon, label, and trend indicator.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { StatCard } from '@arnelirobles/rnxjs';

const card = StatCard({
    label: 'Total Users',
    value: '1,234',
    icon: 'bi-people',
    variant: 'primary'
});

document.getElementById('app').appendChild(card);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Card title/label |
| `value` | string\|number | required | Main metric value |
| `icon` | string | null | Bootstrap Icon class (e.g., 'bi-people') |
| `change` | Object | null | Trend indicator: `{ value: number, trend: 'up'\|'down' }` |
| `variant` | string | `'primary'` | Color variant: primary, success, danger, warning, info, light |
| `footer` | string | null | Optional footer text |
| `onclick` | Function | null | Callback when card clicked |
| `className` | string | `''` | Additional CSS classes |

## Examples

### Basic Card

```javascript
StatCard({
    label: 'Revenue',
    value: '$45,231',
    icon: 'bi-cash-coin',
    variant: 'success'
})
```

### With Trend

```javascript
StatCard({
    label: 'Conversion Rate',
    value: '3.2%',
    icon: 'bi-graph-up',
    change: {
        value: 0.5,
        trend: 'up'
    },
    variant: 'success'
})
```

### Negative Trend

```javascript
StatCard({
    label: 'Bounce Rate',
    value: '42%',
    icon: 'bi-exclamation-triangle',
    change: {
        value: 2.3,
        trend: 'down'
    },
    variant: 'danger'
})
```

### With Footer

```javascript
StatCard({
    label: 'Active Orders',
    value: '842',
    icon: 'bi-box-seam',
    footer: 'Last 24 hours',
    variant: 'info'
})
```

### Clickable Card

```javascript
StatCard({
    label: 'New Leads',
    value: '127',
    icon: 'bi-person-plus',
    variant: 'primary',
    onclick: () => {
        window.location.href = '/leads';
    }
})
```

### Multiple Cards Grid

```javascript
const Row = require('./Row/Row');
const Column = require('./Column/Column');

const statsRow = Row({
    children: [
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Users',
                    value: '2,541',
                    icon: 'bi-people',
                    change: { value: 12, trend: 'up' },
                    variant: 'primary'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Revenue',
                    value: '$89,245',
                    icon: 'bi-cash-coin',
                    change: { value: 8.2, trend: 'up' },
                    variant: 'success'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Visits',
                    value: '15,789',
                    icon: 'bi-graph-up',
                    change: { value: 3.5, trend: 'up' },
                    variant: 'info'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Errors',
                    value: '23',
                    icon: 'bi-exclamation-circle',
                    change: { value: 5, trend: 'down' },
                    variant: 'warning'
                })
            ]
        })
    ]
});
```

## Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `primary` | Blue | Default metrics |
| `success` | Green | Positive metrics (revenue, growth) |
| `danger` | Red | Critical metrics (errors, failures) |
| `warning` | Orange | Caution metrics (pending items) |
| `info` | Cyan | Informational metrics |
| `light` | Gray | Secondary metrics |

## Styling

The component uses Bootstrap card classes with custom stat-card styling:

```css
/* Card container */
.stat-card {
    border-radius: 8px;
    border-left: 4px solid;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Icon styling */
.stat-card-icon {
    font-size: 24px;
    opacity: 0.8;
    margin-right: 12px;
}

/* Value styling */
.stat-card-value {
    font-size: 28px;
    font-weight: 700;
    margin: 8px 0;
}

/* Trend indicator */
.stat-card-change {
    font-size: 14px;
    font-weight: 500;
}

.stat-card-change.up {
    color: #28a745;
}

.stat-card-change.down {
    color: #dc3545;
}

/* Footer text */
.stat-card-footer {
    font-size: 12px;
    color: #6c757d;
    margin-top: 8px;
}
```

## Customization

### Custom Icon Colors

```javascript
StatCard({
    label: 'Active Users',
    value: '1,245',
    icon: 'bi-person-check',
    variant: 'success',
    className: 'custom-stat'
})
```

```css
.custom-stat .stat-card-icon {
    color: #28a745;
}
```

### Large Value Display

```javascript
StatCard({
    label: 'Total Revenue',
    value: '€1,234,567',
    icon: 'bi-cash-coin',
    variant: 'success',
    className: 'stat-large'
})
```

```css
.stat-large .stat-card-value {
    font-size: 36px;
}
```

## Methods

After creating the component:

```javascript
const card = StatCard({
    label: 'Sales',
    value: '100',
    variant: 'primary'
});

// Update value
card.setValue('150');

// Update trend
card.setChange({ value: 50, trend: 'up' });
```

## Accessibility

- **Semantic Structure**: Uses proper card and heading markup
- **Color Not Only**: Trends use icons (arrows) in addition to color
- **Icons**: Bootstrap Icons are decorative (aria-hidden)
- **Text Contrast**: Meets WCAG AA standards

## Performance Notes

- Very lightweight component
- No external dependencies
- Minimal DOM manipulation
- Renders efficiently in grids

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Card](../Card/) - Generic card container
- [DataTable](../DataTable/) - For detailed metric data
- [Row & Column](../Row/) - Grid layout for dashboard

## Tips & Tricks

### Auto-Update Value

```javascript
let count = 0;
const card = StatCard({
    label: 'Page Views',
    value: count,
    icon: 'bi-graph-up'
});

setInterval(() => {
    count++;
    card.setValue(count);
}, 1000);
```

### Real-Time Data

```javascript
const userCard = StatCard({
    label: 'Online Users',
    value: '0',
    icon: 'bi-person-circle',
    variant: 'success'
});

// Update from WebSocket
socket.on('user-count', (count) => {
    userCard.setValue(count);
});
```

### Conditional Styling

```javascript
const errorCard = StatCard({
    label: 'Errors',
    value: '0',
    icon: 'bi-exclamation-circle',
    variant: 'success' // Green when 0
});

// Change variant based on value
function updateErrorCard(errorCount) {
    const variant = errorCount === 0 ? 'success' : errorCount < 10 ? 'warning' : 'danger';
    errorCard.variant = variant;
}
```

### Formatted Numbers

```javascript
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

StatCard({
    label: 'Total Sales',
    value: formatNumber(1234567),
    icon: 'bi-cash-coin',
    variant: 'success'
})
```
