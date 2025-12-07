import { createComponent } from '../../utils/createComponent.js';

export function Column({ size = '', children = '', alignSelf = '', className = '' }) {
  const classList = className || ''; // Handle 'class' passed as attribute which maps to className in React-like, but here props likely have 'class' if passed via Loader?
  // ComponentLoader passes 'class' as 'class'. createComponent doesn't map it.

  const template = ({ size, alignSelf, className, class: cls }) => `
    <div class="col${size ? '-' + size : ''} ${alignSelf ? 'align-self-' + alignSelf : ''} ${className || cls || ''}" data-slot></div>
  `;

  return createComponent(template, { size, children, alignSelf });
}
