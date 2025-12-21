"""
rnxJS Django Template Tags

Provides template tags for integrating rnxJS into Django templates.

Usage:
    {% load rnx %}

    # Include rnxJS CDN scripts
    {% rnx_scripts %}

    # Create reactive state from Django context
    {% rnx_state user_data 'state' %}

    # Render a component
    {% rnx_component 'Button' variant='primary' label='Save' %}
"""

from django import template
from django.utils.safestring import mark_safe
from django.utils.html import escape
import json

register = template.Library()


@register.simple_tag
def rnx_scripts(cdn=True, theme='bootstrap'):
    """
    Include rnxJS library and Bootstrap CSS.

    Args:
        cdn (bool): Use CDN links (default: True)
        theme (str): Theme to include: 'bootstrap' (default), 'm3', or None

    Usage:
        {% rnx_scripts %}
        {% rnx_scripts cdn=False theme='m3' %}
    """
    if cdn:
        scripts = '''<!-- rnxJS from CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>'''

        if theme == 'm3':
            scripts += '\n<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">'
        elif theme == 'plugins':
            scripts += '\n<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/plugins.css" rel="stylesheet">'

        return mark_safe(scripts)
    else:
        # For local serving, reference static files
        scripts = '''<!-- rnxJS from static files -->
<link href="{% static 'css/bootstrap.min.css' %}" rel="stylesheet">
<link href="{% static 'css/bootstrap-icons.min.css' %}" rel="stylesheet">
<script src="{% static 'js/rnx.global.js' %}"></script>'''

        if theme == 'm3':
            scripts += '\n<link href="{% static \'css/bootstrap-m3-theme.css\' %}" rel="stylesheet">'
        elif theme == 'plugins':
            scripts += '\n<link href="{% static \'css/plugins.css\' %}" rel="stylesheet">'

        return mark_safe(scripts)


@register.simple_tag
def rnx_state(data, var_name='state'):
    """
    Create a reactive state from Django context data.

    Converts Python data to JSON and initializes rnxJS reactive state.

    Args:
        data: Python object to convert to state
        var_name (str): Variable name for the state (default: 'state')

    Usage:
        {% rnx_state user_data 'state' %}
        {% rnx_state users 'appState' %}

    Then in your template:
        <span data-bind="state.name"></span>
    """
    try:
        json_data = json.dumps(data, default=str)
    except (TypeError, ValueError) as e:
        return f'<script>console.error("rnxJS: Failed to serialize state: {e}")</script>'

    script = f'''<script>
// Initialize reactive state from Django context
const {var_name} = rnx.createReactiveState({json_data});
rnx.loadComponents(document.body, {var_name});
</script>'''

    return mark_safe(script)


@register.simple_tag
def rnx_component(name, **kwargs):
    """
    Render an rnxJS component with props.

    Converts Python keyword arguments to HTML attributes.

    Args:
        name (str): Component name (e.g., 'Button', 'Input', 'DataTable')
        **kwargs: Component props

    Usage:
        {% rnx_component 'Button' variant='primary' label='Save' %}
        {% rnx_component 'Input' label='Email' placeholder='user@example.com' %}
        {% rnx_component 'DataTable' data='state.users' columns='state.columns' %}

    Returns:
        str: HTML component tag
    """
    # Build attributes from kwargs
    attrs = []
    for key, value in kwargs.items():
        # Convert Python naming (snake_case) to kebab-case (HTML attributes)
        attr_name = key.replace('_', '-')

        # Quote string values, leave others as-is (for data binding like data="state.users")
        if isinstance(value, bool):
            if value:
                attrs.append(f'{attr_name}')
            continue
        elif isinstance(value, str) and (value.startswith('state.') or value.startswith('{') or value.startswith('[')):
            # Likely a data binding or expression, don't quote
            attrs.append(f'{attr_name}="{value}"')
        elif isinstance(value, (int, float)):
            attrs.append(f'{attr_name}={value}')
        else:
            # Quote and escape string values
            escaped = escape(str(value))
            attrs.append(f'{attr_name}="{escaped}"')

    attrs_str = ' '.join(attrs)
    if attrs_str:
        attrs_str = ' ' + attrs_str

    component = f'<{name}{attrs_str}></{name}>'
    return mark_safe(component)


@register.simple_tag
def rnx_plugin(name, **options):
    """
    Initialize an rnxJS plugin.

    Args:
        name (str): Plugin name ('router', 'toast', 'storage')
        **options: Plugin configuration options

    Usage:
        {% rnx_plugin 'toast' position='top-right' duration=3000 %}
        {% rnx_plugin 'router' mode='hash' %}
        {% rnx_plugin 'storage' prefix='myapp_' %}

    Returns:
        str: JavaScript code to initialize plugin
    """
    try:
        options_json = json.dumps(options, default=str)
    except (TypeError, ValueError) as e:
        return f'<script>console.error("rnxJS: Failed to serialize plugin options: {e}")</script>'

    script = f'''<script>
// Initialize rnxJS plugin: {name}
if (window.rnx && window.rnx.plugins) {{
  try {{
    const plugin = rnx.{name}Plugin ? rnx.{name}Plugin({options_json}) : null;
    if (plugin) {{
      rnx.plugins.use(plugin);
    }}
  }} catch (e) {{
    console.error('[rnxJS] Failed to initialize {name} plugin:', e);
  }}
}}
</script>'''

    return mark_safe(script)


@register.inclusion_tag('rnx/form.html')
def rnx_form(form, fields=None, **kwargs):
    """
    Render a Django form as rnxJS components.

    Args:
        form: Django form instance
        fields (list): List of field names to render (default: all)
        **kwargs: Additional options

    Usage:
        {% rnx_form form %}
        {% rnx_form form fields='username,email,password' %}

    Returns:
        dict: Context for template rendering
    """
    if fields:
        if isinstance(fields, str):
            fields = [f.strip() for f in fields.split(',')]
    else:
        fields = [field.name for field in form]

    form_fields = []
    for field_name in fields:
        field = form[field_name]
        form_fields.append({
            'name': field_name,
            'label': field.label,
            'field': field,
            'error': field.errors.as_text() if field.errors else None,
            'type': field.field.widget.__class__.__name__
        })

    return {
        'form': form,
        'form_fields': form_fields,
        **kwargs
    }


@register.filter
def to_data_bind(key):
    """
    Convert a key to rnxJS data-bind format.

    Usage:
        {{ 'user.name'|to_data_bind }}
        <!-- Output: data-bind="user.name" -->
    """
    return mark_safe(f'data-bind="{escape(key)}"')


@register.filter
def to_data_rule(rules):
    """
    Convert validation rules to rnxJS data-rule format.

    Usage:
        {{ 'required|email'|to_data_rule }}
        <!-- Output: data-rule="required|email" -->
    """
    if isinstance(rules, (list, tuple)):
        rules_str = '|'.join(rules)
    else:
        rules_str = str(rules)

    return mark_safe(f'data-rule="{escape(rules_str)}"')
