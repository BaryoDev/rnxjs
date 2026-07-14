import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let sidebarUid = 0;

/**
 * Sidebar Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Collapsible sidebar navigation with nested menu support.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.items=[]] - Menu items [{label, icon, href, id, active, children}]
 * @param {boolean} [props.defaultOpen=true] - Initially open state
 * @param {string} [props.variant='default'] - Sidebar variant
 * @param {string} [props.width='250px'] - Expanded width
 * @param {string} [props.collapsedWidth='60px'] - Collapsed width
 * @param {boolean} [props.darkMode=false] - Enable dark mode styling
 * @param {Function} [props.onItemClick] - Called when item is clicked
 * @param {string|null} [props.activeItem=null] - Currently active item ID
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Sidebar element
 *
 * @example
 * <Sidebar
 *   items={[
 *     { label: 'Dashboard', icon: '📊', href: '/dashboard', id: 'dash' },
 *     { label: 'Settings', icon: '⚙️', href: '/settings', id: 'settings' }
 *   ]}
 *   onItemClick={(item) => console.log(item.id)}
 * />
 */
export const Sidebar = (props = {}) => {
    const {
        items = [],
        defaultOpen = true,
        variant = 'default',
        width = '250px',
        collapsedWidth = '60px',
        darkMode = false,
        onItemClick,
        activeItem = null,
        className = ''
    } = props;

    let isOpen = defaultOpen;
    let currentActiveItem = activeItem;
    const navId = `rnx-sidebar-nav-${++sidebarUid}`;

    const template = () => {
        // Resolve classes from active theme
        const sidebarClass = cn(
            resolveClasses('sidebar', { variant }),
            'sidebar',
            isOpen ? 'sidebar-open' : 'sidebar-collapsed',
            darkMode ? 'sidebar-dark' : '',
            className
        );
        const headerClass = cn(resolvePartClasses('sidebar', 'header'), 'sidebar-header');
        const brandClass = cn(resolvePartClasses('sidebar', 'brand'), 'sidebar-brand');
        const toggleClass = cn(resolvePartClasses('sidebar', 'toggle'), 'sidebar-toggle');
        const navClass = cn(resolvePartClasses('sidebar', 'nav'), 'sidebar-nav');
        const menuClass = cn(resolvePartClasses('sidebar', 'menu'), 'sidebar-menu');
        const itemClass = cn(resolvePartClasses('sidebar', 'item'), 'sidebar-item');
        const linkClass = cn(resolvePartClasses('sidebar', 'link'), 'sidebar-item-btn');
        const iconClass = cn(resolvePartClasses('sidebar', 'icon'), 'sidebar-icon');
        const itemTextClass = cn(resolvePartClasses('sidebar', 'itemText'), 'sidebar-item-text');
        const parentClass = cn(resolvePartClasses('sidebar', 'parent'), 'sidebar-parent');
        const submenuClass = cn(resolvePartClasses('sidebar', 'submenu'), 'sidebar-submenu');
        const subitemClass = cn(resolvePartClasses('sidebar', 'subitem'), 'sidebar-subitem');
        const subitemLinkClass = cn(resolvePartClasses('sidebar', 'link'), 'sidebar-subitem-link');
        const arrowClass = cn(resolvePartClasses('sidebar', 'arrow'), 'sidebar-submenu-arrow');

        const textStyle = `display: ${isOpen ? 'inline' : 'none'};`;

        const renderIcon = (icon) => icon
            ? `<span class="${iconClass}" aria-hidden="true">${escapeHtml(icon)}</span>`
            : '';

        const renderItem = (item, index) => {
            const isActive = item.active || (item.id && item.id === currentActiveItem);

            if (item.children && item.children.length > 0) {
                const submenuId = `${navId}-sub-${index}`;
                return `
                    <li class="${cn(itemClass, parentClass, isActive ? 'active' : '')}">
                        <div class="sidebar-parent-toggle">
                            <button type="button" class="${linkClass}" aria-expanded="false" aria-controls="${submenuId}">
                                ${renderIcon(item.icon)}
                                <span class="${itemTextClass}" style="${textStyle}">${escapeHtml(item.label)}</span>
                                <span class="${arrowClass}" style="${textStyle}" aria-hidden="true">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <ul id="${submenuId}" class="${submenuClass}" style="display: none; max-height: none;">
                            ${item.children.map(child => {
                                const childActive = child.active || (child.id && child.id === currentActiveItem);
                                return `
                                    <li class="${cn(subitemClass, childActive ? 'active' : '')}">
                                        <a href="${escapeHtml(child.href || '#')}" class="${subitemLinkClass}" data-item-id="${escapeHtml(child.id || '')}"${childActive ? ' aria-current="page"' : ''}>
                                            ${renderIcon(child.icon)}
                                            <span class="${itemTextClass}" style="${textStyle}">${escapeHtml(child.label)}</span>
                                        </a>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </li>
                `;
            }

            return `
                <li class="${cn(itemClass, isActive ? 'active' : '')}">
                    <a href="${escapeHtml(item.href || '#')}" class="${linkClass}" data-item-id="${escapeHtml(item.id || '')}"${isActive ? ' aria-current="page"' : ''}>
                        ${renderIcon(item.icon)}
                        <span class="${itemTextClass}" style="${textStyle}">${escapeHtml(item.label)}</span>
                    </a>
                </li>
            `;
        };

        return `
            <div class="${sidebarClass}" data-ref="sidebar" style="width: ${escapeHtml(isOpen ? width : collapsedWidth)}; transition: width 0.3s ease;">
                <div class="${headerClass}">
                    <div class="${brandClass}">
                        <span class="sidebar-brand-text" style="${textStyle}">Menu</span>
                    </div>
                    <button type="button" class="${toggleClass}" aria-label="Toggle sidebar" aria-expanded="${isOpen}" aria-controls="${navId}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <nav id="${navId}" class="${navClass}" aria-label="Sidebar">
                    <ul class="${menuClass}">
                        ${items.map((item, index) => renderItem(item, index)).join('')}
                    </ul>
                </nav>
            </div>
        `;
    };

    const component = createComponent(template, { items, activeItem, className });

    const setOpenState = (open) => {
        isOpen = open;
        const sidebar = component.refs?.sidebar || component.querySelector('[data-ref="sidebar"]') || component;
        sidebar.style.width = isOpen ? width : collapsedWidth;

        const textElements = component.querySelectorAll('.sidebar-item-text, .sidebar-submenu-arrow, .sidebar-brand-text');
        textElements.forEach(el => {
            el.style.display = isOpen ? 'inline' : 'none';
        });

        sidebar.classList.toggle('sidebar-open', isOpen);
        sidebar.classList.toggle('sidebar-collapsed', !isOpen);

        const toggleBtn = component.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        }
    };

    const applyActiveItem = (itemId) => {
        currentActiveItem = itemId;
        component.querySelectorAll('.sidebar-item.active, .sidebar-subitem.active').forEach(el => {
            el.classList.remove('active');
        });
        component.querySelectorAll('[aria-current="page"]').forEach(el => {
            el.removeAttribute('aria-current');
        });
        const activeLink = component.querySelector(`[data-item-id="${itemId}"]`);
        if (activeLink) {
            activeLink.setAttribute('aria-current', 'page');
            const activeElement = activeLink.closest('.sidebar-item, .sidebar-subitem');
            if (activeElement) {
                activeElement.classList.add('active');
            }
        }
    };

    component.useEffect(() => {
        // MEMORY LEAK FIX: Store handler references for proper cleanup
        const handlers = {
            toggleClick: null,
            itemClicks: []
        };

        const toggleBtn = component.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            handlers.toggleClick = () => setOpenState(!isOpen);
            toggleBtn.addEventListener('click', handlers.toggleClick);
        }

        const itemBtns = component.querySelectorAll('.sidebar-item-btn, .sidebar-subitem-link');
        itemBtns.forEach(btn => {
            const clickHandler = (e) => {
                const parentToggle = btn.closest('.sidebar-parent-toggle');
                if (parentToggle) {
                    e.preventDefault();
                    const submenu = parentToggle.nextElementSibling;
                    const isExpanded = submenu.style.display === 'block';
                    submenu.style.display = isExpanded ? 'none' : 'block';
                    const arrow = parentToggle.querySelector('.sidebar-submenu-arrow');
                    if (arrow) {
                        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                    btn.setAttribute('aria-expanded', String(!isExpanded));
                } else {
                    const itemId = btn.getAttribute('data-item-id');
                    applyActiveItem(itemId);

                    if (onItemClick) {
                        onItemClick({
                            id: itemId,
                            label: btn.querySelector('.sidebar-item-text')?.textContent || ''
                        });
                    }
                }
            };
            btn.addEventListener('click', clickHandler);
            handlers.itemClicks.push({ element: btn, handler: clickHandler });
        });

        // MEMORY LEAK FIX: Proper cleanup with stored handler references
        return () => {
            handlers.itemClicks.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
            if (toggleBtn && handlers.toggleClick) {
                toggleBtn.removeEventListener('click', handlers.toggleClick);
            }
        };
    });

    component.toggle = () => setOpenState(!isOpen);

    component.isOpen = () => isOpen;

    component.setActiveItem = (itemId) => applyActiveItem(itemId);

    return component;
};
