"""Views demonstrating rnxJS template tags."""
from django import forms
from django.shortcuts import render


class ContactForm(forms.Form):
    """Example form for contact page."""
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)
    subscribe = forms.BooleanField(required=False)


def index(request):
    """Index page with reactive state example."""
    context = {
        'user': {
            'name': 'John Doe',
            'email': 'john@example.com',
            'role': 'admin'
        },
        'notifications': [
            {'id': 1, 'text': 'Welcome to rnxJS!', 'type': 'info'},
            {'id': 2, 'text': 'You have 3 new messages', 'type': 'success'},
        ]
    }
    return render(request, 'index.html', context)


def form_example(request):
    """Form example showing rnx_form usage."""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            return render(request, 'form_success.html', {
                'name': form.cleaned_data['name']
            })
    else:
        form = ContactForm()

    return render(request, 'form.html', {'form': form})


def components_example(request):
    """Components example showing various rnxJS components."""
    context = {
        'users': [
            {'id': 1, 'name': 'Alice', 'email': 'alice@example.com', 'status': 'active'},
            {'id': 2, 'name': 'Bob', 'email': 'bob@example.com', 'status': 'inactive'},
            {'id': 3, 'name': 'Charlie', 'email': 'charlie@example.com', 'status': 'active'},
        ],
        'columns': [
            {'key': 'id', 'label': 'ID'},
            {'key': 'name', 'label': 'Name'},
            {'key': 'email', 'label': 'Email'},
            {'key': 'status', 'label': 'Status'},
        ]
    }
    return render(request, 'components.html', context)


def plugins_example(request):
    """Plugins example showing router, toast, and storage."""
    context = {
        'routes': {
            '/': 'Home',
            '/users': 'Users',
            '/settings': 'Settings',
            '/about': 'About',
        }
    }
    return render(request, 'plugins.html', context)
