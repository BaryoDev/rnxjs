import { createComponent } from '../../utils/createComponent.js';

export function Modal({ id = '', title = '', dismissable = true, children = '', footer = '' }) {
  const template = () => `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
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

  return createComponent(template, { id, title, children, footer });
}
