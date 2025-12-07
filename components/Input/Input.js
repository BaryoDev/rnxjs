import { createComponent } from '../../utils/createComponent.js';

export function Input({ type = 'text', label = '', name = '', value = '', placeholder = '', required = false, disabled = false, icon = '', ...rest }) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (typeof v === 'string') return `${k}="${v}"`;
    return '';
  }).join(' ');

  // Generate ID for floating label
  const id = `input-${Math.random().toString(36).substr(2, 9)}`;

  const template = () => `
    <div class="input-group ${label ? 'form-floating' : ''}">
      ${icon ? `<span class="input-group-text bg-transparent border-end-0"><span class="material-symbols-outlined">${icon}</span></span>` : ''}
      <input
        class="form-control ${icon ? 'border-start-0 ps-0' : ''}"
        id="${id}"
        type="${type}"
        name="${name}"
        value="${value}"
        placeholder="${placeholder || (label ? label : '')}"
        ${required ? 'required' : ''}
        ${disabled ? 'disabled' : ''}
        data-ref="input"
        ${attrs}
      >
      ${label ? `<label for="${id}">${label}</label>` : ''}
    </div>
  `;

  const input = createComponent(template, { type, label, name, value, placeholder, required, disabled, icon, ...rest });

  input.useEffect(() => {
    // Re-attach listeners if passed in rest (e.g. onchange, oninput)
    // Note: This is a simplified approach. In a real reactive system, we'd bind properly.
    const validEvents = ['onchange', 'oninput', 'onblur', 'onfocus'];
    validEvents.forEach(evt => {
      if (rest[evt] && typeof rest[evt] === 'function') {
        const eventName = evt.substring(2);
        input.refs.input.addEventListener(eventName, rest[evt]);
      }
    });

    return () => {
      validEvents.forEach(evt => {
        if (rest[evt] && typeof rest[evt] === 'function') {
          const eventName = evt.substring(2);
          if (input.refs && input.refs.input) input.refs.input.removeEventListener(eventName, rest[evt]);
        }
      });
    }
  });

  return input;
}
