# DataTable

A powerful, flexible data table component with built-in sorting, filtering, and pagination. Perfect for displaying and managing large datasets in admin panels and dashboards.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { DataTable } from '@arnelirobles/rnxjs';

const table = DataTable({
    columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role' }
    ],
    rows: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' }
    ],
    pageSize: 10
});

document.getElementById('app').appendChild(table);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array | required | Column definitions. Each column should have: `key` (string), `label` (string), `sortable` (boolean, optional), `filterable` (boolean, optional), `width` (string, optional) |
| `rows` | Array | `[]` | Array of data objects. Each object's keys must correspond to column keys |
| `pageSize` | number | `10` | Number of rows to display per page |
| `sortable` | boolean | `true` | Enable/disable column sorting |
| `filterable` | boolean | `true` | Enable/disable global search filtering |
| `selectable` | boolean | `false` | Show checkboxes for row selection |
| `loading` | boolean | `false` | Show loading spinner |
| `error` | string | `null` | Show error message (disables normal rendering) |
| `emptyMessage` | string | `'No data available'` | Message to show when no rows |
| `onSort` | Function | null | Callback when sort changes: `(column, direction) => {}` |
| `onFilter` | Function | null | Callback when filter changes: `(query) => {}` |
| `onPageChange` | Function | null | Callback when page changes: `(page) => {}` |
| `onSelectionChange` | Function | null | Callback when selection changes: `(selectedIndices) => {}` |
| `onRowClick` | Function | null | Callback when row is clicked: `(row, index) => {}` |
| `className` | string | `''` | Additional CSS classes |

## Column Definition

Each column object can have:

```javascript
{
    key: 'email',              // Required: property name in data
    label: 'Email Address',    // Required: column header text
    sortable: true,            // Optional: allow sorting (default: false)
    filterable: true,          // Optional: include in search (default: false)
    width: '200px'             // Optional: CSS width
}
```

## Methods

After creating the table, you can call methods on the returned component:

```javascript
const table = DataTable({ /* ... */ });

// Navigation
table.getCurrentPage();              // Get current page number
table.setCurrentPage(2);             // Go to page 2

// Sorting
table.getSortColumn();               // Get sorted column key
table.getSortDirection();            // Get 'asc' or 'desc'

// Filtering
table.getFilterQuery();              // Get current search query
table.setFilterQuery('John');        // Set search query

// Selection
table.getSelectedRows();             // Get array of selected row indices
table.clearSelection();              // Clear all selections

// Info
table.getTotalRows();                // Get total filtered row count
table.getTotalPages();               // Get total page count
```

## Examples

### Basic Table

```javascript
DataTable({
    columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true }
    ],
    rows: users
})
```

### With Callbacks

```javascript
DataTable({
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name', sortable: true }
    ],
    rows: users,
    onSort: (column, direction) => {
        console.log(`Sorted by ${column} (${direction})`);
        // Fetch sorted data from server
    },
    onPageChange: (page) => {
        console.log(`Moved to page ${page}`);
    },
    onRowClick: (row) => {
        console.log('Clicked row:', row);
        // Open detail view
    }
})
```

### With Selection

```javascript
DataTable({
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
    ],
    rows: users,
    selectable: true,
    onSelectionChange: (selectedIndices) => {
        console.log('Selected rows:', selectedIndices);
        // Enable bulk delete/export buttons
    }
})
```

### With Loading State

```javascript
let table = DataTable({
    columns: [...],
    rows: [],
    loading: true
});

// Later, when data loads:
table.setPageSize(10);
// Re-render with actual data
```

### With Error Handling

```javascript
let table = DataTable({
    columns: [...],
    rows: [],
    error: 'Failed to load data. Please try again.'
});
```

### Filterable Columns

```javascript
DataTable({
    columns: [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'role', label: 'Role', filterable: true },
        { key: 'joinDate', label: 'Join Date', sortable: true }
    ],
    rows: users,
    // User can search by name or role
})
```

### Custom Widths

```javascript
DataTable({
    columns: [
        { key: 'id', label: 'ID', width: '60px' },
        { key: 'name', label: 'Name', width: '200px' },
        { key: 'email', label: 'Email', width: '300px' },
        { key: 'status', label: 'Status', width: '100px' }
    ],
    rows: users
})
```

## Events & Interactivity

### User Interactions

- **Sort**: Click column header to sort ascending, click again for descending
- **Filter**: Type in search box to filter all columns with `filterable: true`
- **Paginate**: Click prev/next buttons to change page
- **Select**: Check checkboxes to select rows (if `selectable: true`)
- **Row Click**: Click on row to trigger `onRowClick` callback

### Responsive Behavior

- Table automatically adds `table-responsive` wrapper for small screens
- Pagination and filters stack on mobile
- Search input uses full width on mobile

## Styling

The component uses Bootstrap table classes and can be styled with CSS:

```css
/* Style entire table */
.datatable {
    font-size: 14px;
}

/* Style specific rows */
.datatable-row.table-active {
    background-color: #e7f3ff;
}

/* Style headers */
.datatable-header.sortable {
    cursor: pointer;
}

.datatable-header.sortable:hover {
    background-color: #f8f9fa;
}

/* Style sorting indicators */
.datatable-header.sorted-asc i,
.datatable-header.sorted-desc i {
    opacity: 1;
}
```

## Accessibility

- **Semantic HTML**: Uses proper `<table>` markup with `<thead>` and `<tbody>`
- **Keyboard Navigation**:
  - Tab through interactive elements
  - Enter/Space to activate buttons and checkboxes
  - Sort headers are keyboard accessible
- **Screen Readers**:
  - Column headers use proper `<th>` elements
  - Pagination buttons labeled clearly
  - Loading/error states are announced
- **ARIA Attributes**:
  - Pagination uses `<nav aria-label="Table pagination">`
  - Checkboxes are properly labeled

## Performance Notes

- **Large Datasets**: The component efficiently handles pagination, so only the current page is rendered
- **Sorting**: In-memory sort (suitable for <10,000 rows). For larger datasets, sort on the server and fetch new data
- **Filtering**: Global search filters all visible columns in-memory. For better UX with large datasets, implement server-side filtering
- **Virtual Scrolling**: For very large paginated datasets (>1000 rows per page), consider using `VirtualList` instead

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Pagination](../Pagination/) - Standalone pagination control
- [Spinner](../Spinner/) - Loading indicator
- [EmptyState](../EmptyState/) - No data display
- [ErrorState](../ErrorState/) - Error display
- [VirtualList](../VirtualList/) - For very large lists

## Tips & Tricks

### Dynamic Data Updates

```javascript
let table = DataTable({
    columns: [...],
    rows: initialData
});

// Later, update data:
table.rows = newData;
table.setCurrentPage(1);  // Reset to first page
```

### Server-Side Sorting

```javascript
DataTable({
    columns: [...],
    rows: currentPageData,
    onSort: async (column, direction) => {
        const data = await fetchSortedData(column, direction);
        // Update table data (requires component refresh)
    }
})
```

### Bulk Actions

```javascript
let table = DataTable({
    columns: [...],
    rows: users,
    selectable: true,
    onSelectionChange: (selectedIndices) => {
        // Show delete button only if rows selected
        deleteBtn.style.display = selectedIndices.length > 0 ? 'block' : 'none';

        deleteBtn.onclick = () => {
            const selectedRows = selectedIndices.map(idx => users[idx]);
            deleteRows(selectedRows);
        };
    }
});
```

### Export to CSV

```javascript
function exportTableToCSV(table, filename = 'export.csv') {
    const rows = table.getTotalRows();
    const csv = [];

    // Add headers
    csv.push(table.columns.map(col => col.label).join(','));

    // Add all data rows (not just current page)
    table.rows.forEach(row => {
        csv.push(
            table.columns
                .map(col => `"${row[col.key]}"`)
                .join(',')
        );
    });

    // Download
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```
