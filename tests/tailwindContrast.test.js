/**
 * WCAG AA contrast check for the Tailwind theme.
 *
 * Every text-<colour>-<shade> and placeholder:text-<colour>-<shade> class in
 * the theme must reach 4.5:1 against white, unless it is allowlisted below
 * with a reason. A shade missing from PALETTE fails the test.
 */

import { describe, it, expect } from 'vitest';
import { tailwindTheme } from '../themes/tailwind/index.js';

// Tailwind 3 default palette, only the shades the theme uses as text.
const PALETTE = {
    slate: { 100: '#f1f5f9', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
    indigo: { 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3' },
    red: { 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b' },
    emerald: { 600: '#059669', 700: '#047857', 800: '#065f46' },
    amber: { 600: '#d97706', 700: '#b45309', 800: '#92400e', 950: '#451a03' },
    sky: { 600: '#0284c7', 700: '#0369a1', 800: '#075985' }
};

const WHITE = '#ffffff';
const AA_NORMAL = 4.5;

function luminance(hex) {
    const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// Theme paths (dot notation) whose text classes are not read as text on white.
const ALLOWLIST = {
    'components.breadcrumb.parts.separator': 'decorative, the component renders it aria-hidden',
    'components.alert.variants.dark': 'light text on a slate-900 background',
    // Icons and close buttons are graphics (3:1 rule, tracked separately), not text.
    'components.input.parts.icon': 'icon',
    'components.modal.parts.close': 'icon button',
    'components.toast.parts.close': 'icon button',
    'components.search.parts.icon': 'icon',
    'components.fileupload.parts.icon': 'icon',
    'components.emptystate.parts.icon': 'icon',
    'components.errorstate.parts.icon': 'icon'
};

// Classes that sit on a dark or coloured background by design.
const ALLOWED_CLASSES = new Set(['text-white', 'text-amber-950']);

const TEXT_CLASS = /(?:^|\s)((?:[a-z-]+:)*text-([a-z]+)-(\d+))(?=\s|$)/g;

function collect(node, path, out) {
    if (typeof node === 'string') {
        for (const m of node.matchAll(TEXT_CLASS)) {
            out.push({ path: path.join('.'), cls: m[1], colour: m[2], shade: m[3] });
        }
    } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) collect(v, [...path, k], out);
    }
    return out;
}

describe('tailwind theme contrast', () => {
    const found = collect(tailwindTheme, [], []);

    it('finds text classes to check', () => {
        expect(found.length).toBeGreaterThan(30);
    });

    it('every text colour reaches AA (4.5:1) on white', () => {
        const failures = [];
        for (const { path, cls, colour, shade } of found) {
            if (ALLOWLIST[path] || ALLOWED_CLASSES.has(cls)) continue;
            const hex = PALETTE[colour] && PALETTE[colour][shade];
            if (!hex) {
                failures.push(`${path}: ${cls} is not in the palette table`);
                continue;
            }
            const ratio = contrast(hex, WHITE);
            if (ratio < AA_NORMAL) failures.push(`${path}: ${cls} is ${ratio.toFixed(2)}:1`);
        }
        expect(failures).toEqual([]);
    });

    it('contrast function matches known values', () => {
        expect(contrast('#000000', WHITE)).toBeCloseTo(21, 1);
        expect(contrast('#64748b', WHITE)).toBeCloseTo(4.76, 2);
        expect(contrast('#d97706', WHITE)).toBeCloseTo(3.19, 2);
    });
});
