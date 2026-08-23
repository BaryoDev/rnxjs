/**
 * Tests for Dropdown interaction and state
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Dropdown } from '../../components/Dropdown/Dropdown.js';

describe('Dropdown Interaction', () => {
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

    it('should render dropdown trigger button', async () => {
        const dropdown = Dropdown({
            label: 'Actions'
        });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            expect(trigger).not.toBeNull();
            expect(trigger.textContent).toContain('Actions');
    });

    it('should render menu items', async () => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const menuItems = container.querySelectorAll('.dropdown-item');
            expect(menuItems.length).toBe(items.length);
    });

    it('should open dropdown on trigger click', async () => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(dropdown.isOpen()).toBe(true);
                const menu = container.querySelector('.dropdown-menu');
                expect(menu.style.display).toBe('block');
    });

    it('should close dropdown on second click', async () => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                trigger.click();

                expect(dropdown.isOpen()).toBe(false);
    });

    it('should call onSelect when item is clicked', async () => {
        const onSelect = vi.fn();
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items, onSelect });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const firstItem = container.querySelector('.dropdown-item-link');
                firstItem.click();

                expect(onSelect).toHaveBeenCalled();
                expect(onSelect).toHaveBeenCalledWith({
                    id: 'edit',
                    label: 'Edit',
                    index: 0
                });
    });

    it('should close dropdown after selecting item', async () => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const item = container.querySelector('.dropdown-item-link');
                item.click();

                expect(dropdown.isOpen()).toBe(false);
    });

    it('should mark selected item as active', async () => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                // .dropdown-item is the anchor itself, matching Bootstrap's markup
                const secondItem = container.querySelectorAll('.dropdown-item')[1];
                secondItem.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                    const activeItem = container.querySelector('.dropdown-item.active');
                    expect(activeItem).toBe(secondItem);
    });

    it('should render items with icons', async () => {
        const items = [
            { id: 'edit', label: 'Edit', icon: '✏️' },
            { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const icons = container.querySelectorAll('.dropdown-item-icon');
            expect(icons.length).toBe(2);
            expect(icons[0].textContent).toContain('✏️');
    });

    it('should render items with badges', async () => {
        const items = [
            { id: 'notifications', label: 'Notifications', badge: '5' },
            { id: 'messages', label: 'Messages', badge: '3' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const badges = container.querySelectorAll('.dropdown-item-badge');
            expect(badges.length).toBe(2);
            expect(badges[0].textContent).toContain('5');
    });

    it('should render dividers between items', async () => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { divider: true },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const divider = container.querySelector('.dropdown-divider');
            expect(divider).not.toBeNull();
    });

    it('should disable specific items', async () => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete', disabled: true }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const disabledItem = container.querySelectorAll('.dropdown-item')[1];
            expect(disabledItem.classList.contains('disabled')).toBe(true);
    });

    it('should not trigger callback for disabled items', async () => {
        const onSelect = vi.fn();
        const items = [
            { id: 'edit', label: 'Edit', disabled: true }
        ];

        const dropdown = Dropdown({ items, onSelect });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const disabledItem = container.querySelector('.dropdown-item-link');
                if (disabledItem) {
                    disabledItem.click();
                }

                expect(onSelect).not.toHaveBeenCalled();
    });

    it('should support different positions', async () => {
        const positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
        let completed = 0;

        for (const position of positions) {
            const div = document.createElement('div');
            container.appendChild(div);

            const dropdown = Dropdown({
                items: [{ id: 'test', label: 'Test' }],
                position: position
            });
            div.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
                const menu = div.querySelector('.dropdown-menu');
                expect(menu.classList.contains(`dropdown-${position}`)).toBe(true);

                completed++;
                if (completed === positions.length) {
                }

        }
    });

    it('should handle keyboard navigation', async () => {
        const items = [
            { id: 'item1', label: 'Item 1' },
            { id: 'item2', label: 'Item 2' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');

            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            });
            trigger.dispatchEvent(enterEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(dropdown.isOpen()).toBe(true);
    });

    it('should close dropdown on outside click', async () => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const outsideElement = document.createElement('div');
                document.body.appendChild(outsideElement);

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });
                outsideElement.dispatchEvent(clickEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
                    expect(dropdown.isOpen()).toBe(false);

                    document.body.removeChild(outsideElement);
    });

    it('should toggle dropdown programmatically', async () => {
        const dropdown = Dropdown({
            items: [{ id: 'test', label: 'Test' }]
        });
        container.appendChild(dropdown);

        await new Promise(resolve => setTimeout(resolve, 50));
            dropdown.toggle();
            expect(dropdown.isOpen()).toBe(true);

            dropdown.toggle();
            expect(dropdown.isOpen()).toBe(false);
    });
});
