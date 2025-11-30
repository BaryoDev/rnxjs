
/**
 * Safe wrapper for the global bootstrap object.
 * Handles cases where bootstrap.js might not be loaded.
 */
export const bs = {
    get Modal() { return window.bootstrap?.Modal; },
    get Toast() { return window.bootstrap?.Toast; },
    get Tooltip() { return window.bootstrap?.Tooltip; },
    get Popover() { return window.bootstrap?.Popover; },

    /**
     * Checks if Bootstrap JS is available
     * @returns {boolean}
     */
    isAvailable: () => typeof window.bootstrap !== 'undefined'
};
