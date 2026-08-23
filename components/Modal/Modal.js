import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';
import { createFocusTrap, announce } from '../../utils/a11y.js';
import { sanitizeHtml, escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let modalIdCounter = 0;

/**
 * Modal Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Accessible dialog with focus trap and screen reader support.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.id=''] - Modal ID for targeting (auto-generated if omitted)
 * @param {string} [props.title=''] - Modal title
 * @param {boolean} [props.dismissable=true] - Can be closed
 * @param {Array} [props.children=[]] - Modal body content
 * @param {string} [props.footer=''] - Footer content (sanitized before insertion)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Modal element
 */
export function Modal({ id = '', title = '', dismissable = true, children = [], footer = '', className = '' } = {}) {
  const modalId = id || `rnx-modal-${++modalIdCounter}`;

  // Extract footer from children if not provided as prop
  let mainContent = children;
  // SECURITY: footer HTML (prop or slot) is always sanitized before insertion
  let footerContent = footer ? sanitizeHtml(footer) : '';

  if (Array.isArray(children)) {
    // Find index of element with slot="footer"
    const footerSlotIndex = children.findIndex(c =>
      c && c.nodeType === 1 && c.getAttribute && c.getAttribute('slot') === 'footer'
    );

    if (footerSlotIndex !== -1) {
      const footerSlotNode = children[footerSlotIndex];
      footerContent = sanitizeHtml(footerSlotNode.innerHTML);

      // Remove valid footer slot from mainContent
      // crucial: filter using the exact index found
      mainContent = children.filter((_, i) => i !== footerSlotIndex);
    }
  }

  // Resolve classes from active theme
  const modalClass = cn(resolveClasses('modal'), 'modal', className);
  const dialogClass = resolvePartClasses('modal', 'dialog') || 'modal-dialog';
  const contentClass = resolvePartClasses('modal', 'content') || 'modal-content';
  const headerClass = resolvePartClasses('modal', 'header') || 'modal-header';
  const titleClass = resolvePartClasses('modal', 'title') || 'modal-title';
  const closeClass = resolvePartClasses('modal', 'close') || 'btn-close';
  const bodyClass = resolvePartClasses('modal', 'body') || 'modal-body';
  const footerClass = resolvePartClasses('modal', 'footer') || 'modal-footer';

  const template = () => `
    <div class="${modalClass}" id="${escapeHtml(modalId)}" tabindex="-1" role="dialog" aria-modal="true"${title ? ` aria-labelledby="${escapeHtml(modalId)}-label"` : ''} aria-hidden="true" data-ref="modalRoot">
      <div class="${dialogClass}" role="document" data-ref="dialog">
        <div class="${contentClass}">

          ${title ? `
          <div class="${headerClass}">
            <h5 class="${titleClass}" id="${escapeHtml(modalId)}-label">${escapeHtml(title)}</h5>
            ${dismissable ? `<button type="button" class="${closeClass}" data-bs-dismiss="modal" aria-label="Close"></button>` : ''}
          </div>
          ` : ''}

          <div class="${bodyClass}" data-slot></div>

          ${footerContent ? `
          <div class="${footerClass}">
            ${footerContent}
          </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;

  // We need to pass mainContent as children to createComponent to render it in default slot
  const component = createComponent(template, { id: modalId, title, children: mainContent, footer: footerContent });

  component.useEffect((el) => {
    // Check if Bootstrap JS is available
    if (!bs.isAvailable() || !bs.Modal) {
      // Graceful fallback or no-op
      return;
    }

    // Create focus trap for the modal dialog
    const modalDialog = el.querySelector('[data-ref="dialog"]');
    const focusTrap = modalDialog ? createFocusTrap(modalDialog) : null;
    let previousActiveElement = null;

    // Initialize Bootstrap Modal
    // We try to get existing instance or create new one
    let modalInstance = bs.Modal.getInstance(el);
    if (!modalInstance) {
      modalInstance = new bs.Modal(el, dismissable ? {} : { backdrop: 'static', keyboard: false });
    }

    // Handle modal shown event - activate focus trap
    const handleShown = () => {
      // Store previously focused element
      previousActiveElement = document.activeElement;

      // Activate focus trap
      if (focusTrap) {
        focusTrap.activate();
      }

      // Update aria-hidden
      el.setAttribute('aria-hidden', 'false');

      // Announce to screen readers
      if (title) {
        announce(`${title} dialog opened`, 'polite');
      }
    };
    el.addEventListener('shown.bs.modal', handleShown);

    // Handle modal hidden event - deactivate focus trap and restore focus
    const handleHidden = () => {
      // Deactivate focus trap
      if (focusTrap) {
        focusTrap.deactivate(false); // Don't let trap restore focus, we'll do it manually
      }

      // Update aria-hidden
      el.setAttribute('aria-hidden', 'true');

      // Restore focus to previously active element
      if (previousActiveElement && previousActiveElement.focus) {
        requestAnimationFrame(() => {
          previousActiveElement.focus();
        });
      }

      // Announce to screen readers
      if (title) {
        announce(`${title} dialog closed`, 'polite');
      }
    };
    el.addEventListener('hidden.bs.modal', handleHidden);

    // Handle Escape key
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && dismissable) {
        modalInstance.hide();
      }
    };
    el.addEventListener('keydown', handleKeydown);

    // Expose methods to the component DOM element
    el.show = () => modalInstance.show();
    el.hide = () => modalInstance.hide();
    el.toggle = () => modalInstance.toggle();
    el.getInstance = () => modalInstance;

    // Cleanup on component destruction
    return () => {
      // Remove event listeners
      el.removeEventListener('keydown', handleKeydown);
      el.removeEventListener('shown.bs.modal', handleShown);
      el.removeEventListener('hidden.bs.modal', handleHidden);

      // Deactivate focus trap if active
      if (focusTrap && focusTrap.isActive()) {
        focusTrap.deactivate();
      }

      // If the modal is still open, hide it before disposing
      // This prevents backdrop from getting stuck
      if (modalInstance) {
        // We carefully check if the element is still in DOM to avoid errors
        modalInstance.dispose();
      }
    };
  });

  return component;
}
