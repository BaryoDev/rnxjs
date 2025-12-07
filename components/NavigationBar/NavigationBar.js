import { createComponent } from '../../utils/createComponent.js';

export function NavigationBar({ items = [], activeIndex = 0, onchange }) {
    // items: [{ label, icon }]

    const template = ({ activeIndex, items }) => `
    <div style="background-color: var(--md-sys-color-surface-container); height: 80px;" class="w-100 d-flex justify-content-around align-items-center">
      ${items.map((item, idx) => `
        <button class="btn btn-link text-decoration-none d-flex flex-column align-items-center p-0 ${idx === activeIndex ? 'text-primary' : 'text-muted'}" 
                data-index="${idx}" 
                data-ref="nav-${idx}"
                style="width: 64px;">
           <span class="d-flex align-items-center justify-content-center mb-1" 
                 style="${idx === activeIndex ? 'background-color: var(--md-sys-color-secondary-container); width: 64px; height: 32px; border-radius: 16px;' : ''}">
              <span class="material-symbols-outlined" style="${idx === activeIndex ? 'color: var(--md-sys-color-on-secondary-container)' : ''}">${item.icon}</span>
           </span>
           <span style="font-size: 12px; font-weight: 500;">${item.label}</span>
        </button>
      `).join('')}
    </div>
  `;

    const component = createComponent(template, { items, activeIndex });

    component.useEffect(() => {
        items.forEach((item, idx) => {
            const btn = component.refs[`nav-${idx}`];
            if (btn) {
                btn.addEventListener('click', () => {
                    if (onchange) onchange(idx);
                });
            }
        });
    });

    return component;
}
