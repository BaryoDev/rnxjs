/**
 * Efficient list rendering with keyed diffing
 * Similar to Vue's v-for with :key
 *
 * This provides O(n) performance for list updates by:
 * - Only creating/destroying DOM nodes that changed
 * - Moving existing nodes instead of recreating them
 * - Using keys to identify stable elements across renders
 */

// Import bindData for nested list support
let _bindDataFn = null;

/**
 * Set bindData function to avoid circular imports
 * @param {Function} fn - bindData function
 */
export function setBindDataFunction(fn) {
  _bindDataFn = fn;
}

/**
 * ListRenderer - Manages efficient list rendering with keyed reconciliation
 */
export class ListRenderer {
  /**
   * Create a new list renderer
   * @param {HTMLElement} template - Template element to clone for each item
   * @param {HTMLElement} placeholder - Comment node marking list location
   * @param {Proxy} state - Reactive state object
   * @param {string} arrayPath - Path to array in state (e.g., 'users')
   * @param {Object} options - Rendering options
   * @param {Function} options.key - Key function (item, index) => key
   * @param {string} options.varName - Variable name for item (e.g., 'user')
   * @param {string} options.indexName - Variable name for index (e.g., 'i')
   */
  constructor(template, placeholder, state, arrayPath, options = {}) {
    this.template = template;
    this.placeholder = placeholder;
    this.state = state;
    this.arrayPath = arrayPath;
    this.keyFn = options.key || ((item, index) => String(index));
    this.varName = options.varName;
    this.indexName = options.indexName;

    // Map of key -> { element, item, index }
    this.renderedMap = new Map();
    this.renderedOrder = []; // Keys in current order
  }

  /**
   * Render or update the list
   */
  render() {
    const array = this.getArray();

    if (!Array.isArray(array)) {
      console.warn(`[rnxJS] data-for: "${this.arrayPath}" is not an array`);
      this.clear();
      return;
    }

    const newKeys = [];
    const newMap = new Map();

    // Build new state
    array.forEach((item, index) => {
      const key = String(this.keyFn(item, index));
      newKeys.push(key);
      newMap.set(key, { item, index });
    });

    // Remove items that no longer exist
    for (const [key, rendered] of this.renderedMap) {
      if (!newMap.has(key)) {
        rendered.element.remove();
        this.renderedMap.delete(key);
      }
    }

    // Add or update items
    const parent = this.placeholder.parentNode;
    if (!parent) {
      console.warn('[rnxJS] ListRenderer: placeholder has no parent');
      return;
    }

    let prevElement = this.placeholder;

    for (let i = 0; i < newKeys.length; i++) {
      const key = newKeys[i];
      const { item, index } = newMap.get(key);

      let rendered = this.renderedMap.get(key);

      if (rendered) {
        // Update existing item if data changed
        if (rendered.item !== item || rendered.index !== index) {
          this.updateElement(rendered.element, item, index);
          rendered.item = item;
          rendered.index = index;
        }

        // Move if position changed
        if (rendered.element.previousSibling !== prevElement) {
          prevElement.after(rendered.element);
        }
      } else {
        // Create new item
        const element = this.createElement(item, index);
        prevElement.after(element);
        rendered = { element, item, index };
        this.renderedMap.set(key, rendered);

        // Process nested data-for if needed
        if (element._rnxNeedsBinding && _bindDataFn) {
          queueMicrotask(() => {
            _bindDataFn(element, this.state);
          });
        }
      }

      prevElement = rendered.element;
    }

    this.renderedOrder = newKeys;
  }

  /**
   * Create a new element from template
   * @param {*} item - Array item
   * @param {number} index - Item index
   * @returns {HTMLElement} - Cloned and populated element
   */
  createElement(item, index) {
    const clone = this.template.cloneNode(true);
    this.updateElement(clone, item, index);

    // Store item data on element for potential nested data-for access
    if (typeof item === 'object' && item !== null) {
      clone._rnxItemData = item;
      clone._rnxVarName = this.varName; // Store variable name for path resolution

      // If there are nested data-for elements, we need to process them
      // But we can't call bindData here because it would create a circular dependency
      // Instead, mark this element to be processed
      if (clone.querySelector('[data-for]')) {
        clone._rnxNeedsBinding = true;
      }
    }

    return clone;
  }

  /**
   * Update element content with item data
   * @param {HTMLElement} element - Element to update
   * @param {*} item - Item data
   * @param {number} index - Item index
   */
  updateElement(element, item, index) {
    // Update data-bind elements within (excluding nested data-for templates)
    const bindings = element.querySelectorAll('[data-bind]');
    bindings.forEach(el => {
      // Skip if this binding is inside a nested data-for
      if (el !== element && el.closest('[data-for]') !== element) {
        return;
      }

      const path = el.getAttribute('data-bind');
      const value = this.resolveBinding(path, item, index);
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    // Update element itself if it has data-bind
    const selfPath = element.getAttribute('data-bind');
    if (selfPath) {
      const value = this.resolveBinding(selfPath, item, index);
      if (value !== undefined) {
        // For primitive items, show the value directly
        if (typeof item !== 'object' || item === null) {
          element.textContent = value;
        }
      }
    }
  }

  /**
   * Resolve a binding path for list item context
   * @param {string} path - Binding path
   * @param {*} item - Current item
   * @param {number} index - Current index
   * @returns {*} - Resolved value
   */
  resolveBinding(path, item, index) {
    // Direct variable reference (e.g., 'user')
    if (path === this.varName) {
      return typeof item === 'object' ? JSON.stringify(item) : String(item);
    }

    // Index reference (e.g., 'i')
    if (path === this.indexName) {
      return String(index);
    }

    // Property access (e.g., 'user.name')
    if (path.startsWith(this.varName + '.')) {
      const subPath = path.slice(this.varName.length + 1);
      return this.getNestedValue(item, subPath);
    }

    // Try to resolve from item first (for nested data-for like "category.items")
    if (typeof item === 'object' && item !== null) {
      const itemValue = this.getNestedValue(item, path);
      if (itemValue !== undefined) {
        return itemValue;
      }
    }

    // Fallback to global state access
    return this.getNestedValue(this.state, path);
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Source object
   * @param {string} path - Dot-notation path
   * @returns {*} - Value at path
   */
  getNestedValue(obj, path) {
    try {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    } catch {
      return undefined;
    }
  }

  /**
   * Get array from state
   * Checks parent elements for item data to support nested data-for
   * @returns {Array} - The array to render
   */
  getArray() {
    // Check if we're inside a parent data-for (nested lists)
    // Walk up the DOM tree to find parent item data
    let parent = this.placeholder?.parentElement;
    while (parent && parent !== document.body) {
      if (parent._rnxItemData && parent._rnxVarName) {
        // If arrayPath starts with the parent's variable name, strip it
        // e.g., "category.items" with parent varName="category" becomes "items"
        let pathToResolve = this.arrayPath;
        if (pathToResolve.startsWith(parent._rnxVarName + '.')) {
          pathToResolve = pathToResolve.slice(parent._rnxVarName.length + 1);
        }

        // Try to resolve from parent item
        const parentValue = pathToResolve.split('.').reduce(
          (curr, key) => curr?.[key],
          parent._rnxItemData
        );
        if (parentValue !== undefined && Array.isArray(parentValue)) {
          return parentValue;
        }
      }
      parent = parent.parentElement;
    }

    // Otherwise resolve from global state
    return this.arrayPath.split('.').reduce(
      (curr, key) => curr?.[key],
      this.state
    );
  }

  /**
   * Clear all rendered elements
   */
  clear() {
    for (const [, rendered] of this.renderedMap) {
      rendered.element.remove();
    }
    this.renderedMap.clear();
    this.renderedOrder = [];
  }

  /**
   * Destroy the renderer and cleanup
   */
  destroy() {
    this.clear();
    // Note: Don't remove placeholder as it's needed to mark position
  }
}
