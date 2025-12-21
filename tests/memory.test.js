/**
 * Tests for memory leak prevention and cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createReactiveState } from '../utils/createReactiveState.ts';
import { createComponent } from '../utils/createComponent.js';

describe('Memory Leak Prevention', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Reactive State Cleanup', () => {
        it('should have $unsubscribeAll method', () => {
            const state = createReactiveState({ count: 0 });
            expect(typeof state.$unsubscribeAll).toBe('function');
        });

        it('should have $destroy method', () => {
            const state = createReactiveState({ count: 0 });
            expect(typeof state.$destroy).toBe('function');
        });

        it('should unsubscribe all listeners with $unsubscribeAll', () => {
            const state = createReactiveState({ count: 0 });
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            state.subscribe('count', callback1);
            state.subscribe('count', callback2);

            state.count = 1;
            state.$flushSync();

            expect(callback1).toHaveBeenCalledWith(1);
            expect(callback2).toHaveBeenCalledWith(1);

            state.$unsubscribeAll();

            state.count = 2;
            state.$flushSync();

            // Callbacks should not be called after unsubscribeAll
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it('should cleanup all resources with $destroy', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            state.subscribe('count', callback);

            state.$destroy();

            state.count = 1;
            state.$flushSync();

            // Callback should not be called after destroy
            expect(callback).not.toHaveBeenCalled();
        });

        it('should allow unsubscribe via returned function', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            const unsubscribe = state.subscribe('count', callback);

            state.count = 1;
            state.$flushSync();

            expect(callback).toHaveBeenCalledWith(1);

            unsubscribe();

            state.count = 2;
            state.$flushSync();

            // Callback should not be called after unsubscribe
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should clean up empty subscription paths', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            const unsubscribe = state.subscribe('count', callback);
            unsubscribe();

            // After unsubscribing, the path should be cleaned up
            // This is internal, but we can verify by subscribing again
            const callback2 = vi.fn();
            state.subscribe('count', callback2);

            state.count = 1;
            state.$flushSync();

            expect(callback2).toHaveBeenCalledWith(1);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should handle multiple unsubscribes gracefully', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            const unsubscribe = state.subscribe('count', callback);

            unsubscribe();
            unsubscribe(); // Second call should be safe
            unsubscribe(); // Third call should be safe

            state.count = 1;
            state.$flushSync();

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Component Auto-Cleanup', () => {
        it('should have destroy method', () => {
            const comp = createComponent(() => '<div>Test</div>');
            expect(typeof comp.destroy).toBe('function');
        });

        it('should cleanup effect on destroy', () => {
            const cleanup = vi.fn();
            const effect = vi.fn(() => cleanup);

            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            comp.useEffect(effect);

            // Wait for effect to run
            return new Promise(resolve => {
                setTimeout(() => {
                    expect(effect).toHaveBeenCalled();

                    comp.destroy();

                    expect(cleanup).toHaveBeenCalled();
                    resolve();
                }, 10);
            });
        });

        it('should cleanup unmount handler on destroy', () => {
            const unmount = vi.fn();

            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            comp.onUnmount(unmount);
            comp.destroy();

            expect(unmount).toHaveBeenCalled();
        });

        it('should clear refs on destroy', () => {
            const comp = createComponent(() => '<div data-ref="test">Test</div>');
            container.appendChild(comp);

            expect(comp.refs.test).toBeDefined();

            comp.destroy();

            expect(comp.refs).toEqual({});
        });

        it('should auto-cleanup when removed from DOM', () => {
            return new Promise((resolve) => {
                const cleanup = vi.fn();
                const effect = vi.fn(() => cleanup);

                const comp = createComponent(() => '<div>Test</div>');
                container.appendChild(comp);

                comp.useEffect(effect);

                // Wait for effect to run and observer to be set up
                setTimeout(() => {
                    expect(effect).toHaveBeenCalled();

                    // Remove component from DOM
                    container.removeChild(comp);

                    // Wait for MutationObserver to trigger
                    setTimeout(() => {
                        expect(cleanup).toHaveBeenCalled();
                        resolve();
                    }, 50);
                }, 20);
            });
        });

        it('should disconnect MutationObserver on manual destroy', () => {
            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            return new Promise(resolve => {
                // Wait for observer to be set up
                setTimeout(() => {
                    const observer = comp._mutationObserver;

                    if (observer) {
                        const disconnectSpy = vi.spyOn(observer, 'disconnect');
                        comp.destroy();
                        expect(disconnectSpy).toHaveBeenCalled();
                    }

                    resolve();
                }, 20);
            });
        });

        it('should not crash if destroyed before observer setup', () => {
            const comp = createComponent(() => '<div>Test</div>');

            // Destroy immediately before requestAnimationFrame callback
            expect(() => comp.destroy()).not.toThrow();
        });

        it('should handle component removed with parent', () => {
            return new Promise((resolve) => {
                const cleanup = vi.fn();
                const effect = vi.fn(() => cleanup);

                const wrapper = document.createElement('div');
                container.appendChild(wrapper);

                const comp = createComponent(() => '<div>Test</div>');
                wrapper.appendChild(comp);

                comp.useEffect(effect);

                // Wait for effect and observer setup
                setTimeout(() => {
                    expect(effect).toHaveBeenCalled();

                    // Remove parent wrapper (should trigger cleanup)
                    container.removeChild(wrapper);

                    // Wait for MutationObserver
                    setTimeout(() => {
                        expect(cleanup).toHaveBeenCalled();
                        resolve();
                    }, 50);
                }, 20);
            });
        });
    });

    describe('Subscription Memory Management', () => {
        it('should not leak subscriptions with multiple subscribe/unsubscribe cycles', () => {
            const state = createReactiveState({ count: 0 });
            const callbacks = [];

            // Create and remove many subscriptions
            for (let i = 0; i < 100; i++) {
                const callback = vi.fn();
                callbacks.push(callback);
                const unsubscribe = state.subscribe('count', callback);

                // Unsubscribe immediately
                unsubscribe();
            }

            // Should not notify any of the unsubscribed callbacks
            state.count = 1;
            state.$flushSync();

            callbacks.forEach(callback => {
                expect(callback).not.toHaveBeenCalled();
            });
        });

        it('should handle nested object subscriptions cleanup', () => {
            const state = createReactiveState({
                user: {
                    profile: {
                        name: 'John'
                    }
                }
            });

            const callback = vi.fn();
            const unsubscribe = state.subscribe('user.profile.name', callback);

            state.user.profile.name = 'Jane';
            state.$flushSync();

            expect(callback).toHaveBeenCalledWith('Jane');

            unsubscribe();

            state.user.profile.name = 'Bob';
            state.$flushSync();

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Component State Integration', () => {
        it('should cleanup component when state is destroyed', () => {
            const state = createReactiveState({ message: 'Hello' });

            const comp = createComponent(() => `<div>${state.message}</div>`);
            container.appendChild(comp);

            const cleanup = vi.fn();
            comp.onUnmount(cleanup);

            // Destroy state
            state.$destroy();

            // Component should still be functional, but state subscriptions are gone
            // Manual component cleanup should still work
            comp.destroy();
            expect(cleanup).toHaveBeenCalled();
        });

        it('should handle component with reactive state subscriptions', () => {
            const state = createReactiveState({ count: 0 });
            const callback = vi.fn();

            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            const unsubscribe = state.subscribe('count', callback);

            comp.onUnmount(() => {
                unsubscribe();
            });

            state.count = 1;
            state.$flushSync();

            expect(callback).toHaveBeenCalledWith(1);

            // Destroy component (should cleanup subscription)
            comp.destroy();

            state.count = 2;
            state.$flushSync();

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle destroying already destroyed component', () => {
            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            comp.destroy();

            // Second destroy should not crash
            expect(() => comp.destroy()).not.toThrow();
        });

        it('should handle destroying state twice', () => {
            const state = createReactiveState({ count: 0 });

            state.$destroy();

            // Second destroy should not crash
            expect(() => state.$destroy()).not.toThrow();
        });

        it('should handle component removed before observer setup completes', () => {
            const comp = createComponent(() => '<div>Test</div>');
            container.appendChild(comp);

            // Remove immediately (before requestAnimationFrame)
            container.removeChild(comp);

            // Should not crash
            return new Promise(resolve => {
                setTimeout(resolve, 50);
            });
        });
    });
});
