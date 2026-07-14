import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, themeProvider } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Row Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Provides flexbox row container for Column components.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.children=''] - Row content (Column components via slot)
 * @param {string} [props.justify=''] - Horizontal alignment (start, center, end, between, around, evenly)
 * @param {string} [props.align=''] - Vertical alignment (start, center, end, stretch, baseline)
 * @param {boolean} [props.noGutters=false] - Remove gutters between columns
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Row element
 *
 * @example
 * // Basic row
 * <Row><Column>Col 1</Column><Column>Col 2</Column></Row>
 *
 * @example
 * // Centered content
 * <Row justify="center" align="center">...</Row>
 *
 * @example
 * // No gutters
 * <Row noGutters={true}>...</Row>
 */
export function Row({
  children = '',
  justify = '',
  align = '',
  noGutters = false,
  className = ''
}) {
  const hasNoGutters = noGutters === true || noGutters === 'true';

  // Resolve base row classes from theme
  const rowClass = cn(
    resolveClasses('row', {
      noGutters: hasNoGutters
    }),
    // Add flexbox utilities if specified
    justify ? themeProvider.resolveUtility('flexbox', `justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`) : '',
    align ? themeProvider.resolveUtility('flexbox', `align${align.charAt(0).toUpperCase() + align.slice(1)}`) : '',
    className
  );

  const template = () => `
    <div class="${rowClass}" data-slot></div>
  `;

  return createComponent(template, { children, justify, align, noGutters, className });
}
