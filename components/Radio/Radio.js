import { createComponent } from '../../utils/createComponent.js';

export function Radio({ label = '', name = '', value = '', checked = false, disabled = false, required = false, onchange }) {
  const template = () => `
    <div class="form-check">
      <input 
        class="form-check-input"
        type="radio"
        name="${name}"
        value="${value}"
        ${checked === 'true' ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="radio"
      />
      <label class="form-check-label">
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
