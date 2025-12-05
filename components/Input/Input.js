import { createComponent } from '../../utils/createComponent.js';

export function Input({ type = 'text', name = '', value = '', placeholder = '', required = false, disabled = false, ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => k + '="' + v + '"').join(' ');
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
      ${attrs}
    >
  `;

  const input = createComponent(template, { type, name, value, placeholder, required, disabled, ...rest });

  input.useEffect(() => {
    if (rest.onchange) {
      input.refs.input.addEventListener('change', rest.onchange);
    }
  });

  return input;
}
