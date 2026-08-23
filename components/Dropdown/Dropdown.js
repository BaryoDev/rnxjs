import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, sanitizeUrl } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Dropdown Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Accessible dropdown menu (WAI-ARIA menu pattern) with keyboard navigation.
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

    // Resolve classes from active theme
    const dropdownClass = cn(
        resolveClasses('dropdown', { disabled }),
        className
    );
    const triggerClass = cn(resolvePartClasses('dropdown', 'toggle'), 'dropdown-trigger');
    const iconWrapperClass = resolvePartClasses('dropdown', 'icon') || 'dropdown-icon';
    const labelClass = resolvePartClasses('dropdown', 'label') || 'dropdown-label';
    const arrowClass = resolvePartClasses('dropdown', 'arrow') || 'dropdown-arrow';
    const menuClass = cn(
        resolvePartClasses('dropdown', 'menu'),
        'dropdown-menu',
        `dropdown-${position}`
    );
    const listClass = resolvePartClasses('dropdown', 'list') || 'dropdown-list';
    const dividerClass = cn(resolvePartClasses('dropdown', 'divider'), 'dropdown-divider');
    const linkClass = cn(resolvePartClasses('dropdown', 'item'), 'dropdown-item-link');
    const itemWrapperClass = resolvePartClasses('dropdown', 'itemWrapper') || 'dropdown-item-wrapper';
    const itemIconClass = resolvePartClasses('dropdown', 'itemIcon') || 'dropdown-item-icon';
    const itemTextClass = resolvePartClasses('dropdown', 'itemText') || 'dropdown-item-text';
    const badgeClass = resolvePartClasses('dropdown', 'badge') || 'dropdown-item-badge';

    const renderItem = (item, index) => {
        if (item.divider) {
            return `<li class="${dividerClass}" role="separator"></li>`;
        }

        return `
            <li class="${cn(itemWrapperClass, item.disabled ? 'disabled' : '', item.active ? 'active' : '')}" role="none" data-index="${index}">
                <a href="${escapeHtml(sanitizeUrl(item.href) || '#')}" class="${cn(linkClass, item.disabled ? 'disabled' : '', item.active ? 'active' : '')}" role="menuitem" tabindex="-1"${item.disabled ? ' aria-disabled="true"' : ''} data-item-id="${escapeHtml(item.id || '')}">
                    ${item.icon ? `<span class="${itemIconClass}" aria-hidden="true">${escapeHtml(item.icon)}</span>` : ''}
                    <span class="${itemTextClass}">${escapeHtml(item.label)}</span>
                    ${item.badge ? `<span class="${badgeClass}">${escapeHtml(item.badge)}</span>` : ''}
                </a>
            </li>
        `;
    };

    const template = () => `
        <div class="${dropdownClass}" data-ref="dropdown">
            <button type="button" class="${triggerClass}" aria-haspopup="menu" aria-expanded="false"${disabled ? ' disabled' : ''}>
                ${icon ? `<span class="${iconWrapperClass}">${escapeHtml(icon)}</span>` : ''}
                <span class="${labelClass}">${escapeHtml(label)}</span>
                <span class="${arrowClass}" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
            <div class="${menuClass}" data-ref="dropdown-menu" role="menu" style="display: none;">
                <ul class="${listClass}" role="none" style="list-style: none; margin: 0; padding: 0;">
                    ${items.map(renderItem).join('')}
                </ul>
            </div>
        </div>
    `;

    const component = createComponent(template, { label, position, disabled });

    component.useEffect((el) => {
        const trigger = el.querySelector('.dropdown-trigger');
        const container = el;

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
        const itemElements = el.querySelectorAll('.dropdown-item-wrapper:not(.disabled)');
        itemElements.forEach(item => {
            const link = item.querySelector('.dropdown-item-link');
            if (link) {
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const itemId = link.getAttribute('data-item-id');
                    const itemIndex = parseInt(item.getAttribute('data-index'));

                    // Update active state
                    el.querySelectorAll('.dropdown-item-wrapper.active').forEach(activeEl => {
                        activeEl.classList.remove('active');
                        activeEl.querySelector('.dropdown-item-link')?.classList.remove('active');
                    });
                    item.classList.add('active');
                    link.classList.add('active');

                    if (onSelect) {
                        onSelect({
                            id: itemId,
                            label: link.querySelector('.dropdown-item-text')?.textContent.trim() || '',
                            index: itemIndex
                        });
                    }

                    close();
                    if (trigger) trigger.focus();
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
        if (trigger) {
            handlers.triggerKeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    open();
                    const firstItem = el.querySelector('.dropdown-item-wrapper:not(.disabled) .dropdown-item-link');
                    if (firstItem) {
                        firstItem.focus();
                    }
                }
                if (e.key === 'Escape' && isOpen) {
                    e.preventDefault();
                    close();
                }
            };
            trigger.addEventListener('keydown', handlers.triggerKeydown);
        }

        // Keyboard navigation in menu
        const menuItems = el.querySelectorAll('.dropdown-item-wrapper:not(.disabled) .dropdown-item-link');
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
                    } else if (trigger) {
                        trigger.focus();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    close();
                    if (trigger) trigger.focus();
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
