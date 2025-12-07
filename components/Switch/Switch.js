import { createComponent } from '../../utils/createComponent.js';

export function Switch({ label = '', checked = false, onchange }) {
  const id = `switch-${Math.random().toString(36).substr(2, 9)}`;

  const template = ({ checked }) => `
    <div class="form-check form-switch d-flex align-items-center gap-3 ps-0">
      <input class="form-check-input m3-switch ms-0" type="checkbox" role="switch" id="${id}" ${checked ? 'checked' : ''} data-ref="input" data-rnx-ignore="true">
      ${label ? `<label class="form-check-label" for="${id}">${label}</label>` : ''}
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
