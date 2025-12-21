import { registeredComponents } from './Registry.js';
import { bindData } from './DataBinder.js';

/**
 * Dangerous patterns that could lead to code execution
 * @type {RegExp[]}
 */
const DANGEROUS_PATTERNS = [
  /constructor/i,
  /prototype/i,
  /__proto__/i,
  /\beval\b/i,
  /\bFunction\b/i,
  /\bwindow\b/i,
  /\bdocument\b/i,
  /\bglobal\b/i,
  /\bprocess\b/i,
  /\brequire\b/i,
  /\bimport\b/i,
  /\bfetch\b/i,
  /\bXMLHttpRequest\b/i,
  /\blocalStorage\b/i,
  /\bsessionStorage\b/i,
  /\bcookie/i,
  /\[\s*['"`]/,      // Bracket notation with strings
  /\(\s*\)/,         // Function calls
  /`/,               // Template literals
  /\$\{/,            // Template interpolation
];

/**
 * Safely get a nested value from state using dot notation
 * @param {Object} state - The state object
 * @param {string} path - Dot-notation path (e.g., 'user.name')
 * @returns {*} - The value at the path or undefined
 */
function getStateValue(state, path) {
  if (!state || !path) return undefined;

  const keys = path.split('.');
  let current = state;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    // Block prototype access
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn(`[rnxJS] Blocked prototype access attempt: "${path}"`);
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Parse a literal value from expression string
 * @param {string} value - The value string to parse
 * @returns {*} - Parsed value
 */
function parseValue(value) {
  if (!value) return value;
  value = value.trim();

  // String literals
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1);
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Null/undefined
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;

  // Number
  const num = Number(value);
  if (!isNaN(num)) return num;

  return value;
}

/**
 * Evaluate a simple expression (no function calls allowed)
 * @param {string} expr - Expression to evaluate
 * @param {Object} state - State object
 * @returns {boolean} - Result
 */
function evaluateSimpleExpression(expr, state) {
  expr = expr.trim();

  // Handle logical AND
  if (expr.includes('&&')) {
    const parts = expr.split('&&').map(p => p.trim());
    return parts.every(part => evaluateSimpleExpression(part, state));
  }

  // Handle logical OR
  if (expr.includes('||')) {
    const parts = expr.split('||').map(p => p.trim());
    return parts.some(part => evaluateSimpleExpression(part, state));
  }

  // Handle negation
  if (expr.startsWith('!')) {
    return !evaluateSimpleExpression(expr.slice(1).trim(), state);
  }

  // Handle comparison operators
  const comparisonMatch = expr.match(/^([a-zA-Z_$][\w.$]*)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/);
  if (comparisonMatch) {
    const [, leftPath, operator, rightRaw] = comparisonMatch;
    const leftValue = getStateValue(state, leftPath);
    const rightValue = parseValue(rightRaw.trim());

    switch (operator) {
      case '===':
      case '==':
        return leftValue === rightValue;
      case '!==':
      case '!=':
        return leftValue !== rightValue;
      case '>':
        return leftValue > rightValue;
      case '<':
        return leftValue < rightValue;
      case '>=':
        return leftValue >= rightValue;
      case '<=':
        return leftValue <= rightValue;
      default:
        return false;
    }
  }

  // Handle simple property access (truthy check)
  const propertyMatch = expr.match(/^([a-zA-Z_$][\w.$]*)$/);
  if (propertyMatch) {
    return Boolean(getStateValue(state, propertyMatch[1]));
  }

  console.warn(`[rnxJS] Unsupported expression syntax: "${expr}"`);
  return false;
}

/**
 * Safely evaluate a condition expression without code execution risks
 *
 * Supported expressions:
 * - property (truthy check)
 * - nested.property (truthy check)
 * - !property (negation)
 * - property === 'value'
 * - property !== 'value'
 * - property > 0, property < 10, property >= 5, property <= 5
 * - property && other
 * - property || other
 *
 * @param {string} expression - The expression to evaluate
 * @param {Object} state - The reactive state to use as context
 * @returns {boolean} - Result of the expression
 */
function safeEvaluateCondition(expression, state) {
  if (!expression || typeof expression !== 'string') {
    return false;
  }

  expression = expression.trim();

  // Block dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(expression)) {
      console.warn(`[rnxJS] Blocked potentially dangerous expression: "${expression}"`);
      return false;
    }
  }

  try {
    return evaluateSimpleExpression(expression, state);
  } catch (error) {
    console.warn(`[rnxJS] Error evaluating condition "${expression}":`, error.message);
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
          if (el._rnxHydrated || el.hasAttribute('data-rnx-ignore')) return;

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
