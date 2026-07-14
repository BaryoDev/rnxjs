import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Stepper Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Multi-step progress indicator with optional navigation.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.steps=[]] - Step definitions [{title, content}]
 * @param {number} [props.currentStep=0] - Current active step index
 * @param {string} [props.orientation='horizontal'] - horizontal or vertical
 * @param {boolean} [props.editable=false] - Allow clicking completed steps
 * @param {Function} [props.onStepChange] - Called when step changes
 * @param {string} [props.variant='default'] - Stepper variant
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Stepper element
 */
export const Stepper = (props = {}) => {
    const {
        steps = [],
        currentStep = 0,
        orientation = 'horizontal',
        editable = false,
        onStepChange,
        variant = 'default',
        className = ''
    } = props;

    let activeStep = currentStep;

    const component = createComponent({
        render() {
            // Resolve classes from active theme
            const stepperClass = cn(
                resolveClasses('stepper', { variant, orientation }),
                `stepper stepper-${orientation} stepper-${variant}`,
                className
            );

            const container = document.createElement('div');
            container.className = stepperClass;
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

            // MEMORY LEAK FIX: Store handler references for proper cleanup
            const steps = component.querySelectorAll('.stepper-step');
            const stepHandlers = [];

            steps.forEach(step => {
                const clickHandler = () => {
                    const stepIndex = parseInt(step.getAttribute('data-step'));
                    if (stepIndex <= activeStep) {
                        goToStep(stepIndex);
                    }
                };
                step.addEventListener('click', clickHandler);
                step.style.cursor = 'pointer';
                stepHandlers.push({ element: step, handler: clickHandler });
            });

            // MEMORY LEAK FIX: Proper cleanup with stored handler references
            return () => {
                stepHandlers.forEach(({ element, handler }) => {
                    element.removeEventListener('click', handler);
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
