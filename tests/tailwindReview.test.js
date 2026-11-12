/**
 * Review follow-ups for the Tailwind component fixes.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { themeProvider } from '../utils/ThemeProvider.js';
import { Modal } from '../components/Modal/Modal.js';
import { Stepper } from '../components/Stepper/Stepper.js';
import { ProgressBar } from '../components/ProgressBar/ProgressBar.js';
import { Tooltip } from '../components/Tooltip/Tooltip.js';
import { Input } from '../components/Input/Input.js';
import { Skeleton } from '../components/Skeleton/Skeleton.js';

const wait = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));
const mount = async (el) => {
    document.body.appendChild(el);
    await wait();
    return el;
};
const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

beforeEach(() => {
    delete window.bootstrap;
    themeProvider.setTheme('tailwind');
});

afterEach(() => {
    themeProvider.setTheme('bootstrap');
    document.body.innerHTML = '';
    document.body.style.overflow = '';
});

describe('ProgressBar unknown variant', () => {
    it('falls back to the primary fill', async () => {
        const el = await mount(ProgressBar({ value: 40, variant: 'bogus' }));
        const primary = themeProvider.resolveUtility('background', 'primary');
        expect(primary).toContain('var(--rnx-');
        expect(el.querySelector('.progress-bar').className).toContain(primary);
    });
});

describe('stacked modals', () => {
    it('Escape closes only the topmost modal', async () => {
        const a = await mount(Modal({ title: 'A', children: [document.createElement('p')] }));
        const b = await mount(Modal({ title: 'B' }));
        a.show();
        b.show();
        let aHidden = 0;
        let bHidden = 0;
        a.addEventListener('hidden.bs.modal', () => aHidden++);
        b.addEventListener('hidden.bs.modal', () => bHidden++);
        escape();
        expect(bHidden).toBe(1);
        expect(aHidden).toBe(0);
        expect(a.classList.contains('hidden')).toBe(false);
        escape();
        expect(aHidden).toBe(1);
    });

    it('does not take a trigger from inside another open modal', async () => {
        const inner = document.createElement('button');
        const a = await mount(Modal({ title: 'A', children: [inner] }));
        const b = await mount(Modal({ title: 'B' }));
        a.show();
        inner.focus();
        b.show();
        b.hide();
        expect(document.activeElement).toBe(a);
    });
});

describe('modal removed without destroy', () => {
    it('ignores Escape and releases the scroll lock', async () => {
        const modal = await mount(Modal({ title: 'T' }));
        modal.show();
        let hidden = 0;
        modal.addEventListener('hidden.bs.modal', () => hidden++);
        modal.remove();
        escape();
        expect(hidden).toBe(0);
        expect(document.body.style.overflow).toBe('');
    });
});

describe('modal scroll lock', () => {
    it('locks body while any modal is open and restores the previous value', async () => {
        document.body.style.overflow = 'scroll';
        const a = await mount(Modal({ title: 'A' }));
        const b = await mount(Modal({ title: 'B' }));
        a.show();
        b.show();
        expect(document.body.style.overflow).toBe('hidden');
        b.hide();
        expect(document.body.style.overflow).toBe('hidden');
        a.hide();
        expect(document.body.style.overflow).toBe('scroll');
    });
});

describe('modal close button', () => {
    it('draws a glyph under Tailwind and stays empty under Bootstrap', async () => {
        const tw = await mount(Modal({ title: 'T' }));
        expect(tw.querySelector('[data-bs-dismiss="modal"]').textContent.trim()).toBe('\u00d7');
        themeProvider.setTheme('bootstrap');
        const bs = await mount(Modal({ title: 'T' }));
        expect(bs.querySelector('[data-bs-dismiss="modal"]').textContent.trim()).toBe('');
    });
});

describe('modal instance', () => {
    it('getInstance returns show, hide and toggle', async () => {
        const modal = await mount(Modal({ title: 'T' }));
        const instance = modal.getInstance();
        expect(['show', 'hide', 'toggle'].every((k) => typeof instance[k] === 'function')).toBe(true);
        instance.toggle();
        expect(modal.classList.contains('hidden')).toBe(false);
        instance.hide();
        expect(modal.classList.contains('hidden')).toBe(true);
    });
});

describe('modal focus trap', () => {
    it('wraps Tab from the last focusable element to the first', async () => {
        const b1 = document.createElement('button');
        const b2 = document.createElement('button');
        b1.textContent = 'one';
        b2.textContent = 'two';
        const modal = await mount(Modal({ title: 'T', children: [b1, b2] }));
        modal.show();
        const first = modal.querySelector('[data-bs-dismiss="modal"]');
        b2.focus();
        expect(document.activeElement).toBe(b2);
        b2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(first);
    });
});

describe('Tooltip accessibility', () => {
    it('describes the trigger with the popup and Escape hides it', async () => {
        const btn = document.createElement('button');
        const el = await mount(Tooltip({ title: 'Tip', children: btn }));
        const popup = el.querySelector('[role="tooltip"]');
        expect(btn.getAttribute('aria-describedby')).toBe(popup.id);
        escape();
        expect(popup.style.visibility).toBe('hidden');
        el.dispatchEvent(new Event('mouseenter'));
        expect(popup.style.visibility).toBe('');
    });
});

describe('Skeleton counts', () => {
    it('coerces and caps lines, rows and cols', () => {
        expect(Skeleton({ variant: 'text', lines: 500 }).querySelectorAll('.skeleton-line').length).toBe(100);
        const table = Skeleton({ variant: 'table', rows: '3', cols: '2' });
        expect(table.querySelectorAll('.skeleton-row').length).toBe(4);
        expect(table.querySelector('.skeleton-header').querySelectorAll('.skeleton-cell').length).toBe(2);
        const big = Skeleton({ variant: 'table', rows: 500, cols: 500 });
        expect(big.querySelectorAll('.skeleton-row').length).toBe(101);
        expect(big.querySelector('.skeleton-header').querySelectorAll('.skeleton-cell').length).toBe(100);
    });
});

describe('Input icon and placeholder under Tailwind', () => {
    it('keeps the label out of the placeholder and centres the icon on the field', async () => {
        const el = await mount(Input({ label: 'Email', name: 'e', icon: 'bi-envelope', help: 'We never share it' }));
        const input = el.querySelector('input');
        expect(input.getAttribute('placeholder')).toBe('');
        const field = input.parentElement;
        expect(field.className).toContain('relative');
        expect(field.contains(el.querySelector('span[aria-hidden="true"]'))).toBe(true);
        expect(field.contains(el.querySelector('label'))).toBe(false);
        expect(field.contains(el.querySelector('[id$="-help"]'))).toBe(false);
    });

    it('Bootstrap keeps the label placeholder and flat markup', async () => {
        themeProvider.setTheme('bootstrap');
        const el = await mount(Input({ label: 'Email', name: 'e', icon: 'bi-envelope' }));
        const input = el.querySelector('input');
        expect(input.getAttribute('placeholder')).toBe('Email');
        expect(input.parentElement.contains(el.querySelector('label'))).toBe(true);
    });
});

describe('Stepper vertical under Tailwind', () => {
    it('lays the header out as a row, horizontal stays a column', async () => {
        const v = await mount(Stepper({ orientation: 'vertical', steps: [{ title: 'A' }, { title: 'B' }] }));
        const header = v.querySelector('.stepper-step-header').className;
        expect(header).toContain('flex-row');
        expect(header).not.toContain('flex-col');
        const h = await mount(Stepper({ steps: [{ title: 'A' }, { title: 'B' }] }));
        expect(h.querySelector('.stepper-step-header').className).toContain('flex-col');
    });

    it('indents the step content to the label column', async () => {
        const v = await mount(Stepper({ orientation: 'vertical', steps: [{ title: 'A', content: 'Create it' }] }));
        const content = v.querySelector('.stepper-content').className;
        expect(content).toContain('ml-12');
        expect(content).toContain('text-sm');
    });

    it('Bootstrap keeps the bare stepper-content class', async () => {
        themeProvider.setTheme('bootstrap');
        const v = await mount(Stepper({ orientation: 'vertical', steps: [{ title: 'A', content: 'x' }] }));
        expect(v.querySelector('.stepper-content').getAttribute('class')).toBe('stepper-content');
    });
});
