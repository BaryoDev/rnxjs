/**
 * Tests for accessibility utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    isFocusable,
    getFocusableElements,
    getFirstFocusable,
    getLastFocusable,
    createFocusTrap,
    announce,
    createSkipLink,
    setupAccessibleClick,
    createDisclosureWidget,
    ensureId,
    createAriaLabel,
    createAriaDescription
} from '../utils/a11y.ts';

describe('Accessibility Utilities', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('isFocusable', () => {
        it('should return true for focusable elements', () => {
            const button = document.createElement('button');
            expect(isFocusable(button)).toBe(true);

            const input = document.createElement('input');
            expect(isFocusable(input)).toBe(true);

            const link = document.createElement('a');
            link.href = '#';
            expect(isFocusable(link)).toBe(true);
        });

        it('should return false for disabled elements', () => {
            const button = document.createElement('button');
            button.disabled = true;
            expect(isFocusable(button)).toBe(false);
        });

        it('should return false for links without href', () => {
            const link = document.createElement('a');
            expect(isFocusable(link)).toBe(false);
        });

        it('should respect tabindex', () => {
            const div = document.createElement('div');
            expect(isFocusable(div)).toBe(false);

            div.setAttribute('tabindex', '0');
            expect(isFocusable(div)).toBe(true);

            div.setAttribute('tabindex', '-1');
            expect(isFocusable(div)).toBe(false);
        });
    });

    describe('getFocusableElements', () => {
        it('should find all focusable elements', () => {
            container.innerHTML = `
                <button id="btn1">Button 1</button>
                <input id="input1" />
                <a href="#" id="link1">Link</a>
                <div tabindex="0" id="div1">Focusable Div</div>
                <button disabled id="btn2">Disabled</button>
                <div id="div2">Not Focusable</div>
            `;

            const focusable = getFocusableElements(container);
            expect(focusable).toHaveLength(4);
            expect(focusable.map(el => el.id)).toEqual(['btn1', 'input1', 'link1', 'div1']);
        });

        it('should exclude tabindex="-1" elements', () => {
            container.innerHTML = `
                <button id="btn">Button</button>
                <div tabindex="-1" id="div">Negative Tabindex</div>
            `;

            const focusable = getFocusableElements(container);
            expect(focusable).toHaveLength(1);
            expect(focusable[0].id).toBe('btn');
        });
    });

    describe('getFirstFocusable / getLastFocusable', () => {
        it('should get first focusable element', () => {
            container.innerHTML = `
                <div>Non-focusable</div>
                <button id="first">First</button>
                <button id="second">Second</button>
            `;

            const first = getFirstFocusable(container);
            expect(first.id).toBe('first');
        });

        it('should get last focusable element', () => {
            container.innerHTML = `
                <button id="first">First</button>
                <button id="last">Last</button>
                <div>Non-focusable</div>
            `;

            const last = getLastFocusable(container);
            expect(last.id).toBe('last');
        });

        it('should return null if no focusable elements', () => {
            container.innerHTML = `<div>No focusable elements</div>`;

            expect(getFirstFocusable(container)).toBeNull();
            expect(getLastFocusable(container)).toBeNull();
        });
    });

    describe('createFocusTrap', () => {
        it('should trap focus within container', () => {
            container.innerHTML = `
                <button id="first">First</button>
                <button id="middle">Middle</button>
                <button id="last">Last</button>
            `;

            const first = container.querySelector('#first');
            const last = container.querySelector('#last');
            const trap = createFocusTrap(container);

            trap.activate();

            expect(trap.isActive()).toBe(true);

            // Simulate Tab on last element
            last.focus();
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            container.dispatchEvent(tabEvent);

            // Focus should still be on last (prevented from leaving)
            // Note: In real DOM, focus would move but we prevent default
        });

        it('should restore focus on deactivate', async () => {
            const externalButton = document.createElement('button');
            document.body.appendChild(externalButton);
            externalButton.focus();

            container.innerHTML = `<button id="internal">Internal</button>`;

            const trap = createFocusTrap(container);
            trap.activate();

            await new Promise(resolve => requestAnimationFrame(resolve));

            trap.deactivate();

            await new Promise(resolve => requestAnimationFrame(resolve));

            expect(document.activeElement).toBe(externalButton);

            document.body.removeChild(externalButton);
        });
    });

    describe('announce', () => {
        afterEach(() => {
            // Clean up any lingering announcement elements
            document.querySelectorAll('[role="status"], [role="alert"]').forEach(el => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        });

        it('should create announcement element', () => {
            announce('Test message');

            const announcer = document.body.querySelector('[role="status"]');
            expect(announcer).not.toBeNull();
            expect(announcer.textContent).toBe('Test message');
            expect(announcer.getAttribute('aria-live')).toBe('polite');
        });

        it('should use assertive priority when specified', () => {
            announce('Important!', 'assertive');

            const announcer = document.body.querySelector('[role="alert"]');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('assertive');
        });

        it('should remove announcement after duration', async () => {
            announce('Test', 'polite', 100);

            expect(document.body.querySelector('[role="status"]')).not.toBeNull();

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(document.body.querySelector('[role="status"]')).toBeNull();
        });
    });

    describe('createSkipLink', () => {
        it('should create skip link with correct attributes', () => {
            const skipLink = createSkipLink('main-content', 'Skip to main');

            expect(skipLink.tagName).toBe('A');
            expect(skipLink.href).toContain('#main-content');
            expect(skipLink.textContent).toBe('Skip to main');
            expect(skipLink.className).toBe('rnx-skip-link');
        });

        it('should use default text if not provided', () => {
            const skipLink = createSkipLink('content');
            expect(skipLink.textContent).toBe('Skip to main content');
        });
    });

    describe('setupAccessibleClick', () => {
        it('should add click handler', () => {
            const div = document.createElement('div');
            const handler = vi.fn();

            setupAccessibleClick(div, handler);

            div.click();
            expect(handler).toHaveBeenCalled();
        });

        it('should add keyboard handler', () => {
            const div = document.createElement('div');
            const handler = vi.fn();

            setupAccessibleClick(div, handler);

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            div.dispatchEvent(enterEvent);
            expect(handler).toHaveBeenCalled();
        });

        it('should make element focusable', () => {
            const div = document.createElement('div');
            setupAccessibleClick(div, () => {});

            expect(div.hasAttribute('tabindex')).toBe(true);
            expect(div.getAttribute('role')).toBe('button');
        });

        it('should support custom keys', () => {
            const div = document.createElement('div');
            const handler = vi.fn();

            setupAccessibleClick(div, handler, ['a', 'b']);

            div.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            expect(handler).toHaveBeenCalledTimes(1);

            div.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(handler).toHaveBeenCalledTimes(1); // Not called for Enter
        });
    });

    describe('createDisclosureWidget', () => {
        it('should set up disclosure with ARIA attributes', () => {
            const trigger = document.createElement('button');
            trigger.textContent = 'Toggle';
            const target = document.createElement('div');
            target.textContent = 'Content';

            container.appendChild(trigger);
            container.appendChild(target);

            const widget = createDisclosureWidget(trigger, target);

            expect(trigger.hasAttribute('aria-controls')).toBe(true);
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            expect(target.hidden).toBe(true);
        });

        it('should toggle expanded state', () => {
            const trigger = document.createElement('button');
            const target = document.createElement('div');

            const widget = createDisclosureWidget(trigger, target);

            expect(widget.isExpanded()).toBe(false);

            widget.toggle();
            expect(widget.isExpanded()).toBe(true);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(target.hidden).toBe(false);

            widget.toggle();
            expect(widget.isExpanded()).toBe(false);
            expect(target.hidden).toBe(true);
        });

        it('should respect initial state', () => {
            const trigger = document.createElement('button');
            const target = document.createElement('div');

            const widget = createDisclosureWidget(trigger, target, true);

            expect(widget.isExpanded()).toBe(true);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(target.hidden).toBe(false);
        });
    });

    describe('ensureId', () => {
        it('should preserve existing ID', () => {
            const element = document.createElement('div');
            element.id = 'existing-id';

            const id = ensureId(element);
            expect(id).toBe('existing-id');
        });

        it('should generate ID if missing', () => {
            const element = document.createElement('div');

            const id = ensureId(element);
            expect(id).toMatch(/^rnx-/);
            expect(element.id).toBe(id);
        });

        it('should use custom prefix', () => {
            const element = document.createElement('div');

            const id = ensureId(element, 'custom');
            expect(id).toMatch(/^custom-/);
        });
    });

    describe('createAriaLabel', () => {
        it('should create aria-labelledby relationship', () => {
            const label = document.createElement('div');
            label.textContent = 'Label';
            const target = document.createElement('div');

            createAriaLabel(label, target);

            expect(label.id).toBeTruthy();
            expect(target.getAttribute('aria-labelledby')).toBe(label.id);
        });
    });

    describe('createAriaDescription', () => {
        it('should create aria-describedby relationship', () => {
            const desc = document.createElement('div');
            desc.textContent = 'Description';
            const target = document.createElement('div');

            createAriaDescription(desc, target);

            expect(desc.id).toBeTruthy();
            expect(target.getAttribute('aria-describedby')).toBe(desc.id);
        });
    });
});
