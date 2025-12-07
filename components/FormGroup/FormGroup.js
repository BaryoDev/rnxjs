import { createComponent } from '../../utils/createComponent.js';

export function FormGroup({ label = '', forId = '', children = '' }) {
  const template = () => `
    <div class="mb-3">
      ${label ? `<label class="form-label" for="${forId}">${label}</label>` : ''}
      <div data-slot></div>
    </div>
  `;

  return createComponent(template, { label, forId, children });
}
