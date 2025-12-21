/**
 * Toast Plugin for rnxJS
 *
 * Toast notifications with auto-dismiss and positioning.
 *
 * Usage:
 * import { toastPlugin } from '@arnelirobles/rnxjs';
 *
 * rnx.plugins.use(toastPlugin, {
 *   position: 'top-right',
 *   duration: 3000,
 *   maxToasts: 5
 * });
 *
 * // In JavaScript:
 * rnx.toast.success('Saved successfully!');
 * rnx.toast.error('An error occurred');
 * rnx.toast.warning('Please review');
 * rnx.toast.info('Processing...');
 * rnx.toast.show('Custom message', 'custom', 5000);
 */

export function toastPlugin(options = {}) {
  const {
    position = 'top-right',
    duration = 3000,
    maxToasts = 5
  } = options;

  return {
    name: 'toast',

    install() {
      // Get or create escapeHtml function
      const escapeHtml = typeof window !== 'undefined' && window.rnx?.escapeHtml
        ? window.rnx.escapeHtml
        : (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
          };

      // Create container
      const container = document.createElement('div');
      container.className = `rnx-toast-container rnx-toast-${position}`;
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);

      const toasts = [];

      /**
       * Show a toast notification
       */
      function show(message, type = 'info', customDuration) {
        const toast = document.createElement('div');
        toast.className = `rnx-toast rnx-toast-${type}`;
        toast.setAttribute('role', 'alert');

        // Icon map for different types
        const icons = {
          success: 'check-circle-fill',
          error: 'x-circle-fill',
          warning: 'exclamation-triangle-fill',
          info: 'info-circle-fill'
        };

        const icon = icons[type] || icons.info;

        toast.innerHTML = `
          <i class="bi bi-${icon}"></i>
          <span class="rnx-toast-message">${escapeHtml(message)}</span>
          <button class="rnx-toast-close" aria-label="Close notification">
            <i class="bi bi-x"></i>
          </button>
        `;

        // Close button handler
        toast.querySelector('.rnx-toast-close').addEventListener('click', () => {
          remove(toast);
        });

        // Add to container
        container.appendChild(toast);
        toasts.push(toast);

        // Trigger animation
        requestAnimationFrame(() => {
          toast.classList.add('rnx-toast-show');
        });

        // Remove oldest if too many
        while (toasts.length > maxToasts) {
          remove(toasts[0]);
        }

        // Auto-dismiss
        const dismissDuration = customDuration ?? duration;
        if (dismissDuration > 0) {
          setTimeout(() => remove(toast), dismissDuration);
        }

        return toast;
      }

      /**
       * Remove a toast with animation
       */
      function remove(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.remove('rnx-toast-show');
        toast.classList.add('rnx-toast-hide');

        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
          const idx = toasts.indexOf(toast);
          if (idx > -1) toasts.splice(idx, 1);
        }, 300);
      }

      /**
       * Clear all toasts
       */
      function clear() {
        while (toasts.length > 0) {
          remove(toasts[0]);
        }
      }

      // Public API
      window.rnx = window.rnx || {};
      window.rnx.toast = {
        show,
        success: (msg, dur) => show(msg, 'success', dur),
        error: (msg, dur) => show(msg, 'error', dur),
        warning: (msg, dur) => show(msg, 'warning', dur),
        info: (msg, dur) => show(msg, 'info', dur),
        clear
      };

      console.log(`[rnxJS Toast] Initialized at ${position}`);
    }
  };
}

export default toastPlugin;
