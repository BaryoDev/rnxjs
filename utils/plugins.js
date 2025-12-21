/**
 * Plugin System for rnxJS
 *
 * Provides extensible plugin architecture with hooks for customization.
 *
 * Usage:
 * import { plugins } from '@arnelirobles/rnxjs';
 *
 * plugins.use(myPlugin, options);
 * await plugins.runHook('before:load', context);
 */

/**
 * Plugin Manager - Core plugin system
 */
export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  /**
   * Register a plugin
   * @param {Function|Object} plugin - Plugin or plugin factory function
   * @param {Object} options - Plugin options
   */
  use(plugin, options = {}) {
    // If plugin is a function, call it to get plugin object
    if (typeof plugin === 'function') {
      plugin = plugin(options);
    }

    // Validate plugin
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('[rnxJS] Plugin must be an object or factory function');
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('[rnxJS] Plugin must have a name property');
    }

    // Check if already registered
    if (this.plugins.has(plugin.name)) {
      console.warn(`[rnxJS] Plugin "${plugin.name}" is already registered`);
      return;
    }

    // Store plugin
    this.plugins.set(plugin.name, plugin);

    // Call plugin install hook
    if (typeof plugin.install === 'function') {
      try {
        plugin.install(this.getContext());
      } catch (error) {
        console.error(`[rnxJS] Error installing plugin "${plugin.name}":`, error);
        this.plugins.delete(plugin.name);
        throw error;
      }
    }

    // Register plugin hooks
    if (plugin.hooks && typeof plugin.hooks === 'object') {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        if (typeof handler === 'function') {
          this.addHook(hookName, handler);
        }
      }
    }

    console.log(`[rnxJS] Plugin "${plugin.name}" installed`);
  }

  /**
   * Add a hook handler
   * @param {string} name - Hook name
   * @param {Function} handler - Hook handler function
   */
  addHook(name, handler) {
    if (typeof name !== 'string' || typeof handler !== 'function') {
      throw new Error('[rnxJS] Hook name must be string and handler must be function');
    }

    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    this.hooks.get(name).push(handler);
  }

  /**
   * Run all handlers for a hook
   * @param {string} name - Hook name
   * @param {Object} context - Context to pass to handlers
   */
  async runHook(name, context = {}) {
    const handlers = this.hooks.get(name) || [];

    for (const handler of handlers) {
      try {
        await handler(context);
      } catch (error) {
        console.error(`[rnxJS] Error in hook "${name}":`, error);
      }
    }
  }

  /**
   * Get plugin context (API available to plugins)
   * @returns {Object} Plugin context
   */
  getContext() {
    return {
      registerComponent: typeof window !== 'undefined' && window.rnx?.registerComponent,
      createReactiveState: typeof window !== 'undefined' && window.rnx?.createReactiveState,
      addHook: this.addHook.bind(this),
      runHook: this.runHook.bind(this),
      plugins: this.plugins
    };
  }

  /**
   * Get a registered plugin
   * @param {string} name - Plugin name
   * @returns {Object} Plugin object or undefined
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is registered
   * @param {string} name - Plugin name
   * @returns {boolean}
   */
  hasPlugin(name) {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugins
   * @returns {Map} All plugins
   */
  getPlugins() {
    return new Map(this.plugins);
  }
}

// Global plugin manager instance
export const plugins = new PluginManager();

// Export for global access
if (typeof window !== 'undefined') {
  window.rnx = window.rnx || {};
  window.rnx.plugins = plugins;
}
