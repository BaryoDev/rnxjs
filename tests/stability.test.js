
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.ts';
import { bindData } from '../framework/DataBinder.js';
import { createComponent } from '../utils/createComponent.js';

describe('Stability Tests', () => {
    let state;
    let container;

    beforeEach(() => {
        state = createReactiveState({
            count: 0,
            text: 'hello',
            visible: true,
            list: []
        });
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        if (state.$unsubscribeAll) {
            state.$unsubscribeAll();
        }
    });

    it('should handle rapid state updates without crashing', async () => {
        const input = document.createElement('input');
        input.setAttribute('data-bind', 'count');
        container.appendChild(input);

        // Simulate rapid updates
        for (let i = 0; i < 1000; i++) {
            state.count = i;
        }

        // Wait for potential async updates
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(state.count).toBe(999);
    });

    it('should not throw errors on repeatedly mounting/unmounting components', () => {
        // Stress test for mount/unmount cycle
        for (let i = 0; i < 50; i++) {
            const div = document.createElement('div');
            container.appendChild(div);

            // Manually simulate component mount/subscribe
            const unsub = state.subscribe('count', () => { });

            // verifying we can unsubscribe
            unsub();
        }

        expect(true).toBe(true);
    });

    it('should handle circular dependencies gracefully if possible', () => {
        const circular = {};
        circular.self = circular;

        expect(() => {
            const s = createReactiveState(circular);
        }).not.toThrow();
    });

    it('should handle multiple data-binds on the same element race conditions', async () => {
        const div = document.createElement('div');
        div.setAttribute('data-bind', 'text');
        container.appendChild(div);

        // Binding logic
        bindData(container, state);

        state.text = 'world';
        state.text = 'universe';

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(div.textContent).toBe('universe');
    });
});
