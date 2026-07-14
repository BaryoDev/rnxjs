import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';
import { bs } from '../../utils/bootstrap.js';

/**
 * Toast Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Creates notification toasts that auto-dismiss.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.header=''] - Toast header text
 * @param {string} [props.body=''] - Toast body content
 * @param {boolean} [props.autohide=true] - Auto-dismiss the toast
 * @param {number} [props.delay=5000] - Auto-dismiss delay in ms
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Toast element
 *
 * @example
 * // Basic toast
 * <Toast header="Success" body="Operation completed!" />
 *
 * @example
 * // Persistent toast
 * <Toast header="Alert" body="Important message" autohide={false} />
 */
export function Toast({
  header = '',
  body = '',
  autohide = true,
  delay = 5000,
  className = ''
}) {
  // Resolve classes from active theme
  const toastClass = cn(
    resolveClasses('toast'),
    className
  );

  const headerClass = resolvePartClasses('toast', 'header');
  const bodyClass = resolvePartClasses('toast', 'body');

  const template = () => `
    <div class="${toastClass}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
      <div class="${headerClass}">
        <strong class="me-auto flex-1">${escapeHtml(header)}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" data-rnx-ignore="true"></button>
      </div>
      <div class="${bodyClass}">
        ${escapeHtml(body)}
      </div>
    </div>
  `;

  const toast = createComponent(template, { header, body, autohide, delay, className });

  toast.useEffect((el) => {
    if (!bs.isAvailable() || !bs.Toast) return;

    // Use getOrCreateInstance if available (BS5), otherwise new
    const bsToast = bs.Toast.getOrCreateInstance
      ? bs.Toast.getOrCreateInstance(el)
      : new bs.Toast(el);

    bsToast.show();

    // Expose methods
    el.show = () => bsToast.show();
    el.hide = () => bsToast.hide();
    el.dispose = () => bsToast.dispose();

    return () => bsToast.dispose();
  });

  return toast;
}
