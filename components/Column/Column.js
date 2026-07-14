import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Column Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Provides flexible column sizing within Row components.
 *
 * @param {Object} props - Component properties
 * @param {string|number} [props.size=''] - Column size (1-12, or 'auto')
 * @param {string} [props.children=''] - Column content (via slot)
 * @param {string} [props.alignSelf=''] - Vertical self-alignment (start, center, end, stretch, baseline)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Column element
 *
 * @example
 * // Auto-sized column
 * <Column>Content</Column>
 *
 * @example
 * // Specific size (6 of 12)
 * <Column size="6">Half width</Column>
 *
 * @example
 * // With alignment
 * <Column size="4" alignSelf="center">Centered</Column>
 */
export function Column({
  size = '',
  children = '',
  alignSelf = '',
  className = ''
}) {
  // Resolve base column classes from theme
  const columnClass = cn(
    resolveClasses('column', {
      size: size || undefined
    }),
    // Add self-alignment if specified
    alignSelf ? `align-self-${alignSelf} self-${alignSelf}` : '', // Support both Bootstrap and Tailwind
    className
  );

  const template = () => `
    <div class="${columnClass}" data-slot></div>
  `;

  return createComponent(template, { size, children, alignSelf, className });
}
