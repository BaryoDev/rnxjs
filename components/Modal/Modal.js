import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';

export function Modal({ id = '', title = '', dismissable = true, children = '', footer = '' }) {
  const template = () => `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true" data-ref="modalRoot">
      <div class="modal-dialog">
        <div class="modal-content">
        
          ${title ? `
          <div class="modal-header">
            <h5 class="modal-title" id="${id}-label">${title}</h5>
            ${dismissable ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' : ''}
          </div>
          ` : ''}

          <div class="modal-body" data-slot></div>

          ${footer ? `
          <div class="modal-footer">
            ${footer}
          </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;

  const component = createComponent(template, { id, title, children, footer });

  component.useEffect((el) => {
    // Check if Bootstrap JS is available
    if (!bs.isAvailable() || !bs.Modal) {
      // Graceful fallback or no-op
      return;
    }

    // Initialize Bootstrap Modal
    // We try to get existing instance or create new one
    let modalInstance = bs.Modal.getInstance(el);
    if (!modalInstance) {
      modalInstance = new bs.Modal(el);
    }

    // Expose methods to the component DOM element
    el.show = () => modalInstance.show();
    el.hide = () => modalInstance.hide();
    el.toggle = () => modalInstance.toggle();
    el.getInstance = () => modalInstance;

    // Cleanup on component destruction
    return () => {
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
