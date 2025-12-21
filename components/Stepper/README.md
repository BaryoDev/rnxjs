# Stepper

A multi-step form or process wizard component with horizontal and vertical orientation support.

## Installation

Already included in rnxJS v0.4.0+

## Basic Usage

```javascript
import { Stepper } from '@arnelirobles/rnxjs';

const stepper = Stepper({
    steps: [
        { title: 'Personal Info', content: '<p>Step 1 content</p>' },
        { title: 'Address', content: '<p>Step 2 content</p>' },
        { title: 'Review', content: '<p>Step 3 content</p>' }
    ],
    currentStep: 0,
    onStepChange: (step) => console.log('Step changed:', step)
});

document.body.appendChild(stepper);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | Array | `[]` | Array of step objects with title and content |
| `currentStep` | number | `0` | Initially active step (0-indexed) |
| `orientation` | string | `'horizontal'` | Layout: horizontal or vertical |
| `editable` | boolean | `false` | Allow clicking previous steps to go back |
| `onStepChange` | function | `null` | Callback when step changes |
| `variant` | string | `'default'` | Style variant: default, modern, minimal |

## Step Structure

```javascript
{
    title: 'Step Title',      // Display label
    content: '<div>...</div>'  // HTML content for step
}
```

## Methods

```javascript
const stepper = Stepper({ steps: [...] });

// Get current step index
const current = stepper.getStep();

// Jump to specific step
stepper.setStep(2);

// Navigate to next step
stepper.nextStep();

// Navigate to previous step
stepper.prevStep();

// Check if on last step
stepper.isLastStep();

// Check if on first step
stepper.isFirstStep();

// Get total steps
stepper.getTotalSteps();
```

## Examples

### Horizontal Multi-Step Form

```javascript
Stepper({
    steps: [
        {
            title: 'Personal',
            content: `
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" class="form-control" />
                </div>
            `
        },
        {
            title: 'Address',
            content: `
                <div class="form-group">
                    <label>Street</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-group">
                    <label>City</label>
                    <input type="text" class="form-control" />
                </div>
            `
        },
        {
            title: 'Confirm',
            content: `
                <div class="alert alert-info">
                    <p>Please review your information:</p>
                    <p><strong>Name:</strong> John Doe</p>
                    <p><strong>Address:</strong> 123 Main St</p>
                </div>
            `
        }
    ],
    editable: true,
    onStepChange: (step) => {
        console.log('User is on step:', step.step + 1);
    }
});
```

### Vertical Stepper

```javascript
const stepper = Stepper({
    steps: [
        { title: 'Create Account', content: 'Account creation form...' },
        { title: 'Verify Email', content: 'Email verification...' },
        { title: 'Setup Profile', content: 'Profile setup form...' }
    ],
    orientation: 'vertical',
    currentStep: 0
});

// Navigate with buttons
document.getElementById('nextBtn').addEventListener('click', () => {
    if (!stepper.isLastStep()) {
        stepper.nextStep();
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (!stepper.isFirstStep()) {
        stepper.prevStep();
    }
});
```

### Checkout Flow

```javascript
const stepper = Stepper({
    steps: [
        {
            title: 'Cart Review',
            content: `
                <table class="table">
                    <tr><td>Item 1</td><td>$29.99</td></tr>
                    <tr><td>Item 2</td><td>$49.99</td></tr>
                    <tr><td><strong>Total</strong></td><td><strong>$79.98</strong></td></tr>
                </table>
            `
        },
        {
            title: 'Shipping',
            content: `
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-group">
                    <label>Shipping Method</label>
                    <select class="form-control">
                        <option>Standard (5-7 days)</option>
                        <option>Express (1-2 days)</option>
                        <option>Overnight</option>
                    </select>
                </div>
            `
        },
        {
            title: 'Payment',
            content: `
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" class="form-control" />
                </div>
            `
        },
        {
            title: 'Confirmation',
            content: `
                <div class="alert alert-success">
                    <h4>Order Placed!</h4>
                    <p>Your order #12345 has been confirmed.</p>
                </div>
            `
        }
    ],
    editable: false
});
```

## Styling

```css
.stepper {
    width: 100%;
}

.stepper-horizontal {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.stepper-steps {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stepper-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    position: relative;
}

.stepper-step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
}

.stepper-step-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e0e0e0;
    border: 2px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #666;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.stepper-step.active .stepper-step-indicator {
    background-color: #0b57d0;
    border-color: #0b57d0;
    color: white;
}

.stepper-step.completed .stepper-step-indicator {
    background-color: #0f9e6e;
    border-color: #0f9e6e;
    color: white;
}

.stepper-step-title {
    font-weight: 500;
    color: #666;
    font-size: 0.95rem;
}

.stepper-step.active .stepper-step-title {
    color: #0b57d0;
    font-weight: 600;
}

.stepper-step.completed .stepper-step-title {
    color: #0f9e6e;
}

.stepper-connector {
    flex: 1;
    height: 2px;
    background-color: #e0e0e0;
    margin: 0 0.5rem;
}

.stepper-step.completed ~ .stepper-step .stepper-connector,
.stepper-step.completed .stepper-connector {
    background-color: #0f9e6e;
}

.stepper-content {
    padding: 2rem 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
}

/* Vertical Stepper */
.stepper-vertical {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.stepper-vertical .stepper-step {
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
    position: relative;
    padding: 1.5rem 0;
}

.stepper-vertical .stepper-step-header {
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
}

.stepper-vertical .stepper-content {
    flex: 1;
    padding: 1rem;
}

.stepper-connector-vertical {
    position: absolute;
    left: 20px;
    top: 60px;
    bottom: -60px;
    width: 2px;
    background-color: #e0e0e0;
}

.stepper-vertical .stepper-step.completed .stepper-connector-vertical {
    background-color: #0f9e6e;
}

.stepper-vertical .stepper-step:last-child .stepper-connector-vertical {
    display: none;
}

/* Responsive */
@media (max-width: 768px) {
    .stepper-step-title {
        display: none;
    }

    .stepper-steps {
        gap: 0.5rem;
    }

    .stepper-connector {
        margin: 0 0.25rem;
    }
}
```

## Accessibility

- ARIA attributes on step indicators
- Semantic step structure
- Keyboard navigation support
- Clear visual progression indicators
- Completed step checkmarks

## Performance

- Lightweight rendering
- Smooth CSS transitions
- Efficient re-rendering on step change
- No external dependencies

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11 with polyfills
- Mobile browsers

## Related Components

- [Tabs](../Tabs/) - Tab-based navigation
- [Breadcrumb](../Breadcrumb/) - Navigation path display
- [Button](../Button/) - Navigation buttons
- [Card](../Card/) - Content containers
