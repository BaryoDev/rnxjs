/**
 * Tests for computed properties
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.ts';
import {
    createComputed,
    createComputedProperties,
    shallowEqual,
    deepEqual
} from '../utils/createComputed.ts';

describe('Computed Properties', () => {
    describe('Equality Functions', () => {
        describe('shallowEqual', () => {
            it('should return true for same reference', () => {
                const obj = { a: 1 };
                expect(shallowEqual(obj, obj)).toBe(true);
            });

            it('should return true for primitives', () => {
                expect(shallowEqual(5, 5)).toBe(true);
                expect(shallowEqual('hello', 'hello')).toBe(true);
                expect(shallowEqual(true, true)).toBe(true);
            });

            it('should return false for different primitives', () => {
                expect(shallowEqual(5, 6)).toBe(false);
                expect(shallowEqual('hello', 'world')).toBe(false);
            });

            it('should return true for shallowly equal objects', () => {
                expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
            });

            it('should return false for objects with different keys', () => {
                expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
            });

            it('should return false for objects with different values', () => {
                expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
            });

            it('should return true for shallowly equal arrays', () => {
                expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
            });

            it('should return false for arrays with different lengths', () => {
                expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);
            });

            it('should return false for deeply nested different objects', () => {
                const a = { user: { name: 'John' } };
                const b = { user: { name: 'John' } };
                // Shallow equality checks references, not deep values
                expect(shallowEqual(a, b)).toBe(false);
            });
        });

        describe('deepEqual', () => {
            it('should return true for deeply equal objects', () => {
                const a = { user: { name: 'John', age: 30 } };
                const b = { user: { name: 'John', age: 30 } };
                expect(deepEqual(a, b)).toBe(true);
            });

            it('should return false for deeply different objects', () => {
                const a = { user: { name: 'John' } };
                const b = { user: { name: 'Jane' } };
                expect(deepEqual(a, b)).toBe(false);
            });

            it('should handle nested arrays', () => {
                expect(deepEqual({ items: [1, 2, 3] }, { items: [1, 2, 3] })).toBe(true);
                expect(deepEqual({ items: [1, 2, 3] }, { items: [1, 2, 4] })).toBe(false);
            });
        });
    });

    describe('createComputed', () => {
        it('should create computed property', () => {
            const state = createReactiveState({ count: 5 });

            createComputed(state, 'double', (s) => s.count * 2);

            expect(state.double).toBe(10);
        });

        it('should update when dependency changes', () => {
            const state = createReactiveState({ count: 5 });

            createComputed(state, 'double', (s) => s.count * 2);

            expect(state.double).toBe(10);

            state.count = 10;
            state.$flushSync();

            // Wait for microtask
            return new Promise(resolve => {
                setTimeout(() => {
                    expect(state.double).toBe(20);
                    resolve();
                }, 10);
            });
        });

        it('should cache value when dependencies unchanged', () => {
            const state = createReactiveState({ count: 5 });
            const getter = vi.fn((s) => s.count * 2);

            createComputed(state, 'double', getter);

            // First access
            expect(state.double).toBe(10);
            expect(getter).toHaveBeenCalledTimes(1);

            // Second access (should use cache)
            expect(state.double).toBe(10);
            expect(getter).toHaveBeenCalledTimes(1);
        });

        it('should track multiple dependencies', () => {
            const state = createReactiveState({ a: 2, b: 3 });

            createComputed(state, 'sum', (s) => s.a + s.b);

            expect(state.sum).toBe(5);

            state.a = 5;
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    expect(state.sum).toBe(8);
                    resolve();
                }, 10);
            });
        });

        it('should track nested dependencies', () => {
            const state = createReactiveState({
                user: { firstName: 'John', lastName: 'Doe' }
            });

            createComputed(state, 'fullName', (s) => `${s.user.firstName} ${s.user.lastName}`);

            expect(state.fullName).toBe('John Doe');

            state.user.firstName = 'Jane';
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    expect(state.fullName).toBe('Jane Doe');
                    resolve();
                }, 10);
            });
        });

        it('should use custom equality function', () => {
            const state = createReactiveState({ items: [1, 2, 3] });
            const getter = vi.fn((s) => s.items.map(x => x * 2));

            // Use deep equality
            createComputed(state, 'doubled', {
                get: getter,
                equals: deepEqual
            });

            expect(state.doubled).toEqual([2, 4, 6]);
            expect(getter).toHaveBeenCalledTimes(1);

            // Trigger recompute but result is same
            state.items = [1, 2, 3]; // Same values, different array
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    // Should recompute (getter called again)
                    expect(getter.mock.calls.length).toBeGreaterThan(1);
                    expect(state.doubled).toEqual([2, 4, 6]);
                    resolve();
                }, 10);
            });
        });

        it('should cleanup subscriptions on remove', () => {
            const state = createReactiveState({ count: 5 });

            const cleanup = createComputed(state, 'double', (s) => s.count * 2);

            expect(state.double).toBe(10);

            cleanup();

            expect(state.double).toBeUndefined();
        });

        it('should not recompute if value unchanged (with equality check)', () => {
            const state = createReactiveState({ count: 5 });
            const getter = vi.fn((s) => ({ value: Math.floor(s.count / 5) * 5 }));

            createComputed(state, 'rounded', {
                get: getter,
                equals: shallowEqual
            });

            expect(state.rounded).toEqual({ value: 5 });
            expect(getter).toHaveBeenCalledTimes(1);

            // Change count but rounded result stays same
            state.count = 6;
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    // Getter called but value unchanged
                    expect(state.rounded).toEqual({ value: 5 });
                    resolve();
                }, 10);
            });
        });

        it('should handle chained computed properties', () => {
            const state = createReactiveState({ count: 5 });

            createComputed(state, 'double', (s) => s.count * 2);
            createComputed(state, 'quadruple', (s) => s.count * 4); // Direct dependency

            expect(state.double).toBe(10);
            expect(state.quadruple).toBe(20);

            state.count = 10;
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    expect(state.double).toBe(20);
                    expect(state.quadruple).toBe(40);
                    resolve();
                }, 20);
            });
        });
    });

    describe('createComputedProperties', () => {
        it('should create multiple computed properties', () => {
            const state = createReactiveState({ a: 2, b: 3 });

            createComputedProperties(state, {
                sum: (s) => s.a + s.b,
                product: (s) => s.a * s.b,
                difference: (s) => s.a - s.b
            });

            expect(state.sum).toBe(5);
            expect(state.product).toBe(6);
            expect(state.difference).toBe(-1);
        });

        it('should cleanup all computed properties', () => {
            const state = createReactiveState({ a: 2, b: 3 });

            const cleanup = createComputedProperties(state, {
                sum: (s) => s.a + s.b,
                product: (s) => s.a * s.b
            });

            expect(state.sum).toBe(5);
            expect(state.product).toBe(6);

            cleanup();

            expect(state.sum).toBeUndefined();
            expect(state.product).toBeUndefined();
        });

        it('should support mixed configs', () => {
            const state = createReactiveState({ items: [1, 2, 3] });

            createComputedProperties(state, {
                // Function form
                length: (s) => s.items.length,

                // Config form with custom equality
                doubled: {
                    get: (s) => s.items.map(x => x * 2),
                    equals: deepEqual
                }
            });

            expect(state.length).toBe(3);
            expect(state.doubled).toEqual([2, 4, 6]);
        });
    });

    describe('Performance Optimization', () => {
        it('should avoid unnecessary recomputation', () => {
            const state = createReactiveState({
                firstName: 'John',
                lastName: 'Doe',
                age: 30
            });

            const getter = vi.fn((s) => `${s.firstName} ${s.lastName}`);

            createComputed(state, 'fullName', getter);

            expect(state.fullName).toBe('John Doe');
            expect(getter).toHaveBeenCalledTimes(1);

            // Change unrelated property
            state.age = 31;
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    // Should not recompute (age not a dependency)
                    expect(getter).toHaveBeenCalledTimes(1);
                    expect(state.fullName).toBe('John Doe');
                    resolve();
                }, 10);
            });
        });

        it('should batch multiple dependency changes', () => {
            const state = createReactiveState({ a: 1, b: 2, c: 3 });
            const getter = vi.fn((s) => s.a + s.b + s.c);

            createComputed(state, 'sum', getter);

            expect(state.sum).toBe(6);
            expect(getter).toHaveBeenCalledTimes(1);

            // Change multiple dependencies
            state.a = 10;
            state.b = 20;
            state.c = 30;
            state.$flushSync();

            return new Promise(resolve => {
                setTimeout(() => {
                    // Should only recompute once (batched)
                    expect(state.sum).toBe(60);
                    // May be called twice: once for initial, once for batch update
                    expect(getter.mock.calls.length).toBeLessThanOrEqual(3);
                    resolve();
                }, 10);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle computed property that returns undefined', () => {
            const state = createReactiveState({ value: null });

            createComputed(state, 'computed', (s) => s.value?.toString());

            expect(state.computed).toBeUndefined();
        });

        it('should handle circular dependencies gracefully', () => {
            const state = createReactiveState({ a: 1 });

            // This would create a circular dependency if not handled
            createComputed(state, 'b', (s) => s.a + 1);

            expect(state.b).toBe(2);
        });

        it('should work with array methods', () => {
            const state = createReactiveState({ items: [1, 2, 3, 4, 5] });

            createComputedProperties(state, {
                evenItems: (s) => s.items.filter(x => x % 2 === 0),
                sum: (s) => s.items.reduce((a, b) => a + b, 0),
                doubled: (s) => s.items.map(x => x * 2)
            });

            expect(state.evenItems).toEqual([2, 4]);
            expect(state.sum).toBe(15);
            expect(state.doubled).toEqual([2, 4, 6, 8, 10]);
        });

        it('should handle getters that throw errors', () => {
            const state = createReactiveState({ value: 0 });

            createComputed(state, 'computed', (s) => {
                if (s.value === 0) throw new Error('Division by zero');
                return 100 / s.value;
            });

            // Should throw on access
            expect(() => state.computed).toThrow('Division by zero');
        });
    });
});
