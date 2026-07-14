import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, themeProvider } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Spinner Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.type='border'] - Spinner type (border, grow)
 * @param {string} [props.size='md'] - Spinner size (sm, md, lg)
 * @param {string} [props.variant='primary'] - Color variant for the spinner
 * @param {string} [props.label=''] - Accessible label (defaults to "Loading...")
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Spinner element
 *
 * @example
 * // Basic usage
 * <Spinner />
 *
 * @example
 * // Small growing spinner
 * <Spinner type="grow" size="sm" />
 *
 * @example
 * // With custom classes
 * <Spinner className="my-spinner-class" />
 */
export function Spinner({
  type = 'border',
  size = '',
  variant = 'primary',
  label = '',
  className = ''
}) {
  // Resolve classes from active theme
  const spinnerClass = cn(
    resolveClasses('spinner', {
      variant: type, // type maps to variant in theme (border/grow)
      size: size || 'md'
    }),
    // Add text color for the spinner
    themeProvider.resolveUtility('text', variant),
    className // User classes applied last (highest priority)
  );

  const template = () => `
    <div class="${spinnerClass}" role="status">
      <span class="visually-hidden sr-only">${escapeHtml(label || 'Loading...')}</span>
    </div>
  `;

  return createComponent(template, { type, size, variant, label, className });
}
