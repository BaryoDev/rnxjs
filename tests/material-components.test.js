
import { describe, it, expect, vi } from 'vitest';
import { FAB } from '../components/FAB/FAB.js';
import { Switch } from '../components/Switch/Switch.js';
import { Chips } from '../components/Chips/Chips.js';
import { NavigationDrawer } from '../components/NavigationDrawer/NavigationDrawer.js';

describe('Material M3 Components', () => {

    describe('FAB Component', () => {
        it('renders with correct icon and classes', () => {
            const fab = FAB({ icon: 'add', variant: 'large' });
            document.body.appendChild(fab);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        expect(fab.querySelector('.material-symbols-outlined').textContent).toBe('add');
                        expect(fab.className).toContain('m3-fab large');
                        fab.remove();
                        resolve();
                    } catch (e) { reject(e); }
                }, 0);
            });
        });

        it('handles clicks', () => {
            const handler = vi.fn();
            const fab = FAB({ onclick: handler });
            document.body.appendChild(fab);

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        fab.dispatchEvent(new Event('click'));
                        expect(handler).toHaveBeenCalled();
                        fab.remove();
                        resolve();
                    } catch (e) { reject(e); }
                }, 0);
            });
        });
    });

    describe('Switch Component', () => {
        it('renders checked state correctly', () => {
            const sw = Switch({ checked: true, label: 'Toggle Me' });
            document.body.appendChild(sw);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const input = sw.querySelector('input');
                        expect(input.checked).toBe(true);
                        expect(sw.innerHTML).toContain('Toggle Me');
                        sw.remove();
                        resolve();
                    } catch (e) { reject(e); }
                }, 0);
            });
        });

        it('emits onchange event', () => {
            const handler = vi.fn();
            const sw = Switch({ onchange: handler });
            document.body.appendChild(sw);

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const input = sw.querySelector('input');
                        input.checked = true;
                        input.dispatchEvent(new Event('change'));
                        expect(handler).toHaveBeenCalledWith(true);
                        sw.remove();
                        resolve();
                    } catch (e) { reject(e); }
                }, 0);
            });
        });
    });

    describe('Chips Component', () => {
        it('renders multiple items correctly', () => {
            const items = [{ label: 'One' }, { label: 'Two', selected: true }];
            const chips = Chips({ items });
            document.body.appendChild(chips);

            return new Promise(resolve => {
                setTimeout(() => {
                    const chipEls = chips.querySelectorAll('.m3-chip');
                    expect(chipEls.length).toBe(2);
                    expect(chipEls[1].classList.contains('selected')).toBe(true);
                    chips.remove();
                    resolve();
                }, 0);
            });
        });
    });

    describe('NavigationDrawer Component', () => {
        it('toggles open class based on prop', () => {
            const drawer = NavigationDrawer({ isOpen: true, links: [] });
            document.body.appendChild(drawer);
            return new Promise(resolve => {
                setTimeout(() => {
                    expect(drawer.querySelector('.m3-navigation-drawer').classList.contains('open')).toBe(true);
                    drawer.remove();
                    resolve();
                }, 0);
            });
        });
    });
});
