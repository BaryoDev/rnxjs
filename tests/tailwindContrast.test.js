/**
 * WCAG AA contrast check for the Tailwind theme.
 *
 * Every text-<colour>-<shade> and placeholder:text-<colour>-<shade> class in
 * the theme must reach 4.5:1 against white, unless it is allowlisted below
 * with a reason. A shade missing from PALETTE fails the test.
 */

import { describe, it, expect } from 'vitest';
import { tailwindTheme } from '../themes/tailwind/index.js';

// Tailwind 3 default palette, only the shades the theme uses as text or fill.
const PALETTE = {
    white: { '': '#ffffff' },
    black: { '': '#000000' },
    slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
    indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3' },
    red: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b' },
    emerald: { 50: '#ecfdf5', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
    amber: { 50: '#fffbeb', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 950: '#451a03' },
    sky: { 50: '#f0f9ff', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' }
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

// Exact classes, per theme path, that are not read as text on their background.
const ALLOWLIST = {
    'components.breadcrumb.parts.separator': ['text-slate-300'], // decorative, rendered aria-hidden
    // Icons and close buttons are graphics (3:1 rule, tracked separately), not text.
    'components.input.parts.icon': ['text-slate-400'],
    'components.modal.parts.close': ['text-slate-400'],
    'components.toast.parts.close': ['text-slate-400'],
    'components.search.parts.icon': ['text-slate-400'],
    'components.fileupload.parts.icon': ['text-slate-400'],
    'components.emptystate.parts.icon': ['text-slate-300'],
    'components.errorstate.parts.icon': ['text-red-500']
};

function lookup(colour, shade) {
    return PALETTE[colour] && PALETTE[colour][shade];
}

// Splits a class string into { state: { text, bg } } keyed by variant prefix.
function parse(str) {
    const states = {};
    for (const token of str.split(/\s+/)) {
        const m = token.match(/^((?:[a-z-]+:)*)(text|bg)-(white|black|[a-z]+-\d+)(\/\d+)?$/);
        if (!m || m[4]) continue; // opacity fills are overlays, not checked
        const [, prefix, kind, value] = m;
        (states[prefix] = states[prefix] || {})[kind] = { cls: token, value };
    }
    return states;
}

function resolve(value) {
    const m = value.match(/^([a-z]+)(?:-(\d+))?$/);
    return { colour: m[1], shade: m[2] || '', hex: lookup(m[1], m[2] || '') };
}

function collect(node, path, out) {
    if (typeof node === 'string') {
        out.push({ path: path.join('.'), str: node });
    } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) collect(v, [...path, k], out);
    }
    return out;
}

function check(entries) {
    const failures = [];
    for (const { path, str } of entries) {
        const states = parse(str);
        const base = states[''] || {};
        for (const [prefix, st] of Object.entries(states)) {
            // placeholder: text sits on the same fill as the base state
            const text = st.text || base.text;
            const bg = st.bg || base.bg;
            if (!st.text && !prefix.startsWith('placeholder:') && !(st.bg && text)) continue;
            if (!text) continue;
            if ((ALLOWLIST[path] || []).includes(text.cls)) continue;
            const fg = resolve(text.value);
            const fill = bg ? resolve(bg.value) : { hex: WHITE, colour: 'white' };
            const fgHex = fg.hex;
            if (!fgHex) { failures.push(`${path}: ${text.cls} is not in the palette table`); continue; }
            if (!fill.hex) { failures.push(`${path}: ${bg.cls} is not in the palette table`); continue; }
            const ratio = contrast(fgHex, fill.hex);
            if (ratio < AA_NORMAL) {
                failures.push(`${path}: ${text.cls} on ${bg ? bg.cls : 'white'} is ${ratio.toFixed(2)}:1`);
            }
        }
    }
    return [...new Set(failures)];
}

describe('tailwind theme contrast', () => {
    const entries = collect(tailwindTheme, [], []);

    it('finds classes to check', () => {
        expect(entries.length).toBeGreaterThan(100);
    });

    it('every text colour reaches AA (4.5:1) on its background (white if none)', () => {
        expect(check(entries)).toEqual([]);
    });

    it('allowlist has no stale entries', () => {
        const stale = [];
        for (const [path, classes] of Object.entries(ALLOWLIST)) {
            const entry = entries.find((e) => e.path === path);
            if (!entry) { stale.push(`${path}: path not in theme`); continue; }
            for (const cls of classes) {
                if (!entry.str.split(/\s+/).includes(cls)) stale.push(`${path}: ${cls} not in class string`);
            }
        }
        expect(stale).toEqual([]);
    });

    it('checks text against its own fill, not just white', () => {
        const failures = check([{ path: 'x', str: 'bg-emerald-600 text-white' }]);
        expect(failures).toEqual(['x: text-white on bg-emerald-600 is 3.77:1']);
    });

    it('fails on a shade missing from the palette', () => {
        expect(check([{ path: 'x', str: 'text-pink-700' }])).toEqual(['x: text-pink-700 is not in the palette table']);
    });

    it('contrast function matches known values', () => {
        expect(contrast('#000000', WHITE)).toBeCloseTo(21, 1);
        expect(contrast('#64748b', WHITE)).toBeCloseTo(4.76, 2);
        expect(contrast('#d97706', WHITE)).toBeCloseTo(3.19, 2);
    });
});
