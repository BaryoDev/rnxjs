import { createComponent } from '../../utils/createComponent.js';

export function Select({ name = '', label = '', options = '', value = '', required = false, disabled = false, onchange, id, className = '', ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${v}"`;
    return '';
  }).join(' ');

  let parsedOptions = [];
  try {
    parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    parsedOptions = [];
  }

  const finalId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const template = () => `
    <div class="${label ? 'form-floating' : ''}">
      <select 
        class="form-select ${className || rest.class || ''}" 
        id="${finalId}"
        name="${name}" 
        ${required ? 'required' : ''} 
        ${disabled ? 'disabled' : ''} 
        data-ref="select"
        data-rnx-ignore="true"
        ${attrs}
      >
        ${parsedOptions.map(opt => `
          <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
            ${opt.label}
          </option>
        `).join('')}
      </select>
      ${label ? `<label for="${finalId}">${label}</label>` : ''}
    </div>
  `;

  const select = createComponent(template, { name, label, options, value, required, disabled });

  select.useEffect(() => {
    if (onchange) {
      select.refs.select.addEventListener('change', onchange);
      return () => {
        if (select.refs && select.refs.select) select.refs.select.removeEventListener('change', onchange);
      };
    }
  });

  return select;
}
