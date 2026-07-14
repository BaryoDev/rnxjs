import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Dropdown Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Accessible dropdown menu with keyboard navigation.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.label='Menu'] - Trigger button label
 * @param {Array} [props.items=[]] - Menu items [{label, icon, href, id, badge, disabled, active, divider}]
 * @param {string} [props.position='bottom-left'] - Menu position
 * @param {Function} [props.onSelect] - Called when item is selected
 * @param {string} [props.trigger='click'] - Trigger type
 * @param {string|null} [props.icon=null] - Trigger button icon
 * @param {string} [props.variant='default'] - Dropdown variant
 * @param {boolean} [props.disabled=false] - Disable dropdown
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Dropdown element
 */
export const Dropdown = (props = {}) => {
    const {
        label = 'Menu',
        items = [],
        position = 'bottom-left',
        onSelect,
        trigger = 'click',
        icon = null,
        variant = 'default',
        disabled = false,
        className = ''
    } = props;

    let isOpen = false;

    const component = createComponent({
        render() {
            // Resolve classes from active theme
            const dropdownClass = cn(
                resolveClasses('dropdown', { variant, disabled }),
                className
            );
            const triggerClass = resolvePartClasses('dropdown', 'trigger') || 'dropdown-trigger';
            const iconWrapperClass = resolvePartClasses('dropdown', 'icon') || 'dropdown-icon';
            const labelClass = resolvePartClasses('dropdown', 'label') || 'dropdown-label';
            const arrowClass = resolvePartClasses('dropdown', 'arrow') || 'dropdown-arrow';
            const menuClass = cn(
                resolvePartClasses('dropdown', 'menu') || 'dropdown-menu',
                `dropdown-${position}`
            );
            const listClass = resolvePartClasses('dropdown', 'list') || 'dropdown-list';
            const itemClass = resolvePartClasses('dropdown', 'item') || 'dropdown-item';
            const dividerClass = resolvePartClasses('dropdown', 'divider') || 'dropdown-divider';
            const linkClass = resolvePartClasses('dropdown', 'link') || 'dropdown-item-link';
            const itemIconClass = resolvePartClasses('dropdown', 'itemIcon') || 'dropdown-item-icon';
            const itemTextClass = resolvePartClasses('dropdown', 'itemText') || 'dropdown-item-text';
            const badgeClass = resolvePartClasses('dropdown', 'badge') || 'dropdown-item-badge';

            const container = document.createElement('div');
            container.className = dropdownClass;
            container.setAttribute('data-ref', 'dropdown');

            const button = document.createElement('button');
            button.className = triggerClass;
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.disabled = disabled;
            button.innerHTML = `
                ${icon ? `<span class="${iconWrapperClass}">${escapeHtml(icon)}</span>` : ''}
                <span class="${labelClass}">${escapeHtml(label)}</span>
                <span class="${arrowClass}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            `;

            const menu = document.createElement('div');
            menu.className = menuClass;
            menu.setAttribute('data-ref', 'dropdown-menu');
            menu.style.display = 'none';

            const list = document.createElement('ul');
            list.className = listClass;

            items.forEach((item, index) => {
                if (item.divider) {
                    const divider = document.createElement('li');
                    divider.className = dividerClass;
                    list.appendChild(divider);
                    return;
                }

                const li = document.createElement('li');
                li.className = cn(itemClass, item.disabled ? 'disabled' : '', item.active ? 'active' : '');
                li.setAttribute('data-index', index);
                li.innerHTML = `
                    <a href="${escapeHtml(item.href || '#')}" class="${linkClass}" data-item-id="${escapeHtml(item.id || '')}">
                        ${item.icon ? `<span class="${itemIconClass}">${escapeHtml(item.icon)}</span>` : ''}
                        <span class="${itemTextClass}">${escapeHtml(item.label)}</span>
                        ${item.badge ? `<span class="${badgeClass}">${escapeHtml(item.badge)}</span>` : ''}
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

            // MEMORY LEAK FIX: Store handler references for proper cleanup
            const handlers = {
                triggerClick: null,
                triggerKeydown: null,
                documentClick: null,
                itemClicks: [],
                menuItemKeydowns: []
            };

            // Handle trigger clicks
            if (trigger) {
                handlers.triggerClick = (e) => {
                    e.stopPropagation();
                    toggle();
                };
                trigger.addEventListener('click', handlers.triggerClick);
            }

            // Handle item clicks
            const items = component.querySelectorAll('.dropdown-item:not(.disabled)');
            items.forEach(item => {
                const link = item.querySelector('.dropdown-item-link');
                if (link) {
                    const clickHandler = (e) => {
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
                    };
                    link.addEventListener('click', clickHandler);
                    handlers.itemClicks.push({ element: link, handler: clickHandler });
                }
            });

            // Close on outside click
            handlers.documentClick = (e) => {
                if (!container.contains(e.target) && isOpen) {
                    close();
                }
            };
            document.addEventListener('click', handlers.documentClick);

            // Keyboard navigation
            handlers.triggerKeydown = (e) => {
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
            };
            trigger.addEventListener('keydown', handlers.triggerKeydown);

            // Keyboard navigation in menu
            const menuItems = component.querySelectorAll('.dropdown-item-link');
            menuItems.forEach((item, index) => {
                const keydownHandler = (e) => {
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
                };
                item.addEventListener('keydown', keydownHandler);
                handlers.menuItemKeydowns.push({ element: item, handler: keydownHandler });
            });

            // MEMORY LEAK FIX: Proper cleanup with stored handler references
            return () => {
                if (trigger && handlers.triggerClick) {
                    trigger.removeEventListener('click', handlers.triggerClick);
                }
                if (trigger && handlers.triggerKeydown) {
                    trigger.removeEventListener('keydown', handlers.triggerKeydown);
                }
                handlers.itemClicks.forEach(({ element, handler }) => {
                    element.removeEventListener('click', handler);
                });
                if (handlers.documentClick) {
                    document.removeEventListener('click', handlers.documentClick);
                }
                handlers.menuItemKeydowns.forEach(({ element, handler }) => {
                    element.removeEventListener('keydown', handler);
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
