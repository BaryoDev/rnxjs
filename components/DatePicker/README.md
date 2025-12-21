# DatePicker

A flexible date picker component with calendar widget for desktop and native HTML5 fallback for mobile. Supports date constraints, disabled dates, and customizable formatting.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { DatePicker } from '@arnelirobles/rnxjs';

const datePicker = DatePicker({
    label: 'Birth Date',
    value: '2024-01-15',
    onchange: (date) => console.log('Selected:', date)
});

document.getElementById('app').appendChild(datePicker);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Input label |
| `value` | string | `''` | Initial date value (YYYY-MM-DD format) |
| `format` | string | `'YYYY-MM-DD'` | Date format for display (not yet customizable in v0.4) |
| `min` | string | null | Minimum date (YYYY-MM-DD) - dates before are disabled |
| `max` | string | null | Maximum date (YYYY-MM-DD) - dates after are disabled |
| `disabledDates` | Array | `[]` | Array of disabled dates (YYYY-MM-DD format) |
| `onchange` | Function | null | Callback on date selection: `(date) => {}` |
| `className` | string | `''` | Additional CSS classes |

## Methods

After creating the component, you can call:

```javascript
const picker = DatePicker({ /* ... */ });

// Get selected date
const date = picker.getValue();

// Set selected date
picker.setValue('2024-12-25');
```

## Examples

### Basic Date Selection

```javascript
DatePicker({
    label: 'Event Date',
    onchange: (date) => {
        console.log(`Event scheduled for ${date}`);
    }
})
```

### With Date Constraints

```javascript
DatePicker({
    label: 'Appointment Date',
    min: '2024-01-01',
    max: '2024-12-31',
    disabledDates: ['2024-01-01', '2024-12-25'], // Holidays
    onchange: (date) => console.log(date)
})
```

### Mobile Fallback

```javascript
// Desktop: Shows custom calendar widget
// Mobile (iPhone, iPad, Android): Uses native date input
DatePicker({
    label: 'Birth Date',
    value: '1990-05-15',
    min: '1900-01-01',
    max: '2024-01-01'
})
```

### With Initial Value

```javascript
DatePicker({
    label: 'Start Date',
    value: '2024-06-15',
    min: '2024-01-01',
    onchange: (date) => updateForm({ startDate: date })
})
```

### Range Selection (Using Two Pickers)

```javascript
const startPicker = DatePicker({
    label: 'Start Date',
    onchange: (date) => {
        // Update end picker min constraint
        endPicker.min = date;
    }
});

const endPicker = DatePicker({
    label: 'End Date',
    min: startPicker.getValue(),
    onchange: (date) => {
        // Update start picker max constraint
        startPicker.max = date;
    }
});
```

### Disable Weekends

```javascript
function getDisabledWeekends(month, year) {
    const disabled = [];
    const date = new Date(year, month - 1, 1);

    while (date.getMonth() === month - 1) {
        if (date.getDay() === 0 || date.getDay() === 6) { // Sunday or Saturday
            disabled.push(date.toISOString().split('T')[0]);
        }
        date.setDate(date.getDate() + 1);
    }

    return disabled;
}

DatePicker({
    label: 'Weekday Only',
    disabledDates: getDisabledWeekends(1, 2024) // January 2024
})
```

## Features

### Desktop (Custom Calendar)
- Month navigation (previous/next buttons)
- Click dates to select
- Visual disabled state for constrained dates
- Selected date highlighted in blue
- Click outside to close

### Mobile (Native Input)
- Automatic detection of mobile user agents
- Uses native date picker for optimal UX
- Respects min/max constraints
- No custom calendar widget needed

### Date Constraints
- **Min Date**: Prevents selection of earlier dates
- **Max Date**: Prevents selection of later dates
- **Disabled Dates**: Specific dates that cannot be selected
- Visual feedback: Disabled dates appear grayed out

## Styling

The component uses Bootstrap form controls. Customize with CSS:

```css
/* Input styling */
.datepicker-input {
    border-radius: 4px;
}

.datepicker-input:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Calendar dropdown */
.datepicker-dropdown {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 4px;
}

/* Header styling */
.datepicker-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

/* Day buttons */
.datepicker-day {
    border-radius: 4px;
    transition: all 0.15s ease;
}

.datepicker-day:hover {
    background-color: #e7f3ff;
}

/* Selected date */
.datepicker-day.btn-primary {
    background-color: #0b57d0;
}

/* Disabled dates */
.datepicker-day:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

## Accessibility

- **Semantic Label**: Proper `<label>` element for input
- **Keyboard Navigation**:
  - Tab to focus input
  - Enter/Space to open calendar (desktop)
  - Arrow keys to navigate dates (future enhancement)
  - Escape to close calendar
- **Screen Readers**: Button labels and aria-labels
- **Mobile**: Native date picker is fully accessible

## Performance Notes

- Calendar renders only current month
- No external date library (native JavaScript Date)
- Month navigation re-renders only calendar grid
- Minimal DOM manipulation

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Automatic fallback for mobile devices

## Related Components

- [Input](../Input/) - Basic text input
- [Autocomplete](../Autocomplete/) - Search with suggestions
- [FormGroup](../FormGroup/) - Form field wrapper

## Tips & Tricks

### Current Date Default

```javascript
const today = new Date().toISOString().split('T')[0];
DatePicker({
    label: 'Today',
    value: today
})
```

### Future Dates Only

```javascript
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
DatePicker({
    label: 'Schedule',
    min: tomorrow
})
```

### Disable Past Dates

```javascript
const today = new Date().toISOString().split('T')[0];
DatePicker({
    label: 'Future Event',
    min: today
})
```

### Format Display (Custom)

```javascript
// For now, always YYYY-MM-DD
// Future versions will support custom formatting

const picker = DatePicker({
    label: 'Date',
    value: '2024-06-15'
});

// You can format externally:
const formatted = new Date(picker.getValue()).toLocaleDateString('en-US');
```

### Date Validation

```javascript
const picker = DatePicker({
    label: 'Valid Date',
    min: '2024-01-01',
    max: '2024-12-31',
    onchange: (date) => {
        const selected = new Date(date);
        const timestamp = selected.getTime();

        // Additional validation
        if (timestamp % 2 === 0) {
            console.log('Even timestamp selected!');
        }
    }
})
```

### Integration with Form

```javascript
const form = document.querySelector('form');
const picker = DatePicker({
    label: 'Event Date',
    min: new Date().toISOString().split('T')[0],
    onchange: (date) => {
        form.eventDate.value = date;
    }
});

form.appendChild(picker);
```
