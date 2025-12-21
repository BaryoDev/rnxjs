/**
 * Tests for update batching (Sprint 2 Task 2.2)
 * Verifies that multiple state updates are batched into a single microtask
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.ts';

describe('Update Batching', () => {
    let state;
    let callCount;
    let receivedValues;

    beforeEach(() => {
        state = createReactiveState({
            user: {
                name: 'Alice',
                email: 'alice@example.com',
                age: 30
            },
            counter: 0
        });
        callCount = 0;
        receivedValues = [];
    });

    describe('batching multiple updates', () => {
        it('should batch multiple property updates into one notification', async () => {
            const callback = vi.fn();
            state.subscribe('user', callback);

            // Make multiple updates synchronously
            state.user.name = 'Bob';
            state.user.email = 'bob@example.com';
            state.user.age = 35;

            // Callback should not be called yet (batched)
            expect(callback).not.toHaveBeenCalled();

            // Wait for microtask to complete
            await Promise.resolve();

            // Now callback should have been called exactly once
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({
                name: 'Bob',
                email: 'bob@example.com',
                age: 35
            });
        });

        it('should batch updates to the same property', async () => {
            const callback = vi.fn();
            state.subscribe('counter', callback);

            // Update same property multiple times
            state.counter = 1;
            state.counter = 2;
            state.counter = 3;
            state.counter = 4;
            state.counter = 5;

            // Not called yet
            expect(callback).not.toHaveBeenCalled();

            await Promise.resolve();

            // Called once with final value
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(5);
        });

        it('should batch array mutations', async () => {
            state.items = ['a', 'b', 'c'];
            const callback = vi.fn();
            state.subscribe('items', callback);

            // Multiple array mutations
            state.items.push('d');
            state.items.push('e');
            state.items.pop();

            expect(callback).not.toHaveBeenCalled();

            await Promise.resolve();

            // Should be called for each mutation (each is a separate path update)
            // But within a single microtask batch
            expect(callback).toHaveBeenCalled();
            expect(state.items).toEqual(['a', 'b', 'c', 'd']);
        });

        it('should reduce DOM updates in realistic scenario', async () => {
            // Simulate form with multiple fields
            state.form = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: ''
            };

            const callback = vi.fn();
            state.subscribe('form', callback);

            // User filling out form rapidly
            state.form.firstName = 'John';
            state.form.lastName = 'Doe';
            state.form.email = 'john@example.com';
            state.form.phone = '555-0123';
            state.form.address = '123 Main St';

            // No calls yet
            expect(callback).not.toHaveBeenCalled();

            await Promise.resolve();

            // Single update instead of 5
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('$flushSync utility', () => {
        it('should synchronously flush pending updates', () => {
            const callback = vi.fn();
            state.subscribe('counter', callback);

            state.counter = 1;
            state.counter = 2;

            // Force synchronous flush
            state.$flushSync();

            // Now it should be called
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(2);
        });

        it('should allow immediate DOM updates when needed', () => {
            const callback = vi.fn();
            state.subscribe('user.name', callback);

            state.user.name = 'Charlie';
            expect(callback).not.toHaveBeenCalled();

            // Flush immediately
            state.$flushSync();
            expect(callback).toHaveBeenCalledTimes(1);

            // Subsequent update after flush
            state.user.name = 'David';
            expect(callback).toHaveBeenCalledTimes(1); // Still 1

            state.$flushSync();
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('should be safe to call when no updates are pending', () => {
            expect(() => {
                state.$flushSync();
                state.$flushSync();
                state.$flushSync();
            }).not.toThrow();
        });
    });

    describe('parent path notifications', () => {
        it('should batch parent path notifications', async () => {
            const userCallback = vi.fn();
            const nameCallback = vi.fn();

            state.subscribe('user', userCallback);
            state.subscribe('user.name', nameCallback);

            state.user.name = 'Eve';

            await Promise.resolve();

            // Both should be called once
            expect(nameCallback).toHaveBeenCalledTimes(1);
            expect(userCallback).toHaveBeenCalledTimes(1);
        });

        it('should handle deeply nested updates efficiently', async () => {
            state.deep = {
                level1: {
                    level2: {
                        level3: {
                            value: 0
                        }
                    }
                }
            };

            const callbacks = {
                deep: vi.fn(),
                level1: vi.fn(),
                level2: vi.fn(),
                level3: vi.fn(),
                value: vi.fn()
            };

            state.subscribe('deep', callbacks.deep);
            state.subscribe('deep.level1', callbacks.level1);
            state.subscribe('deep.level1.level2', callbacks.level2);
            state.subscribe('deep.level1.level2.level3', callbacks.level3);
            state.subscribe('deep.level1.level2.level3.value', callbacks.value);

            // Update deep value
            state.deep.level1.level2.level3.value = 42;

            await Promise.resolve();

            // All should be called once
            expect(callbacks.value).toHaveBeenCalledTimes(1);
            expect(callbacks.level3).toHaveBeenCalledTimes(1);
            expect(callbacks.level2).toHaveBeenCalledTimes(1);
            expect(callbacks.level1).toHaveBeenCalledTimes(1);
            expect(callbacks.deep).toHaveBeenCalledTimes(1);
        });
    });

    describe('performance improvements', () => {
        it('should significantly reduce callback invocations', async () => {
            const callback = vi.fn();
            state.subscribe('counter', callback);

            // Simulate rapid updates (like animation or scroll handler)
            for (let i = 0; i < 1000; i++) {
                state.counter = i;
            }

            await Promise.resolve();

            // Without batching: 1000 calls
            // With batching: 1 call
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(999);
        });

        it('should handle multiple batches across microtasks', async () => {
            const callback = vi.fn();
            state.subscribe('counter', callback);

            // Batch 1
            state.counter = 1;
            state.counter = 2;
            await Promise.resolve();
            expect(callback).toHaveBeenCalledTimes(1);

            // Batch 2
            state.counter = 3;
            state.counter = 4;
            await Promise.resolve();
            expect(callback).toHaveBeenCalledTimes(2);

            // Batch 3
            state.counter = 5;
            await Promise.resolve();
            expect(callback).toHaveBeenCalledTimes(3);
        });
    });

    describe('edge cases', () => {
        it('should handle updates during notification', async () => {
            const callback = vi.fn((value) => {
                if (value === 1) {
                    state.counter = 2; // Update during callback
                }
            });

            state.subscribe('counter', callback);

            state.counter = 1;
            await Promise.resolve();

            // First call with 1
            expect(callback).toHaveBeenCalledWith(1);

            // Second update from inside callback should schedule new batch
            await Promise.resolve();
            expect(callback).toHaveBeenCalledWith(2);
        });

        it('should maintain update order within batch', async () => {
            state.log = [];
            const callback = vi.fn((value) => {
                receivedValues.push(value);
            });

            state.subscribe('counter', callback);

            state.counter = 1;
            state.counter = 2;
            state.counter = 3;

            await Promise.resolve();

            // Should receive final value
            expect(receivedValues).toEqual([3]);
        });

        it('should handle subscription during batching', async () => {
            state.counter = 1;

            // Subscribe after update but before flush
            const callback = vi.fn();
            state.subscribe('counter', callback);

            state.counter = 2;

            await Promise.resolve();

            // Should be notified with batched value
            expect(callback).toHaveBeenCalledWith(2);
        });
    });
});
