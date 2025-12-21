"""App configuration for example_app."""
from django.apps import AppConfig


class ExampleAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'example_app'
