/**
 * Tests for Stepper navigation and state
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Stepper } from '../../components/Stepper/Stepper.js';

describe('Stepper Navigation', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render stepper with steps', (done) => {
        const steps = [
            { title: 'Step 1', content: '<p>Step 1 content</p>' },
            { title: 'Step 2', content: '<p>Step 2 content</p>' }
        ];

        const stepper = Stepper({ steps });
        container.appendChild(stepper);

        setTimeout(() => {
            const stepElements = container.querySelectorAll('.stepper-step');
            expect(stepElements.length).toBe(steps.length);

            done();
        }, 50);
    });

    it('should render in horizontal orientation by default', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, orientation: 'horizontal' });
        container.appendChild(stepper);

        setTimeout(() => {
            const stepperElement = container.querySelector('.stepper-horizontal');
            expect(stepperElement).not.toBeNull();

            done();
        }, 50);
    });

    it('should render in vertical orientation', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, orientation: 'vertical' });
        container.appendChild(stepper);

        setTimeout(() => {
            const stepperElement = container.querySelector('.stepper-vertical');
            expect(stepperElement).not.toBeNull();

            done();
        }, 50);
    });

    it('should track current step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        setTimeout(() => {
            expect(stepper.getStep()).toBe(0);

            done();
        }, 50);
    });

    it('should mark current step as active', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        setTimeout(() => {
            const activeStep = container.querySelector('.stepper-step.active');
            expect(activeStep).not.toBeNull();
            expect(activeStep.querySelector('.stepper-step-title').textContent).toContain('Step 1');

            done();
        }, 50);
    });

    it('should navigate to next step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        setTimeout(() => {
            stepper.nextStep();

            expect(stepper.getStep()).toBe(1);

            done();
        }, 50);
    });

    it('should navigate to previous step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        setTimeout(() => {
            stepper.prevStep();

            expect(stepper.getStep()).toBe(0);

            done();
        }, 50);
    });

    it('should jump to specific step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        setTimeout(() => {
            stepper.setStep(2);

            expect(stepper.getStep()).toBe(2);

            done();
        }, 50);
    });

    it('should detect first step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        setTimeout(() => {
            expect(stepper.isFirstStep()).toBe(true);

            stepper.nextStep();

            setTimeout(() => {
                expect(stepper.isFirstStep()).toBe(false);

                done();
            }, 50);
        }, 50);
    });

    it('should detect last step', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        setTimeout(() => {
            expect(stepper.isLastStep()).toBe(true);

            done();
        }, 50);
    });

    it('should mark completed steps', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 2 });
        container.appendChild(stepper);

        setTimeout(() => {
            const completedSteps = container.querySelectorAll('.stepper-step.completed');
            expect(completedSteps.length).toBe(2);

            done();
        }, 50);
    });

    it('should display checkmark for completed steps', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        setTimeout(() => {
            const firstStepIndicator = container.querySelector('.stepper-step.completed .stepper-step-indicator');
            expect(firstStepIndicator.textContent).toContain('✓');

            done();
        }, 50);
    });

    it('should call onStepChange callback', (done) => {
        const onStepChange = vi.fn();
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, onStepChange });
        container.appendChild(stepper);

        setTimeout(() => {
            stepper.setStep(1);

            expect(onStepChange).toHaveBeenCalled();
            expect(onStepChange).toHaveBeenCalledWith({
                step: 1,
                title: 'Step 2',
                isCompleted: expect.any(Boolean)
            });

            done();
        }, 50);
    });

    it('should return total steps count', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps });
        container.appendChild(stepper);

        setTimeout(() => {
            expect(stepper.getTotalSteps()).toBe(3);

            done();
        }, 50);
    });

    it('should not navigate beyond step bounds', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        setTimeout(() => {
            stepper.nextStep();
            expect(stepper.getStep()).toBe(1);

            stepper.setStep(0);
            stepper.prevStep();
            expect(stepper.getStep()).toBe(0);

            done();
        }, 50);
    });

    it('should allow clicking previous steps when editable', (done) => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1, editable: true });
        container.appendChild(stepper);

        setTimeout(() => {
            const firstStep = container.querySelector('.stepper-step');
            firstStep.click();

            setTimeout(() => {
                expect(stepper.getStep()).toBe(0);

                done();
            }, 50);
        }, 50);
    });
});
