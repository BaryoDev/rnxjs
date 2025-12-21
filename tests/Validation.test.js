import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bindData, unbindData } from '../framework/DataBinder.js';
import { createReactiveState } from '../utils/createReactiveState.ts';

describe('DataBinder Validation', () => {
    let container;
    let state;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        state = createReactiveState({
            user: {
                name: '',
                email: '',
                age: 0,
                bio: ''
            }
        });
    });

    afterEach(() => {
        unbindData(container);
        document.body.removeChild(container);
    });

    it('should initialize errors object in state', () => {
        bindData(container, state);
        expect(state.errors).toBeDefined();
        expect(typeof state.errors).toBe('object');
    });

    it('should validate required fields', () => {
        container.innerHTML = `
            <input data-bind="user.name" data-rule="required" />
            <span data-bind="errors.user.name"></span>
        `;
        bindData(container, state);

        const input = container.querySelector('input');
        const errorSpan = container.querySelector('span');

        // Initial state is empty, so it should be invalid
        expect(state.errors.user.name).toBe('This field is required');
        expect(errorSpan.textContent).toBe('This field is required');

        // Make valid
        input.value = 'John';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates

        expect(state.errors.user.name).toBe('');
        expect(errorSpan.textContent).toBe('');

        // Make invalid again
        input.value = '';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates

        expect(state.errors.user.name).toBe('This field is required');
    });

    it('should validate email fields', () => {
        container.innerHTML = `
            <input data-bind="user.email" data-rule="email" />
        `;
        bindData(container, state);
        const input = container.querySelector('input');

        // Invalid email
        input.value = 'invalid-email';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.email).toBe('Invalid email address');

        // Valid email
        input.value = 'test@example.com';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.email).toBe('');
    });

    it('should validate min length', () => {
        container.innerHTML = `
            <input data-bind="user.name" data-rule="min:3" />
        `;
        bindData(container, state);
        const input = container.querySelector('input');

        input.value = 'Jo';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('Must be at least 3 characters');

        input.value = 'Joe';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('');
    });

    it('should validate max length', () => {
        container.innerHTML = `
            <input data-bind="user.name" data-rule="max:5" />
        `;
        bindData(container, state);
        const input = container.querySelector('input');

        input.value = 'Joseph';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('Must be no more than 5 characters');

        input.value = 'Jose';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('');
    });

    it('should validate numeric values', () => {
        container.innerHTML = `
            <input type="number" data-bind="user.age" data-rule="min:18" />
        `;
        bindData(container, state);
        const input = container.querySelector('input');

        input.value = '10';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.age).toBe('Must be at least 18');

        input.value = '20';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.age).toBe('');
    });

    it('should handle multiple rules', () => {
        container.innerHTML = `
            <input data-bind="user.name" data-rule="required|min:3" />
        `;
        bindData(container, state);
        const input = container.querySelector('input');

        // Required check
        input.value = '';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('This field is required');

        // Min length check
        input.value = 'Jo';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('Must be at least 3 characters');

        // Valid
        input.value = 'Joe';
        input.dispatchEvent(new Event('input'));
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('');
    });

    it('should re-validate when state changes externally', () => {
        container.innerHTML = `
            <input data-bind="user.name" data-rule="required" />
        `;
        bindData(container, state);

        // Update state directly
        state.user.name = 'John';
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('');

        state.user.name = '';
        state.$flushSync(); // Flush batched updates
        expect(state.errors.user.name).toBe('This field is required');
    });
});
