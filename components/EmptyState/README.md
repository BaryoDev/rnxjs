# EmptyState

A component for displaying when there is no data to show. Provides a clear, user-friendly message with optional action button.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { EmptyState } from '@arnelirobles/rnxjs';

const empty = EmptyState({
    icon: 'bi-inbox',
    title: 'No Items',
    message: 'There are no items to display yet.'
});

document.getElementById('app').appendChild(empty);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | null | Bootstrap Icon class (e.g., 'bi-inbox') |
| `title` | string | required | Empty state title |
| `message` | string | null | Additional descriptive message |
| `actionLabel` | string | null | Action button label |
| `onAction` | Function | null | Callback when button clicked |
| `className` | string | `''` | Additional CSS classes |

## Examples

### Basic Empty State

```javascript
EmptyState({
    icon: 'bi-inbox',
    title: 'No Messages',
    message: 'Your inbox is empty'
})
```

### With Action Button

```javascript
EmptyState({
    icon: 'bi-folder-plus',
    title: 'No Projects',
    message: 'Get started by creating your first project.',
    actionLabel: 'New Project',
    onAction: () => {
        // Open create project dialog
        showProjectDialog();
    }
})
```

### Search Results Empty

```javascript
EmptyState({
    icon: 'bi-search',
    title: 'No Results Found',
    message: 'Try adjusting your search terms.',
    actionLabel: 'Clear Search',
    onAction: () => {
        searchInput.value = '';
        performSearch('');
    }
})
```

### File Upload Empty

```javascript
EmptyState({
    icon: 'bi-cloud-arrow-up',
    title: 'No Files',
    message: 'Drag and drop files here or click to browse.',
    actionLabel: 'Browse Files',
    onAction: () => {
        fileInput.click();
    }
})
```

### Data Loading Empty

```javascript
EmptyState({
    icon: 'bi-graph-up',
    title: 'No Data Available',
    message: 'Data will appear here after you complete some actions.'
})
```

### Filtered Results Empty

```javascript
function showFilteredResults(results, filters) {
    if (results.length === 0) {
        return EmptyState({
            icon: 'bi-funnel',
            title: 'No Results',
            message: 'No items match your current filters.',
            actionLabel: 'Reset Filters',
            onAction: () => {
                clearFilters();
            }
        });
    }

    return renderResults(results);
}
```

### Cart Empty

```javascript
EmptyState({
    icon: 'bi-cart',
    title: 'Your Cart is Empty',
    message: 'Start shopping by adding items to your cart.',
    actionLabel: 'Continue Shopping',
    onAction: () => {
        window.location.href = '/products';
    }
})
```

### Notifications Empty

```javascript
EmptyState({
    icon: 'bi-bell',
    title: 'All Caught Up',
    message: 'You have no new notifications.'
})
```

## Styling

The component uses Bootstrap utilities for centered layout:

```css
/* Container */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
}

/* Icon */
.empty-state-icon {
    font-size: 48px;
    opacity: 0.6;
    margin-bottom: 1rem;
    color: #6c757d;
}

/* Title */
.empty-state-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #212529;
}

/* Message */
.empty-state-message {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 1rem;
    max-width: 400px;
}

/* Action button */
.empty-state-action {
    margin-top: 1rem;
}
```

## Customization

### Custom Colors

```javascript
EmptyState({
    icon: 'bi-warning',
    title: 'Error State',
    message: 'Something went wrong',
    className: 'empty-state-error'
})
```

```css
.empty-state-error .empty-state-icon {
    color: #dc3545;
}

.empty-state-error .empty-state-title {
    color: #dc3545;
}
```

### Large Icon

```javascript
EmptyState({
    icon: 'bi-house-heart',
    title: 'Welcome Home',
    className: 'empty-state-large'
})
```

```css
.empty-state-large .empty-state-icon {
    font-size: 80px;
}
```

## Patterns

### List with Empty State

```javascript
function renderList(items) {
    if (items.length === 0) {
        return EmptyState({
            icon: 'bi-list',
            title: 'No Items',
            message: 'Start by adding your first item.'
        });
    }

    return List({ items });
}
```

### DataTable with Empty State

```javascript
DataTable({
    columns: [...],
    rows: data,
    emptyMessage: 'No records found'
    // Or use EmptyState for more customization
})
```

### Search with Empty State

```javascript
const results = searchResults();

if (results.length === 0) {
    return EmptyState({
        icon: 'bi-search',
        title: 'No Results',
        message: `No results for "${query}"`,
        actionLabel: 'Search Again',
        onAction: () => {
            // Focus search input
        }
    });
}
```

## Accessibility

- **Semantic Structure**: Uses proper heading and paragraph elements
- **Icon**: Bootstrap Icons are decorative with implicit aria-hidden
- **Text**: Clear, concise messaging
- **Action Button**: Keyboard accessible button
- **Centering**: Proper use of CSS Flexbox for visual balance

## Performance Notes

- Lightweight component
- Minimal DOM elements
- No external dependencies
- Renders efficiently

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [ErrorState](../ErrorState/) - Error display with details
- [Skeleton](../Skeleton/) - Loading placeholder
- [Card](../Card/) - Generic container
- [Button](../Button/) - For action buttons

## Tips & Tricks

### Conditional Rendering

```javascript
function renderContent(data, loading, error) {
    if (error) {
        return ErrorState({ error });
    }

    if (loading) {
        return Skeleton({ variant: 'text', lines: 3 });
    }

    if (!data || data.length === 0) {
        return EmptyState({
            title: 'No Data',
            message: 'Data will appear here.'
        });
    }

    return renderData(data);
}
```

### Contextual Messages

```javascript
function showEmptyStateForContext(context) {
    const states = {
        search: {
            icon: 'bi-search',
            title: 'No Results',
            message: 'Try a different search'
        },
        filter: {
            icon: 'bi-funnel',
            title: 'No Results',
            message: 'No items match your filters'
        },
        create: {
            icon: 'bi-plus-circle',
            title: 'Nothing Yet',
            message: 'Create your first item'
        }
    };

    const state = states[context];
    return EmptyState(state);
}
```

### With Loading Fallback

```javascript
let container = document.createElement('div');

let state = Skeleton({ variant: 'text', lines: 3 });
container.appendChild(state);

// Fetch data
fetchData()
    .then(data => {
        state.remove();

        if (data.length === 0) {
            state = EmptyState({
                title: 'No Data',
                icon: 'bi-inbox'
            });
        } else {
            state = renderDataView(data);
        }

        container.appendChild(state);
    })
    .catch(error => {
        state.remove();
        container.appendChild(
            ErrorState({ error: error.message })
        );
    });
```

### Action-Driven Empty State

```javascript
function showEmptyStateWithAction(resource) {
    return EmptyState({
        icon: 'bi-plus-lg',
        title: `No ${resource}s Yet`,
        message: `Create your first ${resource.toLowerCase()} to get started.`,
        actionLabel: `New ${resource}`,
        onAction: () => {
            showCreateDialog(resource);
        }
    });
}

// Usage
showEmptyStateWithAction('Project');
showEmptyStateWithAction('Document');
showEmptyStateWithAction('Team');
```
