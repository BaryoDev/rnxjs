import { createComponent } from '../../utils/createComponent.js';

export function Search({ placeholder = 'Search...', value = '', onsearch }) {

  const template = ({ value }) => `
    <div class="input-group" style="background-color: var(--md-sys-color-surface-variant); border-radius: 28px; padding: 4px 16px;">
      <span class="input-group-text bg-transparent border-0 p-0 me-2">
        <i class="bi bi-search"></i>
      </span>
      <input type="text" class="form-control bg-transparent border-0 shadow-none p-0" 
             placeholder="${placeholder}" 
             value="${value}" 
             data-ref="input"
             data-rnx-ignore="true"
             style="height: 40px;">
      ${value ? `
        <button class="btn btn-link text-muted p-0 ms-2" data-ref="clear" data-rnx-ignore="true">
          <i class="bi bi-x-lg"></i>
        </button>
      ` : ''}
    </div>
  `;

  const component = createComponent(template, { value, placeholder });

  component.useEffect((comp) => {
    if (comp.refs.input) {
      comp.refs.input.addEventListener('input', (e) => {
        const val = e.target.value;
        comp.setState({ value: val });
        if (onsearch) onsearch(val);
      });
    }
    if (comp.refs.clear) {
      comp.refs.clear.addEventListener('click', () => {
        comp.setState({ value: '' });
        if (onsearch) onsearch('');
      });
    }
  });

  return component;
}
