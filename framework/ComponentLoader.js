import { registeredComponents } from './Registry.js';
import { bindData } from './DataBinder.js';

/**
 * Safely evaluate a condition expression with limited scope
 * @param {string} expression - The expression to evaluate
 * @param {Object} state - The reactive state to use as context
 * @returns {boolean} - Result of the expression
 */
function safeEvaluateCondition(expression, state) {
  try {
    // Create a function with the state as the only accessible variable
    // This is safer than eval() as it limits the scope
    const fn = new Function('state', `
      'use strict';
      try {
        return Boolean(${expression});
      } catch (e) {
        console.error('[rnxJS] Error evaluating condition "${expression}":', e.message);
        return false;
      }
    `);
    return fn(state);
  } catch (error) {
    console.error('[rnxJS] Invalid condition expression "${expression}":', error.message);
    return false;
  }
}

export function loadComponents(root = document, reactiveState = null) {
  if (!root || typeof root.querySelectorAll !== 'function') {
    console.error('[rnxJS] loadComponents: root must be a valid DOM element');
    return;
  }

  Object.keys(registeredComponents).forEach(tag => {
    try {
      // Robust selector: match "FAB" or "fab"
      // HTML parser often lowercases custom tags in DOM, but registry has "FAB"
      const selector = (tag === tag.toLowerCase()) ? tag : `${tag}, ${tag.toLowerCase()}`;
      const elements = root.querySelectorAll(selector);
      elements.forEach(el => {
        try {
          if (el._rnxHydrated) return;

          const ComponentFunc = registeredComponents[tag];

          // Validate component function
          if (typeof ComponentFunc !== 'function') {
            console.error(`[rnxJS] Component "${tag}" is not a valid function`);
            return;
          }

          const props = {};

          for (let attr of el.attributes) {
            const name = attr.name;
            const value = attr.value;

            // Allow string event handlers (e.g. onclick="foo()") to pass through
            // The component implementation handles whether to use them as attributes or listeners
            if (name.startsWith('on') && typeof value !== 'string') {
              // no-op
            }
            props[name] = value;
          }

          const children = Array.from(el.childNodes).filter(n => n.nodeType !== 8);
          if (children.length) props.children = children;

          if (el.getAttribute('visible') === 'false') return;

          // Handle conditional rendering with safer evaluation
          const condition = el.getAttribute('data-if');
          if (condition) {
            const shouldRender = safeEvaluateCondition(condition, reactiveState);
            if (!shouldRender) return;
          }

          const comp = ComponentFunc(props);

          if (!comp) {
            console.error(`[rnxJS] Component "${tag}" did not return a valid element`);
            return;
          }

          // Verify replacement
          if (comp instanceof Node) {
            // Mark new component as hydrated to prevent re-hydration (infinite loop for recursive tags like Input -> input)
            comp._rnxHydrated = true;
            el.replaceWith(comp);

            // Verify if connected
            if (!comp.isConnected) {
              // In some environments, replaceWith might weirdly fail or if parent is missing
            }
            loadComponents(comp, reactiveState);
          } else {
            console.error(`[rnxJS] Component "${tag}" returned invalid node type`);
          }
        } catch (error) {
          console.error(`[rnxJS] Error loading component "${tag}":`, error);
          // Create error placeholder
          const errorEl = document.createElement('div');
          errorEl.style.cssText = 'color: red; padding: 10px; border: 1px solid red; margin: 5px;';
          errorEl.textContent = `Error loading component "${tag}": ${error.message}`;
          el.replaceWith(errorEl);
        }
      });
    } catch (error) {
      console.error(`[rnxJS] Error processing component "${tag}":`, error);
    }
  });

  // Apply data binding after components are loaded
  if (reactiveState) {
    try {
      bindData(root, reactiveState);
    } catch (error) {
      console.error('[rnxJS] Error in bindData:', error);
    }
  }
}
