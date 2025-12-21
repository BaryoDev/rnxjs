# Migrating from jQuery to rnxJS

> A practical guide for jQuery developers transitioning to rnxJS

## Why Migrate?

| Aspect | jQuery | rnxJS |
|--------|--------|-------|
| **Reactivity** | Manual DOM updates | Automatic updates |
| **State Management** | Scattered variables | Centralized reactive state |
| **Components** | None built-in | 34 pre-built components |
| **Data Binding** | Manual | Declarative `data-bind` |
| **Form Validation** | Plugin required | Built-in |
| **Bundle Size** | ~30KB | ~10KB |
| **Modern Features** | Limited | Full ES6+ support |

## Quick Comparison

### Updating the DOM

**jQuery:**
```javascript
// Update text
$('#username').text(user.name);
$('#email').text(user.email);

// On user change, manually update again
function updateUser(newUser) {
    user = newUser;
    $('#username').text(user.name);
    $('#email').text(user.email);
}
```

**rnxJS:**
```javascript
// Create reactive state
const state = rnx.createReactiveState({
    user: { name: 'John', email: 'john@example.com' }
});

// Bind to DOM (one-time setup)
rnx.bindData(document.body, state);

// HTML with data binding
// <span data-bind="user.name"></span>
// <span data-bind="user.email"></span>

// Updates are automatic!
state.user.name = 'Jane'; // DOM updates automatically
```

### Event Handling

**jQuery:**
```javascript
$('#myButton').on('click', function() {
    const count = parseInt($('#counter').text()) + 1;
    $('#counter').text(count);
});
```

**rnxJS:**
```javascript
const state = rnx.createReactiveState({ count: 0 });
rnx.bindData(document.body, state);

document.getElementById('myButton').addEventListener('click', () => {
    state.count++; // DOM updates automatically
});

// HTML: <span data-bind="count"></span>
```

### AJAX Requests

**jQuery:**
```javascript
$.ajax({
    url: '/api/users',
    success: function(users) {
        const html = users.map(u => `<li>${u.name}</li>`).join('');
        $('#userList').html(html);
    }
});
```

**rnxJS:**
```javascript
const state = rnx.createReactiveState({ users: [] });
rnx.bindData(document.body, state);

// HTML: <ul data-for="users"><li data-bind="name"></li></ul>

fetch('/api/users')
    .then(r => r.json())
    .then(users => {
        state.users = users; // List renders automatically
    });
```

### Form Handling

**jQuery (with validation plugin):**
```javascript
$('#myForm').validate({
    rules: {
        email: { required: true, email: true },
        password: { required: true, minlength: 8 }
    },
    submitHandler: function(form) {
        const data = $(form).serialize();
        $.post('/api/submit', data);
    }
});
```

**rnxJS (built-in validation):**
```html
<form id="myForm">
    <input data-bind="email" data-rule="required|email">
    <input data-bind="password" data-rule="required|min:8">
    <button type="submit">Submit</button>
</form>
```

```javascript
const state = rnx.createReactiveState({
    email: '',
    password: '',
    errors: {}
});

rnx.bindData(document.getElementById('myForm'), state);

document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Object.keys(state.errors).length === 0) {
        fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify({ email: state.email, password: state.password })
        });
    }
});
```

---

## Migration Patterns

### Pattern 1: Replace $(document).ready()

**jQuery:**
```javascript
$(document).ready(function() {
    // Initialize app
});

// or
$(function() {
    // Initialize app
});
```

**rnxJS:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const state = rnx.createReactiveState({ /* ... */ });
    rnx.loadComponents(document.body, state);
});
```

### Pattern 2: Replace $.each()

**jQuery:**
```javascript
$.each(users, function(index, user) {
    console.log(user.name);
});
```

**rnxJS / Modern JS:**
```javascript
users.forEach((user, index) => {
    console.log(user.name);
});

// or
for (const user of users) {
    console.log(user.name);
}
```

### Pattern 3: Replace DOM Traversal

**jQuery:**
```javascript
$('#container').find('.item').first().addClass('active');
$('.card').parent().siblings('.header').hide();
```

**rnxJS / Modern JS:**
```javascript
document.querySelector('#container .item')?.classList.add('active');
// For complex traversal, use data-bind for reactive updates
```

### Pattern 4: Replace .html() / .text()

**jQuery:**
```javascript
$('#content').html('<p>New content</p>');
$('#title').text('New title');
```

**rnxJS:**
```html
<div id="content" data-bind="content"></div>
<h1 data-bind="title"></h1>
```

```javascript
const state = rnx.createReactiveState({
    content: '<p>New content</p>',  // Use trustHtml() for HTML
    title: 'New title'
});
rnx.bindData(document.body, state);

// Update anytime
state.title = 'Updated title';
```

### Pattern 5: Replace .show() / .hide()

**jQuery:**
```javascript
$('#panel').show();
$('#panel').hide();
$('#panel').toggle();
```

**rnxJS:**
```html
<div data-if="showPanel">
    Panel content
</div>
```

```javascript
const state = rnx.createReactiveState({ showPanel: true });
rnx.bindData(document.body, state);

// Toggle visibility
state.showPanel = !state.showPanel;
```

### Pattern 6: Replace .addClass() / .removeClass()

**jQuery:**
```javascript
$('#button').addClass('active');
$('#button').removeClass('active');
$('#button').toggleClass('active');
```

**rnxJS:**
```html
<button id="button" class="btn" data-bind-class="isActive ? 'active' : ''">
    Click me
</button>
```

Or with direct DOM:
```javascript
document.getElementById('button').classList.toggle('active');
```

### Pattern 7: Replace .animate()

**jQuery:**
```javascript
$('#box').animate({
    opacity: 0,
    left: '+=50'
}, 500);
```

**Modern CSS + JS:**
```css
#box {
    transition: all 0.5s ease;
}
```

```javascript
const box = document.getElementById('box');
box.style.opacity = '0';
box.style.transform = 'translateX(50px)';
```

### Pattern 8: Replace $.ajax()

**jQuery:**
```javascript
$.ajax({
    url: '/api/data',
    method: 'POST',
    data: JSON.stringify({ name: 'John' }),
    contentType: 'application/json',
    success: function(response) {
        console.log(response);
    },
    error: function(xhr, status, error) {
        console.error(error);
    }
});
```

**Modern Fetch:**
```javascript
try {
    const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John' })
    });
    const data = await response.json();
    console.log(data);
} catch (error) {
    console.error(error);
}
```

### Pattern 9: Replace Event Delegation

**jQuery:**
```javascript
$('#list').on('click', '.item', function() {
    $(this).addClass('selected');
});
```

**rnxJS / Modern JS:**
```javascript
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.classList.contains('item')) {
        e.target.classList.add('selected');
    }
});
```

Or with reactive state:
```javascript
const state = rnx.createReactiveState({
    items: [
        { id: 1, name: 'Item 1', selected: false },
        { id: 2, name: 'Item 2', selected: false }
    ]
});

// HTML with data-for handles list rendering
```

---

## Component Migration

### Replace jQuery UI Dialog

**jQuery UI:**
```javascript
$('#dialog').dialog({
    title: 'Confirm',
    modal: true,
    buttons: {
        'OK': function() { $(this).dialog('close'); },
        'Cancel': function() { $(this).dialog('close'); }
    }
});
```

**rnxJS Modal:**
```javascript
const modal = rnx.Modal({
    title: 'Confirm',
    children: '<p>Are you sure?</p>',
    footer: true
});

document.body.appendChild(modal);
modal.show();
```

### Replace jQuery UI Datepicker

**jQuery UI:**
```javascript
$('#date').datepicker({
    dateFormat: 'yy-mm-dd'
});
```

**rnxJS DatePicker:**
```html
<DatePicker data-bind="selectedDate" format="YYYY-MM-DD" />
```

### Replace jQuery UI Autocomplete

**jQuery UI:**
```javascript
$('#search').autocomplete({
    source: '/api/search',
    minLength: 2
});
```

**rnxJS Autocomplete:**
```html
<Autocomplete
    data-bind="searchTerm"
    source="/api/search"
    min-length="2"
    on-select="handleSelect"
/>
```

### Replace DataTables

**jQuery DataTables:**
```javascript
$('#table').DataTable({
    data: users,
    columns: [
        { data: 'id', title: 'ID' },
        { data: 'name', title: 'Name' }
    ],
    pageLength: 10,
    ordering: true
});
```

**rnxJS DataTable:**
```html
<DataTable
    data="state.users"
    columns="state.columns"
    page-size="10"
    sortable="true"
    pageable="true"
/>
```

---

## Step-by-Step Migration

### Step 1: Add rnxJS to Your Project

Keep jQuery for now, add rnxJS alongside:

```html
<!-- Keep jQuery temporarily -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Add rnxJS -->
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
```

### Step 2: Create Centralized State

Move scattered variables to reactive state:

```javascript
// Before: scattered variables
let users = [];
let currentPage = 1;
let searchTerm = '';

// After: centralized state
const state = rnx.createReactiveState({
    users: [],
    currentPage: 1,
    searchTerm: ''
});
```

### Step 3: Replace DOM Updates with Data Binding

```html
<!-- Before: jQuery target -->
<span id="username"></span>

<!-- After: data binding -->
<span data-bind="user.name"></span>
```

```javascript
// Before: jQuery update
$('#username').text(user.name);

// After: state update (DOM updates automatically)
state.user.name = 'New Name';
```

### Step 4: Replace jQuery Components

One by one, replace jQuery plugins with rnxJS components:

```javascript
// Before: jQuery modal
$('#modal').modal('show');

// After: rnxJS Modal
const modal = rnx.Modal({ title: 'Hello' });
modal.show();
```

### Step 5: Remove jQuery

Once all functionality is migrated:

```html
<!-- Remove jQuery -->
<!-- <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script> -->

<!-- Keep rnxJS -->
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
```

---

## Common Gotchas

### 1. jQuery Returns jQuery Objects

```javascript
// jQuery: chainable, returns jQuery object
$('#element').addClass('active').show().text('Hello');

// rnxJS/Vanilla: returns actual DOM element
const el = document.getElementById('element');
el.classList.add('active');
el.style.display = 'block';
el.textContent = 'Hello';
```

### 2. jQuery .each() vs forEach()

```javascript
// jQuery: $(this) refers to current element
$('.items').each(function() {
    $(this).addClass('processed');
});

// Modern JS: explicit element parameter
document.querySelectorAll('.items').forEach(el => {
    el.classList.add('processed');
});
```

### 3. Event Object Differences

```javascript
// jQuery: normalized event object
$('#btn').on('click', function(e) {
    e.preventDefault();
    // e is jQuery event
});

// Vanilla/rnxJS: native event object
document.getElementById('btn').addEventListener('click', (e) => {
    e.preventDefault();
    // e is native Event
});
```

### 4. Async Operations

```javascript
// jQuery: callback-based
$.get('/api/data', function(data) {
    // handle data
});

// Modern: Promise-based
const data = await fetch('/api/data').then(r => r.json());
```

---

## Feature Mapping

| jQuery | rnxJS/Modern JS |
|--------|-----------------|
| `$(selector)` | `document.querySelector(selector)` |
| `$(selector).each()` | `document.querySelectorAll(selector).forEach()` |
| `.addClass()` | `.classList.add()` |
| `.removeClass()` | `.classList.remove()` |
| `.toggleClass()` | `.classList.toggle()` |
| `.hasClass()` | `.classList.contains()` |
| `.attr()` | `.getAttribute()` / `.setAttribute()` |
| `.prop()` | Direct property access |
| `.html()` | `.innerHTML` or `data-bind` |
| `.text()` | `.textContent` or `data-bind` |
| `.val()` | `.value` or `data-bind` |
| `.css()` | `.style` or CSS classes |
| `.show()` | `.style.display` or `data-if` |
| `.hide()` | `.style.display` or `data-if` |
| `.on()` | `.addEventListener()` |
| `.off()` | `.removeEventListener()` |
| `.trigger()` | `.dispatchEvent()` |
| `$.ajax()` | `fetch()` |
| `$.get()` | `fetch(url)` |
| `$.post()` | `fetch(url, { method: 'POST' })` |
| `$.extend()` | `Object.assign()` or spread |
| `$.each()` | `Array.forEach()` or `for...of` |
| `$.map()` | `Array.map()` |
| `$.grep()` | `Array.filter()` |

---

## Need Help?

- [API Reference](./API.md)
- [Quick Start Guide](./QUICK-START.md)
- [GitHub Issues](https://github.com/arnelirobles/rnxjs/issues)
- [GitHub Discussions](https://github.com/arnelirobles/rnxjs/discussions)
