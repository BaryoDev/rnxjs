/**
 * Smart class name utilities with conflict resolution
 *
 * Handles Tailwind-style class conflicts (e.g., bg-blue-500 vs bg-red-500)
 * so that later classes override earlier ones for the same CSS property.
 *
 * Design rule: only drop a class when we are confident two classes set the
 * same property. When a utility is not recognised it is kept verbatim —
 * under-merging leaves a harmless duplicate, over-merging silently deletes
 * styling (which is much harder to debug).
 *
 * @module utils/classNames
 */

/* ---------------------------------------------------------------------------
 * Utility vocabulary
 * ------------------------------------------------------------------------ */

// Display values that are unambiguous. `table`/`list-item` are deliberately
// excluded: Bootstrap ships `.table` and `.list-item` as component classes.
const DISPLAY = new Set([
  'block', 'inline-block', 'inline', 'flex', 'inline-flex',
  'grid', 'inline-grid', 'flow-root', 'contents', 'hidden'
]);

const POSITION = new Set(['static', 'fixed', 'absolute', 'relative', 'sticky']);
const TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify', 'start', 'end']);
const TEXT_WRAP = new Set(['wrap', 'nowrap', 'balance', 'pretty']);
const TEXT_OVERFLOW = new Set(['ellipsis', 'clip']);
const VERTICAL_ALIGN = new Set([
  'baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'
]);
const OBJECT_FIT = new Set(['contain', 'cover', 'fill', 'none', 'scale-down']);
const SHADOW_SIZE = new Set(['sm', 'md', 'lg', 'xl', '2xl', 'inner', 'none']);
const TEXT_TRANSFORM = new Set(['uppercase', 'lowercase', 'capitalize', 'normal-case']);
const TEXT_DECORATION = new Set(['underline', 'overline', 'line-through', 'no-underline']);
const FONT_SIZE = new Set([
  'xs', 'sm', 'base', 'lg', 'xl',
  '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'
]);
const FONT_WEIGHT = new Set([
  'thin', 'extralight', 'light', 'normal', 'medium',
  'semibold', 'bold', 'extrabold', 'black'
]);
const FONT_FAMILY = new Set(['sans', 'serif', 'mono']);
const LINE_STYLE = new Set(['solid', 'dashed', 'dotted', 'double', 'hidden', 'none']);

// Tailwind logical/physical sides plus the Bootstrap long forms (border-bottom,
// border-end-0, ...) so both frameworks group correctly.
const SIDES = new Set([
  'x', 'y', 't', 'r', 'b', 'l', 's', 'e',
  'top', 'right', 'bottom', 'left', 'start', 'end'
]);

const BG_ATTACHMENT = new Set(['fixed', 'local', 'scroll']);
const BG_SIZE = new Set(['auto', 'cover', 'contain']);
const BG_REPEAT = new Set([
  'repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'repeat-round', 'repeat-space'
]);
const BG_POSITION = new Set([
  'bottom', 'center', 'left', 'right', 'top',
  'left-bottom', 'left-top', 'right-bottom', 'right-top'
]);

const JUSTIFY_CONTENT = new Set([
  'normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'
]);

// Bootstrap button colour variants (btn-group / btn-close are component classes,
// not variants, so they must not be grouped together with these).
const BS_BTN_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'
]);

const isArbitrary = (v) =>
  (v.startsWith('[') && v.endsWith(']')) || (v.startsWith('(') && v.endsWith(')'));

const isNumeric = (v) => /^\d+(\.\d+)?$/.test(v) || v === 'px';

// `text-[#fff]` is a colour; `text-[13px]` is a font size.
const isArbitraryColor = (v) => /^\[(#|rgb|hsl|oklch|oklab|color[:(])/.test(v);

const after = (value, prefix) => (value.startsWith(prefix) ? value.slice(prefix.length) : null);

/* ---------------------------------------------------------------------------
 * Variant handling
 * ------------------------------------------------------------------------ */

/**
 * Split a class into its variant prefix and base utility.
 *
 * Bracket-aware, so arbitrary variants that contain colons stay intact:
 * `[&_tr:nth-child(odd)]:bg-slate-50` produces prefix `[&_tr:nth-child(odd)]:`
 * and base `bg-slate-50`.
 *
 * @param {string} cls - Full class name
 * @returns {{prefix: string, base: string}}
 * @private
 */
function splitVariants(cls) {
  let depth = 0;
  let lastColon = -1;

  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) lastColon = i;
  }

  return lastColon === -1
    ? { prefix: '', base: cls }
    : { prefix: cls.slice(0, lastColon + 1), base: cls.slice(lastColon + 1) };
}

/* ---------------------------------------------------------------------------
 * Group resolution
 * ------------------------------------------------------------------------ */

/**
 * Resolve a base utility to a conflict group.
 *
 * Two classes conflict only when they share both a variant prefix and a group.
 * Returning `null` means "unknown utility" — the class is always kept.
 *
 * @param {string} raw - Base utility, without variant prefix
 * @returns {string|null} - Conflict group key, or null when unrecognised
 * @private
 */
function getGroup(raw) {
  // Strip Tailwind's important markers (`!p-0` / `p-0!`)
  let base = raw;
  if (base.startsWith('!')) base = base.slice(1);
  if (base.endsWith('!')) base = base.slice(0, -1);
  if (!base) return null;

  const negative = base.startsWith('-');
  const bare = negative ? base.slice(1) : base;

  // Bootstrap encodes breakpoints as an infix (`flex-md-column`, `m-lg-3`)
  // rather than a variant prefix. Two such classes target different media
  // queries and must never collapse into each other, so leave them ungrouped.
  if (!bare.includes('[') && /^[a-z]+(?:-[a-z]+)*?-(?:sm|md|lg|xl|xxl)-/.test(bare)) {
    return null;
  }

  // --- standalone keywords -------------------------------------------------
  if (DISPLAY.has(bare)) return 'display';
  if (POSITION.has(bare)) return 'position';
  if (TEXT_TRANSFORM.has(bare)) return 'text-transform';
  if (TEXT_DECORATION.has(bare)) return 'text-decoration';
  if (bare === 'italic' || bare === 'not-italic') return 'font-style';
  if (bare === 'visible' || bare === 'invisible') return 'visibility';
  if (bare === 'truncate') return 'text-overflow';
  if (bare === 'border') return 'border-w';
  if (bare === 'rounded') return 'rounded';
  if (bare === 'shadow') return 'shadow';
  if (bare === 'ring') return 'ring-w';
  if (bare === 'outline') return 'outline-style';

  // --- spacing (margin / padding, incl. negative values) -------------------
  const spacing = bare.match(/^([mp])([trblxyse])?-(.+)$/);
  if (spacing) return `space-${spacing[1]}${spacing[2] || ''}`;

  // --- sizing --------------------------------------------------------------
  const sizing = bare.match(/^(min-w|min-h|max-w|max-h|size|w|h)-(.+)$/);
  if (sizing) return `size-${sizing[1]}`;

  // --- inset / offsets -----------------------------------------------------
  const inset = bare.match(/^(inset-x|inset-y|inset|top|right|bottom|left|start|end)-(.+)$/);
  if (inset) return `inset-${inset[1]}`;

  // --- text-* --------------------------------------------------------------
  let v = after(bare, 'text-');
  if (v !== null) {
    if (TEXT_ALIGN.has(v)) return 'text-align';
    if (TEXT_WRAP.has(v)) return 'text-wrap';
    if (TEXT_OVERFLOW.has(v)) return 'text-overflow';
    if (v.startsWith('opacity-')) return 'text-opacity';
    if (v.startsWith('shadow')) return 'text-shadow';
    if (FONT_SIZE.has(v)) return 'font-size';
    if (isArbitrary(v)) return isArbitraryColor(v) ? 'text-color' : 'font-size';
    return 'text-color';
  }

  // --- font-* --------------------------------------------------------------
  v = after(bare, 'font-');
  if (v !== null) {
    if (FONT_WEIGHT.has(v)) return 'font-weight';
    if (FONT_FAMILY.has(v)) return 'font-family';
    return isNumeric(v) || isArbitrary(v) ? 'font-weight' : 'font-family';
  }

  // --- border-* ------------------------------------------------------------
  v = after(bare, 'border-');
  if (v !== null) {
    if (LINE_STYLE.has(v)) return 'border-style';
    if (v === 'collapse' || v === 'separate') return 'border-collapse';
    if (isNumeric(v) || isArbitrary(v)) return 'border-w';
    if (v.startsWith('spacing-')) return 'border-spacing';
    const side = v.match(/^([a-z]+)(?:-(.*))?$/);
    if (side && SIDES.has(side[1])) {
      const rest = side[2];
      // `border-b`, `border-b-2`, `border-end-0` are widths for that side.
      // `border-t-indigo-600` is a colour for that side.
      if (rest === undefined || isNumeric(rest) || isArbitrary(rest)) {
        return `border-w-${side[1]}`;
      }
      return `border-color-${side[1]}`;
    }
    return 'border-color';
  }

  // --- divide-* ------------------------------------------------------------
  v = after(bare, 'divide-');
  if (v !== null) {
    const axis = v.match(/^([xy])(?:-|$)/);
    // `divide-y-reverse` flips the border side; it does not set a width.
    if (axis) return v.endsWith('-reverse') ? `divide-reverse-${axis[1]}` : `divide-w-${axis[1]}`;
    if (LINE_STYLE.has(v)) return 'divide-style';
    return 'divide-color';
  }

  // --- ring / outline ------------------------------------------------------
  v = after(bare, 'ring-');
  if (v !== null) {
    if (v === 'inset') return 'ring-inset';
    if (v.startsWith('opacity-')) return 'ring-opacity';
    if (isNumeric(v) || isArbitrary(v)) return 'ring-w';
    const offset = after(v, 'offset-');
    if (offset !== null) {
      return isNumeric(offset) || isArbitrary(offset) ? 'ring-offset-w' : 'ring-offset-color';
    }
    return 'ring-color';
  }

  v = after(bare, 'outline-');
  if (v !== null) {
    if (LINE_STYLE.has(v)) return 'outline-style';
    if (isNumeric(v) || isArbitrary(v)) return 'outline-w';
    if (v.startsWith('offset-')) return 'outline-offset';
    return 'outline-color';
  }

  // --- background ----------------------------------------------------------
  v = after(bare, 'bg-');
  if (v !== null) {
    if (BG_ATTACHMENT.has(v)) return 'bg-attachment';
    if (BG_SIZE.has(v)) return 'bg-size';
    if (BG_REPEAT.has(v)) return 'bg-repeat';
    if (BG_POSITION.has(v)) return 'bg-position';
    if (v.startsWith('clip-')) return 'bg-clip';
    if (v.startsWith('origin-')) return 'bg-origin';
    if (v.startsWith('blend-')) return 'bg-blend';
    if (v.startsWith('opacity-')) return 'bg-opacity';
    if (v === 'none' || v.startsWith('gradient-') || v.startsWith('linear-') ||
        v.startsWith('radial-') || v.startsWith('conic-')) {
      return 'bg-image';
    }
    return 'bg-color';
  }

  // --- rounded -------------------------------------------------------------
  v = after(bare, 'rounded-');
  if (v !== null) {
    const corner = v.match(/^(tl|tr|br|bl|ss|se|es|ee|t|r|b|l|s|e)(?:-|$)/);
    return corner ? `rounded-${corner[1]}` : 'rounded';
  }

  // --- flexbox / grid ------------------------------------------------------
  // `col`/`col-reverse` are Tailwind; `column`/`column-reverse` are Bootstrap.
  if (/^flex-(row|row-reverse|col|col-reverse|column|column-reverse)$/.test(bare)) {
    return 'flex-direction';
  }
  if (/^flex-(wrap|wrap-reverse|nowrap)$/.test(bare)) return 'flex-wrap';
  // Bootstrap spells these `flex-grow-1` / `flex-shrink-0`.
  if (/^flex-grow(-.+)?$/.test(bare)) return 'grow';
  if (/^flex-shrink(-.+)?$/.test(bare)) return 'shrink';
  if (bare.startsWith('flex-')) return 'flex';
  if (/^grow(-.+)?$/.test(bare)) return 'grow';
  if (/^shrink(-.+)?$/.test(bare)) return 'shrink';
  if (bare.startsWith('basis-')) return 'basis';
  if (bare.startsWith('order-')) return 'order';
  if (bare.startsWith('grid-cols-')) return 'grid-cols';
  if (bare.startsWith('grid-rows-')) return 'grid-rows';
  if (bare.startsWith('col-span-')) return 'col-span';
  if (bare.startsWith('row-span-')) return 'row-span';
  if (bare.startsWith('justify-items-')) return 'justify-items';
  if (bare.startsWith('justify-self-')) return 'justify-self';
  v = after(bare, 'justify-');
  if (v !== null) return JUSTIFY_CONTENT.has(v) ? 'justify-content' : null;
  if (bare.startsWith('items-')) return 'align-items';
  if (bare.startsWith('self-')) return 'align-self';
  if (bare.startsWith('content-')) return 'align-content';
  if (bare.startsWith('place-items-')) return 'place-items';
  if (bare.startsWith('place-content-')) return 'place-content';
  const gap = bare.match(/^gap(-[xy])?-(.+)$/);
  if (gap) return `gap${gap[1] || ''}`;

  // --- misc single-property utilities --------------------------------------
  if (bare.startsWith('overflow-x-')) return 'overflow-x';
  if (bare.startsWith('overflow-y-')) return 'overflow-y';
  if (bare.startsWith('overflow-')) return 'overflow';
  if (bare.startsWith('z-')) return 'z';
  if (bare.startsWith('opacity-')) return 'opacity';
  v = after(bare, 'shadow-');
  if (v !== null) {
    return SHADOW_SIZE.has(v) || isNumeric(v) || isArbitrary(v) ? 'shadow' : 'shadow-color';
  }
  if (bare.startsWith('animate-')) return 'animate';
  if (bare.startsWith('duration-')) return 'duration';
  if (bare.startsWith('delay-')) return 'delay';
  if (bare.startsWith('ease-')) return 'ease';
  if (bare === 'transition' || bare.startsWith('transition-')) return 'transition';
  if (bare.startsWith('tracking-')) return 'tracking';
  if (bare.startsWith('leading-')) return 'leading';
  if (bare.startsWith('whitespace-')) return 'whitespace';
  if (bare.startsWith('cursor-')) return 'cursor';
  if (bare.startsWith('select-')) return 'select';
  if (bare.startsWith('pointer-events-')) return 'pointer-events';
  if (bare.startsWith('appearance-')) return 'appearance';
  if (bare.startsWith('accent-')) return 'accent';
  v = after(bare, 'object-');
  if (v !== null) return OBJECT_FIT.has(v) ? 'object-fit' : 'object-position';
  // Bootstrap's `align-items-*` / `align-self-*` / `align-content-*` are flexbox
  // properties, not vertical-align — they share a prefix and nothing else.
  if (bare.startsWith('align-items-')) return 'align-items';
  if (bare.startsWith('align-self-')) return 'align-self';
  if (bare.startsWith('align-content-')) return 'align-content';
  v = after(bare, 'align-');
  if (v !== null) return VERTICAL_ALIGN.has(v) ? 'vertical-align' : null;
  if (bare.startsWith('rotate-')) return 'rotate';
  if (bare.startsWith('scale-x-')) return 'scale-x';
  if (bare.startsWith('scale-y-')) return 'scale-y';
  if (bare.startsWith('scale-')) return 'scale';
  if (bare.startsWith('translate-x-')) return 'translate-x';
  if (bare.startsWith('translate-y-')) return 'translate-y';
  if (bare.startsWith('fill-')) return 'fill';
  if (bare.startsWith('stroke-')) return isNumeric(after(bare, 'stroke-')) ? 'stroke-w' : 'stroke';

  // --- Bootstrap component variants ----------------------------------------
  if (bare === 'btn-sm' || bare === 'btn-lg') return 'bs-btn-size';
  v = after(bare, 'btn-');
  if (v !== null) {
    const outlined = after(v, 'outline-');
    if (BS_BTN_VARIANTS.has(outlined !== null ? outlined : v)) return 'bs-btn-variant';
    return null;
  }
  if (/^form-control-(sm|lg)$/.test(bare)) return 'bs-form-control-size';
  if (/^form-select-(sm|lg)$/.test(bare)) return 'bs-form-select-size';
  if (/^pagination-(sm|lg)$/.test(bare)) return 'bs-pagination-size';
  if (/^modal-(sm|lg|xl)$/.test(bare)) return 'bs-modal-size';

  return null;
}

/* ---------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------ */

/**
 * Merge class names with intelligent conflict resolution
 *
 * When multiple classes set the same CSS property under the same variant
 * (e.g. both set a background colour), only the last one is kept. Everything
 * else is preserved in its original order.
 *
 * @param {...string|Object|Array} classNames - Class name strings, objects, or arrays to merge
 * @returns {string} - Merged class string with conflicts resolved
 *
 * @example
 * // Conflict resolution
 * cn('bg-blue-500', 'bg-red-500')
 * // => "bg-red-500" (last one wins)
 *
 * @example
 * // Width and colour are different properties — both survive
 * cn('border-b border-slate-200')
 * // => "border-b border-slate-200"
 *
 * @example
 * // Variants are scoped independently
 * cn('bg-white hover:bg-slate-50')
 * // => "bg-white hover:bg-slate-50"
 *
 * @example
 * // Mixed arguments
 * cn('base-class', { 'conditional-class': true, 'ignored-class': false }, 'user-class')
 * // => "base-class conditional-class user-class"
 */
export function cn(...classNames) {
  const entries = [];

  flattenClassNames(classNames).forEach(className => {
    if (!className || typeof className !== 'string') return;

    className.split(/\s+/).forEach(cls => {
      if (!cls) return;

      const { prefix, base } = splitVariants(cls);
      const group = getGroup(base);

      // Unknown utilities only collapse against an identical class, so nothing
      // is ever deleted on a guess.
      entries.push({ cls, key: group ? `${prefix} ${group}` : ` exact ${cls}` });
    });
  });

  // Walk backwards keeping the last occurrence of each key, then restore order.
  const seen = new Set();
  const kept = [];

  for (let i = entries.length - 1; i >= 0; i--) {
    const { cls, key } = entries[i];
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(cls);
  }

  return kept.reverse().join(' ');
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
 * variant({ primary: 'bg-blue-500', danger: 'bg-red-500' }, 'primary')
 * // => "bg-blue-500"
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
 * compose(() => 'btn', (v) => `btn-${v}`)('primary')
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
