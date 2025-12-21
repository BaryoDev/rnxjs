"""
django-rnx: Django integration for rnxJS

Provides template tags and utilities for using rnxJS reactive components
in Django templates.

Usage:
    {% load rnx %}

    # Include rnxJS scripts
    {% rnx_scripts %}

    # Create reactive state
    {% rnx_state user_data 'state' %}

    # Use components
    <DataTable data="state.users" />
"""

__version__ = "1.0.0"
__author__ = "Arnel Isiderio Robles"
__license__ = "MPL-2.0"


def default_app_config():
    return "django_rnx.apps.DjangoRnxConfig"
