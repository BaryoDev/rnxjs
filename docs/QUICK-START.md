# rnxJS Quick Start Guide

> Get up and running with rnxJS in under 5 minutes

## Installation

### Option 1: CDN (Recommended for Quick Start)

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
    <!-- Your content here -->

    <!-- rnxJS -->
    <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
</body>
</html>
```

### Option 2: npm

```bash
npm install @arnelirobles/rnxjs
```

```javascript
import { createReactiveState, loadComponents } from '@arnelirobles/rnxjs';
```

### Option 3: Create New Project

```bash
npx @arnelirobles/create-rnxjs-app my-app
cd my-app
npx serve .
```

---

## Hello World

```html
<!DOCTYPE html>
<html>
<head>
    <title>rnxJS Hello World</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
    <h1>Hello, <span data-bind="name"></span>!</h1>
    <input data-bind="name" class="form-control w-50" placeholder="Enter your name">

    <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
    <script>
        const state = rnx.createReactiveState({ name: 'World' });
        rnx.bindData(document.body, state);
    </script>
</body>
</html>
```

**What happens:**
1. Type in the input field
2. The heading updates automatically
3. That's two-way data binding!

---

## Core Concepts

### 1. Reactive State

Create a centralized state object that automatically tracks changes:

```javascript
const state = rnx.createReactiveState({
    user: { name: 'John', email: 'john@example.com' },
    items: [],
    isLoading: false
});

// Access properties
console.log(state.user.name); // 'John'

// Modify properties (triggers UI updates)
state.user.name = 'Jane';
state.items.push({ id: 1, text: 'New item' });
state.isLoading = true;
```

### 2. Data Binding

Bind state to DOM elements with `data-bind`:

```html
<!-- Display values -->
<span data-bind="user.name"></span>
<span data-bind="user.email"></span>

<!-- Two-way binding on inputs -->
<input data-bind="user.name">
<textarea data-bind="message"></textarea>

<!-- Bind to checkbox/radio -->
<input type="checkbox" data-bind="isActive">
```

```javascript
rnx.bindData(document.body, state);
```

### 3. Conditional Rendering

Show/hide elements based on state:

```html
<div data-if="isLoading">
    <span class="spinner-border"></span> Loading...
</div>

<div data-if="!isLoading">
    Content loaded!
</div>
```

### 4. List Rendering

Render arrays automatically:

```html
<ul data-for="items">
    <li>
        <span data-bind="name"></span> -
        <span data-bind="email"></span>
    </li>
</ul>
```

```javascript
state.items = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
];
```

### 5. Form Validation

Built-in validation with `data-rule`:

```html
<form id="myForm">
    <input data-bind="email" data-rule="required|email">
    <span data-bind="errors.email" class="text-danger"></span>

    <input data-bind="password" data-rule="required|min:8">
    <span data-bind="errors.password" class="text-danger"></span>

    <button type="submit">Submit</button>
</form>
```

Available rules:
- `required` - Must have value
- `email` - Valid email format
- `numeric` - Numbers only
- `min:n` - Minimum length/value
- `max:n` - Maximum length/value
- `pattern:regex` - Custom pattern

---

## Using Components

### Auto-Register Components

```javascript
rnx.autoRegisterComponents();
rnx.loadComponents(document.body, state);
```

### Button

```html
<Button variant="primary" label="Click Me" />
<Button variant="danger" label="Delete" size="sm" />
<Button variant="success" label="Save" block="true" />
```

### Card

```html
<Card title="Welcome" subtitle="Getting started with rnxJS">
    <p>This is the card content.</p>
</Card>
```

### Input

```html
<Input type="email" label="Email" placeholder="you@example.com" data-bind="email" />
<Input type="password" label="Password" data-bind="password" />
```

### DataTable

```html
<DataTable
    data="state.users"
    columns="state.columns"
    sortable="true"
    pageable="true"
    page-size="10"
/>
```

```javascript
state.columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' }
];

state.users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];
```

### Modal

```html
<button onclick="document.querySelector('Modal').show()">Open Modal</button>

<Modal title="Confirm Action" id="confirmModal">
    <p>Are you sure you want to proceed?</p>
</Modal>
```

### Toast Notifications

```javascript
// First, add the toast plugin
rnx.plugins.use(rnx.toastPlugin({ position: 'top-right' }));

// Then show toasts
rnx.toast.success('Saved successfully!');
rnx.toast.error('Something went wrong');
rnx.toast.warning('Are you sure?');
rnx.toast.info('Loading...');
```

---

## Complete Example: Todo App

```html
<!DOCTYPE html>
<html>
<head>
    <title>Todo App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body class="p-4">
    <div class="container" style="max-width: 500px;">
        <h1>Todo List</h1>

        <!-- Add Todo Form -->
        <div class="input-group mb-3">
            <input data-bind="newTodo" class="form-control" placeholder="What needs to be done?">
            <button class="btn btn-primary" onclick="addTodo()">Add</button>
        </div>

        <!-- Todo List -->
        <ul class="list-group" data-for="todos">
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <input type="checkbox" data-bind="completed" class="form-check-input me-2">
                    <span data-bind="text"></span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeTodo(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        </ul>

        <!-- Stats -->
        <div class="mt-3 text-muted">
            <span data-bind="remaining"></span> items remaining
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
    <script>
        // Create state
        const state = rnx.createReactiveState({
            newTodo: '',
            todos: [
                { id: 1, text: 'Learn rnxJS', completed: false },
                { id: 2, text: 'Build something awesome', completed: false }
            ],
            remaining: 2
        });

        // Bind to DOM
        rnx.bindData(document.body, state);

        // Update remaining count when todos change
        state.subscribe('todos', () => {
            state.remaining = state.todos.filter(t => !t.completed).length;
        });

        // Add todo
        function addTodo() {
            if (state.newTodo.trim()) {
                state.todos.push({
                    id: Date.now(),
                    text: state.newTodo,
                    completed: false
                });
                state.newTodo = '';
            }
        }

        // Remove todo
        function removeTodo(btn) {
            const li = btn.closest('li');
            const index = Array.from(li.parentNode.children).indexOf(li);
            state.todos.splice(index, 1);
        }

        // Handle Enter key
        document.querySelector('[data-bind="newTodo"]').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    </script>
</body>
</html>
```

---

## Complete Example: Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid p-4">
        <h1 class="mb-4">Dashboard</h1>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <StatCard title="Total Users" value="state.stats.users" icon="people" variant="primary" />
            </div>
            <div class="col-md-3">
                <StatCard title="Revenue" value="state.stats.revenue" icon="currency-dollar" variant="success" />
            </div>
            <div class="col-md-3">
                <StatCard title="Orders" value="state.stats.orders" icon="cart" variant="info" />
            </div>
            <div class="col-md-3">
                <StatCard title="Active" value="state.stats.active" icon="activity" variant="warning" />
            </div>
        </div>

        <!-- Data Table -->
        <Card title="Recent Users">
            <DataTable
                data="state.users"
                columns="state.columns"
                sortable="true"
                pageable="true"
                page-size="5"
            />
        </Card>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
    <script>
        const state = rnx.createReactiveState({
            stats: {
                users: '1,234',
                revenue: '$45,678',
                orders: '567',
                active: '89%'
            },
            columns: [
                { key: 'id', label: 'ID', sortable: true },
                { key: 'name', label: 'Name', sortable: true },
                { key: 'email', label: 'Email' },
                { key: 'status', label: 'Status' }
            ],
            users: [
                { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active' },
                { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Active' },
                { id: 3, name: 'Carol White', email: 'carol@example.com', status: 'Inactive' }
            ]
        });

        rnx.autoRegisterComponents();
        rnx.loadComponents(document.body, state);
        rnx.bindData(document.body, state);
    </script>
</body>
</html>
```

---

## Using Plugins

### Router Plugin

```javascript
rnx.plugins.use(rnx.routerPlugin({
    mode: 'hash',
    routes: {
        '/': 'home',
        '/users': 'users',
        '/users/:id': 'user-detail'
    }
}));
```

```html
<!-- Navigation -->
<nav>
    <a href="#/">Home</a>
    <a href="#/users">Users</a>
</nav>

<!-- Route Views -->
<div data-route="home">Home Page</div>
<div data-route="users">Users Page</div>
<div data-route="user-detail">User Detail (ID: <span data-bind="routeParams.id"></span>)</div>
```

### Storage Plugin

```javascript
rnx.plugins.use(rnx.storagePlugin({ prefix: 'myapp_' }));

// Persist state to localStorage
rnx.storage.persist(state, 'userPrefs', ['theme', 'language']);
```

---

## Next Steps

1. **Explore Components**: Browse the [34 built-in components](../README.md#components)
2. **Read the API**: Full [API Reference](./API.md)
3. **Check Benchmarks**: [Performance comparisons](./BENCHMARKS.md)
4. **Migrate from jQuery**: [Migration guide](./MIGRATION.md)
5. **Join Community**: [GitHub Discussions](https://github.com/arnelirobles/rnxjs/discussions)

---

## Common Patterns

### Fetching Data

```javascript
async function loadUsers() {
    state.isLoading = true;
    try {
        const response = await fetch('/api/users');
        state.users = await response.json();
    } catch (error) {
        state.error = error.message;
    } finally {
        state.isLoading = false;
    }
}
```

### Form Submission

```javascript
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (Object.keys(state.errors).length > 0) {
        rnx.toast.error('Please fix validation errors');
        return;
    }

    try {
        await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: state.email, password: state.password })
        });
        rnx.toast.success('Submitted successfully!');
    } catch (error) {
        rnx.toast.error('Submission failed');
    }
});
```

### Subscribe to Changes

```javascript
// Subscribe to specific path
state.subscribe('user.name', (newValue, oldValue) => {
    console.log(`Name changed from ${oldValue} to ${newValue}`);
});

// Subscribe to array changes
state.subscribe('items', (items) => {
    console.log(`Items updated: ${items.length} total`);
});
```

---

## Troubleshooting

### Components Not Rendering

```javascript
// Make sure to call both:
rnx.autoRegisterComponents();  // Register component functions
rnx.loadComponents(document.body, state);  // Initialize in DOM
```

### Data Binding Not Working

```javascript
// Make sure to call bindData after DOM is ready:
document.addEventListener('DOMContentLoaded', () => {
    const state = rnx.createReactiveState({ /* ... */ });
    rnx.bindData(document.body, state);
});
```

### State Changes Not Reflecting

```javascript
// For objects, reassign to trigger update:
state.user = { ...state.user, name: 'New Name' };

// For arrays, use mutating methods:
state.items.push(newItem);  // ✅ Works
state.items = [...state.items, newItem];  // ✅ Also works
```

---

## Get Help

- **Documentation**: [Full README](../README.md)
- **API Reference**: [API.md](./API.md)
- **Issues**: [GitHub Issues](https://github.com/arnelirobles/rnxjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arnelirobles/rnxjs/discussions)
