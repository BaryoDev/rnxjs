import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const VARIANT_SIZE = { small: 'sm', standard: 'md', large: 'lg' };

/**
 * FAB (Floating Action Button) Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 floating action button.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.icon='add'] - Bootstrap icon name
 * @param {string} [props.label=''] - Extended FAB label text
 * @param {string} [props.variant='standard'] - FAB variant (small, standard, large, extended)
 * @param {Function|string} [props.onclick=null] - Click handler
 * @param {string} [props.ariaLabel=''] - Accessible name for icon-only FABs (falls back to icon name)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} FAB element
 */
export function FAB({ icon = 'add', label = '', variant = 'standard', onclick = null, ariaLabel = '', className = '' } = {}) {
  // Resolve classes from active theme
  const fabClass = cn(
    resolveClasses('fab', { size: VARIANT_SIZE[variant] || 'md' }),
    'm3-fab',
    variant !== 'standard' ? variant : '',
    className
  );
  const labelClass = resolvePartClasses('fab', 'label') || 'extendedspan';

  // Icon-only FABs need an accessible name
  const accessibleName = label ? '' : (ariaLabel || icon);

  const template = ({ icon, label }) => `
    <button type="button" class="${fabClass}" data-ref="btn" data-rnx-ignore="true"${accessibleName ? ` aria-label="${escapeHtml(accessibleName)}"` : ''}>
      <i class="bi bi-${escapeHtml(icon)}" aria-hidden="true"></i>
      ${label ? `<span class="${labelClass}">${escapeHtml(label)}</span>` : ''}
    </button>
  `;

  const component = createComponent(template, { icon, label, variant, className });

  component.useEffect(() => {
    // MEMORY LEAK FIX: Store handler for cleanup
    let handler = null;

    if (component.refs.btn) {
      if (typeof onclick === 'function') {
        handler = onclick;
        component.refs.btn.addEventListener('click', handler);
      } else if (typeof onclick === 'string') {
        component.refs.btn.setAttribute('onclick', onclick);
      }
    }

    // Cleanup
    return () => {
      if (handler && component.refs.btn) {
        component.refs.btn.removeEventListener('click', handler);
      }
    };
  });

  return component;
}
