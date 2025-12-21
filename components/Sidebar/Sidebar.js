import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

export const Sidebar = (props = {}) => {
    const {
        items = [],
        defaultOpen = true,
        variant = 'default',
        width = '250px',
        collapsedWidth = '60px',
        darkMode = false,
        onItemClick,
        activeItem = null
    } = props;

    let isOpen = defaultOpen;
    let currentActiveItem = activeItem;

    const component = createComponent({
        render() {
            const sidebar = document.createElement('div');
            sidebar.className = `sidebar sidebar-${variant} ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'} ${darkMode ? 'sidebar-dark' : ''}`;
            sidebar.setAttribute('data-ref', 'sidebar');
            sidebar.style.width = isOpen ? width : collapsedWidth;
            sidebar.style.transition = 'width 0.3s ease';

            // Header with toggle button
            const header = document.createElement('div');
            header.className = 'sidebar-header';
            header.innerHTML = `
                <div class="sidebar-brand">
                    <span class="sidebar-brand-text" style="display: ${isOpen ? 'inline' : 'none'}; transition: display 0.3s ease;">Menu</span>
                </div>
                <button class="sidebar-toggle" aria-label="Toggle sidebar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            `;

            // Navigation list
            const nav = document.createElement('nav');
            nav.className = 'sidebar-nav';

            const list = document.createElement('ul');
            list.className = 'sidebar-menu';

            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                if (item.active || item.id === currentActiveItem) {
                    li.classList.add('active');
                }

                if (item.children && item.children.length > 0) {
                    // Parent item with submenu
                    li.classList.add('sidebar-parent');
                    const toggle = document.createElement('div');
                    toggle.className = 'sidebar-parent-toggle';
                    toggle.innerHTML = `
                        <button class="sidebar-item-btn" aria-expanded="false">
                            ${item.icon ? `<span class="sidebar-icon">${escapeHtml(item.icon)}</span>` : ''}
                            <span class="sidebar-item-text" style="display: ${isOpen ? 'inline' : 'none'}; transition: display 0.3s ease;">${escapeHtml(item.label)}</span>
                            <span class="sidebar-submenu-arrow" style="display: ${isOpen ? 'inline' : 'none'}; transition: display 0.3s ease;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </button>
                    `;

                    // Submenu
                    const submenu = document.createElement('ul');
                    submenu.className = 'sidebar-submenu';
                    submenu.style.display = 'none';
                    submenu.style.maxHeight = 'none';

                    item.children.forEach(child => {
                        const subli = document.createElement('li');
                        subli.className = 'sidebar-subitem';
                        if (child.active || child.id === currentActiveItem) {
                            subli.classList.add('active');
                        }
                        subli.innerHTML = `
                            <a href="${escapeHtml(child.href || '#')}" class="sidebar-subitem-link" data-item-id="${escapeHtml(child.id || '')}">
                                ${child.icon ? `<span class="sidebar-icon">${escapeHtml(child.icon)}</span>` : ''}
                                <span class="sidebar-item-text" style="display: ${isOpen ? 'inline' : 'none'}; transition: display 0.3s ease;">${escapeHtml(child.label)}</span>
                            </a>
                        `;
                        submenu.appendChild(subli);
                    });

                    li.appendChild(toggle);
                    li.appendChild(submenu);
                } else {
                    // Regular item
                    li.innerHTML = `
                        <a href="${escapeHtml(item.href || '#')}" class="sidebar-item-btn" data-item-id="${escapeHtml(item.id || '')}">
                            ${item.icon ? `<span class="sidebar-icon">${escapeHtml(item.icon)}</span>` : ''}
                            <span class="sidebar-item-text" style="display: ${isOpen ? 'inline' : 'none'}; transition: display 0.3s ease;">${escapeHtml(item.label)}</span>
                        </a>
                    `;
                }

                list.appendChild(li);
            });

            nav.appendChild(list);

            sidebar.appendChild(header);
            sidebar.appendChild(nav);

            return sidebar;
        },

        useEffect(component) {
            const toggleBtn = component.querySelector('.sidebar-toggle');
            const sidebar = component.querySelector('[data-ref="sidebar"]');

            // Toggle sidebar
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    isOpen = !isOpen;
                    sidebar.style.width = isOpen ? width : collapsedWidth;

                    const textElements = component.querySelectorAll('.sidebar-item-text, .sidebar-submenu-arrow');
                    textElements.forEach(el => {
                        el.style.display = isOpen ? 'inline' : 'none';
                    });

                    sidebar.classList.toggle('sidebar-open');
                    sidebar.classList.toggle('sidebar-collapsed');
                });
            }

            // Handle menu item clicks
            const itemBtns = component.querySelectorAll('.sidebar-item-btn, .sidebar-subitem-link');
            itemBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const parentToggle = btn.closest('.sidebar-parent-toggle');
                    if (parentToggle) {
                        e.preventDefault();
                        const submenu = parentToggle.nextElementSibling;
                        const isExpanded = submenu.style.display === 'block';
                        submenu.style.display = isExpanded ? 'none' : 'block';
                        const arrow = parentToggle.querySelector('.sidebar-submenu-arrow');
                        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                        parentToggle.querySelector('button').setAttribute('aria-expanded', !isExpanded);
                    } else {
                        const itemId = btn.getAttribute('data-item-id');
                        currentActiveItem = itemId;

                        // Update active state
                        component.querySelectorAll('.sidebar-item.active, .sidebar-subitem.active').forEach(el => {
                            el.classList.remove('active');
                        });

                        const activeElement = component.querySelector(`[data-item-id="${itemId}"]`).closest('.sidebar-item, .sidebar-subitem');
                        if (activeElement) {
                            activeElement.classList.add('active');
                        }

                        if (onItemClick) {
                            onItemClick({
                                id: itemId,
                                label: btn.querySelector('.sidebar-item-text')?.textContent || ''
                            });
                        }
                    }
                });
            });

            return () => {
                // Cleanup
                itemBtns.forEach(btn => {
                    btn.removeEventListener('click', null);
                });
                if (toggleBtn) {
                    toggleBtn.removeEventListener('click', null);
                }
            };
        }
    });

    component.toggle = () => {
        isOpen = !isOpen;
        const sidebar = component.querySelector('[data-ref="sidebar"]');
        if (sidebar) {
            sidebar.style.width = isOpen ? width : collapsedWidth;
            const textElements = component.querySelectorAll('.sidebar-item-text, .sidebar-submenu-arrow');
            textElements.forEach(el => {
                el.style.display = isOpen ? 'inline' : 'none';
            });
        }
    };

    component.isOpen = () => isOpen;

    component.setActiveItem = (itemId) => {
        currentActiveItem = itemId;
        component.querySelectorAll('.sidebar-item.active, .sidebar-subitem.active').forEach(el => {
            el.classList.remove('active');
        });
        const activeElement = component.querySelector(`[data-item-id="${itemId}"]`)?.closest('.sidebar-item, .sidebar-subitem');
        if (activeElement) {
            activeElement.classList.add('active');
        }
    };

    return component;
};
