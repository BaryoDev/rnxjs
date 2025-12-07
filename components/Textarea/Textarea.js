import { createComponent } from '../../utils/createComponent.js';

export function Textarea({ name = '', value = '', rows = 4, placeholder = '', required = false, disabled = false, onchange, id, className = '', ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${v}"`;
    return '';
  }).join(' ');

  const template = () => `
    <textarea
      class="form-control ${className || rest.class || ''}"
      name="${name}"
      rows="${rows}"
      placeholder="${placeholder}"
      ${required ? 'required' : ''}
      ${disabled ? 'disabled' : ''}
      data-ref="textarea"
      data-rnx-ignore="true"
      ${attrs}
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
