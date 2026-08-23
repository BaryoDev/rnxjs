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

    it('should render stepper with steps', async () => {
        const steps = [
            { title: 'Step 1', content: '<p>Step 1 content</p>' },
            { title: 'Step 2', content: '<p>Step 2 content</p>' }
        ];

        const stepper = Stepper({ steps });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const stepElements = container.querySelectorAll('.stepper-step');
            expect(stepElements.length).toBe(steps.length);
    });

    it('should render in horizontal orientation by default', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, orientation: 'horizontal' });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const stepperElement = container.querySelector('.stepper-horizontal');
            expect(stepperElement).not.toBeNull();
    });

    it('should render in vertical orientation', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, orientation: 'vertical' });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const stepperElement = container.querySelector('.stepper-vertical');
            expect(stepperElement).not.toBeNull();
    });

    it('should track current step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(stepper.getStep()).toBe(0);
    });

    it('should mark current step as active', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const activeStep = container.querySelector('.stepper-step.active');
            expect(activeStep).not.toBeNull();
            expect(activeStep.querySelector('.stepper-step-title').textContent).toContain('Step 1');
    });

    it('should navigate to next step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            stepper.nextStep();

            expect(stepper.getStep()).toBe(1);
    });

    it('should navigate to previous step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            stepper.prevStep();

            expect(stepper.getStep()).toBe(0);
    });

    it('should jump to specific step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            stepper.setStep(2);

            expect(stepper.getStep()).toBe(2);
    });

    it('should detect first step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 0 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(stepper.isFirstStep()).toBe(true);

            stepper.nextStep();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(stepper.isFirstStep()).toBe(false);
    });

    it('should detect last step', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(stepper.isLastStep()).toBe(true);
    });

    it('should mark completed steps', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 2 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const completedSteps = container.querySelectorAll('.stepper-step.completed');
            expect(completedSteps.length).toBe(2);
    });

    it('should display checkmark for completed steps', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const firstStepIndicator = container.querySelector('.stepper-step.completed .stepper-step-indicator');
            expect(firstStepIndicator.textContent).toContain('✓');
    });

    it('should call onStepChange callback', async () => {
        const onStepChange = vi.fn();
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, onStepChange });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            stepper.setStep(1);

            expect(onStepChange).toHaveBeenCalled();
            expect(onStepChange).toHaveBeenCalledWith({
                step: 1,
                title: 'Step 2',
                isCompleted: expect.any(Boolean)
            });
    });

    it('should return total steps count', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' },
            { title: 'Step 3', content: 'Content' }
        ];

        const stepper = Stepper({ steps });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(stepper.getTotalSteps()).toBe(3);
    });

    it('should not navigate beyond step bounds', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1 });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            stepper.nextStep();
            expect(stepper.getStep()).toBe(1);

            stepper.setStep(0);
            stepper.prevStep();
            expect(stepper.getStep()).toBe(0);
    });

    it('should allow clicking previous steps when editable', async () => {
        const steps = [
            { title: 'Step 1', content: 'Content' },
            { title: 'Step 2', content: 'Content' }
        ];

        const stepper = Stepper({ steps, currentStep: 1, editable: true });
        container.appendChild(stepper);

        await new Promise(resolve => setTimeout(resolve, 50));
            const firstStep = container.querySelector('.stepper-step');
            firstStep.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(stepper.getStep()).toBe(0);
    });
});