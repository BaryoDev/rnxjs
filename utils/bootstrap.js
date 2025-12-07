
import { getBootstrap } from './config.js';

/**
 * Safe wrapper for the global bootstrap object.
 * Handles cases where bootstrap.js might not be loaded.
 */
export const bs = {
    get Modal() { return getBootstrap()?.Modal; },
    get Toast() { return getBootstrap()?.Toast; },
    get Tooltip() { return getBootstrap()?.Tooltip; },
    get Popover() { return getBootstrap()?.Popover; },

    /**
     * Checks if Bootstrap JS is available
     * @returns {boolean}
     */
    isAvailable: () => typeof getBootstrap() !== 'undefined'
};
