/**
 * rnxJS Express Middleware
 *
 * Provides Express middleware and view helpers for integrating rnxJS
 * reactive components into Express applications.
 */

const { renderScripts } = require('./scripts');
const { renderState } = require('./state');
const { renderComponent } = require('./component');
const { renderPlugin } = require('./plugin');

/**
 * Main rnxJS middleware factory
 *
 * @param {Object} options Configuration options
 * @param {boolean} options.cdn Use CDN (default: true)
 * @param {string} options.theme Theme to use ('bootstrap', 'm3', 'plugins', or null)
 * @returns {Function} Express middleware function
 */
function rnxMiddleware(options = {}) {
  const config = {
    cdn: options.cdn !== false,
    theme: options.theme || 'bootstrap',
    storagePrefix: options.storagePrefix || 'rnx_',
    routerMode: options.routerMode || 'hash',
    toastPosition: options.toastPosition || 'top-right',
    toastDuration: options.toastDuration || 3000,
    toastMax: options.toastMax || 5,
    ...options
  };

  return (req, res, next) => {
    // Add rnxJS helpers to res.locals
    res.locals.rnx = {
      /**
       * Render rnxJS script includes
       *
       * @param {boolean} cdn Use CDN
       * @param {string} theme Theme name
       * @returns {string} HTML script tags
       */
      scripts: (cdn = config.cdn, theme = config.theme) => {
        return renderScripts(cdn, theme);
      },

      /**
       * Create reactive state from data
       *
       * @param {*} data Data to serialize
       * @param {string} varName Variable name
       * @returns {string} Script tag with state initialization
       */
      state: (data, varName = 'state') => {
        return renderState(data, varName);
      },

      /**
       * Render an rnxJS component
       *
       * @param {string} name Component name
       * @param {Object} props Component properties
       * @returns {string} HTML component tag
       */
      component: (name, props = {}) => {
        return renderComponent(name, props);
      },

      /**
       * Initialize an rnxJS plugin
       *
       * @param {string} name Plugin name
       * @param {Object} options Plugin options
       * @returns {string} Script tag with plugin initialization
       */
      plugin: (name, options = {}) => {
        return renderPlugin(name, options);
      },

      /**
       * Create a data-bind attribute
       *
       * @param {string} path Data path
       * @returns {string} data-bind attribute
       */
      dataBind: (path) => {
        const escaped = String(path)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        return `data-bind="${escaped}"`;
      },

      /**
       * Create a data-rule attribute
       *
       * @param {string|Array} rules Validation rules
       * @returns {string} data-rule attribute
       */
      dataRule: (rules) => {
        const rulesStr = Array.isArray(rules) ? rules.join('|') : String(rules);
        const escaped = rulesStr
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        return `data-rule="${escaped}"`;
      },

      /**
       * Configuration object
       */
      config
    };

    next();
  };
}

/**
 * Configuration getter/setter
 */
rnxMiddleware.configure = function(options) {
  return rnxMiddleware(options);
};

module.exports = rnxMiddleware;
module.exports.renderScripts = renderScripts;
module.exports.renderState = renderState;
module.exports.renderComponent = renderComponent;
module.exports.renderPlugin = renderPlugin;
