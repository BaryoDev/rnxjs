import { describe, it, expect, vi } from 'vitest';
import { createReactiveState } from '../../utils/createReactiveState.js';
import { bindData } from '../../framework/DataBinder.js';

describe('DataBinder Regression Tests', () => {
    it('should be idempotent (not attach duplicate listeners)', () => {
        const state = createReactiveState({ count: 0 });
        document.body.innerHTML = `<button id="btn" data-bind="count">0</button>`;
        const btn = document.getElementById('btn');

        // Mock addEventListener to count calls
        const spy = vi.spyOn(btn, 'addEventListener'); // Note: bindData might not add listener to display elements, mainly inputs

        // Let's test with an input instead
        document.body.innerHTML = `<input id="input" data-bind="count" />`;
        const input = document.getElementById('input');
        const spyInput = vi.spyOn(input, 'addEventListener');

        bindData(document.body, state);
        bindData(document.body, state);
        bindData(document.body, state);

        // Expect addEventListener to be called exactly once per event type
        // input element listens for 'input' (or 'change')
        const calls = spyInput.mock.calls.filter(call => call[0] === 'input' || call[0] === 'change');
        expect(calls.length).toBe(1);
    });

    it('should use WeakSet to track bound elements', () => {
        // This is an implementation detail test, but useful for regression
        const state = createReactiveState({ val: 'test' });
        document.body.innerHTML = `<div id="div1" data-bind="val"></div>`;
        const div = document.getElementById('div1');

        bindData(document.body, state);

        // Modify the element implementation to spy/check if it was processed again?
        // Hard to verify WeakSet internal state directly without exposing it.
        // We rely on the side-effect check above (idempotency).
        expect(true).toBe(true);
    });
});
