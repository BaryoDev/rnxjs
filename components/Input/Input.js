import { createComponent } from '../../utils/createComponent.js';

export function Input({ type = 'text', name = '', value = '', placeholder = '', required = false, disabled = false, onchange }) {
  const template = () => `
    <input
      class="form-control"
      type="${type}"
      name="${name}"
      value="${value}"
      placeholder="${placeholder}"
      ${required ? 'required' : ''}
      ${disabled ? 'disabled' : ''}
      data-ref="input"
    />
  `;

  const input = createComponent(template, { type, name, value, placeholder, required, disabled });

  input.useEffect(() => {
    if (onchange) {
      input.refs.input.addEventListener('change', onchange);
    }
  });

  return input;
}
