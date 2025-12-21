/**
 * Storage Plugin for rnxJS
 *
 * Persistent state storage with localStorage/sessionStorage.
 *
 * Usage:
 * import { storagePlugin } from '@arnelirobles/rnxjs';
 *
 * rnx.plugins.use(storagePlugin, {
 *   storage: localStorage,
 *   prefix: 'myapp_'
 * });
 *
 * const state = rnx.createReactiveState({
 *   user: null,
 *   theme: 'light',
 *   notifications: true
 * });
 *
 * // Persist specific paths
 * rnx.storage.persist(state, 'app-state', ['theme', 'notifications']);
 *
 * // Now state.theme and state.notifications will be:
 * // - Loaded from localStorage on init
 * // - Saved to localStorage on change
 */

export function storagePlugin(options = {}) {
  const {
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    prefix = 'rnx_'
  } = options;

  return {
    name: 'storage',

    install() {
      /**
       * Get nested value from object using dot notation
       * getNestedValue(obj, 'user.profile.name')
       */
      function getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
          if (current == null) return undefined;
          current = current[key];
        }

        return current;
      }

      /**
       * Set nested value in object using dot notation
       * setNestedValue(obj, 'user.profile.name', 'John')
       */
      function setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        }

        current[keys[keys.length - 1]] = value;
      }

      /**
       * Persist state paths to storage
       */
      function persist(state, key, paths = null) {
        if (!storage) {
          console.warn('[rnxJS Storage] No storage available');
          return;
        }

        const storageKey = prefix + key;
        const pathsToWatch = paths || Object.keys(state);

        // Load initial values from storage
        try {
          const saved = storage.getItem(storageKey);
          if (saved) {
            const data = JSON.parse(saved);
            for (const [path, value] of Object.entries(data)) {
              try {
                setNestedValue(state, path, value);
              } catch (e) {
                console.warn(`[rnxJS Storage] Failed to restore ${path}:`, e);
              }
            }
          }
        } catch (e) {
          console.warn('[rnxJS Storage] Failed to load initial data:', e);
        }

        // Subscribe to changes
        pathsToWatch.forEach(path => {
          state.subscribe(path, () => {
            try {
              const data = {};
              pathsToWatch.forEach(p => {
                data[p] = getNestedValue(state, p);
              });
              storage.setItem(storageKey, JSON.stringify(data));
            } catch (e) {
              console.warn('[rnxJS Storage] Failed to save:', e);
            }
          });
        });

        console.log(`[rnxJS Storage] Persisting ${pathsToWatch.length} paths to "${storageKey}"`);
      }

      /**
       * Clear persisted data
       */
      function clear(key) {
        if (!storage) return;

        const storageKey = prefix + key;
        try {
          storage.removeItem(storageKey);
          console.log(`[rnxJS Storage] Cleared "${storageKey}"`);
        } catch (e) {
          console.warn('[rnxJS Storage] Failed to clear:', e);
        }
      }

      /**
       * Get raw stored data
       */
      function get(key) {
        if (!storage) return null;

        const storageKey = prefix + key;
        try {
          const data = storage.getItem(storageKey);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.warn('[rnxJS Storage] Failed to get data:', e);
          return null;
        }
      }

      /**
       * Set raw data
       */
      function set(key, data) {
        if (!storage) return;

        const storageKey = prefix + key;
        try {
          storage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
          console.warn('[rnxJS Storage] Failed to set data:', e);
        }
      }

      // Public API
      window.rnx = window.rnx || {};
      window.rnx.storage = {
        persist,
        clear,
        get,
        set
      };

      console.log('[rnxJS Storage] Initialized');
    }
  };
}

export default storagePlugin;
