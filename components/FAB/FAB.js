import { createComponent } from '../../utils/createComponent.js';

export function FAB({ icon = 'add', label = '', variant = 'standard', onclick = null }) {
  // variant: small, standard, large, extended

  const template = ({ icon, label, variant }) => {
    let classes = 'm3-fab';
    if (variant !== 'standard') classes += ` ${variant}`;

    return `
    <button class="${classes}" data-ref="btn" data-rnx-ignore="true">
      <i class="bi bi-${icon}"></i>
      ${label ? `<span class="extendedspan">${label}</span>` : ''}
    </button>
  `};

  const component = createComponent(template, { icon, label, variant });

  component.useEffect(() => {
    if (component.refs.btn) {
      if (typeof onclick === 'function') {
        component.refs.btn.addEventListener('click', onclick);
        return () => component.refs.btn.removeEventListener('click', onclick);
      } else if (typeof onclick === 'string') {
        component.refs.btn.setAttribute('onclick', onclick);
      }
    }
  });

  return component;
}
