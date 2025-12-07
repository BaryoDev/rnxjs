import { createComponent } from '../../utils/createComponent.js';

export function Checkbox({ label = '', name = '', value = '', checked = false, disabled = false, required = false, onchange }) {
  const template = () => `
    <div class="form-check">
      <input 
        class="form-check-input"
        type="checkbox"
        name="${name}"
        value="${value}"
        ${checked === 'true' ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="checkbox"
        data-rnx-ignore="true"
      />
      <label class="form-check-label">
        ${label}
      </label>
    </div>
  `;

  const checkbox = createComponent(template, { label, name, value, checked, disabled, required });

  checkbox.useEffect(() => {
    if (onchange) {
      checkbox.refs.checkbox.addEventListener('change', onchange);
    }
  });

  return checkbox;
}
