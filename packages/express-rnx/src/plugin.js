/**
 * Plugin initialization
 */

/**
 * Convert camelCase string to camelCase function name
 *
 * @param {string} str Input string
 * @returns {string} Camel cased string
 */
function toCamelCase(str) {
  return str.replace(/-/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s/g, '');
}

/**
 * Initialize an rnxJS plugin
 *
 * @param {string} name Plugin name ('router', 'toast', 'storage')
 * @param {Object} options Plugin configuration options
 * @returns {string} Script tag with plugin initialization
 */
function renderPlugin(name, options = {}) {
  try {
    const optionsJson = JSON.stringify(options);
    const camelName = toCamelCase(name);

    return `<script>
// Initialize rnxJS plugin: ${name}
if (window.rnx && window.rnx.plugins) {
  try {
    const plugin = rnx.${camelName}Plugin ? rnx.${camelName}Plugin(${optionsJson}) : null;
    if (plugin) {
      rnx.plugins.use(plugin);
    }
  } catch (e) {
    console.error("[rnxJS] Failed to initialize ${name} plugin:", e);
  }
}
</script>`;
  } catch (error) {
    return `<script>console.error('rnxJS: Failed to serialize plugin options: ${error.message}')</script>`;
  }
}

module.exports = { renderPlugin, toCamelCase };
