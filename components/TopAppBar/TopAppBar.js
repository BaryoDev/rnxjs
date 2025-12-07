import { createComponent } from '../../utils/createComponent.js';

export function TopAppBar({ title = '', leadingIcon = 'menu', trailingIcon = 'more_vert', onLeadingClick, onTrailingClick }) {

    const template = () => `
    <header class="m3-top-app-bar shadow-sm">
       ${leadingIcon ? `
         <button class="btn btn-sm btn-link text-dark p-0 me-3" data-ref="leading">
           <span class="material-symbols-outlined" style="font-size: 24px;">${leadingIcon}</span>
         </button>
       ` : ''}
       <h5 class="m-0 flex-grow-1">${title}</h5>
       ${trailingIcon ? `
         <button class="btn btn-sm btn-link text-dark p-0 ms-3" data-ref="trailing">
           <span class="material-symbols-outlined" style="font-size: 24px;">${trailingIcon}</span>
         </button>
       ` : ''}
    </header>
  `;

    const component = createComponent(template, { title, leadingIcon, trailingIcon });

    component.useEffect(() => {
        if (onLeadingClick && component.refs.leading) {
            component.refs.leading.addEventListener('click', onLeadingClick);
        }
        if (onTrailingClick && component.refs.trailing) {
            component.refs.trailing.addEventListener('click', onTrailingClick);
        }
    });

    return component;
}
