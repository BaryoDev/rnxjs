# ProgressBar

A flexible progress bar component with determinate and indeterminate states.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { ProgressBar } from '@arnelirobles/rnxjs';

const progress = ProgressBar({
    value: 65,
    variant: 'success',
    label: 'Upload Progress',
    showValue: true
});

document.getElementById('app').appendChild(progress);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `0` | Progress percentage (0-100) |
| `variant` | string | `'primary'` | Color: primary, success, danger, warning, info |
| `striped` | boolean | `false` | Show striped pattern |
| `animated` | boolean | `true` | Animate striped pattern |
| `indeterminate` | boolean | `false` | Show indeterminate progress |
| `label` | string | `''` | Label text |
| `showValue` | boolean | `true` | Display percentage value |
| `height` | string | `'1.5rem'` | CSS height |
| `className` | string | `''` | Additional CSS classes |

## Methods

```javascript
const progress = ProgressBar({ value: 0 });

// Update progress
progress.setValue(50);

// Get current value
const current = progress.getValue();
```

## Examples

### File Upload Progress

```javascript
const progress = ProgressBar({
    value: 0,
    label: 'Uploading...',
    variant: 'primary'
});

container.appendChild(progress);

// Simulate upload
let current = 0;
const interval = setInterval(() => {
    current += Math.random() * 30;
    if (current >= 100) {
        current = 100;
        clearInterval(interval);
    }
    progress.setValue(current);
}, 500);
```

### Loading State

```javascript
ProgressBar({
    indeterminate: true,
    label: 'Loading data...',
    striped: true,
    animated: true
})
```

### Multi-step Progress

```javascript
const progress = ProgressBar({
    value: 33,
    label: 'Step 1 of 3: Uploading',
    variant: 'info'
});

// After step 1
progress.setValue(66);
progress.setLabel('Step 2 of 3: Processing');

// After step 2
progress.setValue(100);
progress.setLabel('Complete!');
progress.setVariant('success');
```

## Variants

- `primary` - Blue (default)
- `success` - Green (completion, positive)
- `danger` - Red (errors, failures)
- `warning` - Orange (caution, attention)
- `info` - Cyan (information)

## Styling

```css
.progress {
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar {
    transition: width 0.3s ease;
}

.progress-bar-striped {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
}

.progress-bar-animated {
    animation: progress-bar-stripes 1s linear infinite;
}
```

## Accessibility

- ARIA `progressbar` role
- Aria-valuenow, aria-valuemin, aria-valuemax
- Semantic HTML
- Screen reader support

## Browser Support

- Modern browsers
- IE 11 with polyfills
- Mobile browsers

## Related Components

- [Spinner](../Spinner/) - Loading indicator
- [Skeleton](../Skeleton/) - Content loader
- [FileUpload](../FileUpload/) - File upload with progress
