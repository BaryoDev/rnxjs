# rnx_rails

Rails gem providing view helpers and ERB directives for integrating [rnxJS](https://github.com/arnelirobles/rnxjs) reactive components into Rails applications.

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Ruby Version](https://img.shields.io/badge/ruby-%3E%3D2.7-red.svg)](https://www.ruby-lang.org/)

## Overview

rnx_rails provides Rails view helpers that make it easy to:

- Include rnxJS library and stylesheets in your ERB templates
- Create reactive state from Rails data
- Render rnxJS components with Rails variables
- Initialize rnxJS plugins (router, toast, storage)
- Bind Rails data to reactive components

## Installation

### Add to Gemfile

```ruby
gem 'rnx_rails', '~> 1.0'
```

### Bundle

```bash
bundle install
```

The gem is automatically loaded by Rails' engine system.

## Quick Start

### 1. Include rnxJS in Your Base Layout

```erb
<%= rnx_scripts(cdn: true, theme: 'bootstrap') %>
```

### 2. Create Reactive State

Pass Rails data to rnxJS as reactive state:

```erb
<% user_data = {
  name: current_user.name,
  email: current_user.email,
  role: current_user.role
} %>

<%= rnx_state(user_data, 'user') %>

<p>Welcome, <span data-bind="user.name"></span>!</p>
```

### 3. Render Components

Use view helpers to render rnxJS components:

```erb
<%= rnx_component('Button', variant: 'primary', label: 'Save') %>
<%= rnx_component('Input', type: 'email', placeholder: 'user@example.com') %>
<%= rnx_component('DataTable', data: 'users', columns: 'columns', sortable: true) %>
```

## View Helpers Reference

### rnx_scripts

Include rnxJS library and stylesheets.

**Signature:**
```ruby
rnx_scripts(cdn: true, theme: 'bootstrap')
```

**Parameters:**
- `cdn` (Boolean, default: true) - Use CDN for resources
- `theme` (String, default: 'bootstrap') - Theme variant: 'bootstrap', 'm3', 'plugins', or nil

**Example:**
```erb
<head>
  <%= rnx_scripts(cdn: true, theme: 'm3') %>
</head>
```

### rnx_state

Create reactive state from Rails data.

**Signature:**
```ruby
rnx_state(data, var_name = 'state')
```

**Parameters:**
- `data` - Ruby hash or object to convert to reactive state
- `var_name` (String, optional, default: 'state') - Name of the global state variable

**Example:**
```erb
<% app_data = {
  user: current_user,
  notifications: current_user.notifications,
  settings: {
    theme: 'light',
    language: 'en'
  }
} %>

<%= rnx_state(app_data, 'appState') %>

<!-- Access reactive state in HTML -->
<span data-bind="appState.user.name"></span>
<span data-bind="appState.user.email"></span>
```

### rnx_component

Render rnxJS components with props.

**Signature:**
```ruby
rnx_component(name, props = {})
```

**Parameters:**
- Component name (String)
- Hash of props (optional)

**Features:**
- Automatic string escaping for security
- Support for data binding expressions (state.*)
- Boolean attributes without values
- Numeric attribute values without quotes
- Snake_case to kebab-case conversion

**Examples:**

```erb
<!-- Button component -->
<%= rnx_component('Button', variant: 'primary', label: 'Save') %>

<!-- Input with data binding -->
<%= rnx_component('Input',
  type: 'email',
  placeholder: 'user@example.com',
  data_bind: 'state.email'
) %>

<!-- DataTable with reactive data -->
<%= rnx_component('DataTable',
  data: 'state.users',
  columns: 'state.columns',
  sortable: true,
  pageable: true
) %>

<!-- Loop example -->
<% @items.each do |item| %>
  <%= rnx_component('Card',
    title: item.title,
    content: item.content,
    id: item.id
  ) %>
<% end %>
```

### rnx_plugin

Initialize rnxJS plugins.

**Signature:**
```ruby
rnx_plugin(name, options = {})
```

**Parameters:**
- Plugin name: 'router', 'toast', or 'storage'
- Plugin-specific configuration options

**Available Plugins:**

#### Router Plugin
Navigate between pages with hash-based routing.

```erb
<%= rnx_plugin('router', mode: 'hash', default_route: '/') %>

<!-- Route-specific content visibility -->
<div data-route="/">Home Page</div>
<div data-route="/users">Users Page</div>
```

#### Toast Plugin
Display notifications.

```erb
<%= rnx_plugin('toast',
  position: 'top-right',
  duration: 3000,
  max_toasts: 5
) %>

<script>
  window.rnx.toast.success('Operation completed!');
  window.rnx.toast.error('An error occurred');
  window.rnx.toast.warning('Warning message');
  window.rnx.toast.info('Information');
</script>
```

#### Storage Plugin
Persist state to localStorage/sessionStorage.

```erb
<%= rnx_plugin('storage',
  prefix: 'myapp_',
  storage: 'localStorage'
) %>

<script>
  // Persist state
  window.rnx.storage.persist(state, 'user_prefs', ['theme', 'language']);

  // Retrieve
  const theme = window.rnx.storage.get('user_prefs_theme');
</script>
```

### data_bind

Create a data binding attribute.

**Signature:**
```ruby
data_bind(path)
```

**Example:**
```erb
<span <%= data_bind('user.name') %>></span>
<!-- Output: data-bind="user.name" -->
```

### data_rule

Create a validation rule attribute.

**Signature:**
```ruby
data_rule(rules)
```

**Example:**
```erb
<input <%= data_rule('required|email|max:100') %> />
<!-- Output: data-rule="required|email|max:100" -->

<input <%= data_rule(['required', 'email']) %> />
<!-- Output: data-rule="required|email" -->
```

## Configuration

Create an initializer to configure rnx_rails:

```ruby
# config/initializers/rnx.rb
RnxRails.configure do |config|
  config.cdn = ENV.fetch('RNX_CDN', true)
  config.theme = ENV.fetch('RNX_THEME', 'bootstrap')
  config.storage_prefix = ENV.fetch('RNX_STORAGE_PREFIX', 'rnx_')
  config.router_mode = ENV.fetch('RNX_ROUTER_MODE', 'hash')
  config.toast_position = ENV.fetch('RNX_TOAST_POSITION', 'top-right')
  config.toast_duration = ENV.fetch('RNX_TOAST_DURATION', 3000).to_i
  config.toast_max = ENV.fetch('RNX_TOAST_MAX', 5).to_i
end
```

### Environment Variables

- `RNX_CDN` - Use CDN (default: true)
- `RNX_THEME` - Default theme (default: 'bootstrap')
- `RNX_STORAGE_PREFIX` - Storage key prefix (default: 'rnx_')
- `RNX_ROUTER_MODE` - Router mode (default: 'hash')
- `RNX_TOAST_POSITION` - Toast position (default: 'top-right')
- `RNX_TOAST_DURATION` - Toast duration in ms (default: 3000)
- `RNX_TOAST_MAX` - Max toasts on screen (default: 5)

## Complete Example

### app/controllers/profiles_controller.rb

```ruby
class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user
    @notifications = current_user.notifications.recent.limit(10)
  end
end
```

### app/views/profiles/show.html.erb

```erb
<% app_state = {
  user: {
    name: @user.name,
    email: @user.email,
    role: @user.role,
    avatar: @user.avatar_url
  },
  notifications: @notifications.map { |n| n.as_json },
  routes: {
    home: '/',
    profile: '/profile',
    settings: '/settings'
  }
} %>

<%= rnx_state(app_state, 'appState') %>
<%= rnx_plugin('toast', position: 'top-right', duration: 3000) %>

<div class="profile-container">
  <header>
    <h1 data-bind="appState.user.name"></h1>
    <p data-bind="appState.user.email"></p>
  </header>

  <section class="profile-actions">
    <%= rnx_component('Button',
      variant: 'primary',
      label: 'Edit Profile',
      onclick: 'editProfile()'
    ) %>

    <%= rnx_component('Button',
      variant: 'danger',
      label: 'Logout',
      onclick: 'logout()'
    ) %>
  </section>

  <section class="notifications">
    <h2>Recent Notifications</h2>
    <% @notifications.each do |notification| %>
      <%= rnx_component('Card',
        title: notification.title,
        content: notification.message,
        timestamp: notification.created_at,
        dismissible: true
      ) %>
    <% end %>
  </section>
</div>

<script>
  function editProfile() {
    window.rnx.toast.info('Opening edit dialog');
    // Navigate to edit page
    window.location.href = appState.routes.profile + '/edit';
  }

  function logout() {
    window.rnx.toast.info('Logging out...');
    window.location.href = '/logout';
  }
</script>
```

### app/views/layouts/application.html.erb

```erb
<!DOCTYPE html>
<html>
  <head>
    <title>My Rails App</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csp_meta_tag %>
    <%= csrf_meta_tags %>

    <%= stylesheet_link_tag 'application', media: 'all', 'data-turbolinks-track': 'reload' %>
    <%= javascript_pack_tag 'application', 'data-turbolinks-track': 'reload' %>

    <!-- rnxJS -->
    <%= rnx_scripts(cdn: true, theme: 'bootstrap') %>
  </head>

  <body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <%= link_to 'My App', root_path, class: 'navbar-brand' %>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <% if user_signed_in? %>
              <li class="nav-item">
                <%= link_to current_user.name, profile_path, class: 'nav-link' %>
              </li>
              <li class="nav-item">
                <%= link_to 'Logout', destroy_user_session_path, method: :delete, class: 'nav-link' %>
              </li>
            <% else %>
              <li class="nav-item">
                <%= link_to 'Login', new_user_session_path, class: 'nav-link' %>
              </li>
            <% end %>
          </ul>
        </div>
      </div>
    </nav>

    <main>
      <%= yield %>
    </main>

    <%= rnx_plugin('toast', RnxRails.configuration.toast.to_hash) if RnxRails.configuration.toast %>
  </body>
</html>
```

## Security Considerations

### HTML Escaping

All component props are automatically HTML-escaped to prevent XSS attacks:

```erb
<!-- Safe: Will escape < > & quotes -->
<%= rnx_component('Button', label: user_input) %>
```

### Data Binding Expressions

String values starting with `state.`, `{`, or `[` are preserved without escaping for data binding:

```erb
<!-- Treated as data binding expression -->
<%= rnx_component('Div', data_content: 'state.userMessage') %>

<!-- Regular string, will be escaped -->
<%= rnx_component('Div', title: 'Hello World') %>
```

## Testing

Tests are included in the `spec` directory. Run them with RSpec:

```bash
bundle exec rspec
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
- Rails view helpers: rnx_scripts, rnx_state, rnx_component, rnx_plugin
- Helper methods: data_bind, data_rule
- Bootstrap 5.3+ support
- Plugin integration (router, toast, storage)
- Configuration via initializers
- Full test coverage
- Type-safe component rendering
- HTML escaping and XSS prevention
