import { createComponent } from '../../utils/createComponent.js';

export function FAB({ icon = 'add', label = '', variant = 'standard', onclick = null }) {
    // variant: small, standard, large, extended

    let classes = 'm3-fab';
    if (variant !== 'standard') classes += ` ${variant}`;

    const clickAttr = (typeof onclick === 'string') ? `onclick="${onclick}"` : '';

    const template = () => `
    <button class="${classes}" ${clickAttr} data-ref="btn">
      <span class="material-symbols-outlined">${icon}</span>
      ${label ? `<span class="extendedspan">${label}</span>` : ''}
    </button>
  `;

    const component = createComponent(template, { icon, label, variant });

    component.useEffect(() => {
        if (typeof onclick === 'function' && component.refs.btn) {
            component.refs.btn.addEventListener('click', onclick);
            return () => component.refs.btn.removeEventListener('click', onclick);
        }
    });

    return component;
}
