# rnxJS Component Library

> Complete reference for all 46 production-ready components.

**Quick Navigation:** [Form Components](#form-components) | [Layout](#layout) | [UI Components](#ui-components) | [Data Display](#data-display) | [Feedback](#feedback) | [Navigation](#navigation) | [Advanced](#advanced)

---

## Form Components

### Input Components

#### **Input** ⭐ Stable
Two-way data binding text input with validation support.

```html
<Input
  label="Email"
  type="email"
  data-bind="email"
  data-rule="required|email"
  placeholder="user@example.com"
/>
```

**Key Features:**
- Two-way binding via `data-bind`
- Built-in validation rules
- Floating labels
- Password, email, number types
- Error message display

**Props:**
- `label` - Input label text
- `type` - Input type (text, email, password, number, etc.)
- `data-bind` - Reactive state path
- `data-rule` - Validation rules (required, email, numeric, min:5, max:10, pattern:regex)
- `placeholder` - Placeholder text
- `readonly` - Make input read-only
- `disabled` - Disable input

**See:** [API.md - Input](./API.md#input)

---

#### **Textarea** ⭐ Stable
Multi-line text input with character counting and validation.

```html
<Textarea
  label="Comments"
  data-bind="comments"
  rows="5"
/>
```

**Key Features:**
- Two-way binding
- Validation support
- Customizable rows/cols
- Auto-expanding variant

---

#### **Select** ⭐ Stable
Dropdown select with two-way binding.

```html
<Select data-bind="country" label="Country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</Select>
```

**Key Features:**
- Two-way binding
- Support for optgroups
- Keyboard navigation
- Accessibility support

---

#### **Checkbox** ⭐ Stable
Boolean input with label.

```html
<Checkbox
  data-bind="agreeToTerms"
  label="I agree to terms and conditions"
/>
```

**Key Features:**
- Two-way binding to boolean
- Label text support
- Indeterminate state support
- Accessible labels

---

#### **Radio** ⭐ Stable
Radio button group for single-choice selection.

```html
<FormGroup label="Shipping Method">
  <Radio name="shipping" value="standard" data-bind="shippingMethod" label="Standard" />
  <Radio name="shipping" value="express" data-bind="shippingMethod" label="Express" />
</FormGroup>
```

**Key Features:**
- Two-way binding
- Named groups
- Accessibility labels
- Custom styling

---

#### **Switch** ⭐ Stable
Toggle switch component (Material Design 3).

```html
<Switch
  data-bind="darkMode"
  label="Dark Mode"
/>
```

**Key Features:**
- Two-way binding to boolean
- Material Design 3 styling
- Color variants
- Accessible

---

#### **Slider** ⭐ Stable
Range slider input.

```html
<Slider
  data-bind="volume"
  min="0"
  max="100"
  label="Volume"
/>
```

**Key Features:**
- Two-way binding
- Min/max values
- Step support
- Range slider support

---

#### **FileUpload** 🔧 Advanced
Drag & drop file upload with validation, file list preview, and async upload. File names containing path-traversal characters (`..`, `/`, `\`) are rejected during validation.

```javascript
const upload = FileUpload({
  label: 'Upload Images',
  accept: ['.jpg', '.png', '.gif'],
  maxSize: 5242880, // 5MB
  maxFiles: 5,
  multiple: true,
  onchange: (files) => console.log('Files:', files)
});
document.getElementById('app').appendChild(upload);

// Upload to server (POSTs FormData under the "files" key)
await upload.upload('/api/upload');
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `'Upload Files'` | Input label |
| `accept` | Array | `[]` | Accepted file extensions (`'.jpg'`) or MIME types |
| `maxSize` | number | `null` | Maximum file size in bytes |
| `maxFiles` | number | `null` | Maximum number of files |
| `multiple` | boolean | `false` | Allow multiple file selection |
| `preview` | boolean | `true` | Show selected file list |
| `allowEmpty` | boolean | `true` | Set `false` to reject zero-byte files |
| `onchange` | Function | `null` | `(files) => {}` on selection change |
| `onupload` | Function | `null` | `(files) => {}` after successful upload |
| `className` | string | `''` | Additional CSS classes |

**Methods:**
- `addFiles(files)` - Validate and add files programmatically; returns `{ added, errors }`
- `getFiles()` - Get currently selected files
- `clearFiles()` - Remove all selected files
- `upload(url)` - Async POST of selected files; resolves with parsed JSON response, rejects on HTTP error or empty selection

---

#### **Autocomplete** 🔧 Advanced
Search-as-you-type input with dropdown suggestions, async data loading, debouncing, keyboard navigation (Arrow keys / Enter / Escape), WAI-ARIA combobox semantics, and optional multiple selection with removable tags.

```javascript
const autocomplete = Autocomplete({
  label: 'Search Users',
  items: async (query) => {
    const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    return response.json();
  },
  minChars: 2,
  debounce: 500,
  renderItem: (user) => `${user.name} (${user.email})`,
  onselect: (user) => console.log('Selected:', user)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Input label (associated via for/id) |
| `items` | Array\|Function | `[]` | Item array or async function `(query) => Promise<items>` |
| `placeholder` | string | `'Search...'` | Input placeholder |
| `value` | string | `''` | Initial input value |
| `multiple` | boolean | `false` | Enable multiple selection with tags |
| `debounce` | number | `300` | Search debounce delay (ms) |
| `minChars` | number | `1` | Minimum characters before searching |
| `renderItem` | Function | `(item) => item.label` | Custom item renderer (output is escaped) |
| `onchange` | Function | `null` | `(query) => {}` on input change |
| `onselect` | Function | `null` | `(item)` or `(items)` on selection |
| `id` | string | auto | Input `id` attribute |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `getValue()` (selected item or array), `setValue(itemOrArray)`, `clear()`.

---

#### **DatePicker** 🔧 Advanced
Calendar-based date input with month navigation, min/max constraints, and disabled dates. On mobile user agents (iPhone/iPad/Android) it automatically returns a native HTML5 `<input type="date">` instead of the custom calendar. Dates use `YYYY-MM-DD` format (custom display formats are not yet supported). Escape or an outside click closes the calendar.

```javascript
const picker = DatePicker({
  label: 'Appointment Date',
  value: '2026-07-14',
  min: '2026-01-01',
  max: '2026-12-31',
  disabledDates: ['2026-12-25'], // holidays
  onchange: (date) => console.log('Selected:', date)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Input label (associated via for/id) |
| `value` | string | `''` | Initial date (`YYYY-MM-DD`) |
| `min` | string | `null` | Minimum selectable date |
| `max` | string | `null` | Maximum selectable date |
| `disabledDates` | Array | `[]` | Specific dates to disable (`YYYY-MM-DD`) |
| `onchange` | Function | `null` | `(date) => {}` on selection |
| `id` | string | auto | Input `id` attribute |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `getValue()`, `setValue('2026-12-25')`.

---

#### **Search** ⭐ Stable
Search input with icon and clear button.

```html
<Search
  data-bind="searchQuery"
  placeholder="Search..."
/>
```

---

### Form Layout

#### **FormGroup** ⭐ Stable
Wrapper for form inputs with label and error display.

```html
<FormGroup label="Email Address">
  <Input
    type="email"
    data-bind="email"
    data-rule="required|email"
  />
  <small class="text-danger" data-bind="errors.email"></small>
</FormGroup>
```

**Key Features:**
- Label association
- Error message display
- Validation state styling
- Help text support

---

## Layout Components

### Structure

#### **Container** ⭐ Stable
Responsive container with max-width and padding.

```html
<Container class="py-5">
  <!-- Page content -->
</Container>
```

**Variants:** Default, fluid

---

#### **Row** ⭐ Stable
Horizontal row with column system support.

```html
<Row>
  <Column size="6">Left</Column>
  <Column size="6">Right</Column>
</Row>
```

---

#### **Column** ⭐ Stable
Flexible column with responsive sizing.

```html
<Column size="6" md="4" lg="3">
  Content
</Column>
```

**Props:**
- `size` - Column width (1-12)
- `md`, `lg`, `xl` - Responsive breakpoints
- `offset` - Column offset

---

### Advanced Layout

#### **Sidebar** 🔧 Advanced
Collapsible sidebar navigation with nested submenus, active-item tracking, ARIA labels, and smooth width transitions. When collapsed, item text and arrows hide, leaving icons only.

```javascript
const sidebar = Sidebar({
  items: [
    { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '📊' },
    {
      id: 'settings', label: 'Settings', icon: '⚙️',
      children: [
        { id: 'profile', label: 'Profile', href: '#/settings/profile' },
        { id: 'security', label: 'Security', href: '#/settings/security' }
      ]
    }
  ],
  defaultOpen: true,
  activeItem: 'dashboard',
  onItemClick: (item) => console.log(item.id, item.label)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | `[]` | `{id, label, href, icon, active, children}` (children nest one level) |
| `defaultOpen` | boolean | `true` | Initially expanded |
| `variant` | string | `'default'` | Style variant |
| `width` | string | `'250px'` | Expanded width |
| `collapsedWidth` | string | `'60px'` | Collapsed width |
| `darkMode` | boolean | `false` | Apply dark styling |
| `onItemClick` | Function | `null` | Receives `{ id, label }` of clicked leaf item |
| `activeItem` | string | `null` | ID of initially active item |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `toggle()`, `isOpen()`, `setActiveItem(id)`.

---

#### **Grid System** ⭐ Stable
Use Bootstrap's grid system with Row/Column components.

---

## UI Components

### Content Display

#### **Card** ⭐ Stable
Container for grouped content with optional header/footer.

```html
<Card>
  <h5>Card Title</h5>
  <p>Card content goes here.</p>
</Card>
```

**Variants:** Default, outline, filled, elevated

---

#### **Badge** ⭐ Stable
Small label for highlighting and categorization.

```html
<Badge variant="primary">New</Badge>
<Badge variant="success">Verified</Badge>
```

**Variants:** primary, secondary, success, danger, warning, info, light, dark

---

#### **Alert** ⭐ Stable
Contextual message container for warnings, errors, etc.

```html
<Alert variant="success">
  Operation completed successfully!
</Alert>
```

**Variants:** success, info, warning, danger

---

#### **StatCard** 🔧 Advanced
Dashboard statistic card showing a metric value with optional icon, trend indicator, footer, and click handler. Trends render an arrow icon plus percentage, colored by direction (color is not the only signal, for accessibility).

```javascript
const card = StatCard({
  label: 'Total Users',
  value: 2543,
  icon: 'people',                       // Bootstrap icon NAME (no 'bi-' prefix)
  change: { value: 12.5, trend: 'up' }, // trend: 'up' | 'down' | 'neutral'
  variant: 'primary',
  footer: 'Last 24 hours',
  onclick: () => (window.location.href = '/users')
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Label above the value |
| `value` | string\|number | `'—'` | Main metric value |
| `icon` | string | `''` | Bootstrap icon name, e.g. `'people'`, `'cash-coin'` |
| `change` | Object | `null` | `{ value: number, trend: 'up'\|'down'\|'neutral' }` |
| `variant` | string | `'primary'` | primary, success, danger, warning, info, light |
| `footer` | string | `''` | Footer text below a divider |
| `onclick` | Function | `null` | Makes the card clickable (keyboard accessible) |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `setValue(newValue)`, `setChange({ value, trend })`.

---

#### **EmptyState** 🔧 Advanced
Centered placeholder for empty lists or no-result screens, with icon, title, message, and optional action button. Useful for empty inboxes, cleared filters, "create your first item" prompts, etc.

```javascript
const empty = EmptyState({
  icon: 'folder-plus', // Bootstrap icon NAME (no 'bi-' prefix)
  title: 'No Projects',
  message: 'Get started by creating your first project.',
  actionLabel: 'New Project',
  onAction: () => showProjectDialog()
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | `'inbox'` | Bootstrap icon name |
| `title` | string | `'Nothing here yet'` | Title text |
| `message` | string | `''` | Descriptive message |
| `actionLabel` | string | `''` | Action button label (button hidden when empty) |
| `onAction` | Function | `null` | Action button click handler |
| `className` | string | `''` | Additional CSS classes |

---

#### **Skeleton** 🔧 Advanced
Loading placeholder with shimmer animation (pure CSS, GPU-accelerated). Announces "Loading…" to screen readers via `role="status"` / `aria-busy`. Swap it for real content when data arrives (`skeleton.remove()`).

```javascript
Skeleton({ variant: 'text', lines: 3 });                          // paragraph
Skeleton({ variant: 'circle', width: '48px', height: '48px' });   // avatar
Skeleton({ variant: 'card' });                                    // image + text card
Skeleton({ variant: 'table', rows: 10, cols: 5 });                // table grid
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'text'` | text, circle, rectangle, card, table |
| `lines` | number | `3` | Line count (text variant; last line renders at 60% width) |
| `rows` | number | `5` | Row count (table variant) |
| `cols` | number | `4` | Column count (table variant) |
| `width` | string | `'100%'` | CSS width |
| `height` | string | `'20px'` | CSS height |
| `animation` | string | `'wave'` | wave, pulse, none |
| `className` | string | `''` | Additional CSS classes |

---

### Interactive Components

#### **Button** ⭐ Stable
Interactive button with multiple variants.

```html
<Button
  label="Click Me"
  variant="primary"
  icon="check"
  onclick="handleClick()"
/>
```

**Variants:** primary, secondary, success, danger, warning, info, light, dark

**Material Design 3 Variants:** filled, tonal, elevated, text

**Props:**
- `label` - Button text
- `variant` - Color variant
- `icon` - Icon name (Bootstrap Icons)
- `onclick` - Click handler
- `disabled` - Disable button
- `size` - Size (sm, md, lg)

---

#### **FAB** ⭐ Stable
Floating Action Button (Material Design 3).

```html
<FAB
  icon="plus"
  variant="primary"
  onclick="addItem()"
/>
```

**Props:**
- `icon` - Icon name
- `variant` - Color variant
- `size` - Size (small, large)
- `extended` - Text label variant

---

#### **SegmentedButton** ⭐ Stable
Grouped button set for single selection.

```html
<SegmentedButton name="view">
  <Button value="list" label="List" />
  <Button value="grid" label="Grid" />
</SegmentedButton>
```

---

#### **Dropdown** 🔧 Advanced
Accessible dropdown menu (WAI-ARIA menu pattern) with keyboard navigation (Enter/Space toggles, Arrow keys move focus, Escape closes), dividers, icons, badges, and per-item disabled/active states. Closes on outside click.

```javascript
const dropdown = Dropdown({
  label: 'Actions',
  items: [
    { id: 'edit', label: 'Edit', icon: '✏️' },
    { id: 'share', label: 'Share', icon: '📤', badge: '3' },
    { divider: true },
    { id: 'delete', label: 'Delete', icon: '🗑️', disabled: false }
  ],
  onSelect: (item) => console.log(item.id, item.label, item.index)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `'Menu'` | Trigger button label |
| `items` | Array | `[]` | `{id, label, icon, href, badge, active, disabled}` or `{divider: true}` |
| `position` | string | `'bottom-left'` | bottom-left, bottom-right, top-left, top-right |
| `onSelect` | Function | `null` | Receives `{ id, label, index }` of the selected item |
| `icon` | string | `null` | Icon before the trigger label |
| `variant` | string | `'default'` | default, outline, minimal, danger |
| `disabled` | boolean | `false` | Disable the dropdown |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `open()`, `close()`, `toggle()`, `isOpen()`.

---

#### **Tooltip** 🔧 Advanced
Contextual information on hover or focus. Two modes:

1. **Imperative** (pass `element`): attaches to an existing element and returns a tooltip API object — not a DOM node.
2. **Declarative** (no `element`): wraps `children` in a Bootstrap tooltip trigger span using `title` and `placement`.

```javascript
// Imperative mode: returns { el, show, hide, setContent, destroy }
const tooltip = Tooltip({
  element: document.getElementById('save-btn'), // must be an HTMLElement
  content: 'Save changes',
  position: 'bottom',
  delay: 300
});
tooltip.setContent('Saved!');
tooltip.destroy(); // removes listeners and the tooltip element
```

**Props (imperative mode):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `element` | HTMLElement | `null` | Target element (enables imperative mode) |
| `content` | string | `''` | Tooltip text (rendered as plain text) |
| `position` | string | `'top'` | top, bottom, left, right |
| `delay` | number | `0` | Show delay in ms (hover/focus) |
| `arrow` | boolean | `true` | Show arrow pointer |
| `className` | string | `''` | Additional CSS classes |

**Props (declarative mode):** `title`, `placement` (default `'top'`), `children`, `className`.

**Methods (imperative):** `show()`, `hide()`, `setContent(text)`, `destroy()`; the tooltip DOM node is exposed as `.el`. Shows on `mouseenter`/`focus`, hides on `mouseleave`/`blur`.

---

## Data Display

### Tables & Lists

#### **DataTable** 🔧 Advanced
Data table with in-memory sorting, global search filtering, pagination, optional row selection, and loading/error/empty states. Only the current page is rendered. In-memory sort suits <10,000 rows; use the `onSort`/`onFilter` callbacks for server-side data, or `VirtualList` for very large flat lists.

```javascript
const table = DataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, width: '300px' },
    { key: 'role', label: 'Role' }
  ],
  rows: users,
  pageSize: 10,
  selectable: true,
  onSort: (column, direction) => console.log(column, direction),
  onSelectionChange: (selectedIndices) => console.log(selectedIndices),
  onRowClick: (row, index) => openDetail(row)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array | `[]` | `{key, label, sortable, filterable, width}` (required when `rows` is non-empty) |
| `rows` | Array | `[]` | Data objects keyed by column `key` |
| `pageSize` | number | `10` | Rows per page |
| `sortable` | boolean | `true` | Enable column sorting (click header to toggle asc/desc) |
| `filterable` | boolean | `true` | Enable global search box |
| `selectable` | boolean | `false` | Show row-selection checkboxes |
| `loading` | boolean | `false` | Show loading spinner |
| `error` | string | `null` | Show error message instead of data |
| `emptyMessage` | string | `'No data available'` | Message when no rows |
| `ariaLabel` | string | `'Data table'` | Accessible label for the table region |
| `onSort` / `onFilter` / `onPageChange` / `onSelectionChange` / `onRowClick` | Function | `null` | `(column, direction)` / `(query)` / `(page)` / `(selectedIndices)` / `(row, index)` |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `getCurrentPage()`, `setCurrentPage(page)`, `getSortColumn()`, `getSortDirection()`, `getFilterQuery()`, `setFilterQuery(query)`, `getSelectedRows()` (indices), `clearSelection()`, `getTotalRows()`, `getTotalPages()`.

---

#### **List** ⭐ Stable
Vertical list with items.

```html
<List>
  <div class="list-item">Item 1</div>
  <div class="list-item">Item 2</div>
</List>
```

**Variants:** ordered, unordered, single-line, two-line

---

#### **VirtualList** 🔧 Advanced
High-performance list for large datasets (1000+). Uses virtual scrolling: only visible items plus a buffer are rendered. Requires either `renderItem` or `renderItemSafe`.

**Security:** `renderItem` returns raw HTML — you MUST escape user content yourself with `escapeHtml()` from `utils/security`. Prefer `renderItemSafe` (returns `{ title, subtitle, content }`, auto-escaped) when you only need text.

```javascript
import { escapeHtml } from '@arnelirobles/rnxjs/utils/security';

const list = VirtualList({
  items: state.items,
  itemHeight: 48,
  visibleCount: 20,
  renderItem: (item, index) => `
    <div class="item">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </div>`
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | `[]` | Items to render |
| `itemHeight` | number | `40` | Fixed height per item (px) |
| `visibleCount` | number | `20` | Visible items (sets container height unless `height` given) |
| `bufferSize` | number | `5` | Extra items rendered above/below the viewport |
| `renderItem` | Function | — | `(item, index) => htmlString` (escape user content!) |
| `renderItemSafe` | Function | — | `(item) => ({ title, subtitle, content })`, auto-escaped |
| `height` | string | auto | Container height (CSS value) |
| `onScroll` | Function | `null` | Scroll event callback |
| `state` | Object | `null` | Reactive state object for auto-updates |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `scrollToIndex(i)`, `scrollToTop()`, `scrollToBottom()`, `getVisibleRange()`, `refresh()`.

---

### Navigation Lists

#### **Breadcrumb** 🔧 Advanced
Navigation trail showing the user's location in a page hierarchy. Renders semantic `<nav aria-label="breadcrumb">` with an ordered list; the active (current) item is plain text with `aria-current="page"`, all others are links. Throws if `items` is empty.

```javascript
const breadcrumb = Breadcrumb({
  items: [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', active: true }
  ],
  separator: '→' // optional, default '/'
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | required (non-empty) | `{label, href, active}`; `href` ignored when `active: true` |
| `separator` | string | `'/'` | Separator between items (e.g. `'>'`, `'→'`) |
| `className` | string | `''` | Additional CSS classes |

---

#### **Pagination** ⭐ Stable
Page navigation control.

```html
<Pagination
  current="1"
  total="10"
  onchange="goToPage()"
/>
```

---

## Navigation Components

### Top Navigation

#### **TopAppBar** ⭐ Stable
Header bar with title, actions, and navigation (Material Design 3).

```html
<TopAppBar title="My App">
  <Button icon="menu" />
  <Button icon="settings" />
</TopAppBar>
```

**Variants:** small, medium, large

---

#### **NavigationBar** ⭐ Stable
Bottom navigation bar (Material Design 3).

```html
<NavigationBar>
  <Button icon="home" label="Home" />
  <Button icon="search" label="Search" />
  <Button icon="settings" label="Settings" />
</NavigationBar>
```

---

### Drawer Navigation

#### **NavigationDrawer** ⭐ Stable
Side drawer for navigation (Material Design 3).

```html
<NavigationDrawer>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</NavigationDrawer>
```

**Variants:** permanent, dismissible, modal

---

#### **Sidebar** 🔧 Advanced
Custom sidebar with collapsible sections. Documented above under [Layout Components → Advanced Layout](#advanced-layout).

---

## Feedback & Status

### Indicators

#### **Spinner** ⭐ Stable
Loading indicator.

```html
<Spinner />
<Spinner size="lg" color="primary" />
```

**Props:**
- `size` - sm, md, lg
- `color` - Color variant

---

#### **ProgressBar** 🔧 Advanced
Progress bar with determinate and indeterminate modes, optional label and percentage display, and striped/animated styles. Value is clamped to 0-100. Uses ARIA `progressbar` role with `aria-valuenow`/`min`/`max`.

```javascript
const progress = ProgressBar({
  value: 0,
  label: 'Uploading...',
  variant: 'primary'
});
container.appendChild(progress);
progress.setValue(65); // update as the upload proceeds

// Indeterminate loading state
ProgressBar({ indeterminate: true, label: 'Loading data...' });
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `0` | Progress percentage (0-100) |
| `variant` | string | `'primary'` | primary, success, danger, warning, info |
| `striped` | boolean | `false` | Striped pattern |
| `animated` | boolean | `true` | Animate the striped pattern (with `striped`) |
| `indeterminate` | boolean | `false` | Indeterminate (unknown duration) mode |
| `label` | string | `''` | Label text above the bar |
| `showValue` | boolean | `true` | Display percentage value |
| `height` | string | `'1.5rem'` | CSS height |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `setValue(newValue)`, `getValue()`.

---

#### **Stepper** 🔧 Advanced
Multi-step process indicator (wizard) with horizontal and vertical orientations. Steps show a numbered circle (checkmark once completed); step `content` HTML is sanitized before rendering. With `editable: true`, users can click completed steps to go back.

```javascript
const stepper = Stepper({
  steps: [
    { title: 'Personal Info', content: '<p>Step 1 content</p>' },
    { title: 'Address', content: '<p>Step 2 content</p>' },
    { title: 'Review', content: '<p>Step 3 content</p>' }
  ],
  editable: true,
  onStepChange: ({ step, title, isCompleted }) => console.log(step, title)
});
nextBtn.onclick = () => { if (!stepper.isLastStep()) stepper.nextStep(); };
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | Array | `[]` | `{title, content}` — `content` is sanitized HTML |
| `currentStep` | number | `0` | Initially active step (0-indexed) |
| `orientation` | string | `'horizontal'` | horizontal or vertical |
| `editable` | boolean | `false` | Allow clicking completed steps to navigate back |
| `onStepChange` | Function | `null` | Receives `{ step, title, isCompleted }` |
| `variant` | string | `'default'` | Style variant |
| `className` | string | `''` | Additional CSS classes |

**Methods:** `getStep()`, `setStep(i)`, `nextStep()`, `prevStep()`, `isFirstStep()`, `isLastStep()`, `getTotalSteps()`.

---

### Notifications

#### **Toast** ⭐ Stable
Temporary notification message.

```html
<Toast
  message="Operation successful"
  variant="success"
  duration="3000"
/>
```

**Variants:** success, info, warning, danger

**Methods:**
```javascript
rnx.showToast({
  message: 'Hello!',
  variant: 'success',
  duration: 3000
});
```

---

#### **Modal** ⭐ Stable
Dialog box for focused tasks or confirmations.

```html
<Modal title="Confirm Action">
  <p>Are you sure?</p>
  <Button label="Yes" onclick="confirm()" />
  <Button label="No" onclick="cancel()" />
</Modal>
```

**Key Features:**
- Focusable with focus traps
- Backdrop dismiss
- Scrollable content
- Header/footer slots
- ARIA accessibility

---

### Error States

#### **ErrorBoundary** 🔧 Advanced
Catches JavaScript errors in wrapped child components and displays a fallback UI instead of crashing the app. Optionally reports errors to the error-tracking utility. `children` is required (throws otherwise). The default fallback shows a title, message, and an expandable error-details section.

```javascript
const boundary = ErrorBoundary({
  children: myComponent,
  fallback: (error, errorInfo) => `
    <div class="error">
      <h2>Something went wrong</h2>
      <p>${error.message}</p>
    </div>`,
  onError: (error, errorInfo) => console.error('Caught:', error, errorInfo)
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | HTMLElement\|Array | required | Child element(s) to wrap |
| `fallback` | Function | built-in | `(error, errorInfo) => htmlString` fallback UI |
| `onError` | Function | `null` | Called with `(error, errorInfo)` when an error is caught |
| `trackErrors` | boolean | `true` | Send caught errors to error tracking |
| `componentName` | string | `'ErrorBoundary'` | Name used in error context |

**Methods:** `resetError()` (clear error state and re-render children), `getError()` (returns the caught error and info).

---

#### **ErrorState** 🔧 Advanced
Full error display with icon, title, message, retry action, and an optional expandable technical-details section (accepts an `Error`, string, or plain object). Rendered with `role="alert"`.

```javascript
const errorView = ErrorState({
  title: 'Failed to load data',
  message: 'Check your connection and try again.',
  error: new Error('Network timeout'), // shown in a Show/Hide Details toggle
  showDetails: true,
  actionLabel: 'Retry',
  onAction: () => reloadData()
});
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | `'exclamation-triangle'` | Bootstrap icon name (no `'bi-'` prefix) |
| `title` | string | `'Something went wrong'` | Error title |
| `message` | string | generic retry hint | Descriptive message |
| `error` | Error\|string\|Object | `null` | Technical details (objects are JSON-stringified) |
| `showDetails` | boolean | `false` | Render the Show/Hide Details toggle (requires `error`) |
| `actionLabel` | string | `'Try Again'` | Action button label (empty string hides the button) |
| `onAction` | Function | `null` | Action button click handler |
| `className` | string | `''` | Additional CSS classes |

---

## Content & Media

### Text & Icons

#### **Icon** ⭐ Stable
Inline icon from Bootstrap Icons.

```html
<Icon name="check-circle" color="text-success" />
```

**Features:**
- All Bootstrap Icons (2000+)
- Customizable size and color
- Accessible labels

---

### Containers

#### **Accordion** ⭐ Stable
Collapsible content sections.

```html
<Accordion>
  <div data-toggle="collapse" data-target="#panel1">
    Section 1
  </div>
  <div id="panel1" class="collapse">
    Content 1
  </div>
</Accordion>
```

---

#### **Tabs** ⭐ Stable
Tab-based content switching.

```html
<Tabs>
  <ul>
    <li><a href="#tab1">Tab 1</a></li>
    <li><a href="#tab2">Tab 2</a></li>
  </ul>
  <div id="tab1">Content 1</div>
  <div id="tab2">Content 2</div>
</Tabs>
```

---

## Advanced Components

### Data Handling

#### **Chips** ⭐ Stable
Small tag-like buttons for displaying selections.

```html
<Chips label="JavaScript" deleteable onclick="remove()" />
```

---

### Custom Components

You can create custom components using `createComponent`:

```javascript
import { createComponent } from '@arnelirobles/rnxjs';

export const MyComponent = ({ title, content }) => {
  const template = () => `
    <div class="my-component">
      <h3>${title}</h3>
      <p>${content}</p>
    </div>
  `;

  return createComponent(template);
};
```

---

## Component Status Matrix

| Component | Status | Documentation | Tests | Accessible | Material Design |
|-----------|--------|----------------|-------|------------|-----------------|
| Input | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Textarea | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Select | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Checkbox | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Radio | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Switch | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Slider | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| FileUpload | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Autocomplete | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| DatePicker | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Search | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| FormGroup | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Button | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Card | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Alert | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Badge | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| FAB | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Container | ⭐ Stable | ✅ API.md | ✅ | N/A | N/A |
| Row | ⭐ Stable | ✅ API.md | ✅ | N/A | N/A |
| Column | ⭐ Stable | ✅ API.md | ✅ | N/A | N/A |
| TopAppBar | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| NavigationBar | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| NavigationDrawer | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Sidebar | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| DataTable | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| List | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| VirtualList | 🔧 Advanced | ✅ This page | ✅ | ✅ | N/A |
| Pagination | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Breadcrumb | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Toast | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Modal | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Spinner | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| ProgressBar | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Stepper | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Accordion | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Tabs | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Chips | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Icon | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Dropdown | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Tooltip | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| SegmentedButton | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| StatCard | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| EmptyState | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| ErrorState | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| ErrorBoundary | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |
| Skeleton | 🔧 Advanced | ✅ This page | ✅ | ✅ | ✅ |

---

## Theming & Customization

All components support theming through CSS custom properties:

```css
:root {
  --rnx-primary: #007bff;
  --rnx-secondary: #6c757d;
  --rnx-success: #28a745;
  --rnx-danger: #dc3545;
  --rnx-spacing-sm: 0.5rem;
  --rnx-font-size-base: 1rem;
}
```

See [CSS Custom Properties](../css/themes/base.css) for complete list.

**Material Design 3** theme available:
```html
<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">
```

---

## Component Selection Guide

### Building a Form
Use: **Input**, **Textarea**, **Select**, **Checkbox**, **Radio**, **Switch**, **FileUpload**, **FormGroup**

### Building a Dashboard
Use: **DataTable**, **Card**, **StatCard**, **ProgressBar**, **TopAppBar**, **Sidebar**, **Badge**

### Building a Landing Page
Use: **Container**, **Button**, **Card**, **Alert**, **Accordion**, **Modal**

### Building Admin Interface
Use: **DataTable**, **VirtualList**, **Form components**, **Toast**, **Modal**, **Sidebar**

### Building Mobile App
Use: **NavigationBar**, **NavigationDrawer**, **FAB**, **Bottom Sheet**, **Card**

---

## Accessibility

All components follow WCAG 2.1 AA standards:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels and descriptions
- ✅ Focus management
- ✅ Color contrast compliance

Utility functions available in `utils/a11y.ts` for custom components.

---

## Next Steps

1. **Getting Started**: See [QUICK-START.md](./QUICK-START.md)
2. **API Details**: See [API.md](./API.md)
3. **Theming**: See [CSS Custom Properties](../css/themes/base.css)
4. **Examples**: See [GitHub Samples](https://github.com/BaryoDev/rnxJS_samples)
5. **Migration**: See [MIGRATION.md](./MIGRATION.md) if migrating from jQuery
