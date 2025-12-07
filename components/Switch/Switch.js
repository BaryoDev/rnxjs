import { createComponent } from '../../utils/createComponent.js';

export function Switch({ label = '', checked = false, onchange, id, className = '', ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${v}"`;
    return '';
  }).join(' ');
  const finalId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  const template = ({ checked }) => `
    <div class="form-check form-switch d-flex align-items-center gap-3 ps-0">
      <input class="form-check-input m3-switch ms-0 ${className || rest.class || ''}" type="checkbox" role="switch" id="${finalId}" ${checked ? 'checked' : ''} data-ref="input" data-rnx-ignore="true" ${attrs}>
      ${label ? `<label class="form-check-label" for="${finalId}">${label}</label>` : ''}
    </div>
  `;

  const component = createComponent(template, { label, checked });

  component.useEffect(() => {
    if (onchange && component.refs.input) {
      component.refs.input.addEventListener('change', (e) => {
        onchange(e.target.checked);
      });
    }
  });

  return component;
}
