import { describe, it, expect, vi } from 'vitest';
import { createReactiveState } from '../../utils/createReactiveState.js';
import { bindData } from '../../framework/DataBinder.js';

describe('DataBinder Stability', () => {
    it('should not enter unlimited recursion on update', async () => {
        const state = createReactiveState({ user: { name: 'Test' } });
        document.body.innerHTML = `<input id="input" data-bind="user.name" />`;

        bindData(document.body, state);

        const input = document.getElementById('input');

        // Simulate rapid updates
        // This simulates the user typing
        state.user.name = 'Updated';
        input.value = 'Changed';
        input.dispatchEvent(new Event('input'));

        // If there is an infinite loop, the test runner usually crashes or times out
        // We expect the state to reflect the input change (last action)
        expect(state.user.name).toBe('Changed');
        expect(input.value).toBe('Changed');
    });

    it('should handle rapid two-way binding without stack overflow', () => {
        const state = createReactiveState({ count: 0 });
        document.body.innerHTML = `<input id="count-input" type="number" data-bind="count" />`;

        bindData(document.body, state);
        const input = document.getElementById('count-input');

        // Trigger updates from both sides
        for (let i = 0; i < 100; i++) {
            state.count = i;
            input.value = i + 1;
            input.dispatchEvent(new Event('input'));
        }

        expect(state.count).toBe(100);
    });
});
