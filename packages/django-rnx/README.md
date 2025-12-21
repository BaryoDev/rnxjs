# django-rnx

Django template tags and utilities for integrating [rnxJS](https://github.com/arnelirobles/rnxjs) reactive components into Django applications.

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

## Overview

django-rnx provides a collection of Django template tags that make it easy to:

- Include rnxJS library and stylesheets in your templates
- Create reactive state from Django context variables
- Render rnxJS components with Django template variables
- Initialize rnxJS plugins (router, toast, storage)
- Render Django forms as rnxJS components
- Bind Django context data to reactive components

## Installation

### From PyPI (Coming Soon)

```bash
pip install django-rnx
```

### Development Installation

```bash
git clone https://github.com/arnelirobles/rnxjs.git
cd rnxjs/packages/django-rnx
pip install -e .
```

## Quick Start

### 1. Add to Django Apps

Add `django_rnx` to your Django `INSTALLED_APPS`:

```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django_rnx',  # Add this line
    'your_app',
]
```

### 2. Load Template Tags

In your Django templates, load the rnx template tags:

```django
{% load rnx %}
```

### 3. Include rnxJS Scripts

Include the rnxJS library and Bootstrap CSS in your base template:

```django
{% rnx_scripts cdn=True theme='bootstrap' %}
```

Options:
- `cdn` (bool, default: True) - Use CDN links instead of local files
- `theme` (str, default: 'bootstrap') - Theme to include: 'bootstrap', 'm3', 'plugins', or None

### 4. Create Reactive State

Pass Django context variables to rnxJS as reactive state:

```django
{% rnx_state user_data 'state' %}

<p>Welcome, <span data-bind="state.name"></span>!</p>
```

## Template Tags Reference

### rnx_scripts

Include rnxJS library and stylesheets.

**Syntax:**
```django
{% rnx_scripts [cdn=True] [theme='bootstrap'] %}
```

**Parameters:**
- `cdn` (bool, optional, default: True) - Use CDN for resources
- `theme` (str, optional, default: 'bootstrap') - Theme variant: 'bootstrap', 'm3', 'plugins', or None

**Example:**
```django
{% rnx_scripts cdn=True theme='m3' %}
```

### rnx_state

Create reactive state from Django context data.

**Syntax:**
```django
{% rnx_state data [var_name='state'] %}
```

**Parameters:**
- `data` - Django context variable to convert to reactive state
- `var_name` (str, optional, default: 'state') - Name of the global state variable

**Example:**
```django
{% rnx_state user_data 'appState' %}

<!-- Access reactive state in HTML -->
<span data-bind="appState.name"></span>
<span data-bind="appState.email"></span>
```

**View Example:**
```python
def profile(request):
    context = {
        'user_data': {
            'name': 'John Doe',
            'email': 'john@example.com',
            'profile': {
                'bio': 'Software Developer',
                'location': 'USA'
            }
        }
    }
    return render(request, 'profile.html', context)
```

### rnx_component

Render rnxJS components with props.

**Syntax:**
```django
{% rnx_component 'ComponentName' [prop1=value1] [prop2=value2] ... %}
```

**Parameters:**
- Component name (string)
- Arbitrary keyword arguments converted to component props
- Snake_case props automatically converted to kebab-case

**Features:**
- Automatic string escaping for security
- Support for data binding expressions (state.*)
- Boolean attributes without values
- Numeric attribute values without quotes

**Examples:**

```django
<!-- Button component -->
{% rnx_component 'Button' variant='primary' label='Save' %}

<!-- Input with binding -->
{% rnx_component 'Input' type='email' placeholder='user@example.com' data_bind='state.email' %}

<!-- DataTable with reactive data -->
{% rnx_component 'DataTable' data='state.users' columns='state.columns' sortable=true pageable=true %}

<!-- Nested props with snake_case to kebab-case conversion -->
{% rnx_component 'Card' title='User Profile' show_footer=true %}
```

### rnx_plugin

Initialize rnxJS plugins.

**Syntax:**
```django
{% rnx_plugin 'plugin_name' [option1=value1] [option2=value2] ... %}
```

**Parameters:**
- Plugin name: 'router', 'toast', or 'storage'
- Plugin-specific configuration options

**Available Plugins:**

#### Router Plugin
Navigate between pages with hash-based routing.

```django
{% rnx_plugin 'router' mode='hash' default_route='/' routes=routes %}

<!-- Route-specific content visibility -->
<div data-route="/">Home Page</div>
<div data-route="/users">Users Page</div>
```

#### Toast Plugin
Display notifications.

```django
{% rnx_plugin 'toast' position='top-right' duration=3000 max_toasts=5 %}

<script>
    window.rnx.toast.success('Operation completed!');
    window.rnx.toast.error('An error occurred');
    window.rnx.toast.warning('Warning message');
    window.rnx.toast.info('Information');
</script>
```

#### Storage Plugin
Persist state to localStorage/sessionStorage.

```django
{% rnx_plugin 'storage' prefix='myapp_' storage='localStorage' %}

<script>
    // Persist state
    window.rnx.storage.persist(state, 'user_prefs', ['theme', 'language']);

    // Retrieve
    const theme = window.rnx.storage.get('user_prefs_theme');
</script>
```

### rnx_form

Render a Django form using rnxJS components.

**Syntax:**
```django
{% rnx_form form [fields='field1,field2'] %}
```

**Parameters:**
- `form` - Django form instance
- `fields` (str, optional) - Comma-separated list of field names to render

**Example:**
```django
{% load rnx %}

<form method="post">
    {% csrf_token %}
    {% rnx_form form %}
    <button type="submit">Save</button>
</form>

<!-- Or render specific fields -->
{% rnx_form form fields='name,email,message' %}
```

## Filters

### to_data_bind

Convert a key to rnxJS data-bind attribute format.

**Syntax:**
```django
{{ key|to_data_bind }}
```

**Example:**
```django
{{ 'user.profile.name'|to_data_bind }}
<!-- Output: data-bind="user.profile.name" -->
```

### to_data_rule

Convert validation rules to rnxJS data-rule attribute format.

**Syntax:**
```django
{{ rules|to_data_rule }}
```

**Example:**
```django
{{ 'required|email|maxlength:100'|to_data_rule }}
<!-- Output: data-rule="required|email|maxlength:100" -->
```

## Complete Example

### views.py

```python
from django.shortcuts import render
from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)


def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process form...
            return render(request, 'contact_success.html')
    else:
        form = ContactForm()

    context = {
        'form': form,
        'app_state': {
            'page_title': 'Contact Us',
            'notification': 'Questions? We\'d love to hear from you!',
            'routes': {
                '/': 'Home',
                '/contact': 'Contact',
                '/about': 'About',
            }
        }
    }
    return render(request, 'contact.html', context)
```

### contact.html

```django
{% extends "base.html" %}
{% load rnx %}

{% block content %}
    {% rnx_state app_state 'appState' %}
    {% rnx_plugin 'toast' position='top-right' %}

    <h1 data-bind="appState.page_title"></h1>
    <p data-bind="appState.notification"></p>

    <form method="post">
        {% csrf_token %}
        {% rnx_form form %}
        {% rnx_component 'Button' type='submit' variant='primary' label='Send Message' %}
    </form>

    <script>
        document.querySelector('form').addEventListener('submit', function(e) {
            window.rnx.toast.success('Thank you! Your message has been sent.');
        });
    </script>
{% endblock %}
```

### base.html

```django
{% load rnx %}
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    {% rnx_scripts cdn=True theme='bootstrap' %}
</head>
<body>
    {% block content %}{% endblock %}
</body>
</html>
```

## Running the Example App

A complete example Django application is included:

```bash
cd example_app
pip install django

# Run migrations (if any)
python manage.py migrate

# Start development server
python manage.py runserver

# Visit http://localhost:8000
```

The example demonstrates:
- Reactive state binding
- Component rendering
- Form integration
- Plugin usage (router, toast, storage)
- Data tables and lists
- Event handling

## Security Considerations

### HTML Escaping

All component props and text content are automatically HTML-escaped to prevent XSS attacks:

```django
<!-- Safe: Will escape < > & quotes -->
{% rnx_component 'Button' label=user_input %}
```

### Data Binding Expressions

String values starting with `state.`, `{`, or `[` are preserved without escaping for data binding:

```django
<!-- Treated as data binding expression -->
{% rnx_component 'Div' data_content='state.userMessage' %}

<!-- Regular string, will be escaped -->
{% rnx_component 'Div' title='Hello World' %}
```

### Template Tags

All template tags use Django's `mark_safe()` only after proper escaping and validation.

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
- Django template tags: rnx_scripts, rnx_state, rnx_component, rnx_plugin, rnx_form
- Filters: to_data_bind, to_data_rule
- Bootstrap 5.3+ support
- Plugin integration (router, toast, storage)
- Example Django application
- Full test coverage
