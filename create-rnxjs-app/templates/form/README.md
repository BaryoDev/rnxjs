# Multi-Step Form - rnxJS

A multi-step form wizard with validation built with rnxJS.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📋 Form Steps

### Step 1: Personal Information
- First Name (required)
- Last Name (required)
- Email (required, must be valid)

### Step 2: Address Information
- Country (required, dropdown)
- ZIP/Postal Code (required)
- Terms & Conditions (required checkbox)

### Step 3: Review & Submit
- Review of entered information
- Optional comments
- Submit button

## 🎯 Features

- **Multi-step progression**: Navigate through form steps
- **Form validation**: Client-side validation on each step
- **Step indicators**: Visual progress indicator
- **Back/Next navigation**: Move between steps easily
- **Data persistence**: Form data retained when navigating
- **Responsive design**: Works on mobile and desktop

## 🛠️ Customization

### Add More Steps

In `src/main.js`:

```javascript
const totalSteps = 4; // Change this

function renderStep4() {
    return Container({
        children: [
            createStepIndicator(),
            Card({
                title: 'New Step',
                children: [
                    // Add form fields
                ]
            })
        ]
    });
}

// Add case in renderForm()
if (currentStep === 4) {
    app.appendChild(renderStep4());
    setupStep4Listeners();
}
```

### Modify Form Fields

Edit the field definitions in each `renderStep` function:

```javascript
(() => {
    const div = document.createElement('div');
    div.className = 'mb-3';
    div.innerHTML = `
        <label class="form-label">Field Name</label>
        <input type="text" class="form-control" id="fieldId" />
    `;
    return div;
})()
```

### Change Validation Rules

Edit the `validateStep` functions:

```javascript
function validateStep1() {
    if (formData.step1.firstName.length < 2) {
        alert('First name must be at least 2 characters');
        return false;
    }
    return true;
}
```

### Customize Styling

Edit `src/styles.css` to match your brand:

```css
:root {
  --primary-color: #your-color;
  --success-color: #your-color;
}
```

## 💾 Form Data Handling

The form data is stored in memory in the `formData` object:

```javascript
{
    step1: {
        firstName: '',
        lastName: '',
        email: ''
    },
    step2: {
        country: '',
        zipCode: '',
        acceptTerms: false
    },
    step3: {
        message: ''
    }
}
```

### Submit to Server

In `setupStep3Listeners()`, replace the alert with an API call:

```javascript
document.getElementById('submitForm').addEventListener('click', async () => {
    const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        alert('Form submitted successfully!');
        // Reset form or redirect
    } else {
        alert('Error submitting form');
    }
});
```

## 🎨 Design Features

- Clean, modern UI
- Smooth transitions
- Step-by-step indicators
- Mobile-responsive layout
- Color-coded status indicators
- Accessibility-friendly

## 📱 Mobile Optimization

The form is fully responsive:
- Touch-friendly buttons
- Optimized for small screens
- Readable typography on all devices
- Vertical stacking on mobile

## 🔗 Components Used

- Container & Row/Column
- Card
- Input, Select, Checkbox
- Button
- Custom HTML for flexible layout

## 📚 Next Steps

1. **Customize fields** for your use case
2. **Add validation** rules
3. **Connect backend** API
4. **Add success message** after submission
5. **Implement error handling** for API failures
6. **Add animations** between steps
7. **Save draft** functionality

## 📄 License

MPL-2.0 (see main rnxjs repo)
