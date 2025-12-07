import { createComponent } from '../../utils/createComponent.js';

export function Chips({ items = [], type = 'filter', onselect }) {
    // items: [{ label, icon, selected, value }]

    const template = ({ items }) => `
    <div class="d-flex flex-wrap gap-2">
      ${items.map((item, idx) => `
         <span class="m3-chip ${item.selected ? 'selected' : ''}" 
               data-index="${idx}" 
               data-ref="chip-${idx}">
           ${item.selected && type === 'filter' ? '<i class="material-symbols-outlined">check</i>' : (item.icon ? `<i class="material-symbols-outlined">${item.icon}</i>` : '')}
           ${item.label}
         </span>
      `).join('')}
    </div>
  `;

    const component = createComponent(template, { items, type });

    component.useEffect(() => {
        items.forEach((item, idx) => {
            const el = component.refs[`chip-${idx}`];
            if (el) {
                el.addEventListener('click', () => {
                    if (onselect) onselect(item, idx);
                });
            }
        });
    });

    return component;
}
