import { createComponent } from '../../utils/createComponent.js';

export function Col({ size = '', children = '', alignSelf = '' }) {
  const template = () => `
    <div class="col${size ? '-' + size : ''} ${alignSelf ? 'align-self-' + alignSelf : ''}" data-slot></div>
  `;

  return createComponent(template, { size, children, alignSelf });
}
