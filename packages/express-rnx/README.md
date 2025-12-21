# @arnelirobles/express-rnx

Express middleware and view helpers for integrating [rnxJS](https://github.com/arnelirobles/rnxjs) reactive components into Express applications.

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0-green.svg)](https://nodejs.org/)

## Overview

express-rnx provides Express middleware that makes it easy to:

- Include rnxJS library and stylesheets in your views
- Create reactive state from server data
- Render rnxJS components with template variables
- Initialize rnxJS plugins (router, toast, storage)
- Bind server data to reactive components

## Installation

### npm

```bash
npm install @arnelirobles/express-rnx
```

### yarn

```bash
yarn add @arnelirobles/express-rnx
```

## Quick Start

### 1. Setup Express Middleware

```javascript
const express = require('express');
const rnxMiddleware = require('@arnelirobles/express-rnx');

const app = express();

// Add rnx middleware
app.use(rnxMiddleware({
  cdn: true,
  theme: 'bootstrap'
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000);
```

### 2. Use in EJS Templates

```ejs
<head>
  <%- rnx.scripts() %>
</head>

<body>
  <%
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };
  %>

  <%- rnx.state(userData, 'user') %>

  <p>Welcome, <span data-bind="user.name"></span>!</p>

  <%- rnx.component('Button', { variant: 'primary', label: 'Save' }) %>
</body>
```

### 3. Available Methods

```javascript
// In your Express route handlers
app.get('/profile', (req, res) => {
  const user = req.user; // Your user object

  res.render('profile', {
    user: user,
    // res.locals.rnx helpers are automatically available
  });
});
```

## Middleware Configuration

Configure the middleware when initializing:

```javascript
app.use(rnxMiddleware({
  // Include rnxJS scripts (default: true)
  cdn: true,

  // Theme variant (default: 'bootstrap')
  // Options: 'bootstrap', 'm3', 'plugins', or null
  theme: 'bootstrap',

  // Storage configuration
  storagePrefix: 'myapp_',

  // Router configuration
  routerMode: 'hash',

  // Toast configuration
  toastPosition: 'top-right',
  toastDuration: 3000,
  toastMax: 5
}));
```

## View Helpers Reference

### rnx.scripts()

Include rnxJS library and stylesheets.

**Syntax:**
```javascript
rnx.scripts(cdn, theme)
```

**Parameters:**
- `cdn` (boolean, default: true) - Use CDN for resources
- `theme` (string, default: 'bootstrap') - Theme variant

**Example:**
```ejs
<head>
  <%- rnx.scripts(true, 'm3') %>
</head>
```

### rnx.state()

Create reactive state from server data.

**Syntax:**
```javascript
rnx.state(data, varName)
```

**Parameters:**
- `data` - JavaScript object or array to serialize
- `varName` (string, default: 'state') - Global state variable name

**Example:**
```ejs
<%
  const appData = {
    user: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    notifications: notifications,
    routes: {
      home: '/',
      profile: '/profile',
      settings: '/settings'
    }
  };
%>

<%- rnx.state(appData, 'appState') %>

<span data-bind="appState.user.name"></span>
<span data-bind="appState.user.email"></span>
```

### rnx.component()

Render rnxJS components.

**Syntax:**
```javascript
rnx.component(name, props)
```

**Parameters:**
- `name` (string) - Component name
- `props` (object, optional) - Component properties

**Example:**
```ejs
<%- rnx.component('Button', { variant: 'primary', label: 'Save' }) %>

<%- rnx.component('Input', {
  type: 'email',
  placeholder: 'user@example.com',
  data_bind: 'state.email'
}) %>

<%- rnx.component('DataTable', {
  data: 'state.users',
  columns: 'state.columns',
  sortable: true,
  pageable: true
}) %>
```

### rnx.plugin()

Initialize rnxJS plugins.

**Syntax:**
```javascript
rnx.plugin(name, options)
```

**Parameters:**
- `name` (string) - Plugin name ('router', 'toast', 'storage')
- `options` (object, optional) - Plugin configuration

**Example:**
```ejs
<%- rnx.plugin('router', { mode: 'hash', default_route: '/' }) %>

<%- rnx.plugin('toast', {
  position: 'top-right',
  duration: 3000,
  max_toasts: 5
}) %>

<%- rnx.plugin('storage', {
  prefix: 'myapp_',
  storage: 'localStorage'
}) %>
```

### rnx.dataBind()

Create a data-bind attribute.

**Syntax:**
```javascript
rnx.dataBind(path)
```

**Example:**
```ejs
<span <%- rnx.dataBind('user.name') %>></span>
<!-- Output: <span data-bind="user.name"></span> -->
```

### rnx.dataRule()

Create a validation rule attribute.

**Syntax:**
```javascript
rnx.dataRule(rules)
```

**Example:**
```ejs
<input <%- rnx.dataRule('required|email') %> />
<!-- Output: <input data-rule="required|email" /> -->

<input <%- rnx.dataRule(['required', 'email', 'max:100']) %> />
```

## Complete Example

### app.js

```javascript
const express = require('express');
const rnxMiddleware = require('@arnelirobles/express-rnx');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(rnxMiddleware({
  cdn: true,
  theme: 'bootstrap',
  toastPosition: 'top-right',
  toastDuration: 3000
}));

app.set('view engine', 'ejs');
app.set('views', './views');

// Mock user
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

const mockNotifications = [
  { id: 1, title: 'Welcome', message: 'Welcome to the app!', type: 'info' },
  { id: 2, title: 'Success', message: 'Your profile was updated', type: 'success' }
];

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    user: mockUser,
    notifications: mockNotifications
  });
});

app.get('/profile', (req, res) => {
  res.render('profile', {
    user: mockUser
  });
});

app.get('/components', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
    { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'active' }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ];

  res.render('components', {
    users: users,
    columns: columns
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### views/layout.ejs

```ejs
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rnxJS Express Example</title>
  <%- rnx.scripts(true, 'bootstrap') %>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">My App</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/profile">Profile</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/components">Components</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container mt-5">
    <%- body %>
  </main>

  <%- rnx.plugin('toast', { position: 'top-right' }) %>
</body>
</html>
```

### views/index.ejs

```ejs
<%
  const appState = {
    user: user,
    notifications: notifications,
    page: 'home'
  };
%>

<%- rnx.state(appState, 'appState') %>

<h1>Welcome to rnxJS!</h1>
<p>Hello, <span data-bind="appState.user.name"></span>!</p>

<div class="row mt-5">
  <div class="col-md-6">
    <h2>Recent Notifications</h2>
    <% notifications.forEach(notif => { %>
      <%- rnx.component('Card', {
        title: notif.title,
        content: notif.message,
        type: notif.type
      }) %>
    <% }); %>
  </div>

  <div class="col-md-6">
    <h2>Actions</h2>
    <%- rnx.component('Button', {
      variant: 'primary',
      label: 'View Profile',
      onclick: 'window.location.href = "/profile"'
    }) %>
    <br><br>
    <%- rnx.component('Button', {
      variant: 'secondary',
      label: 'View Components',
      onclick: 'window.location.href = "/components"'
    }) %>
  </div>
</div>
```

### views/profile.ejs

```ejs
<%
  const profileState = {
    user: user
  };
%>

<%- rnx.state(profileState, 'profileState') %>
<%- rnx.plugin('toast', { position: 'top-right' }) %>

<h1>User Profile</h1>

<div class="profile-card">
  <h2 data-bind="profileState.user.name"></h2>
  <p><strong>Email:</strong> <span data-bind="profileState.user.email"></span></p>
  <p><strong>Role:</strong> <span data-bind="profileState.user.role"></span></p>

  <%- rnx.component('Button', {
    variant: 'primary',
    label: 'Edit Profile',
    onclick: 'window.rnx.toast.info("Opening edit dialog")'
  }) %>

  <%- rnx.component('Button', {
    variant: 'danger',
    label: 'Logout',
    onclick: 'window.rnx.toast.warning("Logging out...")'
  }) %>
</div>
```

## Security Considerations

### HTML Escaping

All component props and attributes are automatically HTML-escaped to prevent XSS:

```ejs
<%- rnx.component('Button', { label: userInput }) %>
<!-- userInput is escaped automatically -->
```

### Data Binding Expressions

String values starting with `state.`, `{`, or `[` are preserved for data binding:

```ejs
<%- rnx.component('Div', { content: 'state.message' }) %>
<!-- Preserves as: content="state.message" -->

<%- rnx.component('Div', { title: 'Hello' }) %>
<!-- Escapes and quotes: title="Hello" -->
```

## Testing

Tests are included. Run with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MPL-2.0 - See [LICENSE](../../LICENSE) for details.

## Support

- Documentation: [rnxJS Documentation](https://github.com/arnelirobles/rnxjs)
- Issues: [GitHub Issues](https://github.com/arnelirobles/rnxjs/issues)
- Discussions: [GitHub Discussions](https://github.com/arnelirobles/rnxjs/discussions)

## Changelog

### 1.0.0 (2024)

- Initial release
- Express middleware with res.locals.rnx helpers
- View helpers: scripts, state, component, plugin
- Attribute helpers: dataBind, dataRule
- Bootstrap 5.3+ support
- Plugin integration (router, toast, storage)
- Full XSS prevention and HTML escaping
- Support for EJS, Pug, and other template engines
- Configuration options
