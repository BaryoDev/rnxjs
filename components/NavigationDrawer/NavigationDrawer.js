import { createComponent } from '../../utils/createComponent.js';

export function NavigationDrawer({ links = [], isOpen = false, onClose }) {
    // links: [{ label, icon, href, active, onclick }]

    const template = ({ isOpen, links }) => `
    <div>
       <div class="m3-navigation-drawer ${isOpen ? 'open' : ''}" data-ref="drawer">
          <div class="p-3 mb-3">
             <h5 class="m-0">Menu</h5>
          </div>
          <div class="nav flex-column">
             ${links.map((link, idx) => `
               <a href="${link.href || '#'}" 
                  class="m3-drawer-link ${link.active ? 'active' : ''}"
                  data-index="${idx}"
                  data-ref="link-${idx}"
                  data-rnx-ignore="true"
               >
                  ${link.icon ? `<i class="bi bi-${link.icon} me-2"></i>` : ''}
                  ${link.label}
               </a>
             `).join('')}
          </div>
       </div>
       ${isOpen ? `<div class="modal-backdrop fade show" style="z-index: 1040" data-ref="backdrop"></div>` : ''}
    </div>
  `;

    const component = createComponent(template, { links, isOpen });

    component.useEffect((comp) => {
        if (comp.refs.backdrop) {
            comp.refs.backdrop.addEventListener('click', () => {
                if (onClose) onClose();
            });
        }

        // Bind link clicks if they have onclick handlers in the data
        links.forEach((link, idx) => {
            const linkRef = comp.refs[`link-${idx}`];
            if (linkRef && link.onclick) {
                linkRef.addEventListener('click', (e) => {
                    e.preventDefault();
                    link.onclick(e);
                });
            }
        });
    });

    return component;
}
