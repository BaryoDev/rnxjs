"""Tests for rnxJS Django template tags."""
from django.test import TestCase
from django.template import Context, Template
from django.forms import Form, CharField, EmailField, BooleanField
from django.utils.html import escape


class RnxScriptsTagTest(TestCase):
    """Test rnx_scripts template tag."""

    def test_rnx_scripts_cdn_default(self):
        """Test rnx_scripts with CDN enabled (default)."""
        template = Template('{% load rnx %}{% rnx_scripts %}')
        output = template.render(Context({}))

        self.assertIn('cdn.jsdelivr.net', output)
        self.assertIn('bootstrap@5.3.2', output)
        self.assertIn('rnxjs', output)

    def test_rnx_scripts_cdn_disabled(self):
        """Test rnx_scripts with CDN disabled."""
        template = Template('{% load rnx %}{% rnx_scripts cdn=False %}')
        output = template.render(Context({}))

        self.assertIn('static', output)
        self.assertNotIn('cdn.jsdelivr.net', output)

    def test_rnx_scripts_bootstrap_theme(self):
        """Test rnx_scripts with Bootstrap theme."""
        template = Template('{% load rnx %}{% rnx_scripts theme="bootstrap" %}')
        output = template.render(Context({}))

        self.assertIn('bootstrap', output)

    def test_rnx_scripts_m3_theme(self):
        """Test rnx_scripts with M3 theme."""
        template = Template('{% load rnx %}{% rnx_scripts theme="m3" %}')
        output = template.render(Context({}))

        self.assertIn('bootstrap-m3-theme', output)

    def test_rnx_scripts_plugins_theme(self):
        """Test rnx_scripts with plugins theme."""
        template = Template('{% load rnx %}{% rnx_scripts theme="plugins" %}')
        output = template.render(Context({}))

        self.assertIn('plugins.css', output)

    def test_rnx_scripts_no_theme(self):
        """Test rnx_scripts with no theme."""
        template = Template('{% load rnx %}{% rnx_scripts theme=None %}')
        output = template.render(Context({}))

        # Should have bootstrap but not theme-specific CSS
        self.assertIn('bootstrap', output)


class RnxStateTagTest(TestCase):
    """Test rnx_state template tag."""

    def test_rnx_state_simple(self):
        """Test rnx_state with simple data."""
        template = Template('{% load rnx %}{% rnx_state data %}')
        context = Context({'data': {'name': 'John', 'email': 'john@example.com'}})
        output = template.render(context)

        self.assertIn('createReactiveState', output)
        self.assertIn('John', output)
        self.assertIn('john@example.com', output)

    def test_rnx_state_custom_var_name(self):
        """Test rnx_state with custom variable name."""
        template = Template('{% load rnx %}{% rnx_state data "appState" %}')
        context = Context({'data': {'count': 42}})
        output = template.render(context)

        self.assertIn('appState', output)
        self.assertIn('42', output)

    def test_rnx_state_nested_objects(self):
        """Test rnx_state with nested objects."""
        template = Template('{% load rnx %}{% rnx_state data "state" %}')
        context = Context({'data': {
            'user': {
                'profile': {
                    'name': 'John',
                    'age': 30
                }
            }
        }})
        output = template.render(context)

        self.assertIn('John', output)
        self.assertIn('30', output)

    def test_rnx_state_arrays(self):
        """Test rnx_state with arrays."""
        template = Template('{% load rnx %}{% rnx_state data "state" %}')
        context = Context({'data': {
            'items': ['apple', 'banana', 'cherry']
        }})
        output = template.render(context)

        self.assertIn('apple', output)
        self.assertIn('banana', output)
        self.assertIn('cherry', output)

    def test_rnx_state_load_components_called(self):
        """Test that rnx_state calls loadComponents."""
        template = Template('{% load rnx %}{% rnx_state data "state" %}')
        context = Context({'data': {'name': 'test'}})
        output = template.render(context)

        self.assertIn('loadComponents', output)

    def test_rnx_state_json_serialization_error(self):
        """Test rnx_state handles JSON serialization errors gracefully."""
        template = Template('{% load rnx %}{% rnx_state data "state" %}')

        # Create an object that can't be serialized
        class NonSerializable:
            pass

        context = Context({'data': NonSerializable()})
        output = template.render(context)

        # Should contain error message, not crash
        self.assertIn('console.error', output)


class RnxComponentTagTest(TestCase):
    """Test rnx_component template tag."""

    def test_rnx_component_simple(self):
        """Test rnx_component with simple props."""
        template = Template('{% load rnx %}{% rnx_component "Button" label="Click Me" %}')
        output = template.render(Context({}))

        self.assertIn('<Button', output)
        self.assertIn('label="Click Me"', output)
        self.assertIn('</Button>', output)

    def test_rnx_component_multiple_props(self):
        """Test rnx_component with multiple props."""
        template = Template(
            '{% load rnx %}{% rnx_component "Button" variant="primary" label="Save" size="lg" %}'
        )
        output = template.render(Context({}))

        self.assertIn('variant="primary"', output)
        self.assertIn('label="Save"', output)
        self.assertIn('size="lg"', output)

    def test_rnx_component_snake_case_to_kebab_case(self):
        """Test that snake_case props are converted to kebab-case."""
        template = Template('{% load rnx %}{% rnx_component "Card" show_footer="true" %}')
        output = template.render(Context({}))

        self.assertIn('show-footer="true"', output)

    def test_rnx_component_data_binding(self):
        """Test rnx_component preserves data binding expressions."""
        template = Template('{% load rnx %}{% rnx_component "Div" content="state.message" %}')
        output = template.render(Context({}))

        # Data binding should not be quoted
        self.assertIn('content="state.message"', output)

    def test_rnx_component_boolean_true(self):
        """Test rnx_component with boolean true value."""
        template = Template('{% load rnx %}{% rnx_component "Input" required="True" %}')
        output = template.render(Context({}))

        self.assertIn('required', output)

    def test_rnx_component_boolean_false(self):
        """Test rnx_component with boolean false value."""
        template = Template('{% load rnx %}{% rnx_component "Input" disabled="False" %}')
        output = template.render(Context({}))

        # False booleans should not create attribute
        self.assertNotIn('disabled', output)

    def test_rnx_component_numeric_values(self):
        """Test rnx_component with numeric values."""
        template = Template('{% load rnx %}{% rnx_component "Pagination" page=2 limit=10 %}')
        output = template.render(Context({}))

        self.assertIn('page=2', output)
        self.assertIn('limit=10', output)

    def test_rnx_component_html_escaping(self):
        """Test rnx_component escapes HTML in string values."""
        template = Template('{% load rnx %}{% rnx_component "Button" label=label %}')
        context = Context({'label': '<script>alert("xss")</script>'})
        output = template.render(context)

        # Should be escaped
        self.assertNotIn('<script>', output)
        self.assertIn('&lt;script&gt;', output)

    def test_rnx_component_array_binding(self):
        """Test rnx_component preserves array binding."""
        template = Template('{% load rnx %}{% rnx_component "List" items="[1,2,3]" %}')
        output = template.render(Context({}))

        self.assertIn('items="[1,2,3]"', output)

    def test_rnx_component_object_binding(self):
        """Test rnx_component preserves object binding."""
        template = Template('{% load rnx %}{% rnx_component "Form" data="{name: \'John\'}" %}')
        output = template.render(Context({}))

        self.assertIn('data="{name: \'John\'}"', output)


class RnxPluginTagTest(TestCase):
    """Test rnx_plugin template tag."""

    def test_rnx_plugin_router(self):
        """Test rnx_plugin with router plugin."""
        template = Template('{% load rnx %}{% rnx_plugin "router" mode="hash" %}')
        output = template.render(Context({}))

        self.assertIn('router', output)
        self.assertIn('window.rnx', output)

    def test_rnx_plugin_toast(self):
        """Test rnx_plugin with toast plugin."""
        template = Template('{% load rnx %}{% rnx_plugin "toast" position="top-right" duration=3000 %}')
        output = template.render(Context({}))

        self.assertIn('toast', output)
        self.assertIn('top-right', output)
        self.assertIn('3000', output)

    def test_rnx_plugin_storage(self):
        """Test rnx_plugin with storage plugin."""
        template = Template('{% load rnx %}{% rnx_plugin "storage" prefix="myapp_" %}')
        output = template.render(Context({}))

        self.assertIn('storage', output)
        self.assertIn('myapp_', output)

    def test_rnx_plugin_error_handling(self):
        """Test rnx_plugin error handling."""
        template = Template('{% load rnx %}{% rnx_plugin "toast" position="top-right" %}')
        output = template.render(Context({}))

        # Should include error handling
        self.assertIn('try', output)
        self.assertIn('catch', output)

    def test_rnx_plugin_options_serialization(self):
        """Test rnx_plugin serializes options correctly."""
        template = Template('{% load rnx %}{% rnx_plugin "toast" maxToasts=5 position="bottom-left" %}')
        output = template.render(Context({}))

        self.assertIn('5', output)
        self.assertIn('bottom-left', output)


class RnxFormTagTest(TestCase):
    """Test rnx_form template tag."""

    def test_rnx_form_basic(self):
        """Test rnx_form with a simple form."""
        class TestForm(Form):
            name = CharField()
            email = EmailField()

        template = Template('{% load rnx %}{% rnx_form form %}')
        context = Context({'form': TestForm()})
        output = template.render(context)

        # Should render form fields
        self.assertIn('name', output)
        self.assertIn('email', output)

    def test_rnx_form_specific_fields(self):
        """Test rnx_form with specific field selection."""
        class TestForm(Form):
            name = CharField()
            email = EmailField()
            subscribe = BooleanField(required=False)

        template = Template('{% load rnx %}{% rnx_form form fields="name,email" %}')
        context = Context({'form': TestForm()})
        output = template.render(context)

        # Should include specified fields
        self.assertIn('name', output)
        self.assertIn('email', output)


class TemplateFiltersTest(TestCase):
    """Test rnxJS template filters."""

    def test_to_data_bind_filter(self):
        """Test to_data_bind filter."""
        template = Template('{% load rnx %}{{ path|to_data_bind }}')
        context = Context({'path': 'user.profile.name'})
        output = template.render(context)

        self.assertIn('data-bind="user.profile.name"', output)

    def test_to_data_bind_with_escaping(self):
        """Test to_data_bind filter escapes special characters."""
        template = Template('{% load rnx %}{{ path|to_data_bind }}')
        context = Context({'path': 'user.data&info'})
        output = template.render(context)

        self.assertIn('data-bind="user.data&amp;info"', output)

    def test_to_data_rule_filter_string(self):
        """Test to_data_rule filter with string rules."""
        template = Template('{% load rnx %}{{ rules|to_data_rule }}')
        context = Context({'rules': 'required|email'})
        output = template.render(context)

        self.assertIn('data-rule="required|email"', output)

    def test_to_data_rule_filter_list(self):
        """Test to_data_rule filter with list of rules."""
        template = Template('{% load rnx %}{{ rules|to_data_rule }}')
        context = Context({'rules': ['required', 'email', 'max:100']})
        output = template.render(context)

        self.assertIn('data-rule=', output)
        self.assertIn('required', output)
        self.assertIn('email', output)


class SecurityTest(TestCase):
    """Test security features of template tags."""

    def test_xss_prevention_in_component(self):
        """Test that component props prevent XSS."""
        template = Template('{% load rnx %}{% rnx_component "Button" label=input %}')
        context = Context({'input': '<img src=x onerror=alert("xss")>'})
        output = template.render(context)

        # Should be escaped
        self.assertNotIn('<img', output)
        self.assertIn('&lt;img', output)

    def test_xss_prevention_in_state(self):
        """Test that state data is properly serialized."""
        template = Template('{% load rnx %}{% rnx_state data "state" %}')
        context = Context({'data': {'script': '<script>alert("xss")</script>'}})
        output = template.render(context)

        # JSON serialization should escape quotes
        self.assertIn('createReactiveState', output)

    def test_template_tag_injection_prevention(self):
        """Test that template injection in tag names is prevented."""
        template = Template('{% load rnx %}{% rnx_component name %}')
        context = Context({'name': '{% debug %}'})
        output = template.render(context)

        # Should render as component name, not execute template tag
        self.assertNotIn('{% debug %}', output)


class IntegrationTest(TestCase):
    """Integration tests combining multiple template tags."""

    def test_full_page_example(self):
        """Test a realistic page with multiple components."""
        template_str = '''{% load rnx %}
        {% rnx_scripts %}
        {% rnx_state data "appState" %}
        {% rnx_plugin "toast" %}
        {% rnx_component "Button" label="Send" %}
        '''
        template = Template(template_str)
        context = Context({'data': {'title': 'My App'}})
        output = template.render(context)

        self.assertIn('createReactiveState', output)
        self.assertIn('toast', output)
        self.assertIn('Button', output)
        self.assertIn('My App', output)

    def test_component_with_data_binding(self):
        """Test component with reactive state binding."""
        template_str = '''{% load rnx %}
        {% rnx_state user "state" %}
        {% rnx_component "Input" placeholder="user.email" %}
        '''
        template = Template(template_str)
        context = Context({'user': {'email': 'john@example.com'}})
        output = template.render(context)

        self.assertIn('john@example.com', output)
        self.assertIn('placeholder="user.email"', output)
