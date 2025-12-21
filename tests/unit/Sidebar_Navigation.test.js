/**
 * Tests for Sidebar navigation and interaction
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sidebar } from '../../components/Sidebar/Sidebar.js';

describe('Sidebar Navigation', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render sidebar with menu items', (done) => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' },
            { id: 'about', label: 'About', href: '#/about' }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        setTimeout(() => {
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement).not.toBeNull();

            const menuItems = container.querySelectorAll('.sidebar-item');
            expect(menuItems.length).toBe(items.length);

            done();
        }, 50);
    });

    it('should render with nested menu items', (done) => {
        const items = [
            {
                id: 'settings',
                label: 'Settings',
                children: [
                    { id: 'profile', label: 'Profile', href: '#/settings/profile' },
                    { id: 'security', label: 'Security', href: '#/settings/security' }
                ]
            }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        setTimeout(() => {
            const parentItem = container.querySelector('.sidebar-parent');
            expect(parentItem).not.toBeNull();

            const submenu = container.querySelector('.sidebar-submenu');
            expect(submenu).not.toBeNull();

            const subItems = container.querySelectorAll('.sidebar-subitem');
            expect(subItems.length).toBe(2);

            done();
        }, 50);
    });

    it('should toggle sidebar open/closed', (done) => {
        const sidebar = Sidebar({ defaultOpen: true });
        container.appendChild(sidebar);

        setTimeout(() => {
            expect(sidebar.isOpen()).toBe(true);

            sidebar.toggle();
            expect(sidebar.isOpen()).toBe(false);

            sidebar.toggle();
            expect(sidebar.isOpen()).toBe(true);

            done();
        }, 50);
    });

    it('should hide text when sidebar is collapsed', (done) => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({
            items,
            defaultOpen: true
        });
        container.appendChild(sidebar);

        setTimeout(() => {
            const textElements = container.querySelectorAll('.sidebar-item-text');
            const initialDisplay = textElements[0]?.style.display;

            sidebar.toggle();

            setTimeout(() => {
                const textElementsAfter = container.querySelectorAll('.sidebar-item-text');
                expect(textElementsAfter[0]?.style.display).toBe('none');

                done();
            }, 50);
        }, 50);
    });

    it('should track active menu item', (done) => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' },
            { id: 'about', label: 'About', href: '#/about' }
        ];

        const sidebar = Sidebar({ items, activeItem: 'home' });
        container.appendChild(sidebar);

        setTimeout(() => {
            const activeItem = container.querySelector('.sidebar-item.active');
            expect(activeItem).not.toBeNull();

            sidebar.setActiveItem('about');

            setTimeout(() => {
                const updatedActive = container.querySelector('.sidebar-item.active');
                const aboutLink = updatedActive?.querySelector('[data-item-id="about"]');
                expect(aboutLink).not.toBeNull();

                done();
            }, 50);
        }, 50);
    });

    it('should call onItemClick callback', (done) => {
        const onItemClick = vi.fn();
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, onItemClick });
        container.appendChild(sidebar);

        setTimeout(() => {
            const itemBtn = container.querySelector('.sidebar-item-btn');
            itemBtn.click();

            setTimeout(() => {
                expect(onItemClick).toHaveBeenCalled();
                expect(onItemClick).toHaveBeenCalledWith({
                    id: 'home',
                    label: 'Home'
                });

                done();
            }, 50);
        }, 50);
    });

    it('should expand/collapse submenu', (done) => {
        const items = [
            {
                id: 'settings',
                label: 'Settings',
                children: [
                    { id: 'profile', label: 'Profile' }
                ]
            }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        setTimeout(() => {
            const submenu = container.querySelector('.sidebar-submenu');
            const initialDisplay = submenu.style.display;

            const toggleBtn = container.querySelector('.sidebar-parent-toggle button');
            toggleBtn.click();

            setTimeout(() => {
                const submenuAfter = container.querySelector('.sidebar-submenu');
                expect(submenuAfter.style.display).not.toBe(initialDisplay);

                done();
            }, 50);
        }, 50);
    });

    it('should render with dark mode', (done) => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, darkMode: true });
        container.appendChild(sidebar);

        setTimeout(() => {
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement.classList.contains('sidebar-dark')).toBe(true);

            done();
        }, 50);
    });

    it('should render with custom width', (done) => {
        const customWidth = '300px';
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, width: customWidth });
        container.appendChild(sidebar);

        setTimeout(() => {
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement.style.width).toBe(customWidth);

            done();
        }, 50);
    });

    it('should render menu items with icons', (done) => {
        const items = [
            { id: 'home', label: 'Home', icon: '🏠', href: '#/' }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        setTimeout(() => {
            const icon = container.querySelector('.sidebar-icon');
            expect(icon).not.toBeNull();
            expect(icon.textContent).toContain('🏠');

            done();
        }, 50);
    });
});
