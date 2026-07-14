import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';
import { bs } from '../../utils/bootstrap.js';

/**
 * Toast Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Creates notification toasts that auto-dismiss. Uses Bootstrap's Toast
 * JS when available, with a built-in fallback for other frameworks.
 *
 * @param {Object} [props={}] - Component properties
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
} = {}) {
  // Resolve classes from active theme
  const toastClass = cn(
    resolveClasses('toast', { show: true }),
    className
  );

  const headerClass = resolvePartClasses('toast', 'header');
  const bodyClass = resolvePartClasses('toast', 'body');
  const closeClass = resolvePartClasses('toast', 'close') || 'btn-close';
  const titleClass = resolveUtility('spacing', 'mr', 'auto');

  const template = () => `
    <div class="${escapeHtml(toastClass)}" role="status" aria-live="polite" aria-atomic="true" data-bs-delay="${escapeHtml(delay)}">
      <div class="${escapeHtml(headerClass)}">
        <strong class="${escapeHtml(titleClass)}">${escapeHtml(header)}</strong>
        <button type="button" class="${escapeHtml(closeClass)}" data-ref="close" data-bs-dismiss="toast" aria-label="Close" data-rnx-ignore="true"></button>
      </div>
      <div class="${escapeHtml(bodyClass)}">
        ${escapeHtml(body)}
      </div>
    </div>
  `;

  const toast = createComponent(template, { header, body, autohide, delay, className });

  toast.useEffect((el) => {
    if (bs.isAvailable() && bs.Toast) {
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
    }

    // Fallback when Bootstrap JS is not present (Tailwind, custom themes)
    const closeBtn = el.refs && el.refs.close;
    const dismiss = () => el.remove();
    const shouldAutohide = autohide === true || autohide === 'true';
    const timer = shouldAutohide ? setTimeout(dismiss, Number(delay) || 5000) : null;

    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }

    el.hide = dismiss;

    return () => {
      if (timer) clearTimeout(timer);
      if (closeBtn) {
        closeBtn.removeEventListener('click', dismiss);
      }
    };
  });

  return toast;
}
