import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSafeRegex } from '../../utils/security.js';
import { bindData, unbindData } from '../../framework/DataBinder.js';
import { createReactiveState } from '../../utils/createReactiveState.ts';

describe('isSafeRegex', () => {
    beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}); });
    afterEach(() => { vi.restoreAllMocks(); });

    it.each([
        '^[a-z]+$',
        'abc',
        '\\d{3}',
        '^\\d+$',
        '^[a-z]+@[a-z]+\\.com$',
        '^(foo|bar)$',
        '^(\\d{3})-(\\d{4})$',
        '^(?:ab)?c+$',
        '[+*]+',
        '\\(a+\\)+',
        '.+',
    ])('accepts %s', (pattern) => {
        expect(isSafeRegex(pattern)).toBe(true);
    });

    it.each([
        '(a+)+$',
        '(a+)+b',
        '(a*)*',
        '(.+)+',
        '(.*)+',
        '(a+){2,}',
        '((a+)b)+',
        '(?:a+)*',
        '(a|b+)*c',
    ])('rejects %s', (pattern) => {
        expect(isSafeRegex(pattern)).toBe(false);
    });

    it('rejects empty, non-string and very long patterns', () => {
        expect(isSafeRegex('')).toBe(false);
        expect(isSafeRegex(null)).toBe(false);
        expect(isSafeRegex('a'.repeat(501))).toBe(false);
    });
});

describe('data-rule pattern', () => {
    let container;
    let state;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        state = createReactiveState({ code: '' });
    });

    afterEach(() => {
        unbindData(container);
        document.body.removeChild(container);
    });

    it('validates a matching and a non-matching value', () => {
        container.innerHTML = '<input data-bind="code" data-rule="pattern:^[a-z]+$" />';
        bindData(container, state);
        const input = container.querySelector('input');

        input.value = 'abc';
        input.dispatchEvent(new Event('input'));
        state.$flushSync();
        expect(state.errors.code).toBe('');

        input.value = 'ABC';
        input.dispatchEvent(new Event('input'));
        state.$flushSync();
        expect(state.errors.code).toBe('Invalid format');
    });

    it('keeps a colon inside the pattern', () => {
        container.innerHTML = '<input data-bind="code" data-rule="pattern:^a:b$" />';
        bindData(container, state);
        const input = container.querySelector('input');

        input.value = 'a:b';
        input.dispatchEvent(new Event('input'));
        state.$flushSync();
        expect(state.errors.code).toBe('');
    });

    it('still rejects a nested quantifier pattern', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        container.innerHTML = '<input data-bind="code" data-rule="pattern:(a+)+$" />';
        bindData(container, state);
        const input = container.querySelector('input');
        input.value = 'aaaa';
        input.dispatchEvent(new Event('input'));
        state.$flushSync();
        expect(state.errors.code).toBe('Invalid validation rule');
    });
});
