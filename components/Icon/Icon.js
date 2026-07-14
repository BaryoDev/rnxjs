import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Icon Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Uses Bootstrap Icons by default, but can work with any icon system.
 * Supports Blazor-style class customization via the className prop.
 *
 * Icons are decorative (aria-hidden) unless a label is provided,
 * in which case the icon is exposed as an image with an accessible name.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.name=''] - Icon name (without 'bi-' prefix for Bootstrap Icons)
 * @param {string} [props.size='md'] - Icon size (sm, md, lg, xl or Bootstrap: fs-1, fs-2, etc.)
 * @param {string} [props.color=''] - Icon color (can use text utility classes)
 * @param {string} [props.label=''] - Accessible label; when set, icon gets role="img" instead of aria-hidden
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Icon element
 *
 * @example
 * // Basic usage (decorative)
 * <Icon name="heart" />
 *
 * @example
 * // Meaningful icon with accessible name
 * <Icon name="star" size="lg" label="Favorite" />
 *
 * @example
 * // With custom classes
 * <Icon name="check" className="my-icon-class" />
 */
export function Icon({
  name = '',
  size = '',
  color = '',
  label = '',
  className = ''
} = {}) {
  // Handle both 'heart' and 'bi-heart' formats
  const iconName = name ? (name.startsWith('bi-') ? name : `bi-${name}`) : '';

  // Resolve base classes from active theme
  const iconClass = cn(
    resolveClasses('icon', {
      size: size || 'md'
    }),
    // Add icon system base class (bi for Bootstrap Icons)
    'bi',
    iconName,
    // Add color utilities if provided
    color,
    className // User classes applied last (highest priority)
  );

  const ariaAttrs = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true"';

  const template = () => `
    <i
      class="${escapeHtml(iconClass)}"
      data-ref="icon"
      ${ariaAttrs}
    ></i>
  `;

  return createComponent(template, { name, size, color, label, className });
}
