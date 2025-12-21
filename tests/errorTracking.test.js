/**
 * Tests for error tracking and ErrorBoundary
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    errorTracking,
    ConsoleProvider,
    withErrorTracking
} from '../utils/errorTracking.ts';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary.js';

describe('Error Tracking', () => {
    beforeEach(() => {
        errorTracking.disable();
        errorTracking.clearBreadcrumbs();
    });

    afterEach(() => {
        errorTracking.disable();
    });

    describe('ErrorTrackingManager', () => {
        it('should start disabled by default', () => {
            expect(errorTracking.isEnabled()).toBe(false);
        });

        it('should enable and disable', () => {
            errorTracking.enable();
            expect(errorTracking.isEnabled()).toBe(true);

            errorTracking.disable();
            expect(errorTracking.isEnabled()).toBe(false);
        });

        it('should register and use providers', () => {
            const provider = new ConsoleProvider();
            errorTracking.registerProvider(provider);

            errorTracking.enable();
            const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});

            errorTracking.captureError(new Error('Test'));

            expect(consoleGroupSpy).toHaveBeenCalled();
            consoleGroupSpy.mockRestore();
        });

        it('should add and remove custom error handlers', () => {
            errorTracking.enable();
            const handler = vi.fn();
            const unsubscribe = errorTracking.addHandler(handler);

            errorTracking.captureError(new Error('Test'));
            expect(handler).toHaveBeenCalled();

            handler.mockClear();
            unsubscribe();

            errorTracking.captureError(new Error('Test'));
            expect(handler).not.toHaveBeenCalled();
        });

        it('should set and use global context', () => {
            errorTracking.enable();
            const handler = vi.fn();
            errorTracking.addHandler(handler);

            errorTracking.setContext({
                user: { id: '123', email: 'test@example.com' },
                metadata: { version: '1.0.0' }
            });

            errorTracking.captureError(new Error('Test'));

            expect(handler).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    user: { id: '123', email: 'test@example.com' },
                    metadata: expect.objectContaining({ version: '1.0.0' })
                })
            );
        });
    });

    describe('Breadcrumbs', () => {
        it('should add and retrieve breadcrumbs', () => {
            errorTracking.addBreadcrumb('User clicked button', 'ui', { button: 'submit' });

            const breadcrumbs = errorTracking.getBreadcrumbs();
            expect(breadcrumbs.length).toBe(1);
            expect(breadcrumbs[0].message).toBe('User clicked button');
            expect(breadcrumbs[0].category).toBe('ui');
        });

        it('should clear breadcrumbs', () => {
            errorTracking.addBreadcrumb('Test 1');
            errorTracking.addBreadcrumb('Test 2');
            expect(errorTracking.getBreadcrumbs().length).toBe(2);

            errorTracking.clearBreadcrumbs();
            expect(errorTracking.getBreadcrumbs().length).toBe(0);
        });
    });

    describe('Error Capturing', () => {
        it('should not capture errors when disabled', () => {
            const handler = vi.fn();
            errorTracking.addHandler(handler);

            errorTracking.captureError(new Error('Test error'));

            expect(handler).not.toHaveBeenCalled();
        });

        it('should capture errors when enabled', () => {
            errorTracking.enable();
            const handler = vi.fn();
            errorTracking.addHandler(handler);

            const error = new Error('Test error');
            errorTracking.captureError(error);

            expect(handler).toHaveBeenCalledWith(error, expect.any(Object));
        });

        it('should send errors to registered providers', () => {
            errorTracking.enable();

            const provider = {
                name: 'test-provider',
                captureError: vi.fn()
            };
            errorTracking.registerProvider(provider);

            const error = new Error('Test error');
            errorTracking.captureError(error);

            expect(provider.captureError).toHaveBeenCalledWith(
                error,
                expect.any(Object)
            );
        });
    });

    describe('withErrorTracking', () => {
        it('should wrap function with error tracking', () => {
            errorTracking.enable();
            const handler = vi.fn();
            errorTracking.addHandler(handler);

            const fn = () => {
                throw new Error('Test error');
            };

            const wrapped = withErrorTracking(fn);

            expect(() => wrapped()).toThrow('Test error');
            expect(handler).toHaveBeenCalled();
        });

        it('should handle async functions', async () => {
            errorTracking.enable();
            const handler = vi.fn();
            errorTracking.addHandler(handler);

            const fn = async () => {
                throw new Error('Async error');
            };

            const wrapped = withErrorTracking(fn);

            await expect(wrapped()).rejects.toThrow('Async error');
            expect(handler).toHaveBeenCalled();
        });
    });
});

describe('ErrorBoundary Component', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        errorTracking.disable();
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    it('should render children when no error', () => {
        const child = document.createElement('div');
        child.textContent = 'Child content';
        child.className = 'child';

        const boundary = ErrorBoundary({ children: child });
        container.appendChild(boundary);

        return new Promise(resolve => {
            setTimeout(() => {
                const wrapper = boundary.querySelector('.rnx-error-boundary-wrapper');
                expect(wrapper).toBeDefined();
                resolve();
            }, 50);
        });
    });

    it('should throw error if children not provided', () => {
        expect(() => {
            ErrorBoundary({});
        }).toThrow('children is required');
    });

    it('should have getError method', () => {
        const child = document.createElement('div');
        const boundary = ErrorBoundary({ children: child });

        expect(typeof boundary.getError).toBe('function');
        const errorState = boundary.getError();
        expect(errorState.hasError).toBe(false);
    });

    it('should have resetError method', () => {
        const child = document.createElement('div');
        const boundary = ErrorBoundary({ children: child });

        expect(typeof boundary.resetError).toBe('function');
    });

    it('should handle multiple children', () => {
        const child1 = document.createElement('div');
        child1.textContent = 'Child 1';
        const child2 = document.createElement('div');
        child2.textContent = 'Child 2';

        const boundary = ErrorBoundary({
            children: [child1, child2]
        });
        container.appendChild(boundary);

        return new Promise(resolve => {
            setTimeout(() => {
                const wrapper = boundary.querySelector('.rnx-error-boundary-wrapper');
                expect(wrapper).toBeDefined();
                resolve();
            }, 50);
        });
    });
});
