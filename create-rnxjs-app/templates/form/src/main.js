import {
    Container,
    Row,
    Column,
    Card,
    Button,
    Input,
    Select,
    Checkbox,
    FormGroup,
    Alert
} from '@arnelirobles/rnxjs';

// Form state
let currentStep = 1;
const totalSteps = 3;
let formData = {
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
};

// Helper function to create step indicator
function createStepIndicator() {
    const div = document.createElement('div');
    div.className = 'step-indicator mb-4';
    div.innerHTML = `
        <div class="steps">
            ${Array.from({ length: totalSteps }, (_, i) => `
                <div class="step ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}">
                    <div class="step-number">${i + 1}</div>
                    <div class="step-label">Step ${i + 1}</div>
                </div>
            `).join('')}
        </div>
    `;
    return div;
}

// Step 1: Personal Info
function renderStep1() {
    return Container({
        children: [
            createStepIndicator(),
            Card({
                title: 'Personal Information',
                className: 'form-card',
                children: [
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-3';
                        div.innerHTML = `
                            <label class="form-label">First Name</label>
                            <input type="text" class="form-control" id="firstName"
                                   value="${formData.step1.firstName}"
                                   placeholder="John" />
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-3';
                        div.innerHTML = `
                            <label class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="lastName"
                                   value="${formData.step1.lastName}"
                                   placeholder="Doe" />
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-4';
                        div.innerHTML = `
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="email"
                                   value="${formData.step1.email}"
                                   placeholder="john@example.com" />
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'form-actions';
                        div.innerHTML = `
                            <button class="btn btn-primary" id="nextStep1">Next Step</button>
                        `;
                        return div;
                    })()
                ]
            })
        ]
    });
}

// Step 2: Address
function renderStep2() {
    return Container({
        children: [
            createStepIndicator(),
            Card({
                title: 'Address Information',
                className: 'form-card',
                children: [
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-3';
                        div.innerHTML = `
                            <label class="form-label">Country</label>
                            <select class="form-control" id="country">
                                <option value="">Select a country</option>
                                <option value="us" ${formData.step2.country === 'us' ? 'selected' : ''}>United States</option>
                                <option value="uk" ${formData.step2.country === 'uk' ? 'selected' : ''}>United Kingdom</option>
                                <option value="ca" ${formData.step2.country === 'ca' ? 'selected' : ''}>Canada</option>
                                <option value="au" ${formData.step2.country === 'au' ? 'selected' : ''}>Australia</option>
                            </select>
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-4';
                        div.innerHTML = `
                            <label class="form-label">ZIP/Postal Code</label>
                            <input type="text" class="form-control" id="zipCode"
                                   value="${formData.step2.zipCode}"
                                   placeholder="12345" />
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-4 form-check';
                        div.innerHTML = `
                            <input type="checkbox" class="form-check-input" id="acceptTerms"
                                   ${formData.step2.acceptTerms ? 'checked' : ''} />
                            <label class="form-check-label" for="acceptTerms">
                                I accept the terms and conditions
                            </label>
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'form-actions d-flex gap-2';
                        div.innerHTML = `
                            <button class="btn btn-secondary" id="prevStep2">Back</button>
                            <button class="btn btn-primary" id="nextStep2">Next Step</button>
                        `;
                        return div;
                    })()
                ]
            })
        ]
    });
}

// Step 3: Confirmation
function renderStep3() {
    return Container({
        children: [
            createStepIndicator(),
            Card({
                title: 'Review & Submit',
                className: 'form-card',
                children: [
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-4';
                        div.innerHTML = `
                            <div class="alert alert-info">
                                <h6>Your Information:</h6>
                                <p><strong>Name:</strong> ${formData.step1.firstName} ${formData.step1.lastName}</p>
                                <p><strong>Email:</strong> ${formData.step1.email}</p>
                                <p><strong>Country:</strong> ${formData.step2.country}</p>
                                <p><strong>ZIP Code:</strong> ${formData.step2.zipCode}</p>
                            </div>
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'mb-4';
                        div.innerHTML = `
                            <label class="form-label">Additional Comments (Optional)</label>
                            <textarea class="form-control" id="message" rows="4"
                                      placeholder="Any additional information...">${formData.step3.message}</textarea>
                        `;
                        return div;
                    })(),
                    (() => {
                        const div = document.createElement('div');
                        div.className = 'form-actions d-flex gap-2';
                        div.innerHTML = `
                            <button class="btn btn-secondary" id="prevStep3">Back</button>
                            <button class="btn btn-success" id="submitForm">Submit Form</button>
                        `;
                        return div;
                    })()
                ]
            })
        ]
    });
}

// Render current step
function renderForm() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (currentStep === 1) {
        app.appendChild(renderStep1());
        setupStep1Listeners();
    } else if (currentStep === 2) {
        app.appendChild(renderStep2());
        setupStep2Listeners();
    } else if (currentStep === 3) {
        app.appendChild(renderStep3());
        setupStep3Listeners();
    }
}

// Setup listeners for Step 1
function setupStep1Listeners() {
    document.getElementById('firstName').addEventListener('input', (e) => {
        formData.step1.firstName = e.target.value;
    });
    document.getElementById('lastName').addEventListener('input', (e) => {
        formData.step1.lastName = e.target.value;
    });
    document.getElementById('email').addEventListener('input', (e) => {
        formData.step1.email = e.target.value;
    });
    document.getElementById('nextStep1').addEventListener('click', () => {
        if (validateStep1()) {
            currentStep = 2;
            renderForm();
        }
    });
}

// Setup listeners for Step 2
function setupStep2Listeners() {
    document.getElementById('country').addEventListener('change', (e) => {
        formData.step2.country = e.target.value;
    });
    document.getElementById('zipCode').addEventListener('input', (e) => {
        formData.step2.zipCode = e.target.value;
    });
    document.getElementById('acceptTerms').addEventListener('change', (e) => {
        formData.step2.acceptTerms = e.target.checked;
    });
    document.getElementById('prevStep2').addEventListener('click', () => {
        currentStep = 1;
        renderForm();
    });
    document.getElementById('nextStep2').addEventListener('click', () => {
        if (validateStep2()) {
            currentStep = 3;
            renderForm();
        }
    });
}

// Setup listeners for Step 3
function setupStep3Listeners() {
    document.getElementById('message').addEventListener('input', (e) => {
        formData.step3.message = e.target.value;
    });
    document.getElementById('prevStep3').addEventListener('click', () => {
        currentStep = 2;
        renderForm();
    });
    document.getElementById('submitForm').addEventListener('click', () => {
        console.log('Form submitted:', formData);
        alert('Form submitted successfully! Check console for data.');
    });
}

// Validation functions
function validateStep1() {
    if (!formData.step1.firstName.trim()) {
        alert('First name is required');
        return false;
    }
    if (!formData.step1.lastName.trim()) {
        alert('Last name is required');
        return false;
    }
    if (!formData.step1.email.includes('@')) {
        alert('Valid email is required');
        return false;
    }
    return true;
}

function validateStep2() {
    if (!formData.step2.country) {
        alert('Country is required');
        return false;
    }
    if (!formData.step2.zipCode.trim()) {
        alert('ZIP code is required');
        return false;
    }
    if (!formData.step2.acceptTerms) {
        alert('You must accept the terms and conditions');
        return false;
    }
    return true;
}

// Initial render
renderForm();
console.log('🚀 Multi-step form loaded!');
