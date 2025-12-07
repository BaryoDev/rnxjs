import { createComponent } from '../../utils/createComponent.js';

export function List({ items = [] }) {
  // items: [{ headline, supportingText, leadingIcon, trailingIcon, onclick }]

  const template = ({ items }) => `
    <ul class="list-group list-group-flush">
      ${items.map((item, idx) => `
        <li class="list-group-item d-flex align-items-center border-0 px-3 py-2 ${item.onclick ? 'list-group-item-action' : ''}" 
            data-index="${idx}"
            data-ref="item-${idx}"
            style="cursor: ${item.onclick ? 'pointer' : 'default'}; background-color: var(--md-sys-color-surface);">
            
           ${item.leadingIcon ? `
             <div class="me-3 text-secondary">
               <i class="bi bi-${item.leadingIcon}"></i>
             </div>
           ` : ''}
           
           <div class="d-flex flex-column flex-grow-1">
             <span class="fw-normal text-body">${item.headline}</span>
             ${item.supportingText ? `<small class="text-muted">${item.supportingText}</small>` : ''}
           </div>
           
           ${item.trailingIcon ? `
             <div class="ms-3 text-secondary">
               <i class="bi bi-${item.trailingIcon}"></i>
             </div>
           ` : ''}
        </li>
      `).join('')}
    </ul>
  `;

  const component = createComponent(template, { items });

  component.useEffect(() => {
    items.forEach((item, idx) => {
      const el = component.refs[`item-${idx}`];
      if (el && item.onclick) {
        el.addEventListener('click', item.onclick);
      }
    });
  });

  return component;
}
