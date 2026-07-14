/**
 * Smart class name utilities with conflict resolution
 *
 * Handles Tailwind-style class conflicts (e.g., bg-blue-500 vs bg-red-500)
 * Later classes override earlier classes for the same property.
 *
 * @module utils/classNames
 */

/**
 * Class groups for conflict detection
 * Each group represents a CSS property that can only have one value
 */
const classGroups = {
  // Tailwind class groups
  bg: /^bg-(?!gradient)/,  // Background color (not gradient)
  bgGradient: /^bg-gradient-/,
  text: /^text-(?!xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,  // text-color, not text-size
  textSize: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
  font: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
  fontFamily: /^font-(sans|serif|mono)/,
  border: /^border-(?!\d|t-|r-|b-|l-|x-|y-|solid|dashed|dotted|double|none)/,  // border-color
  borderWidth: /^border-(\d|t-\d|r-\d|b-\d|l-\d|x-\d|y-\d)/,
  borderStyle: /^border-(solid|dashed|dotted|double|none)/,
  rounded: /^rounded/,
  shadow: /^shadow/,
  opacity: /^opacity-/,

  // Spacing - Padding
  p: /^p-/,
  px: /^px-/,
  py: /^py-/,
  pt: /^pt-/,
  pr: /^pr-/,
  pb: /^pb-/,
  pl: /^pl-/,

  // Spacing - Margin
  m: /^m-/,
  mx: /^mx-/,
  my: /^my-/,
  mt: /^mt-/,
  mr: /^mr-/,
  mb: /^mb-/,
  ml: /^ml-/,

  // Sizing
  w: /^w-/,
  h: /^h-/,
  minW: /^min-w-/,
  minH: /^min-h-/,
  maxW: /^max-w-/,
  maxH: /^max-h-/,

  // Display
  display: /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)/,

  // Position
  position: /^(static|fixed|absolute|relative|sticky)/,

  // Z-index
  z: /^z-/,

  // Bootstrap class groups
  bgBs: /^bg-(primary|secondary|success|danger|warning|info|light|dark|white|transparent)/,
  textBs: /^text-(primary|secondary|success|danger|warning|info|light|dark|white|muted|body)/,
  btnBs: /^btn-(primary|secondary|success|danger|warning|info|light|dark|outline-primary|outline-secondary|outline-success|outline-danger|outline-warning|outline-info|outline-light|outline-dark)/,
  sizeBs: /^(btn-sm|btn-lg|form-control-sm|form-control-lg)/,

  // Flexbox/Grid
  flexDirection: /^flex-(row|col)/,
  flexWrap: /^flex-(wrap|nowrap)/,
  justifyContent: /^justify-/,
  alignItems: /^items-/,
  alignSelf: /^self-/,
  gridCols: /^grid-cols-/,
  gridRows: /^grid-rows-/,
  gap: /^gap-/,
};

/**
 * Merge class names with intelligent conflict resolution
 *
 * When multiple classes belong to the same group (e.g., both set background color),
 * only the last one is kept. Classes that don't conflict are all preserved.
 *
 * @param {...string|Object|Array} classNames - Class name strings, objects, or arrays to merge
 * @returns {string} - Merged class string with conflicts resolved
 *
 * @example
 * // Simple merging
 * cn('btn', 'btn-primary', 'hover:btn-secondary')
 * // => "btn btn-primary hover:btn-secondary"
 *
 * @example
 * // Conflict resolution
 * cn('bg-blue-500', 'bg-red-500')
 * // => "bg-red-500" (last one wins)
 *
 * @example
 * // No conflict (different properties)
 * cn('bg-blue-500', 'text-white', 'p-4')
 * // => "bg-blue-500 text-white p-4"
 *
 * @example
 * // Mixed arguments
 * cn('base-class', { 'conditional-class': true, 'ignored-class': false }, 'user-class')
 * // => "base-class conditional-class user-class"
 */
export function cn(...classNames) {
  const classMap = new Map();
  const independentClasses = [];

  // Flatten and process all class names
  const allClasses = flattenClassNames(classNames);

  allClasses.forEach(className => {
    if (!className || typeof className !== 'string') return;

    // Split on whitespace to handle space-separated classes
    className.split(/\s+/).forEach(cls => {
      if (!cls) return;

      // Check if this class belongs to any conflict group
      let groupKey = null;

      for (const [group, pattern] of Object.entries(classGroups)) {
        if (pattern.test(cls)) {
          groupKey = group;
          break;
        }
      }

      if (groupKey) {
        // This class belongs to a conflict group - it can override previous classes in same group
        classMap.set(groupKey, cls);
      } else {
        // Independent class - doesn't conflict with anything
        // Only add if not already present (avoid duplicates)
        if (!independentClasses.includes(cls)) {
          independentClasses.push(cls);
        }
      }
    });
  });

  // Combine group classes and independent classes
  const groupClasses = Array.from(classMap.values());
  const result = [...groupClasses, ...independentClasses];

  return result.join(' ');
}

/**
 * Flatten nested class name structures into a flat array
 *
 * @param {Array} args - Array of class name arguments
 * @returns {string[]} - Flat array of class strings
 * @private
 */
function flattenClassNames(args) {
  const result = [];

  args.forEach(arg => {
    if (!arg) return;

    if (typeof arg === 'string') {
      result.push(arg);
    } else if (Array.isArray(arg)) {
      result.push(...flattenClassNames(arg));
    } else if (typeof arg === 'object') {
      // Handle conditional classes: { 'class-name': condition }
      Object.entries(arg).forEach(([className, condition]) => {
        if (condition) {
          result.push(className);
        }
      });
    }
  });

  return result;
}

/**
 * Class name builder with conditional support (shorthand for cn)
 *
 * Accepts strings, objects with boolean conditions, and arrays.
 *
 * @param {...string|Object|Array} args - Class name arguments
 * @returns {string} - Merged class string
 *
 * @example
 * cls('base', { active: isActive, disabled: isDisabled }, userClass)
 * // If isActive=true, isDisabled=false, userClass='custom'
 * // => "base active custom"
 *
 * @example
 * cls('btn', ['btn-primary', 'btn-lg'], { 'btn-disabled': disabled })
 * // => "btn btn-primary btn-lg" (if disabled=false)
 */
export function cls(...args) {
  return cn(...args);
}

/**
 * Tailwind merge - specialized version of cn optimized for Tailwind
 *
 * This is an alias of cn() since our implementation already handles
 * Tailwind class conflicts intelligently.
 *
 * @param {...string} classNames - Tailwind class names
 * @returns {string} - Merged classes
 *
 * @example
 * twMerge('px-4 py-2', 'px-6')
 * // => "py-2 px-6" (px-6 overrides px-4)
 */
export function twMerge(...classNames) {
  return cn(...classNames);
}

/**
 * Conditional class names - apply classes only if condition is true
 *
 * @param {string} classes - Classes to apply
 * @param {boolean} condition - Condition to check
 * @returns {string} - Classes if condition is true, empty string otherwise
 *
 * @example
 * cond('text-red-500', hasError)
 * // => "text-red-500" if hasError is true
 * // => "" if hasError is false
 */
export function cond(classes, condition) {
  return condition ? classes : '';
}

/**
 * Variant class resolver - maps variant names to class strings
 *
 * @param {Object} variants - Map of variant names to class strings
 * @param {string} selectedVariant - Selected variant name
 * @param {string} [defaultVariant='default'] - Fallback variant
 * @returns {string} - Classes for selected variant
 *
 * @example
 * const variants = {
 *   primary: 'bg-blue-500 text-white',
 *   secondary: 'bg-gray-500 text-white',
 *   danger: 'bg-red-500 text-white'
 * };
 * variant(variants, 'primary')
 * // => "bg-blue-500 text-white"
 */
export function variant(variants, selectedVariant, defaultVariant = 'default') {
  return variants[selectedVariant] || variants[defaultVariant] || '';
}

/**
 * Compose multiple class name functions
 *
 * @param {...Function} fns - Functions that return class strings
 * @returns {Function} - Composed function
 *
 * @example
 * const baseClasses = () => 'btn';
 * const variantClasses = (variant) => `btn-${variant}`;
 * const composed = compose(baseClasses, variantClasses);
 * composed('primary')
 * // => "btn btn-primary"
 */
export function compose(...fns) {
  return (...args) => {
    const classes = fns.map(fn => fn(...args)).filter(Boolean);
    return cn(...classes);
  };
}

// Default export
export default {
  cn,
  cls,
  twMerge,
  cond,
  variant,
  compose
};
