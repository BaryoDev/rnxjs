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

    it('should render sidebar with menu items', async () => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' },
            { id: 'about', label: 'About', href: '#/about' }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement).not.toBeNull();

            const menuItems = container.querySelectorAll('.sidebar-item');
            expect(menuItems.length).toBe(items.length);
    });

    it('should render with nested menu items', async () => {
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

        await new Promise(resolve => setTimeout(resolve, 50));
            const parentItem = container.querySelector('.sidebar-parent');
            expect(parentItem).not.toBeNull();

            const submenu = container.querySelector('.sidebar-submenu');
            expect(submenu).not.toBeNull();

            const subItems = container.querySelectorAll('.sidebar-subitem');
            expect(subItems.length).toBe(2);
    });

    it('should toggle sidebar open/closed', async () => {
        const sidebar = Sidebar({ defaultOpen: true });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(sidebar.isOpen()).toBe(true);

            sidebar.toggle();
            expect(sidebar.isOpen()).toBe(false);

            sidebar.toggle();
            expect(sidebar.isOpen()).toBe(true);
    });

    it('should hide text when sidebar is collapsed', async () => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({
            items,
            defaultOpen: true
        });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const textElements = container.querySelectorAll('.sidebar-item-text');
            const initialDisplay = textElements[0]?.style.display;

            sidebar.toggle();

        await new Promise(resolve => setTimeout(resolve, 50));
                const textElementsAfter = container.querySelectorAll('.sidebar-item-text');
                expect(textElementsAfter[0]?.style.display).toBe('none');
    });

    it('should track active menu item', async () => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' },
            { id: 'about', label: 'About', href: '#/about' }
        ];

        const sidebar = Sidebar({ items, activeItem: 'home' });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const activeItem = container.querySelector('.sidebar-item.active');
            expect(activeItem).not.toBeNull();

            sidebar.setActiveItem('about');

        await new Promise(resolve => setTimeout(resolve, 50));
                const updatedActive = container.querySelector('.sidebar-item.active');
                const aboutLink = updatedActive?.querySelector('[data-item-id="about"]');
                expect(aboutLink).not.toBeNull();
    });

    it('should call onItemClick callback', async () => {
        const onItemClick = vi.fn();
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, onItemClick });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const itemBtn = container.querySelector('.sidebar-item-btn');
            itemBtn.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(onItemClick).toHaveBeenCalled();
                expect(onItemClick).toHaveBeenCalledWith({
                    id: 'home',
                    label: 'Home'
                });
    });

    it('should expand/collapse submenu', async () => {
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

        await new Promise(resolve => setTimeout(resolve, 50));
            const submenu = container.querySelector('.sidebar-submenu');
            const initialDisplay = submenu.style.display;

            const toggleBtn = container.querySelector('.sidebar-parent-toggle button');
            toggleBtn.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const submenuAfter = container.querySelector('.sidebar-submenu');
                expect(submenuAfter.style.display).not.toBe(initialDisplay);
    });

    it('should render with dark mode', async () => {
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, darkMode: true });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement.classList.contains('sidebar-dark')).toBe(true);
    });

    it('should render with custom width', async () => {
        const customWidth = '300px';
        const items = [
            { id: 'home', label: 'Home', href: '#/' }
        ];

        const sidebar = Sidebar({ items, width: customWidth });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const sidebarElement = container.querySelector('.sidebar');
            expect(sidebarElement.style.width).toBe(customWidth);
    });

    it('should render menu items with icons', async () => {
        const items = [
            { id: 'home', label: 'Home', icon: '🏠', href: '#/' }
        ];

        const sidebar = Sidebar({ items });
        container.appendChild(sidebar);

        await new Promise(resolve => setTimeout(resolve, 50));
            const icon = container.querySelector('.sidebar-icon');
            expect(icon).not.toBeNull();
            expect(icon.textContent).toContain('🏠');
    });
});