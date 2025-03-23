import { createComponent } from '../../utils/createComponent.js';

export function Textarea({ name = '', value = '', rows = 4, placeholder = '', required = false, disabled = false, onchange }) {
  const template = () => `
    <textarea
      class="form-control"
      name="${name}"
      rows="${rows}"
      placeholder="${placeholder}"
      ${required ? 'required' : ''}
      ${disabled ? 'disabled' : ''}
      data-ref="textarea"
    >${value}</textarea>
  `;

  const textarea = createComponent(template, { name, value, rows, placeholder, required, disabled });

  textarea.useEffect(() => {
    if (onchange) {
      textarea.refs.textarea.addEventListener('change', onchange);
    }
  });

  return textarea;
}
