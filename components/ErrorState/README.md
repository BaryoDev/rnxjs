# ErrorState

A component for displaying error messages with optional error details and retry action.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { ErrorState } from '@arnelirobles/rnxjs';

const error = ErrorState({
    icon: 'bi-exclamation-triangle',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    actionLabel: 'Try Again',
    onAction: () => {
        // Retry logic
    }
});

document.getElementById('app').appendChild(error);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | `'bi-exclamation-triangle'` | Bootstrap Icon class |
| `title` | string | required | Error title |
| `message` | string | required | Error message |
| `error` | Error\|string | null | Error object or details to display |
| `showDetails` | boolean | `false` | Initially show error details |
| `actionLabel` | string | null | Retry button label |
| `onAction` | Function | null | Callback on retry |
| `className` | string | `''` | Additional CSS classes |

## Examples

### Basic Error

```javascript
ErrorState({
    title: 'Error Loading Data',
    message: 'Failed to load your data. Please refresh the page.'
})
```

### With Retry Action

```javascript
ErrorState({
    icon: 'bi-exclamation-circle',
    title: 'Connection Error',
    message: 'Unable to connect to the server.',
    actionLabel: 'Retry',
    onAction: () => {
        reloadData();
    }
})
```

### With Error Details

```javascript
ErrorState({
    title: 'Request Failed',
    message: 'An error occurred while processing your request.',
    error: new Error('Network timeout: Connection refused'),
    actionLabel: 'Try Again',
    onAction: () => {
        retryRequest();
    }
})
```

### Network Error

```javascript
ErrorState({
    icon: 'bi-wifi-off',
    title: 'No Connection',
    message: 'Please check your internet connection and try again.',
    error: 'Network: ERR_INTERNET_DISCONNECTED',
    actionLabel: 'Retry',
    onAction: () => {
        location.reload();
    }
})
```

### API Error

```javascript
fetch('/api/data')
    .then(res => {
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .catch(error => {
        return ErrorState({
            title: 'Failed to Load Data',
            message: 'The server returned an error.',
            error: error.message,
            actionLabel: 'Retry',
            onAction: () => {
                // Retry fetch
            }
        });
    });
```

### Permission Error

```javascript
ErrorState({
    icon: 'bi-lock',
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    error: '403 Forbidden'
})
```

### File Upload Error

```javascript
ErrorState({
    icon: 'bi-exclamation-square',
    title: 'Upload Failed',
    message: 'Your file could not be uploaded.',
    error: 'File size exceeds maximum limit (10MB)',
    actionLabel: 'Try Again',
    onAction: () => {
        fileInput.click();
    }
})
```

### Form Validation Error

```javascript
ErrorState({
    icon: 'bi-exclamation-diamond',
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    error: 'Required fields: email, phone',
    showDetails: true,
    actionLabel: 'Back to Form',
    onAction: () => {
        form.scrollIntoView();
    }
})
```

## Error Details

Error details can be toggled to show/hide technical information:

```javascript
const error = ErrorState({
    title: 'Failed',
    message: 'Something went wrong',
    error: {
        name: 'ValidationError',
        message: 'Invalid email format',
        code: 'ERR_INVALID_EMAIL'
    },
    showDetails: false
});

// User can click to show details
```

## Styling

The component uses Bootstrap alert styles with custom error styling:

```css
/* Container */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
}

/* Icon */
.error-state-icon {
    font-size: 48px;
    color: #721c24;
    margin-bottom: 1rem;
    opacity: 0.8;
}

/* Title */
.error-state-title {
    font-size: 18px;
    font-weight: 600;
    color: #721c24;
    margin-bottom: 0.5rem;
}

/* Message */
.error-state-message {
    font-size: 14px;
    color: #721c24;
    margin-bottom: 1rem;
}

/* Details */
.error-details {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 12px;
    margin: 1rem 0;
    font-family: monospace;
    font-size: 12px;
    color: #856404;
    max-height: 200px;
    overflow-y: auto;
    text-align: left;
}

/* Toggle button */
.error-details-toggle {
    background: none;
    border: none;
    color: #721c24;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    margin-top: 0.5rem;
}
```

## Patterns

### Conditional Error Display

```javascript
async function loadData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return renderData(data);
    } catch (error) {
        return ErrorState({
            title: 'Failed to Load',
            message: 'Could not retrieve your data.',
            error: error.message,
            actionLabel: 'Try Again',
            onAction: () => loadData()
        });
    }
}
```

### Error with Fallback

```javascript
function renderWithErrorHandling(content) {
    if (content.error) {
        return ErrorState({
            title: content.error.title || 'Error',
            message: content.error.message,
            error: content.error.details,
            actionLabel: content.error.retryLabel,
            onAction: content.error.retry
        });
    }

    return content.data;
}
```

### Progressive Error Handling

```javascript
let attempts = 0;
const MAX_ATTEMPTS = 3;

async function fetchWithRetry() {
    try {
        const data = await fetchData();
        return renderData(data);
    } catch (error) {
        attempts++;

        if (attempts >= MAX_ATTEMPTS) {
            return ErrorState({
                title: 'Connection Failed',
                message: `Failed after ${MAX_ATTEMPTS} attempts.`,
                error: error.message
            });
        }

        return ErrorState({
            title: 'Temporary Error',
            message: `Attempt ${attempts}/${MAX_ATTEMPTS} failed.`,
            actionLabel: 'Retry',
            onAction: () => fetchWithRetry()
        });
    }
}
```

### Different Error Types

```javascript
function handleError(error) {
    if (error instanceof NetworkError) {
        return ErrorState({
            icon: 'bi-wifi-off',
            title: 'Network Error',
            message: 'Check your internet connection.',
            error: error.message
        });
    }

    if (error instanceof AuthError) {
        return ErrorState({
            icon: 'bi-lock',
            title: 'Authentication Failed',
            message: 'Please log in and try again.',
            actionLabel: 'Login',
            onAction: () => window.location.href = '/login'
        });
    }

    return ErrorState({
        title: 'Error',
        message: 'An unexpected error occurred.',
        error: error.message
    });
}
```

## Accessibility

- **Semantic Structure**: Uses proper heading and paragraph elements
- **Icon**: Bootstrap Icons are decorative
- **Color Not Only**: Error communicated via icon and text
- **Focus Management**: Action button is keyboard accessible
- **Error Details**: Toggle provides expandable technical info

## Performance Notes

- Lightweight component
- Minimal DOM elements
- No external dependencies
- Efficient error detail toggling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [EmptyState](../EmptyState/) - No data display
- [Skeleton](../Skeleton/) - Loading placeholder
- [Alert](../Alert/) - Inline alert messages
- [Toast](../Toast/) - Notification messages

## Tips & Tricks

### Error Logging

```javascript
ErrorState({
    title: 'Error',
    message: 'Something went wrong',
    error: error,
    onAction: () => {
        // Log to error tracking service
        logError({
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        });

        // Retry
        retry();
    }
})
```

### User-Friendly Messages

```javascript
function getUserFriendlyError(error) {
    const messages = {
        'ERR_INVALID_EMAIL': 'Please enter a valid email address',
        'ERR_PASSWORD_SHORT': 'Password must be at least 8 characters',
        'ERR_USERNAME_TAKEN': 'This username is already taken',
        'NETWORK_TIMEOUT': 'The request took too long. Please try again.',
        'SERVER_ERROR': 'The server encountered an error. Please try again later.'
    };

    return messages[error.code] || error.message;
}

ErrorState({
    title: 'Validation Failed',
    message: getUserFriendlyError(error),
    error: error.details,
    actionLabel: 'Try Again',
    onAction: () => retry()
})
```

### Error with Stack Trace (Development)

```javascript
function showErrorWithDebug(error) {
    const isDev = process.env.NODE_ENV === 'development';

    return ErrorState({
        title: error.title || 'Error',
        message: error.message,
        error: isDev ? error.stack : null,
        showDetails: isDev,
        actionLabel: 'Close',
        onAction: () => {
            // Handle close
        }
    });
}
```

### Retry with Exponential Backoff

```javascript
let attempt = 0;
const MAX_ATTEMPTS = 5;

function retryWithBackoff(fn) {
    if (attempt >= MAX_ATTEMPTS) {
        return ErrorState({
            title: 'Failed',
            message: `Failed after ${MAX_ATTEMPTS} attempts.`
        });
    }

    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
    attempt++;

    setTimeout(() => {
        try {
            fn();
        } catch (error) {
            retryWithBackoff(fn);
        }
    }, delay);
}
```
