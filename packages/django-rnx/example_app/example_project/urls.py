"""
URL configuration for example_project.
"""
from django.urls import path
from example_app import views

urlpatterns = [
    path('', views.index, name='index'),
    path('form/', views.form_example, name='form'),
    path('components/', views.components_example, name='components'),
    path('plugins/', views.plugins_example, name='plugins'),
]
