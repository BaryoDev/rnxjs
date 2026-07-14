import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Alert Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.variant='primary'] - Alert variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {boolean} [props.dismissible=false] - Dismissible alert with close button
 * @param {string} [props.children=''] - Alert content (children via slot)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @param {string} [props.id=''] - Alert HTML id attribute
 * @returns {HTMLElement} Alert element
 *
 * @example
 * // Basic usage
 * <Alert variant="success">Operation completed!</Alert>
 *
 * @example
 * // Dismissible alert
 * <Alert variant="warning" dismissible={true}>This can be closed</Alert>
 *
 * @example
 * // With custom classes
 * <Alert variant="info" className="my-custom-alert">Custom styled</Alert>
 */
export function Alert({
  variant = 'primary',
  dismissible = false,
  children = '',
  className = '',
  id = ''
} = {}) {
  const isDismissible = dismissible === true || dismissible === 'true';

  // Resolve classes from active theme
  const alertClass = cn(
    resolveClasses('alert', {
      variant,
      dismissible: isDismissible
    }),
    className // User classes applied last (highest priority)
  );

  // Alert has no close part in themes; reuse the closest part (modal close)
  const closeClass = resolvePartClasses('modal', 'close') || 'btn-close';

  const template = () => `
    <div ${id ? `id="${escapeHtml(id)}"` : ''} class="${escapeHtml(alertClass)}" role="alert" data-slot>
      ${isDismissible ? `<button type="button" class="${escapeHtml(closeClass)}" data-ref="close" data-bs-dismiss="alert" aria-label="Close" data-rnx-ignore="true"></button>` : ''}
    </div>
  `;

  const alert = createComponent(template, { variant, dismissible, children, className, id });

  alert.useEffect((el) => {
    const closeBtn = el.refs && el.refs.close;
    if (!closeBtn) return;

    const handler = () => el.remove();
    closeBtn.addEventListener('click', handler);
    return () => closeBtn.removeEventListener('click', handler);
  });

  return alert;
}
