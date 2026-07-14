import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, sanitizeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const themeState = (component, state) => {
    const theme = themeProvider.getTheme();
    return (theme && theme.components[component] && theme.components[component].states &&
        theme.components[component].states[state]) || '';
};

/**
 * Stepper Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Multi-step progress indicator with list semantics and optional navigation.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.steps=[]] - Step definitions [{title, content}] (content is sanitized)
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

    const renderStepHeader = (step, index) => {
        const circlePart = resolvePartClasses('stepper', 'circle');
        const labelPart = resolvePartClasses('stepper', 'label');
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const circleState = isActive
            ? themeState('stepper', 'active')
            : isCompleted
                ? themeState('stepper', 'completed')
                : themeState('stepper', 'pending');

        return `
            <div class="stepper-step-header">
                <div class="${cn(circlePart, circleState, 'stepper-step-indicator')}" aria-hidden="true">
                    ${isCompleted ? '✓' : index + 1}
                </div>
                <div class="${cn(labelPart, 'stepper-step-title')}">${escapeHtml(step.title)}</div>
            </div>
        `;
    };

    const stepAttrs = (index) => {
        const stepPart = resolvePartClasses('stepper', 'step');
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        return `class="${cn(stepPart, 'stepper-step', isActive ? 'active' : '', isCompleted ? 'completed' : '')}" data-step="${index}"${isActive ? ' aria-current="step"' : ''}`;
    };

    const template = () => {
        // Resolve classes from active theme
        const stepperClass = cn(
            resolveClasses('stepper'),
            `stepper stepper-${orientation} stepper-${variant}`,
            className
        );
        const connectorPart = resolvePartClasses('stepper', 'connector');

        if (orientation === 'horizontal') {
            return `
                <div class="${stepperClass}" data-ref="stepper">
                    <ol class="stepper-steps" style="list-style: none; margin: 0; padding: 0;">
                        ${steps.map((step, index) => `
                            <li ${stepAttrs(index)}>
                                ${renderStepHeader(step, index)}
                                ${index < steps.length - 1 ? `<div class="${cn(connectorPart, 'stepper-connector')}" aria-hidden="true"></div>` : ''}
                            </li>
                        `).join('')}
                    </ol>
                    <div class="stepper-content">
                        ${steps[activeStep]?.content ? sanitizeHtml(steps[activeStep].content) : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div class="${stepperClass}" data-ref="stepper">
                <ol class="stepper-vertical" style="list-style: none; margin: 0; padding: 0;">
                    ${steps.map((step, index) => `
                        <li ${stepAttrs(index)}>
                            ${renderStepHeader(step, index)}
                            <div class="stepper-content">
                                ${step.content ? sanitizeHtml(step.content) : ''}
                            </div>
                            ${index < steps.length - 1 ? `<div class="${cn(connectorPart, 'stepper-connector-vertical')}" aria-hidden="true"></div>` : ''}
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;
    };

    const component = createComponent(template, { currentStep, orientation, variant });

    component.useEffect((el) => {
        if (!editable) return;

        // MEMORY LEAK FIX: Store handler references for proper cleanup
        const stepElements = el.querySelectorAll('.stepper-step');
        const stepHandlers = [];

        stepElements.forEach(step => {
            const stepIndex = parseInt(step.getAttribute('data-step'));
            const clickHandler = () => {
                if (stepIndex <= activeStep) {
                    goToStep(stepIndex);
                }
            };
            const keydownHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            };
            step.addEventListener('click', clickHandler);
            step.addEventListener('keydown', keydownHandler);
            if (stepIndex <= activeStep) {
                step.setAttribute('tabindex', '0');
                step.style.cursor = 'pointer';
            }
            stepHandlers.push({ element: step, click: clickHandler, keydown: keydownHandler });
        });

        // MEMORY LEAK FIX: Proper cleanup with stored handler references
        return () => {
            stepHandlers.forEach(({ element, click, keydown }) => {
                element.removeEventListener('click', click);
                element.removeEventListener('keydown', keydown);
            });
        };
    });

    const goToStep = (stepIndex) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            activeStep = stepIndex;
            component.setState({ activeStep });

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
