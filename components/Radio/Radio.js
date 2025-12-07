import { createComponent } from '../../utils/createComponent.js';

export function Radio({ label = '', name = '', value = '', checked = false, disabled = false, required = false, onchange, id, className = '', ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${v}"`;
    return '';
  }).join(' ');

  const finalId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  const template = () => `
    <div class="form-check">
      <input 
        class="form-check-input ${className || rest.class || ''}"
        type="radio"
        id="${finalId}"
        name="${name}"
        value="${value}"
        ${checked === 'true' || checked === true ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="radio"
        data-rnx-ignore="true"
        ${attrs}
      />
      <label class="form-check-label" for="${finalId}">
        ${label}
      </label>
    </div>
  `;

  const radio = createComponent(template, { label, name, value, checked, disabled, required });

  radio.useEffect(() => {
    if (onchange) {
      radio.refs.radio.addEventListener('change', onchange);
    }
  });

  return radio;
}
