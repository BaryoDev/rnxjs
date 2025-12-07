import { createComponent } from '../../utils/createComponent.js';

export function Radio({ label = '', name = '', value = '', checked = false, disabled = false, required = false, onchange, id }) {
  const finalId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  const template = () => `
    <div class="form-check">
      <input 
        class="form-check-input"
        type="radio"
        id="${finalId}"
        name="${name}"
        value="${value}"
        ${checked === 'true' ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="radio"
        data-rnx-ignore="true"
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
