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

    it('should render dropdown trigger button', (done) => {
        const dropdown = Dropdown({
            label: 'Actions'
        });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            expect(trigger).not.toBeNull();
            expect(trigger.textContent).toContain('Actions');

            done();
        }, 50);
    });

    it('should render menu items', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const menuItems = container.querySelectorAll('.dropdown-item');
            expect(menuItems.length).toBe(items.length);

            done();
        }, 50);
    });

    it('should open dropdown on trigger click', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                expect(dropdown.isOpen()).toBe(true);
                const menu = container.querySelector('.dropdown-menu');
                expect(menu.style.display).toBe('block');

                done();
            }, 50);
        }, 50);
    });

    it('should close dropdown on second click', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                trigger.click();

                expect(dropdown.isOpen()).toBe(false);

                done();
            }, 50);
        }, 50);
    });

    it('should call onSelect when item is clicked', (done) => {
        const onSelect = vi.fn();
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items, onSelect });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                const firstItem = container.querySelector('.dropdown-item-link');
                firstItem.click();

                expect(onSelect).toHaveBeenCalled();
                expect(onSelect).toHaveBeenCalledWith({
                    id: 'edit',
                    label: 'Edit',
                    index: 0
                });

                done();
            }, 50);
        }, 50);
    });

    it('should close dropdown after selecting item', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                const item = container.querySelector('.dropdown-item-link');
                item.click();

                expect(dropdown.isOpen()).toBe(false);

                done();
            }, 50);
        }, 50);
    });

    it('should mark selected item as active', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                const secondItem = container.querySelectorAll('.dropdown-item')[1];
                secondItem.querySelector('a').click();

                setTimeout(() => {
                    const activeItem = container.querySelector('.dropdown-item.active');
                    expect(activeItem).toBe(secondItem);

                    done();
                }, 50);
            }, 50);
        }, 50);
    });

    it('should render items with icons', (done) => {
        const items = [
            { id: 'edit', label: 'Edit', icon: '✏️' },
            { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const icons = container.querySelectorAll('.dropdown-item-icon');
            expect(icons.length).toBe(2);
            expect(icons[0].textContent).toContain('✏️');

            done();
        }, 50);
    });

    it('should render items with badges', (done) => {
        const items = [
            { id: 'notifications', label: 'Notifications', badge: '5' },
            { id: 'messages', label: 'Messages', badge: '3' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const badges = container.querySelectorAll('.dropdown-item-badge');
            expect(badges.length).toBe(2);
            expect(badges[0].textContent).toContain('5');

            done();
        }, 50);
    });

    it('should render dividers between items', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { divider: true },
            { id: 'delete', label: 'Delete' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const divider = container.querySelector('.dropdown-divider');
            expect(divider).not.toBeNull();

            done();
        }, 50);
    });

    it('should disable specific items', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete', disabled: true }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const disabledItem = container.querySelectorAll('.dropdown-item')[1];
            expect(disabledItem.classList.contains('disabled')).toBe(true);

            done();
        }, 50);
    });

    it('should not trigger callback for disabled items', (done) => {
        const onSelect = vi.fn();
        const items = [
            { id: 'edit', label: 'Edit', disabled: true }
        ];

        const dropdown = Dropdown({ items, onSelect });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                const disabledItem = container.querySelector('.dropdown-item-link');
                if (disabledItem) {
                    disabledItem.click();
                }

                expect(onSelect).not.toHaveBeenCalled();

                done();
            }, 50);
        }, 50);
    });

    it('should support different positions', (done) => {
        const positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
        let completed = 0;

        positions.forEach((position) => {
            const div = document.createElement('div');
            container.appendChild(div);

            const dropdown = Dropdown({
                items: [{ id: 'test', label: 'Test' }],
                position: position
            });
            div.appendChild(dropdown);

            setTimeout(() => {
                const menu = div.querySelector('.dropdown-menu');
                expect(menu.classList.contains(`dropdown-${position}`)).toBe(true);

                completed++;
                if (completed === positions.length) {
                    done();
                }
            }, 50);
        });
    });

    it('should handle keyboard navigation', (done) => {
        const items = [
            { id: 'item1', label: 'Item 1' },
            { id: 'item2', label: 'Item 2' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');

            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            });
            trigger.dispatchEvent(enterEvent);

            setTimeout(() => {
                expect(dropdown.isOpen()).toBe(true);

                done();
            }, 50);
        }, 50);
    });

    it('should close dropdown on outside click', (done) => {
        const items = [
            { id: 'edit', label: 'Edit' }
        ];

        const dropdown = Dropdown({ items });
        container.appendChild(dropdown);

        setTimeout(() => {
            const trigger = container.querySelector('.dropdown-trigger');
            trigger.click();

            setTimeout(() => {
                const outsideElement = document.createElement('div');
                document.body.appendChild(outsideElement);

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });
                outsideElement.dispatchEvent(clickEvent);

                setTimeout(() => {
                    expect(dropdown.isOpen()).toBe(false);

                    document.body.removeChild(outsideElement);
                    done();
                }, 50);
            }, 50);
        }, 50);
    });

    it('should toggle dropdown programmatically', (done) => {
        const dropdown = Dropdown({
            items: [{ id: 'test', label: 'Test' }]
        });
        container.appendChild(dropdown);

        setTimeout(() => {
            dropdown.toggle();
            expect(dropdown.isOpen()).toBe(true);

            dropdown.toggle();
            expect(dropdown.isOpen()).toBe(false);

            done();
        }, 50);
    });
});
