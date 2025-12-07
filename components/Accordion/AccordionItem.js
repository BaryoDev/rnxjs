import { createComponent } from '../../utils/createComponent.js';

export function AccordionItem({ parent = 'accordion', title = '', index = '0', show = false, children = '' }) {
  const collapseId = `collapse-${index}`;
  const headingId = `heading-${index}`;

  const template = () => `
    <div class="accordion-item">
      <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button ${!show ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${show}" aria-controls="${collapseId}" data-rnx-ignore="true">
          ${title}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse ${show ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#${parent}">
        <div class="accordion-body" data-slot></div>
      </div>
    </div>
  `;

  return createComponent(template, { parent, title, index, show, children });
}
