import { createComponent } from '../../utils/createComponent.js';

export function Slider({ value = 0, min = 0, max = 100, step = 1, oninput }) {

    const template = ({ value }) => `
    <div class="d-flex align-items-center" style="height: 40px;">
      <input type="range" class="form-range" 
             min="${min}" max="${max}" step="${step}" value="${value}" 
             data-ref="range"
             data-rnx-ignore="true"
             style="accent-color: var(--md-sys-color-primary);">
    </div>
  `;

    const component = createComponent(template, { value, min, max, step });

    component.useEffect(() => {
        if (oninput && component.refs.range) {
            component.refs.range.addEventListener('input', (e) => {
                oninput(e.target.value);
            });
        }
    });

    return component;
}
