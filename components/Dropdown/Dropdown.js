import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

export const Dropdown = (props = {}) => {
    const {
        label = 'Menu',
        items = [],
        position = 'bottom-left',
        onSelect,
        trigger = 'click',
        icon = null,
        variant = 'default',
        disabled = false
    } = props;

    let isOpen = false;

    const component = createComponent({
        render() {
            const container = document.createElement('div');
            container.className = `dropdown dropdown-${variant} ${disabled ? 'disabled' : ''}`;
            container.setAttribute('data-ref', 'dropdown');

            const button = document.createElement('button');
            button.className = 'dropdown-trigger';
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.disabled = disabled;
            button.innerHTML = `
                ${icon ? `<span class="dropdown-icon">${escapeHtml(icon)}</span>` : ''}
                <span class="dropdown-label">${escapeHtml(label)}</span>
                <span class="dropdown-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            `;

            const menu = document.createElement('div');
            menu.className = `dropdown-menu dropdown-${position}`;
            menu.setAttribute('data-ref', 'dropdown-menu');
            menu.style.display = 'none';

            const list = document.createElement('ul');
            list.className = 'dropdown-list';

            items.forEach((item, index) => {
                if (item.divider) {
                    const divider = document.createElement('li');
                    divider.className = 'dropdown-divider';
                    list.appendChild(divider);
                    return;
                }

                const li = document.createElement('li');
                li.className = `dropdown-item ${item.disabled ? 'disabled' : ''} ${item.active ? 'active' : ''}`;
                li.setAttribute('data-index', index);
                li.innerHTML = `
                    <a href="${item.href || '#'}" class="dropdown-item-link" data-item-id="${escapeHtml(item.id || '')}">
                        ${item.icon ? `<span class="dropdown-item-icon">${escapeHtml(item.icon)}</span>` : ''}
                        <span class="dropdown-item-text">${escapeHtml(item.label)}</span>
                        ${item.badge ? `<span class="dropdown-item-badge">${escapeHtml(item.badge)}</span>` : ''}
                    </a>
                `;
                list.appendChild(li);
            });

            menu.appendChild(list);

            container.appendChild(button);
            container.appendChild(menu);

            return container;
        },

        useEffect(component) {
            const trigger = component.querySelector('.dropdown-trigger');
            const menu = component.querySelector('[data-ref="dropdown-menu"]');
            const container = component.querySelector('[data-ref="dropdown"]');

            // Handle trigger clicks
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggle();
                });
            }

            // Handle item clicks
            const items = component.querySelectorAll('.dropdown-item:not(.disabled)');
            items.forEach(item => {
                const link = item.querySelector('.dropdown-item-link');
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const itemId = link.getAttribute('data-item-id');
                        const itemIndex = parseInt(item.getAttribute('data-index'));

                        // Update active state
                        component.querySelectorAll('.dropdown-item.active').forEach(el => {
                            el.classList.remove('active');
                        });
                        item.classList.add('active');

                        if (onSelect) {
                            onSelect({
                                id: itemId,
                                label: link.querySelector('.dropdown-item-text')?.textContent || '',
                                index: itemIndex
                            });
                        }

                        close();
                    });
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target) && isOpen) {
                    close();
                }
            });

            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    open();
                    const firstItem = component.querySelector('.dropdown-item:not(.disabled)');
                    if (firstItem) {
                        firstItem.querySelector('.dropdown-item-link').focus();
                    }
                }
            });

            // Keyboard navigation in menu
            const menuItems = component.querySelectorAll('.dropdown-item-link');
            menuItems.forEach((item, index) => {
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (index < menuItems.length - 1) {
                            menuItems[index + 1].focus();
                        }
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (index > 0) {
                            menuItems[index - 1].focus();
                        } else {
                            trigger.focus();
                        }
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        close();
                        trigger.focus();
                    }
                });
            });

            return () => {
                trigger?.removeEventListener('click', null);
                items.forEach(item => {
                    item.removeEventListener('click', null);
                });
                document.removeEventListener('click', null);
                menuItems.forEach(item => {
                    item.removeEventListener('keydown', null);
                });
            };
        }
    });

    const open = () => {
        if (disabled) return;
        isOpen = true;
        const menu = component.querySelector('[data-ref="dropdown-menu"]');
        const trigger = component.querySelector('.dropdown-trigger');
        if (menu && trigger) {
            menu.style.display = 'block';
            trigger.setAttribute('aria-expanded', 'true');
            component.classList.add('open');
        }
    };

    const close = () => {
        isOpen = false;
        const menu = component.querySelector('[data-ref="dropdown-menu"]');
        const trigger = component.querySelector('.dropdown-trigger');
        if (menu && trigger) {
            menu.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
            component.classList.remove('open');
        }
    };

    const toggle = () => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    };

    component.open = open;
    component.close = close;
    component.toggle = toggle;
    component.isOpen = () => isOpen;

    return component;
};
