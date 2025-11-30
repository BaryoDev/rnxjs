import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.js';

describe('createReactiveState', () => {
    describe('Basic Functionality', () => {
        it('should create a reactive state object', () => {
            const state = createReactiveState({ count: 0 });
            expect(state.count).toBe(0);
        });

        it('should allow setting properties', () => {
            const state = createReactiveState({ count: 0 });
            state.count = 5;
            expect(state.count).toBe(5);
        });

        it('should throw error for non-object initialState', () => {
            expect(() => createReactiveState(null)).toThrow(TypeError);
            expect(() => createReactiveState('string')).toThrow(TypeError);
            expect(() => createReactiveState(123)).toThrow(TypeError);
        });
    });

    describe('Subscriptions', () => {
        it('should notify subscribers when property changes', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            state.subscribe('count', callback);
            state.count = 5;

            expect(callback).toHaveBeenCalledWith(5);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should not notify when value does not change', () => {
            const state = createReactiveState({ count: 5 });
            const callback = vi.fn();

            state.subscribe('count', callback);
            state.count = 5; // Same value

            expect(callback).not.toHaveBeenCalled();
        });

        it('should support multiple subscribers', () => {
            const state = createReactiveState({ count: 0 });
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            state.subscribe('count', callback1);
            state.subscribe('count', callback2);
            state.count = 10;

            expect(callback1).toHaveBeenCalledWith(10);
            expect(callback2).toHaveBeenCalledWith(10);
        });

        it('should unsubscribe correctly', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            const unsubscribe = state.subscribe('count', callback);
            state.count = 1;
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
            state.count = 2;
            expect(callback).toHaveBeenCalledTimes(1); // Not called again
        });

        it('should notify parent path subscribers', () => {
            const state = createReactiveState({ user: { name: 'Alice' } });
            const parentCallback = vi.fn();
            const childCallback = vi.fn();

            state.subscribe('user', parentCallback);
            state.subscribe('user.name', childCallback);
            state.user.name = 'Bob';

            expect(childCallback).toHaveBeenCalledWith('Bob');
            expect(parentCallback).toHaveBeenCalled();
        });

        it('should handle invalid subscribe arguments', () => {
            const state = createReactiveState({ count: 0 });
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const unsubscribe1 = state.subscribe('', vi.fn());
            const unsubscribe2 = state.subscribe('path', 'not a function');

            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(typeof unsubscribe1).toBe('function');
            expect(typeof unsubscribe2).toBe('function');

            consoleSpy.mockRestore();
        });
    });

    describe('Nested Objects', () => {
        it('should handle nested object updates', () => {
            const state = createReactiveState({
                user: {
                    profile: {
                        name: 'Alice'
                    }
                }
            });

            const callback = vi.fn();
            state.subscribe('user.profile.name', callback);
            state.user.profile.name = 'Bob';

            expect(callback).toHaveBeenCalledWith('Bob');
        });

        it('should handle deep nesting', () => {
            const state = createReactiveState({
                a: { b: { c: { d: { e: 'value' } } } }
            });

            expect(state.a.b.c.d.e).toBe('value');
            state.a.b.c.d.e = 'new value';
            expect(state.a.b.c.d.e).toBe('new value');
        });
    });

    describe('Array Reactivity', () => {
        it('should trigger notifications on push()', () => {
            const state = createReactiveState({ items: [1, 2, 3] });
            const callback = vi.fn();

            state.subscribe('items', callback);
            state.items.push(4);

            expect(callback).toHaveBeenCalled();
            expect(state.items).toContain(4);
        });

        it('should trigger notifications on pop()', () => {
            const state = createReactiveState({ items: [1, 2, 3] });
            const callback = vi.fn();

            state.subscribe('items', callback);
            const popped = state.items.pop();

            expect(callback).toHaveBeenCalled();
            expect(popped).toBe(3);
        });

        it('should trigger notifications on splice()', () => {
            const state = createReactiveState({ items: [1, 2, 3] });
            const callback = vi.fn();

            state.subscribe('items', callback);
            state.items.splice(1, 1);

            expect(callback).toHaveBeenCalled();
            expect(state.items).toEqual([1, 3]);
        });

        it('should handle array spread syntax', () => {
            const state = createReactiveState({ items: [1, 2, 3] });
            const spread = [...state.items];

            expect(spread).toEqual([1, 2, 3]);
        });

        it('should trigger notifications on sort()', () => {
            const state = createReactiveState({ items: [3, 1, 2] });
            const callback = vi.fn();

            state.subscribe('items', callback);
            state.items.sort();

            expect(callback).toHaveBeenCalled();
            expect(state.items).toEqual([1, 2, 3]);
        });
    });

    describe('Circular References', () => {
        it('should handle circular references correctly', () => {
            const obj = { a: { b: {} } };
            obj.a.b.circular = obj.a;

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const state = createReactiveState(obj);

            // Should handle circular reference without recursing infinitely
            expect(state.a).toBeDefined();
            expect(state.a.b).toBeDefined();
            // The circular property exists but won't be proxied further
            expect(state.a.b.circular).toBeDefined();

            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in subscriber callbacks', () => {
            const state = createReactiveState({ count: 0 });
            const errorCallback = vi.fn(() => {
                throw new Error('Subscriber error');
            });
            const normalCallback = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            state.subscribe('count', errorCallback);
            state.subscribe('count', normalCallback);
            state.count = 5;

            // Normal callback should still be called despite error
            expect(normalCallback).toHaveBeenCalledWith(5);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Cleanup', () => {
        it('should unsubscribe all listeners with $unsubscribeAll', () => {
            const state = createReactiveState({ count: 0 });
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            state.subscribe('count', callback1);
            state.subscribe('count', callback2);

            state.$unsubscribeAll();
            state.count = 5;

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });

        it('should cleanup all resources with $destroy', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            state.subscribe('count', callback);
            state.$destroy();
            state.count = 5;

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Proxy Caching', () => {
        it('should reuse proxy for the same object', () => {
            const state = createReactiveState({ user: { name: 'Alice' } });

            const ref1 = state.user;
            const ref2 = state.user;

            // Should be the exact same proxy
            expect(ref1).toBe(ref2);
        });
    });
});
