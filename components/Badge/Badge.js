import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Badge Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Badge text content
 * @param {string} [props.variant='secondary'] - Badge variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} [props.size='md'] - Badge size (sm, md, lg)
 * @param {boolean} [props.pill=false] - Pill-shaped badge
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Badge element
 *
 * @example
 * // Basic usage
 * <Badge label="New" variant="primary" />
 *
 * @example
 * // Pill badge
 * <Badge label="5" variant="danger" pill={true} />
 *
 * @example
 * // With custom classes
 * <Badge label="Custom" className="my-class" />
 */
export function Badge({
  label = '',
  variant = 'secondary',
  size = 'md',
  pill = false,
  className = ''
} = {}) {
  // Resolve classes from active theme
  const badgeClass = cn(
    resolveClasses('badge', {
      variant,
      size,
      pill: pill === true || pill === 'true'
    }),
    className // User classes applied last (highest priority)
  );

  const template = () => `
    <span class="${escapeHtml(badgeClass)}">
      ${escapeHtml(label)}
    </span>
  `;

  return createComponent(template, { label, variant, size, pill, className });
}
