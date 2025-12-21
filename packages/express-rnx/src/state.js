/**
 * Reactive state generation
 */

/**
 * Create reactive state from JavaScript data
 *
 * @param {*} data Data to serialize
 * @param {string} varName Variable name
 * @returns {string} Script tag with state initialization
 */
function renderState(data, varName = 'state') {
  try {
    const jsonData = JSON.stringify(data);

    return `<script>
// Initialize reactive state from server context
const ${varName} = rnx.createReactiveState(${jsonData});
rnx.loadComponents(document.body, ${varName});
</script>`;
  } catch (error) {
    return `<script>console.error('rnxJS: Failed to serialize state: ${error.message}')</script>`;
  }
}

module.exports = { renderState };
