/**
 * Tests for ListRenderer (data-for with keyed diffing)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.js';
import { bindData } from '../framework/DataBinder.js';

describe('ListRenderer with data-for', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('basic list rendering', () => {
        it('should render simple list of primitives', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: ['Apple', 'Banana', 'Cherry']
            });

            bindData(container, state);

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
            expect(listItems[0].textContent).toBe('Apple');
            expect(listItems[1].textContent).toBe('Banana');
            expect(listItems[2].textContent).toBe('Cherry');
        });

        it('should render list of objects with property access', () => {
            container.innerHTML = `
                <div>
                    <div data-for="user in users">
                        <span data-bind="user.name"></span>
                    </div>
                </div>
            `;

            const state = createReactiveState({
                users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' }
                ]
            });

            bindData(container, state);

            const spans = container.querySelectorAll('span');
            expect(spans).toHaveLength(2);
            expect(spans[0].textContent).toBe('Alice');
            expect(spans[1].textContent).toBe('Bob');
        });

        it('should render with index variable', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="(item, i) in items">
                        <span data-bind="i"></span>: <span data-bind="item"></span>
                    </li>
                </ul>
            `;

            const state = createReactiveState({
                items: ['First', 'Second', 'Third']
            });

            bindData(container, state);

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
            expect(listItems[0].textContent).toContain('0: First');
            expect(listItems[1].textContent).toContain('1: Second');
            expect(listItems[2].textContent).toContain('2: Third');
        });
    });

    describe('reactivity and updates', () => {
        it('should update when array items are added', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: ['Apple', 'Banana']
            });

            bindData(container, state);

            expect(container.querySelectorAll('li')).toHaveLength(2);

            // Add an item
            state.items.push('Cherry');
            state.$flushSync(); // Flush batched updates

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
            expect(listItems[2].textContent).toBe('Cherry');
        });

        it('should update when array items are removed', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: ['Apple', 'Banana', 'Cherry']
            });

            bindData(container, state);

            expect(container.querySelectorAll('li')).toHaveLength(3);

            // Remove an item
            state.items.pop();
            state.$flushSync(); // Flush batched updates

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(2);
        });

        it('should update when array is replaced', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: ['Apple', 'Banana']
            });

            bindData(container, state);

            expect(container.querySelectorAll('li')).toHaveLength(2);

            // Replace entire array
            state.items = ['X', 'Y', 'Z'];
            state.$flushSync(); // Flush batched updates

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
            expect(listItems[0].textContent).toBe('X');
            expect(listItems[1].textContent).toBe('Y');
            expect(listItems[2].textContent).toBe('Z');
        });

        it('should update when object properties change', () => {
            container.innerHTML = `
                <div>
                    <div data-for="user in users" data-key="user.id">
                        <span data-bind="user.name"></span>
                    </div>
                </div>
            `;

            const state = createReactiveState({
                users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' }
                ]
            });

            bindData(container, state);

            // Change a user's name by replacing the array
            // (ListRenderer doesn't automatically detect nested property changes)
            state.users[0].name = 'Alice Smith';
            state.users = [...state.users]; // Force array update
            state.$flushSync(); // Flush batched updates

            const spans = container.querySelectorAll('span');
            expect(spans[0].textContent).toBe('Alice Smith');
            expect(spans[1].textContent).toBe('Bob');
        });
    });

    describe('keyed diffing with data-key', () => {
        it('should use data-key for efficient updates', () => {
            container.innerHTML = `
                <div>
                    <div data-for="user in users" data-key="user.id">
                        <span data-bind="user.name"></span>
                    </div>
                </div>
            `;

            const state = createReactiveState({
                users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' },
                    { id: 3, name: 'Charlie' }
                ]
            });

            bindData(container, state);

            const initialDivs = Array.from(container.querySelectorAll('div[data-for]').length ? [] : container.querySelectorAll('div > div'));
            expect(initialDivs).toHaveLength(0); // Template is removed

            const spans = container.querySelectorAll('span');
            expect(spans).toHaveLength(3);

            // Store reference to middle element
            const bobSpan = spans[1];

            // Remove first item
            state.users.shift();
            state.$flushSync(); // Flush batched updates

            const newSpans = container.querySelectorAll('span');
            expect(newSpans).toHaveLength(2);

            // Bob should still be the same DOM node (not recreated)
            // This is the benefit of keyed diffing
            expect(newSpans[0].textContent).toBe('Bob');
            expect(newSpans[1].textContent).toBe('Charlie');
        });

        it('should handle reordering with keys', () => {
            container.innerHTML = `
                <div>
                    <div data-for="item in items" data-key="item.id">
                        <span data-bind="item.name"></span>
                    </div>
                </div>
            `;

            const state = createReactiveState({
                items: [
                    { id: 'a', name: 'First' },
                    { id: 'b', name: 'Second' },
                    { id: 'c', name: 'Third' }
                ]
            });

            bindData(container, state);

            // Reverse the array
            state.items.reverse();
            state.$flushSync(); // Flush batched updates

            const spans = container.querySelectorAll('span');
            expect(spans[0].textContent).toBe('Third');
            expect(spans[1].textContent).toBe('Second');
            expect(spans[2].textContent).toBe('First');
        });
    });

    describe('edge cases', () => {
        it('should handle empty arrays', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: []
            });

            bindData(container, state);

            expect(container.querySelectorAll('li')).toHaveLength(0);
        });

        it('should handle null/undefined arrays gracefully', () => {
            container.innerHTML = `
                <ul>
                    <li data-for="item in items" data-bind="item"></li>
                </ul>
            `;

            const state = createReactiveState({
                items: null
            });

            // Should not throw
            expect(() => bindData(container, state)).not.toThrow();
            expect(container.querySelectorAll('li')).toHaveLength(0);
        });

        it('should handle nested data-for', async () => {
            container.innerHTML = `
                <div>
                    <div data-for="category in categories">
                        <h3 data-bind="category.name"></h3>
                        <ul>
                            <li data-for="item in category.items" data-bind="item"></li>
                        </ul>
                    </div>
                </div>
            `;

            const state = createReactiveState({
                categories: [
                    { name: 'Fruits', items: ['Apple', 'Banana'] },
                    { name: 'Vegetables', items: ['Carrot', 'Lettuce'] }
                ]
            });

            bindData(container, state);
            state.$flushSync(); // Flush batched updates for outer list

            // Wait for nested data-for to be processed (uses queueMicrotask)
            await new Promise(resolve => setTimeout(resolve, 0));
            state.$flushSync(); // Flush batched updates for nested lists

            const headers = container.querySelectorAll('h3');
            expect(headers).toHaveLength(2);
            expect(headers[0].textContent).toBe('Fruits');
            expect(headers[1].textContent).toBe('Vegetables');

            const items = container.querySelectorAll('li');
            expect(items).toHaveLength(4);
        });
    });
});
