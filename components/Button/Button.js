import { createComponent } from '../../utils/createComponent.js';

export function Button({ label = '', variant = 'primary', size = '', block = false, onclick, children }) {
  const template = () => `
    <button 
      class="btn btn-${variant} ${size ? 'btn-' + size : ''} ${block === 'true' ? 'w-100' : ''}" 
      type="button"
      data-ref="btn"
    >
      ${label}
      <span data-slot></span>
    </button>
  `;

  const btn = createComponent(template, { label, variant, size, block, children });

  btn.useEffect(() => {
    if (onclick) btn.refs.btn.addEventListener('click', onclick);
  });

  return btn;
}
