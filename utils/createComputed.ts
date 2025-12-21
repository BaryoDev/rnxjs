/**
 * Computed properties for reactive state
 * Provides lazy evaluation, automatic dependency tracking, and equality checking
 */

import type { ReactiveState, SubscriberCallback } from './createReactiveState.ts';

/**
 * Computed property getter function
 */
export type ComputedGetter<T, R> = (state: T) => R;

/**
 * Computed property configuration
 */
export interface ComputedConfig<T, R> {
    /** Getter function that computes the value */
    get: ComputedGetter<T, R>;
    /** Custom equality function (defaults to shallow equality) */
    equals?: (a: R, b: R) => boolean;
}

/**
 * Internal computed property state
 */
interface ComputedState<R> {
    /** Cached computed value */
    value: R | undefined;
    /** Whether the cached value is stale */
    dirty: boolean;
    /** Dependencies (state paths accessed during computation) */
    dependencies: Set<string>;
    /** Whether currently computing (to track dependencies) */
    isComputing: boolean;
    /** Unsubscribe functions for dependency subscriptions */
    unsubscribers: Array<() => void>;
}

/**
 * Shallow equality check for computed values
 * @param a - First value
 * @param b - Second value
 * @returns True if values are shallowly equal
 */
export function shallowEqual<T>(a: T, b: T): boolean {
    // Same reference or both primitives equal
    if (a === b) return true;

    // Type mismatch
    if (typeof a !== typeof b) return false;

    // Non-object types
    if (typeof a !== 'object' || a === null || b === null) return false;

    // Array check
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    // Object comparison
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if ((a as any)[key] !== (b as any)[key]) return false;
    }

    return true;
}

/**
 * Deep equality check for computed values
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export function deepEqual<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!deepEqual((a as any)[key], (b as any)[key])) return false;
    }

    return true;
}

/**
 * Create a computed property on a reactive state
 * @param state - Reactive state object
 * @param name - Property name for the computed value
 * @param config - Computed property configuration
 * @returns Unsubscribe function to remove the computed property
 */
export function createComputed<T extends Record<string, any>, R>(
    state: T & ReactiveState<T>,
    name: string,
    config: ComputedGetter<T, R> | ComputedConfig<T, R>
): () => void {
    // Normalize config
    const getter = typeof config === 'function' ? config : config.get;
    const equals = typeof config === 'function' ? shallowEqual : (config.equals || shallowEqual);

    // Internal state for this computed property
    const computedState: ComputedState<R> = {
        value: undefined,
        dirty: true,
        dependencies: new Set(),
        isComputing: false,
        unsubscribers: []
    };

    /**
     * Compute the value and update dependencies
     */
    const compute = (): R => {
        if (!computedState.dirty && computedState.value !== undefined) {
            return computedState.value;
        }

        computedState.isComputing = true;
        const oldDependencies = computedState.dependencies;
        computedState.dependencies = new Set();

        try {
            // Create a proxy to track property access
            const trackingProxy = new Proxy(state, {
                get(target, prop) {
                    // Track this property as a dependency
                    if (computedState.isComputing && typeof prop === 'string') {
                        computedState.dependencies.add(prop);
                    }
                    return target[prop as keyof T];
                }
            });

            const newValue = getter(trackingProxy);

            // Only update if value changed (using equality check)
            const hasChanged = computedState.value === undefined || !equals(computedState.value, newValue);

            computedState.value = newValue;
            computedState.dirty = false;

            // Update subscriptions if dependencies changed
            const depsChanged = !setsEqual(oldDependencies, computedState.dependencies);
            if (depsChanged) {
                updateSubscriptions();
            }

            return newValue;
        } finally {
            computedState.isComputing = false;
        }
    };

    /**
     * Mark computed as dirty when dependencies change
     */
    const invalidate = (): void => {
        if (!computedState.dirty) {
            computedState.dirty = true;

            // Recompute in next microtask and notify if changed
            queueMicrotask(() => {
                const oldValue = computedState.value;
                const newValue = compute();

                // Notify subscribers if value changed
                if (oldValue === undefined || !equals(oldValue, newValue)) {
                    // Trigger state update notification
                    (state as any)[name] = newValue;
                }
            });
        }
    };

    /**
     * Update dependency subscriptions
     */
    const updateSubscriptions = (): void => {
        // Unsubscribe from old dependencies
        computedState.unsubscribers.forEach(unsub => unsub());
        computedState.unsubscribers = [];

        // Subscribe to new dependencies
        for (const dep of computedState.dependencies) {
            const unsubscribe = state.subscribe(dep, invalidate);
            computedState.unsubscribers.push(unsubscribe);
        }
    };

    /**
     * Check if two sets are equal
     */
    const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
        if (a.size !== b.size) return false;
        for (const item of a) {
            if (!b.has(item)) return false;
        }
        return true;
    };

    // Define computed property on state
    Object.defineProperty(state, name, {
        get: compute,
        enumerable: true,
        configurable: true
    });

    // Initial computation (wrapped in try-catch to handle errors gracefully)
    try {
        compute();
    } catch (error) {
        // Allow errors during initial computation, will throw again on access
        computedState.dirty = true;
    }

    // Return cleanup function
    return () => {
        computedState.unsubscribers.forEach(unsub => unsub());
        computedState.unsubscribers = [];
        delete (state as any)[name];
    };
}

/**
 * Create multiple computed properties at once
 * @param state - Reactive state object
 * @param computedProperties - Object mapping property names to getters
 * @returns Cleanup function to remove all computed properties
 */
export function createComputedProperties<T extends Record<string, any>>(
    state: T & ReactiveState<T>,
    computedProperties: Record<string, ComputedGetter<T, any> | ComputedConfig<T, any>>
): () => void {
    const cleanupFunctions: Array<() => void> = [];

    for (const [name, config] of Object.entries(computedProperties)) {
        const cleanup = createComputed(state, name, config);
        cleanupFunctions.push(cleanup);
    }

    return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
}
