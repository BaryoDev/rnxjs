import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bindData, unbindData } from '../framework/DataBinder.js';
import { createReactiveState } from '../utils/createReactiveState.js';

describe('DataBinder', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('Basic Binding', () => {
        it('should bind input to state', () => {
            container.innerHTML = '<input data-bind="name" />';
            const state = createReactiveState({ name: '' });

            bindData(container, state);

            const input = container.querySelector('input');
            input.value = 'Alice';
            input.dispatchEvent(new Event('input'));

            expect(state.name).toBe('Alice');
        });

        it('should bind state to display element', () => {
            container.innerHTML = '<span data-bind="message"></span>';
            const state = createReactiveState({ message: 'Hello' });

            bindData(container, state);

            const span = container.querySelector('span');
            expect(span.textContent).toBe('Hello');
        });

        it('should update input when state changes', () => {
            container.innerHTML = '<input data-bind="name" />';
            const state = createReactiveState({ name: 'Alice' });

            bindData(container, state);
            const input = container.querySelector('input');

            expect(input.value).toBe('Alice');

            state.name = 'Bob';
            state.$flushSync(); // Flush batched updates
            expect(input.value).toBe('Bob');
        });
    });

    describe('Nested Properties', () => {
        it('should handle nested property paths', () => {
            container.innerHTML = '<input data-bind="user.profile.name" />';
            const state = createReactiveState({ user: { profile: { name: 'Alice' } } });

            bindData(container, state);
            const input = container.querySelector('input');

            input.value = 'Bob';
            input.dispatchEvent(new Event('input'));

            expect(state.user.profile.name).toBe('Bob');
        });

        it('should create intermediate objects if needed', () => {
            container.innerHTML = '<input data-bind="user.profile.city" />';
            const state = createReactiveState({});

            bindData(container, state);
            const input = container.querySelector('input');

            input.value = 'New York';
            input.dispatchEvent(new Event('input'));

            expect(state.user.profile.city).toBe('New York');
        });
    });

    describe('Input Types', () => {
        it('should handle checkbox inputs', () => {
            container.innerHTML = '<input type="checkbox" data-bind="agreed" />';
            const state = createReactiveState({ agreed: false });

            bindData(container, state);
            const checkbox = container.querySelector('input');

            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));

            expect(state.agreed).toBe(true);
        });

        it('should handle number inputs with type coercion', () => {
            container.innerHTML = '<input type="number" data-bind="age" />';
            const state = createReactiveState({ age: 0 });

            bindData(container, state);
            const input = container.querySelector('input');

            input.value = '25';
            input.dispatchEvent(new Event('input'));

            expect(state.age).toBe(25);
            expect(typeof state.age).toBe('number');
        });

        it('should handle textarea', () => {
            container.innerHTML = '<textarea data-bind="message"></textarea>';
            const state = createReactiveState({ message: '' });

            bindData(container, state);
            const textarea = container.querySelector('textarea');

            textarea.value = 'Long message';
            textarea.dispatchEvent(new Event('input'));

            expect(state.message).toBe('Long message');
        });

        it('should handle select elements', () => {
            container.innerHTML = `
        <select data-bind="country">
          <option value="us">USA</option>
          <option value="uk">UK</option>
        </select>
      `;
            const state = createReactiveState({ country: '' });

            bindData(container, state);
            const select = container.querySelector('select');

            select.value = 'uk';
            select.dispatchEvent(new Event('input')); // Use input event

            expect(state.country).toBe('uk');
        });
    });

    describe('Validation', () => {
        it('should validate rootElement', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const state = createReactiveState({});

            bindData(null, state);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should warn when state is not provided', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            bindData(container, null);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should validate state has subscribe method', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            bindData(container, {});
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should warn on invalid data-bind path', () => {
            container.innerHTML = '<input data-bind="123invalid" />';
            const state = createReactiveState({});
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            bindData(container, state);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should warn on empty data-bind attribute', () => {
            container.innerHTML = '<input data-bind="" />';
            const state = createReactiveState({});
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            bindData(container, state);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Two-Way Binding', () => {
        it('should sync multiple inputs bound to same property', () => {
            container.innerHTML = `
        <input id="input1" data-bind="name" />
        <input id="input2" data-bind="name" />
      `;
            const state = createReactiveState({ name: '' });

            bindData(container, state);

            const input1 = container.querySelector('#input1');
            const input2 = container.querySelector('#input2');

            input1.value = 'Alice';
            input1.dispatchEvent(new Event('input'));
            state.$flushSync(); // Flush batched updates

            expect(input2.value).toBe('Alice');
        });

        it('should update display elements when input changes', () => {
            container.innerHTML = `
        <input data-bind="name" />
        <span data-bind="name"></span>
      `;
            const state = createReactiveState({ name: '' });

            bindData(container, state);

            const input = container.querySelector('input');
            const span = container.querySelector('span');

            input.value = 'Alice';
            input.dispatchEvent(new Event('input'));
            state.$flushSync(); // Flush batched updates

            expect(span.textContent).toBe('Alice');
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in data binding gracefully', () => {
            container.innerHTML = '<input data-bind="invalid.deeply.nested.path" />';
            const state = createReactiveState({});
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // This should not throw, but handle gracefully
            bindData(container, state);
            const input = container.querySelector('input');
            input.value = 'test';
            input.dispatchEvent(new Event('input'));

            // Should have created the nested path without errors
            expect(state.invalid?.deeply?.nested?.path).toBe('test');

            consoleSpy.mockRestore();
        });
    });

    describe('Cleanup', () => {
        it('should unbind all data bindings', () => {
            container.innerHTML = '<input data-bind="name" />';
            const state = createReactiveState({ name: 'Alice' });

            bindData(container, state);
            unbindData(container);

            // After unbinding, state changes should not affect the input
            const input = container.querySelector('input');
            const initialValue = input.value;

            state.name = 'Bob';
            expect(input.value).toBe(initialValue);
        });

        it('should handle unbind on non-bound element', () => {
            const newContainer = document.createElement('div');
            unbindData(newContainer); // Should not throw
        });
    });
});
