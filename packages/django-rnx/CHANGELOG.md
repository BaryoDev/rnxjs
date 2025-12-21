# Changelog

All notable changes to django-rnx will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024

### Added

- Initial release
- Django template tags for rnxJS integration:
  - `{% rnx_scripts %}` - Include rnxJS library and stylesheets
  - `{% rnx_state %}` - Create reactive state from Django context
  - `{% rnx_component %}` - Render rnxJS components
  - `{% rnx_plugin %}` - Initialize rnxJS plugins
  - `{% rnx_form %}` - Render Django forms as components
  - `{{ key|to_data_bind }}` - Convert to data-bind attribute
  - `{{ rules|to_data_rule }}` - Convert to data-rule attribute
- Support for Bootstrap 5.3+ themes
- Plugin integration (router, toast, storage)
- Example Django application with multiple demonstrations
- Comprehensive test coverage
- Full documentation with examples
- Security features (HTML escaping, XSS prevention)
- Support for Python 3.8+ and Django 3.2+

[1.0.0]: https://github.com/arnelirobles/rnxjs/releases/tag/v1.0.0
