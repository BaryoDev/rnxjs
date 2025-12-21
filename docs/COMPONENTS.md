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
File input with preview and validation.

**See:** [FileUpload README](../components/FileUpload/README.md)

---

#### **Autocomplete** 🔧 Advanced
Text input with autocomplete suggestions.

**See:** [Autocomplete README](../components/Autocomplete/README.md)

---

#### **DatePicker** 🔧 Advanced
Calendar-based date input.

**See:** [DatePicker README](../components/DatePicker/README.md)

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
Collapsible sidebar navigation.

**See:** [Sidebar README](../components/Sidebar/README.md)

**Key Features:**
- Collapsible state
- Keyboard navigation
- ARIA labels
- Responsive collapse

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
Card for displaying statistics/metrics.

**See:** [StatCard README](../components/StatCard/README.md)

---

#### **EmptyState** 🔧 Advanced
Placeholder when no data is available.

**See:** [EmptyState README](../components/EmptyState/README.md)

---

#### **Skeleton** 🔧 Advanced
Loading skeleton placeholder.

**See:** [Skeleton README](../components/Skeleton/README.md)

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
Custom dropdown menu component.

**See:** [Dropdown README](../components/Dropdown/README.md)

---

#### **Tooltip** 🔧 Advanced
Hover-triggered informational tooltip.

**See:** [Tooltip README](../components/Tooltip/README.md)

---

## Data Display

### Tables & Lists

#### **DataTable** 🔧 Advanced
Feature-rich data table with sorting, filtering, pagination.

**See:** [DataTable README](../components/DataTable/README.md)

**Key Features:**
- Server-side sorting/filtering
- Pagination
- Responsive design
- Column customization
- Row selection

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
High-performance list for large datasets (1000+).

**See:** [VirtualList README](../components/VirtualList/README.md)

---

### Navigation Lists

#### **Breadcrumb** 🔧 Advanced
Navigation trail showing page hierarchy.

**See:** [Breadcrumb README](../components/Breadcrumb/README.md)

```html
<Breadcrumb>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <span>Details</span>
</Breadcrumb>
```

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
Custom sidebar with collapsible sections.

**See:** [Sidebar README](../components/Sidebar/README.md)

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
Progress bar with value indication.

**See:** [ProgressBar README](../components/ProgressBar/README.md)

```html
<ProgressBar
  value="65"
  label="Upload Progress"
/>
```

---

#### **Stepper** 🔧 Advanced
Multi-step process indicator.

**Key Features:**
- Linear and non-linear modes
- Step navigation
- Validation per step
- Icon/number display

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
Component error boundary catching and displaying errors.

**See:** [ErrorBoundary README](../components/ErrorBoundary/README.md)

---

#### **ErrorState** 🔧 Advanced
Dedicated error display component.

**See:** [ErrorState README](../components/ErrorState/README.md)

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
| FileUpload | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Autocomplete | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| DatePicker | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
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
| Sidebar | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| DataTable | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| List | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| VirtualList | 🔧 Advanced | ✅ README | ✅ | ✅ | N/A |
| Pagination | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Breadcrumb | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Toast | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Modal | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Spinner | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| ProgressBar | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Stepper | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Accordion | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Tabs | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Chips | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| Icon | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ |
| Dropdown | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Tooltip | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| SegmentedButton | ⭐ Stable | ✅ API.md | ✅ | ✅ | ✅ M3 |
| StatCard | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| EmptyState | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| ErrorState | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| ErrorBoundary | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |
| Skeleton | 🔧 Advanced | ✅ README | ✅ | ✅ | ✅ |

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
