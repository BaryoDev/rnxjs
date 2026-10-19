/**
 * Component defects under the Tailwind theme (no Bootstrap JS, no Bootstrap CSS).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { themeProvider } from '../utils/ThemeProvider.js';
import { Modal } from '../components/Modal/Modal.js';
import { Stepper } from '../components/Stepper/Stepper.js';
import { ProgressBar } from '../components/ProgressBar/ProgressBar.js';
import { Tooltip } from '../components/Tooltip/Tooltip.js';
import { Input } from '../components/Input/Input.js';
import { Select } from '../components/Select/Select.js';

const wait = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

const mount = async (el) => {
    document.body.appendChild(el);
    await wait();
    return el;
};

beforeEach(() => {
    delete window.bootstrap;
    themeProvider.setTheme('tailwind');
});

afterEach(() => {
    themeProvider.setTheme('bootstrap');
    document.body.innerHTML = '';
});

describe('Modal without Bootstrap JS', () => {
    it('is hidden until shown', async () => {
        const modal = await mount(Modal({ title: 'T', children: [document.createElement('p')] }));
        expect(modal.classList.contains('hidden')).toBe(true);
        expect(modal.style.display).toBe('none');
        expect(modal.getAttribute('aria-hidden')).toBe('true');
        expect(typeof modal.show).toBe('function');
    });

    it('shows a centred dialog over a scrim', async () => {
        const modal = await mount(Modal({ title: 'T' }));
        modal.show();
        expect(modal.classList.contains('hidden')).toBe(false);
        expect(modal.classList.contains('items-center')).toBe(true);
        expect(modal.classList.contains('justify-center')).toBe(true);
        expect(modal.style.display).toBe('');
        expect(modal.getAttribute('aria-hidden')).toBe('false');
        const overlay = modal.querySelector('[data-ref="overlay"]');
        expect(overlay.className).toContain('bg-[color:');
        expect(overlay.className).toContain('[[data-mode=dark]_&]:bg-');
    });

    it('closes on Escape and returns focus to the trigger', async () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        const modal = await mount(Modal({ title: 'T' }));
        trigger.focus();
        expect(document.activeElement).toBe(trigger);
        modal.show();
        let hidden = 0;
        modal.addEventListener('hidden.bs.modal', () => hidden++);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(modal.classList.contains('hidden')).toBe(true);
        expect(hidden).toBe(1);
        expect(document.activeElement).toBe(trigger);
    });

    it('closes on backdrop click and on the close button', async () => {
        const modal = await mount(Modal({ title: 'T' }));
        modal.show();
        modal.querySelector('[data-ref="overlay"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.classList.contains('hidden')).toBe(true);
        modal.show();
        modal.querySelector('[data-bs-dismiss="modal"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('ignores Bootstrap JS when it is on the page', async () => {
        const calls = [];
        window.bootstrap = { Modal: class { constructor() { calls.push('new'); } static getInstance() { calls.push('get'); return null; } } };
        const modal = await mount(Modal({ title: 'T' }));
        modal.show();
        expect(calls).toEqual([]);
        expect(modal.classList.contains('hidden')).toBe(false);
        expect(document.body.classList.contains('modal-open')).toBe(false);
        modal.hide();
        expect(modal.classList.contains('hidden')).toBe(true);
        expect(document.body.classList.contains('modal-open')).toBe(false);
    });

    it('stays open on Escape when not dismissable', async () => {
        const modal = await mount(Modal({ title: 'T', dismissable: false }));
        modal.show();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(modal.classList.contains('hidden')).toBe(false);
    });
});

describe('Stepper under Tailwind', () => {
    it('lays the steps out as a flex row on the <ol> with the label in the flow', async () => {
        const el = await mount(Stepper({ steps: [{ title: 'Account' }, { title: 'Details' }, { title: 'Done' }] }));
        const ol = el.querySelector('ol');
        expect(ol.className).toContain('flex');
        expect(el.className.split(/\s+/)).not.toContain('items-center');
        const label = el.querySelector('.stepper-step-title');
        expect(label.className).not.toContain('absolute');
        expect(el.querySelector('.stepper-step-header').className).toContain('flex-col');
    });
});

describe('ProgressBar under Tailwind', () => {
    it.each(['primary', 'success', 'danger'])('takes the %s fill from the theme', async (variant) => {
        const el = await mount(ProgressBar({ value: 40, variant }));
        const bar = el.querySelector('.progress-bar');
        const fill = themeProvider.resolveUtility('background', variant);
        expect(fill).toContain('var(--rnx-');
        expect(bar.className).toContain(fill);
        expect(bar.className.split(/\s+/)).not.toContain(`bg-${variant}`);
    });
});

describe('Tooltip under Tailwind', () => {
    it('keeps bubble classes off the trigger and puts them on a popup', async () => {
        const trigger = document.createElement('button');
        trigger.textContent = 'Hover';
        const el = await mount(Tooltip({ title: 'Tip', placement: 'bottom', children: trigger }));
        expect(el.className).not.toMatch(/absolute|bg-\[color/);
        expect(el.hasAttribute('data-bs-toggle')).toBe(false);
        const popup = el.querySelector('[role="tooltip"]');
        expect(popup.textContent).toBe('Tip');
        expect(popup.className).toContain('absolute');
        expect(popup.className).toContain('invisible');
        expect(popup.className).toContain('group-hover:visible');
        expect(popup.className).toContain('group-focus-within:visible');
        expect(popup.className).toContain('top-full');
        expect(el.contains(trigger)).toBe(true);
    });
});

describe('Input and Select labels under Tailwind', () => {
    it('Input puts the label first in a column', async () => {
        const el = await mount(Input({ label: 'Email', name: 'e' }));
        expect(el.className).toContain('flex-col');
        expect(el.querySelector('label').className).toContain('order-first');
    });

    it('Select puts the label first in a column', async () => {
        const el = await mount(Select({ label: 'Status', name: 's', options: [{ value: 'a', label: 'A' }] }));
        expect(el.className).toContain('flex-col');
        expect(el.querySelector('label').className).toContain('order-first');
    });

    it('Bootstrap keeps its floating label markup', async () => {
        themeProvider.setTheme('bootstrap');
        const el = await mount(Input({ label: 'Email', name: 'e' }));
        expect(el.className).toContain('form-floating');
        expect(el.querySelector('label').className).not.toContain('order-first');
    });
});
