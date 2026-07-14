import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Card Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.title=''] - Card title text
 * @param {string} [props.subtitle=''] - Card subtitle text
 * @param {string} [props.footer=''] - Card footer content
 * @param {string} [props.variant='outlined'] - Card variant (outlined, elevated, filled)
 * @param {string} [props.children=''] - Card body content (via slot)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Card element
 *
 * @example
 * // Basic usage
 * <Card title="My Card">Card content here</Card>
 *
 * @example
 * // With subtitle and footer
 * <Card title="Stats" subtitle="Last 30 days" footer="Updated today">...</Card>
 *
 * @example
 * // Elevated variant with custom classes
 * <Card variant="elevated" className="my-card">...</Card>
 */
export function Card({
  title = '',
  subtitle = '',
  footer = '',
  variant = 'outlined',
  children = '',
  className = ''
}) {
  // Resolve classes from active theme
  const cardClass = cn(
    resolveClasses('card', { variant }),
    className
  );

  const headerClass = resolvePartClasses('card', 'header');
  const bodyClass = resolvePartClasses('card', 'body');
  const footerClass = resolvePartClasses('card', 'footer');
  const titleClass = resolvePartClasses('card', 'title');
  const subtitleClass = resolvePartClasses('card', 'subtitle');

  const template = () => `
    <div class="${cardClass}">
      ${title || subtitle ? `
        <div class="${headerClass}">
          ${title ? `<h5 class="${titleClass}">${escapeHtml(title)}</h5>` : ''}
          ${subtitle ? `<small class="${subtitleClass}">${escapeHtml(subtitle)}</small>` : ''}
        </div>` : ''}
      <div class="${bodyClass}" data-slot></div>
      ${footer ? `<div class="${footerClass}">${escapeHtml(footer)}</div>` : ''}
    </div>
  `;

  return createComponent(template, { title, subtitle, footer, variant, children, className });
}
