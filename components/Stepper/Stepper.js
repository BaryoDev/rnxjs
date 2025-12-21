import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

export const Stepper = (props = {}) => {
    const {
        steps = [],
        currentStep = 0,
        orientation = 'horizontal',
        editable = false,
        onStepChange,
        variant = 'default'
    } = props;

    let activeStep = currentStep;

    const component = createComponent({
        render() {
            const container = document.createElement('div');
            container.className = `stepper stepper-${orientation} stepper-${variant}`;
            container.setAttribute('data-ref', 'stepper');

            if (orientation === 'horizontal') {
                container.innerHTML = `
                    <div class="stepper-steps">
                        ${steps.map((step, index) => `
                            <div class="stepper-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}" data-step="${index}">
                                <div class="stepper-step-header">
                                    <div class="stepper-step-indicator">
                                        ${index < activeStep ? '✓' : index + 1}
                                    </div>
                                    <div class="stepper-step-title">${escapeHtml(step.title)}</div>
                                </div>
                                ${index < steps.length - 1 ? '<div class="stepper-connector"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="stepper-content">
                        ${steps[activeStep]?.content ? steps[activeStep].content : ''}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="stepper-vertical">
                        ${steps.map((step, index) => `
                            <div class="stepper-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}" data-step="${index}">
                                <div class="stepper-step-header">
                                    <div class="stepper-step-indicator">
                                        ${index < activeStep ? '✓' : index + 1}
                                    </div>
                                    <div class="stepper-step-title">${escapeHtml(step.title)}</div>
                                </div>
                                <div class="stepper-content">
                                    ${step.content ? step.content : ''}
                                </div>
                                ${index < steps.length - 1 ? '<div class="stepper-connector-vertical"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            return container;
        },

        useEffect(component) {
            if (!editable) return;

            const steps = component.querySelectorAll('.stepper-step');
            steps.forEach(step => {
                step.addEventListener('click', () => {
                    const stepIndex = parseInt(step.getAttribute('data-step'));
                    if (stepIndex <= activeStep) {
                        goToStep(stepIndex);
                    }
                });
                step.style.cursor = 'pointer';
            });

            return () => {
                steps.forEach(step => {
                    step.removeEventListener('click', null);
                });
            };
        }
    });

    const goToStep = (stepIndex) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            activeStep = stepIndex;
            component.rerender();

            if (onStepChange) {
                onStepChange({
                    step: stepIndex,
                    title: steps[stepIndex].title,
                    isCompleted: stepIndex < steps.length - 1
                });
            }
        }
    };

    component.getStep = () => activeStep;

    component.setStep = (stepIndex) => {
        goToStep(stepIndex);
    };

    component.nextStep = () => {
        if (activeStep < steps.length - 1) {
            goToStep(activeStep + 1);
        }
    };

    component.prevStep = () => {
        if (activeStep > 0) {
            goToStep(activeStep - 1);
        }
    };

    component.isLastStep = () => activeStep === steps.length - 1;

    component.isFirstStep = () => activeStep === 0;

    component.getTotalSteps = () => steps.length;

    return component;
};
