import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Container Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Provides responsive container with max-width constraints.
 *
 * @param {Object} props - Component properties
 * @param {boolean|string} [props.fluid=false] - Full-width container
 * @param {string} [props.size=''] - Container size variant (sm, md, lg, xl, xxl)
 * @param {string} [props.children=''] - Container content (via slot)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Container element
 *
 * @example
 * // Standard container
 * <Container>Content here</Container>
 *
 * @example
 * // Fluid container
 * <Container fluid={true}>Full width content</Container>
 *
 * @example
 * // Size variant
 * <Container size="lg">Large container</Container>
 */
export function Container({
  fluid = false,
  size = '',
  children = '',
  className = ''
} = {}) {
  const isFluid = fluid === true || fluid === 'true';

  // Resolve classes from active theme
  const containerClass = cn(
    resolveClasses('container', {
      variant: isFluid ? 'fluid' : (size || undefined)
    }),
    className
  );

  const template = () => `
    <div class="${containerClass}" data-slot></div>
  `;

  return createComponent(template, { fluid, size, children, className });
}
