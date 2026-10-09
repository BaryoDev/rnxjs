/**
 * Bootstrap theme defects found in a real browser with css/rnx.css linked.
 * Markup fixes are checked on rendered components, pure CSS fixes on the
 * stylesheet text.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { themeProvider } from '../utils/ThemeProvider.js';
import { Toast } from '../components/Toast/Toast.js';
import { NavigationDrawer } from '../components/NavigationDrawer/NavigationDrawer.js';
import { Sidebar } from '../components/Sidebar/Sidebar.js';
import { TopAppBar } from '../components/TopAppBar/TopAppBar.js';
import { Breadcrumb } from '../components/Breadcrumb/Breadcrumb.js';
import { Dropdown } from '../components/Dropdown/Dropdown.js';
import { FileUpload } from '../components/FileUpload/FileUpload.js';
import { Stepper } from '../components/Stepper/Stepper.js';
import { Card } from '../components/Card/Card.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = readFileSync(join(process.cwd(), 'css/rnx.css'), 'utf8');

// True when some rule with exactly this selector declares the text.
const hasRule = (selector, declaration) => {
    const needle = selector + ' {';
    let i = css.indexOf(needle);
    while (i >= 0) {
        const line = css.lastIndexOf('\n', i) + 1;
        if (css.slice(line, i).trim() === '') {
            const body = css.slice(i, css.indexOf('}', i));
            if (body.includes(declaration)) return true;
        }
        i = css.indexOf(needle, i + 1);
    }
    return false;
};

const mount = async (el) => {
    const c = document.createElement('div');
    document.body.appendChild(c);
    c.appendChild(el);
    await wait(30);
    return c;
};

beforeEach(() => {
    document.body.innerHTML = '';
    themeProvider.setTheme('bootstrap');
});

describe('Toast', () => {
    it('emits data-bs-autohide=false when autohide is false', async () => {
        const c = await mount(Toast({ header: 'a', body: 'b', autohide: false }));
        expect(c.querySelector('.toast').getAttribute('data-bs-autohide')).toBe('false');
    });

    it('emits data-bs-autohide=true by default and keeps the delay', async () => {
        const c = await mount(Toast({ header: 'a', body: 'b', delay: 1234 }));
        const t = c.querySelector('.toast');
        expect(t.getAttribute('data-bs-autohide')).toBe('true');
        expect(t.getAttribute('data-bs-delay')).toBe('1234');
    });
});

describe('NavigationDrawer', () => {
    it('gets the show class when open', async () => {
        const c = await mount(NavigationDrawer({ isOpen: true, links: [{ label: 'a' }] }));
        expect(c.querySelector('.offcanvas').classList.contains('show')).toBe(true);
    });

    it('has no show class when closed', async () => {
        const c = await mount(NavigationDrawer({ isOpen: false, links: [{ label: 'a' }] }));
        expect(c.querySelector('.offcanvas').classList.contains('show')).toBe(false);
    });

    it('styles its links in rnx.css', () => {
        expect(hasRule('.offcanvas .m3-drawer-link', 'text-decoration: none')).toBe(true);
    });
});

describe('Sidebar', () => {
    const items = [{ id: 'a', label: 'A', href: '#', children: [{ id: 'b', label: 'B' }] }];

    it('drops list bullets and styles the toggle and header', async () => {
        const c = await mount(Sidebar({ items }));
        expect(c.querySelector('.sidebar-menu').classList.contains('list-unstyled')).toBe(true);
        expect(c.querySelector('.sidebar-submenu').classList.contains('list-unstyled')).toBe(true);
        expect(c.querySelector('.sidebar-toggle').classList.contains('btn')).toBe(true);
        expect(c.querySelector('.sidebar-header').classList.contains('d-flex')).toBe(true);
    });

    it('has an rnx-sidebar rule', () => {
        expect(hasRule('.rnx-sidebar', 'background: var(--rnx-surface)')).toBe(true);
    });
});

describe('TopAppBar', () => {
    it('does not hardcode a light navbar', async () => {
        const c = await mount(TopAppBar({ title: 't' }));
        const cls = c.querySelector('.navbar').className;
        expect(cls).not.toContain('navbar-light');
        expect(cls).not.toContain('bg-light');
        expect(cls).toContain('rnx-topappbar');
    });

    it('reads tokens for background and text', () => {
        expect(hasRule('.rnx-topappbar', 'background: var(--rnx-surface)')).toBe(true);
        expect(hasRule('.rnx-topappbar', 'color: var(--rnx-text-primary)')).toBe(true);
    });
});

describe('filled Card', () => {
    it('does not use bg-light', async () => {
        const c = await mount(Card({ variant: 'filled', title: 't' }));
        expect(c.querySelector('.card').className).not.toContain('bg-light');
        expect(hasRule('.rnx-card-filled', '--bs-card-bg: var(--rnx-surface-variant)')).toBe(true);
    });
});

describe('Breadcrumb', () => {
    it('spaces its separators', async () => {
        const c = await mount(Breadcrumb({ items: [{ label: 'A', href: '#' }, { label: 'B', active: true }] }));
        expect(c.querySelector('.breadcrumb-separator').classList.contains('rnx-breadcrumb-separator')).toBe(true);
        expect(hasRule('.rnx-breadcrumb-separator', 'padding: 0 0.5rem')).toBe(true);
    });
});

describe('Dropdown', () => {
    it('renders the trigger as a button, not a native one', async () => {
        const c = await mount(Dropdown({ label: 'Go', items: [{ label: 'x' }] }));
        expect(c.querySelector('.dropdown-trigger').classList.contains('btn')).toBe(true);
        expect(hasRule('.btn.dropdown-trigger::after', 'display: none')).toBe(true);
    });
});

describe('FileUpload', () => {
    it('marks the zone and styles the zone and button', async () => {
        const c = await mount(FileUpload({ label: 'f' }));
        expect(c.querySelector('.file-upload').classList.contains('rnx-file-upload')).toBe(true);
        expect(hasRule('.rnx-file-upload', 'border: 2px dashed var(--rnx-border-color)')).toBe(true);
        expect(hasRule('.rnx-file-upload .file-upload-button', 'cursor: pointer')).toBe(true);
    });
});

describe('Stepper', () => {
    it('marks the stepper and lays out steps in rnx.css', async () => {
        const c = await mount(Stepper({ steps: [{ title: 'a' }, { title: 'b' }], currentStep: 0 }));
        expect(c.querySelector('.stepper').classList.contains('rnx-stepper')).toBe(true);
        expect(hasRule('.rnx-stepper .stepper-connector', 'height: 2px')).toBe(true);
        expect(hasRule('.rnx-stepper .stepper-step-indicator.completed', 'background: var(--rnx-primary)')).toBe(true);
    });
});

describe('brand colour', () => {
    it('points Bootstrap primary at --rnx-primary', () => {
        expect(hasRule(':root', '--bs-primary-rgb: var(--rnx-primary-rgb)')).toBe(true);
    });

    it('colours the slider thumb from the token', () => {
        expect(hasRule('.form-range::-webkit-slider-thumb', 'var(--rnx-primary)')).toBe(true);
        expect(hasRule('.form-range::-moz-range-thumb', 'var(--rnx-primary)')).toBe(true);
    });
});
