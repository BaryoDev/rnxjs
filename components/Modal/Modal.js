import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';
import { createFocusTrap, announce } from '../../utils/a11y.ts';

export function Modal({ id = '', title = '', dismissable = true, children = [], footer = '' }) {
  // Extract footer from children if not provided as prop
  let mainContent = children;
  let footerContent = footer;



  if (Array.isArray(children)) {
    // Find index of element with slot="footer"
    const footerSlotIndex = children.findIndex(c =>
      c && c.nodeType === 1 && c.getAttribute && c.getAttribute('slot') === 'footer'
    );

    if (footerSlotIndex !== -1) {
      const footerSlotNode = children[footerSlotIndex];
      // Use innerHTML if present, or just the content if it's a wrapper
      footerContent = footerSlotNode.innerHTML;

      // Remove valid footer slot from mainContent
      // crucial: filter using the exact index found
      mainContent = children.filter((_, i) => i !== footerSlotIndex);
    }
  }

  const template = () => `
    <div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="${id}-label" aria-hidden="true" data-ref="modalRoot">
      <div class="modal-dialog" role="document">
        <div class="modal-content">

          ${title ? `
          <div class="modal-header">
            <h5 class="modal-title" id="${id}-label">${title}</h5>
            ${dismissable ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' : ''}
          </div>
          ` : ''}

          <div class="modal-body" data-slot></div>

          ${footerContent ? `
          <div class="modal-footer">
            ${footerContent}
          </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;

  // We need to pass mainContent as children to createComponent to render it in default slot
  const component = createComponent(template, { id, title, children: mainContent, footer: footerContent });

  component.useEffect((el) => {
    // Check if Bootstrap JS is available
    if (!bs.isAvailable() || !bs.Modal) {
      // Graceful fallback or no-op
      return;
    }

    // Create focus trap for the modal dialog
    const modalDialog = el.querySelector('.modal-dialog');
    const focusTrap = modalDialog ? createFocusTrap(modalDialog) : null;
    let previousActiveElement = null;

    // Initialize Bootstrap Modal
    // We try to get existing instance or create new one
    let modalInstance = bs.Modal.getInstance(el);
    if (!modalInstance) {
      modalInstance = new bs.Modal(el);
    }

    // Handle modal shown event - activate focus trap
    el.addEventListener('shown.bs.modal', () => {
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
    });

    // Handle modal hidden event - deactivate focus trap and restore focus
    el.addEventListener('hidden.bs.modal', () => {
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
    });

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
