# Autocomplete

A flexible autocomplete input component with search-as-you-type functionality, async data loading support, keyboard navigation, and optional multiple selection. Perfect for selecting from large lists or fetching data dynamically.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Autocomplete } from '@arnelirobles/rnxjs';

const autocomplete = Autocomplete({
    label: 'Select User',
    items: [
        { id: 1, label: 'John Doe' },
        { id: 2, label: 'Jane Smith' },
        { id: 3, label: 'Bob Johnson' }
    ],
    onselect: (item) => console.log('Selected:', item)
});

document.getElementById('app').appendChild(autocomplete);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Input label |
| `items` | Array\|Function | required | Array of items or async function: `(query) => Promise<items>` |
| `placeholder` | string | `'Search...'` | Input placeholder |
| `value` | string | `''` | Initial value |
| `multiple` | boolean | `false` | Enable multiple selection mode |
| `debounce` | number | `300` | Search debounce delay in milliseconds |
| `minChars` | number | `1` | Minimum characters to trigger search |
| `renderItem` | Function | `(item) => item.label` | Custom item renderer |
| `onchange` | Function | null | Callback on input change: `(query) => {}` |
| `onselect` | Function | null | Callback on item selection: `(item\|items) => {}` |
| `className` | string | `''` | Additional CSS classes |

## Methods

After creating the component, you can call:

```javascript
const autocomplete = Autocomplete({ /* ... */ });

// Get selected value(s)
const value = autocomplete.getValue();

// Set selected value(s)
autocomplete.setValue(item);  // single mode
autocomplete.setValue([item1, item2]);  // multiple mode

// Clear selection
autocomplete.clear();
```

## Item Definition

Items can be simple objects with a `label` property:

```javascript
{ label: 'John Doe' }
```

Or complex objects (you provide custom `renderItem`):

```javascript
{
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://...'
}
```

## Examples

### Basic List Selection

```javascript
Autocomplete({
    label: 'Select Country',
    items: [
        { label: 'United States' },
        { label: 'Canada' },
        { label: 'Mexico' },
        { label: 'Australia' }
    ],
    onselect: (item) => console.log(item.label)
})
```

### Multiple Selection

```javascript
Autocomplete({
    label: 'Select Tags',
    items: [
        { id: 1, label: 'JavaScript' },
        { id: 2, label: 'Python' },
        { id: 3, label: 'React' },
        { id: 4, label: 'Vue' }
    ],
    multiple: true,
    onselect: (items) => console.log(items)
})
```

### Async Data Loading

```javascript
Autocomplete({
    label: 'Search Users',
    items: async (query) => {
        const response = await fetch(`/api/users?q=${query}`);
        return response.json();
    },
    minChars: 2,
    debounce: 500,
    renderItem: (user) => `${user.name} (${user.email})`,
    onselect: (user) => console.log(user)
})
```

### Custom Item Rendering

```javascript
Autocomplete({
    label: 'Select Product',
    items: products,
    renderItem: (product) => `${product.name} - $${product.price}`,
    onselect: (product) => {
        console.log(`Selected: ${product.name}`);
    }
})
```

### Complex Item Objects

```javascript
Autocomplete({
    label: 'Find Person',
    items: [
        { id: 1, name: 'Alice Johnson', role: 'Manager', avatar: '👩‍💼' },
        { id: 2, name: 'Bob Smith', role: 'Developer', avatar: '👨‍💻' },
        { id: 3, name: 'Carol White', role: 'Designer', avatar: '🎨' }
    ],
    renderItem: (person) => `${person.avatar} ${person.name} - ${person.role}`,
    onselect: (person) => {
        console.log(`Selected: ${person.name}`);
    }
})
```

### API Integration

```javascript
Autocomplete({
    label: 'Search Blog Posts',
    items: async (query) => {
        try {
            const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return response.json();
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },
    minChars: 2,
    debounce: 300,
    renderItem: (post) => post.title,
    onselect: (post) => {
        window.location.href = `/posts/${post.id}`;
    }
})
```

### With Validation

```javascript
let selectedUser = null;

const autocomplete = Autocomplete({
    label: 'Assign User',
    items: users,
    renderItem: (user) => user.name,
    onselect: (user) => {
        selectedUser = user;
        validateSelection();
    }
});

function validateSelection() {
    if (!selectedUser) {
        console.error('No user selected');
    }
}
```

## Keyboard Navigation

When the dropdown is open:

- **Arrow Down** - Move to next item
- **Arrow Up** - Move to previous item
- **Enter** - Select highlighted item
- **Escape** - Close dropdown

## Styling

The component uses Bootstrap classes. Customize with CSS:

```css
/* Input styling */
.autocomplete-input {
    border-radius: 4px;
}

.autocomplete-input:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Dropdown styling */
.autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 4px;
}

/* Item styling */
.autocomplete-item {
    cursor: pointer;
    padding: 8px 12px;
}

.autocomplete-item:hover,
.autocomplete-item.active {
    background-color: #e7f3ff;
}

.autocomplete-item.selected {
    background-color: #f0f0f0;
}

/* Tags in multiple mode */
.autocomplete-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* Loading indicator */
.autocomplete-loading {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
}

/* Empty state */
.autocomplete-empty {
    background-color: #f8f9fa;
}
```

## Accessibility

- **Semantic Input**: Uses proper `<input>` element with label
- **Keyboard Navigation**: Full keyboard support (arrows, Enter, Escape)
- **ARIA Attributes**: Loading spinner has `role="status"` and `aria-hidden`
- **Visible Focus**: Focus states clearly indicated
- **Screen Reader Support**: Labels and feedback messages

## Performance Notes

- **Debouncing**: Default 300ms debounce prevents excessive API calls
- **Async Loading**: Shows spinner while loading, allows cancellation
- **Lazy Filtering**: Only searches when `minChars` threshold met
- **Memory**: Selected items stored efficiently in state

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Input](../Input/) - Basic text input
- [Select](../Select/) - Standard dropdown selection
- [DatePicker](../DatePicker/) - Date selection with calendar
- [DataTable](../DataTable/) - Table with filtering and search

## Tips & Tricks

### Debounce for API Efficiency

```javascript
// High debounce for expensive API calls
Autocomplete({
    label: 'Search Database',
    items: async (query) => { /* API call */ },
    debounce: 500,  // Wait 500ms after typing stops
    minChars: 3      // Require 3+ chars
})
```

### Dynamic Item Loading

```javascript
let countries = [];

const autocomplete = Autocomplete({
    label: 'Select Country',
    items: async (query) => {
        if (!countries.length) {
            countries = await fetch('/api/countries').then(r => r.json());
        }
        return countries.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }
});
```

### Integration with Form Validation

```javascript
const form = document.querySelector('form');
const autocomplete = Autocomplete({
    label: 'Required: Select User',
    items: users,
    onselect: (user) => {
        // Clear error on selection
        form.classList.remove('invalid');
    }
});

form.addEventListener('submit', (e) => {
    const selected = autocomplete.getValue();
    if (!selected) {
        form.classList.add('invalid');
        e.preventDefault();
    }
});
```

### Search Highlighting

```javascript
Autocomplete({
    label: 'Search',
    items: [
        { label: 'JavaScript' },
        { label: 'TypeScript' },
        { label: 'Java' }
    ],
    renderItem: (item, query) => {
        if (query) {
            return item.label.replace(new RegExp(query, 'gi'), match => `<strong>${match}</strong>`);
        }
        return item.label;
    }
})
```
