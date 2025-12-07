import { createComponent } from '../../utils/createComponent.js';

export function SegmentedButton({ options = [], selected = '', onchange }) {
  // options: [{ label, value, icon }]
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      console.warn('[rnxJS] SegmentedButton: invalid options format', options);
      parsedOptions = [];
    }
  }

  const template = ({ selected, options }) => `
    <div class="btn-group" role="group" style="border: 1px solid var(--md-sys-color-outline); border-radius: 28px; overflow: hidden;">
      ${parsedOptions.map(opt => {
    const isSelected = opt.value === selected;
    return `
          <button type="button" class="btn btn-outline-secondary border-0 ${isSelected ? 'active bg-secondary-subtle text-secondary-emphasis' : ''}" 
                  data-value="${opt.value}"
                  data-rnx-ignore="true"
                  data-ref="btn-${opt.value}"
                  style="border-right: 1px solid var(--md-sys-color-outline-variant) !important; border-radius: 0;">
            ${isSelected ? '<i class="bi bi-check fs-6 me-1"></i>' : (opt.icon ? `<i class="bi bi-${opt.icon} fs-6 me-1"></i>` : '')}
            ${opt.label}
          </button>
        `;
  }).join('')}
    </div>
  `;

  const component = createComponent(template, { options, selected });

  component.useEffect(() => {
    options.forEach(opt => {
      const btn = component.refs[`btn-${opt.value}`];
      if (btn) {
        btn.addEventListener('click', () => {
          if (onchange) onchange(opt.value);
        });
      }
    });
  });

  return component;
}
