import { createComponent } from '../../utils/createComponent.js';

export function Select({ name = '', options = '', value = '', required = false, disabled = false, onchange }) {
  // If options are provided as JSON string in HTML, parse them
  let parsedOptions = [];
  try {
    parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    parsedOptions = [];
  }

  const template = () => `
    <select 
      class="form-select" 
      name="${name}" 
      ${required ? 'required' : ''} 
      ${disabled ? 'disabled' : ''} 
      data-ref="select"
    >
      ${parsedOptions.map(opt => `
        <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
          ${opt.label}
        </option>
      `).join('')}
    </select>
  `;

  const select = createComponent(template, { name, options, value, required, disabled });

  select.useEffect(() => {
    if (onchange) {
      select.refs.select.addEventListener('change', onchange);
    }
  });

  return select;
}
