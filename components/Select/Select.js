import { createComponent } from '../../utils/createComponent.js';

export function Select({ name = '', label = '', options = '', value = '', required = false, disabled = false, onchange }) {
  let parsedOptions = [];
  try {
    parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    parsedOptions = [];
  }

  const id = `select-${Math.random().toString(36).substr(2, 9)}`;

  const template = () => `
    <div class="${label ? 'form-floating' : ''}">
      <select 
        class="form-select" 
        id="${id}"
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
      ${label ? `<label for="${id}">${label}</label>` : ''}
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
