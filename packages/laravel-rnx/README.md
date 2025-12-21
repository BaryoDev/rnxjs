# laravel-rnx

Laravel Blade directives and helpers for integrating [rnxJS](https://github.com/arnelirobles/rnxjs) reactive components into Laravel applications.

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.0-blue.svg)](https://www.php.net/)

## Overview

laravel-rnx provides Blade directives and helpers that make it easy to:

- Include rnxJS library and stylesheets in your Blade templates
- Create reactive state from Laravel data
- Render rnxJS components with Laravel variables
- Initialize rnxJS plugins (router, toast, storage)
- Bind Laravel data to reactive components with full type safety

## Installation

### Via Composer

```bash
composer require arnelirobles/laravel-rnx
```

The service provider will be automatically discovered by Laravel's package auto-discovery.

### Manual Configuration

If auto-discovery is disabled, add the service provider to your `config/app.php`:

```php
'providers' => [
    // ...
    ArnelIrobles\RnxLaravel\RnxServiceProvider::class,
],
```

### Publish Configuration

Publish the config file to customize rnxJS settings:

```bash
php artisan vendor:publish --provider="ArnelIrobles\RnxLaravel\RnxServiceProvider" --tag="rnx-config"
```

## Quick Start

### 1. Include rnxJS in Your Base Layout

```blade
@extends('layouts.app')

@section('head')
    @rnxScripts(cdn: true, theme: 'bootstrap')
@endsection

@section('content')
    <!-- Your content -->
@endsection
```

### 2. Create Reactive State

Pass Laravel data to rnxJS as reactive state:

```blade
@php
$user = auth()->user();
@endphp

@rnxState(['name' => $user->name, 'email' => $user->email], 'user')

<p>Welcome, <span data-bind="user.name"></span>!</p>
```

### 3. Render Components

Use Blade directives to render rnxJS components:

```blade
@rnxComponent('Button', ['variant' => 'primary', 'label' => 'Save'])
@rnxComponent('Input', ['type' => 'email', 'placeholder' => 'user@example.com'])
@rnxComponent('DataTable', [
    'data' => 'users',
    'columns' => 'columns',
    'sortable' => true,
    'pageable' => true
])
```

## Blade Directives Reference

### @rnxScripts

Include rnxJS library and stylesheets.

**Syntax:**
```blade
@rnxScripts([cdn: true], [theme: 'bootstrap'])
```

**Parameters:**
- `cdn` (bool, default: true) - Use CDN for resources
- `theme` (string, default: 'bootstrap') - Theme variant: 'bootstrap', 'm3', 'plugins', or null

**Example:**
```blade
@rnxScripts(cdn: true, theme: 'm3')
```

### @rnxState

Create reactive state from Laravel data.

**Syntax:**
```blade
@rnxState($data, ['varName' => 'state'])
```

**Parameters:**
- `$data` - PHP array or object to convert to reactive state
- `varName` (string, optional, default: 'state') - Name of the global state variable

**Example:**
```blade
@php
$appData = [
    'user' => auth()->user(),
    'notifications' => $notifications,
    'settings' => config('app')
];
@endphp

@rnxState($appData, 'appState')

<!-- Access reactive state in HTML -->
<span data-bind="appState.user.name"></span>
<span data-bind="appState.user.email"></span>
```

### @rnxComponent

Render rnxJS components with props.

**Syntax:**
```blade
@rnxComponent('ComponentName', [prop1 => value1, prop2 => value2, ...])
```

**Parameters:**
- Component name (string)
- Array of props (optional)

**Features:**
- Automatic string escaping for security
- Support for data binding expressions (state.*)
- Boolean attributes without values
- Numeric attribute values without quotes
- Snake_case to kebab-case conversion

**Examples:**

```blade
<!-- Button component -->
@rnxComponent('Button', ['variant' => 'primary', 'label' => 'Save'])

<!-- Input with binding -->
@rnxComponent('Input', [
    'type' => 'email',
    'placeholder' => 'user@example.com',
    'data_bind' => 'state.email'
])

<!-- DataTable with reactive data -->
@rnxComponent('DataTable', [
    'data' => 'state.users',
    'columns' => 'state.columns',
    'sortable' => true,
    'pageable' => true
])

<!-- Using loop variable -->
@foreach($items as $item)
    @rnxComponent('Card', [
        'title' => $item->title,
        'content' => $item->content,
        'id' => $item->id
    ])
@endforeach
```

### @rnxPlugin

Initialize rnxJS plugins.

**Syntax:**
```blade
@rnxPlugin('plugin_name', [option1 => value1, option2 => value2, ...])
```

**Parameters:**
- Plugin name: 'router', 'toast', or 'storage'
- Plugin-specific configuration options

**Available Plugins:**

#### Router Plugin
Navigate between pages with hash-based routing.

```blade
@rnxPlugin('router', ['mode' => 'hash', 'default_route' => '/'])

<!-- Route-specific content visibility -->
<div data-route="/">Home Page</div>
<div data-route="/users">Users Page</div>
```

#### Toast Plugin
Display notifications.

```blade
@rnxPlugin('toast', [
    'position' => 'top-right',
    'duration' => 3000,
    'max_toasts' => 5
])

<script>
    window.rnx.toast.success('Operation completed!');
    window.rnx.toast.error('An error occurred');
    window.rnx.toast.warning('Warning message');
    window.rnx.toast.info('Information');
</script>
```

#### Storage Plugin
Persist state to localStorage/sessionStorage.

```blade
@rnxPlugin('storage', [
    'prefix' => 'myapp_',
    'storage' => 'localStorage'
])

<script>
    // Persist state
    window.rnx.storage.persist(state, 'user_prefs', ['theme', 'language']);

    // Retrieve
    const theme = window.rnx.storage.get('user_prefs_theme');
</script>
```

## Global Helpers

You can also use global PHP helper functions instead of directives:

```php
// In controllers or views
echo rnx_scripts(cdn: true, theme: 'bootstrap');
echo rnx_state($data, 'state');
echo rnx_component('Button', ['label' => 'Click']);
echo rnx_plugin('toast', ['position' => 'top-right']);
```

## Configuration

Publish and edit the configuration file:

```bash
php artisan vendor:publish --provider="ArnelIrobles\RnxLaravel\RnxServiceProvider" --tag="rnx-config"
```

### config/rnx.php

```php
return [
    'cdn' => env('RNX_CDN', true),
    'theme' => env('RNX_THEME', 'bootstrap'),
    'storage' => [
        'driver' => env('RNX_STORAGE_DRIVER', 'localStorage'),
        'prefix' => env('RNX_STORAGE_PREFIX', 'rnx_'),
    ],
    'router' => [
        'mode' => env('RNX_ROUTER_MODE', 'hash'),
        'base' => env('RNX_ROUTER_BASE', '/'),
    ],
    'toast' => [
        'position' => env('RNX_TOAST_POSITION', 'top-right'),
        'duration' => (int) env('RNX_TOAST_DURATION', 3000),
        'max_toasts' => (int) env('RNX_TOAST_MAX', 5),
    ],
];
```

## Complete Example

### resources/views/profile.blade.php

```blade
@extends('layouts.app')

@section('content')
@php
$user = auth()->user();
$appState = [
    'user' => [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
    ],
    'notifications' => $user->notifications()->limit(5)->get()->toArray(),
];
@endphp

@rnxState($appState, 'appState')
@rnxPlugin('toast', ['position' => 'top-right', 'duration' => 3000])

<div class="container">
    <h1 data-bind="appState.user.name"></h1>
    <p data-bind="appState.user.email"></p>

    <div class="profile-card">
        @rnxComponent('Button', [
            'variant' => 'primary',
            'label' => 'Edit Profile',
            'onclick' => 'showEditDialog()'
        ])

        @rnxComponent('Button', [
            'variant' => 'danger',
            'label' => 'Logout',
            'onclick' => 'logout()'
        ])
    </div>

    <div class="notifications-list">
        <h2>Recent Notifications</h2>
        @foreach($appState['notifications'] as $notification)
            @rnxComponent('Card', [
                'title' => $notification['title'] ?? 'Notification',
                'content' => $notification['message'] ?? '',
                'timestamp' => $notification['created_at'] ?? ''
            ])
        @endforeach
    </div>
</div>

<script>
    function logout() {
        window.rnx.toast.info('Logging out...');
        window.location.href = '/logout';
    }

    function showEditDialog() {
        window.rnx.toast.success('Opening edit dialog');
        // Your dialog code here
    }
</script>
@endsection
```

### resources/views/layouts/app.blade.php

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Laravel') }}</title>
    @rnxScripts(cdn: true, theme: 'bootstrap')
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="{{ url('/') }}">{{ config('app.name') }}</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    @guest
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('login') }}">Login</a>
                        </li>
                    @else
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('profile') }}">
                                {{ Auth::user()->name }}
                            </a>
                        </li>
                    @endguest
                </ul>
            </div>
        </div>
    </nav>

    <main>
        @yield('content')
    </main>

    @rnxPlugin('toast', config('rnx.toast'))
</body>
</html>
```

## Security Considerations

### HTML Escaping

All component props and text content are automatically HTML-escaped to prevent XSS attacks:

```blade
<!-- Safe: Will escape < > & quotes -->
@rnxComponent('Button', ['label' => $userInput])
```

### Data Binding Expressions

String values starting with `state.`, `{`, or `[` are preserved without escaping for data binding:

```blade
<!-- Treated as data binding expression -->
@rnxComponent('Div', ['data_content' => 'state.userMessage'])

<!-- Regular string, will be escaped -->
@rnxComponent('Div', ['title' => 'Hello World'])
```

## Testing

Tests are included in the `tests` directory. Run them with PHPUnit:

```bash
php vendor/bin/phpunit
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
- Laravel Blade directives: @rnxScripts, @rnxState, @rnxComponent, @rnxPlugin
- Global helper functions: rnx_scripts(), rnx_state(), rnx_component(), rnx_plugin()
- Bootstrap 5.3+ support
- Plugin integration (router, toast, storage)
- Configuration publishing
- Full test coverage
- Type-safe component rendering
