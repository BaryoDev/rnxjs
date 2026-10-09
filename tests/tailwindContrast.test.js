/**
 * WCAG AA contrast check for the Tailwind theme.
 *
 * Every text-[color:...] and placeholder:text-[color:...] class in the theme
 * must reach 4.5:1 against the fill in the same class string (the background
 * token fallback, white, if there is none), unless it is allowlisted below
 * with a reason.
 *
 * Colours are token reads: var(--rnx-x,#hex) resolves to its fallback, and
 * color-mix(in_srgb,A_P%,B) is evaluated per channel the way the CSS spec
 * defines it for srgb. A value that cannot be resolved fails the test, and so
 * does a raw palette class such as text-slate-700.
 *
 * The checks run twice: with no variables set (every fallback), and with the
 * token values parsed from the :root block of css/rnx.css, the default theme
 * a user links. Variant prefixes may be bracketed, e.g. [&_tbody_tr]:hover:.
 */

import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { tailwindTheme } from '../themes/tailwind/index.js';

const WHITE = '#ffffff';
const AA_NORMAL = 4.5;

function toRgb(hex) {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function toHex(rgb) {
    return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function luminance(hex) {
    const [r, g, b] = toRgb(hex).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// Split on commas that are not inside parentheses.
function splitTop(str) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') depth--;
        else if (str[i] === ',' && depth === 0) {
            parts.push(str.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(str.slice(start));
    return parts;
}

/**
 * Resolve an arbitrary colour value to { hex } or { transparent: true }.
 * Returns null when it cannot be resolved.
 */
function evaluate(value, tokens = {}) {
    let m = value.match(/^#([0-9a-f]{6})$/i);
    if (m) return { hex: '#' + m[1].toLowerCase() };
    if (value === 'transparent') return { transparent: true };
    m = value.match(/^var\(--rnx-([a-z-]+),(.+)\)$/);
    if (m) return evaluate(tokens[m[1]] || m[2], tokens);
    m = value.match(/^color-mix\(in_srgb,(.+)\)$/);
    if (m) {
        const [first, second] = splitTop(m[1]);
        const pm = first && first.match(/^(.+)_(\d+(?:\.\d+)?)%$/);
        if (!pm || !second) return null;
        const a = evaluate(pm[1], tokens);
        const b = evaluate(second, tokens);
        if (!a || !b) return null;
        // Mixing with transparent gives a translucent overlay, not a fill.
        if (a.transparent || b.transparent) return { transparent: true };
        const p = parseFloat(pm[2]) / 100;
        const ra = toRgb(a.hex);
        const rb = toRgb(b.hex);
        return { hex: toHex(ra.map((c, i) => c * p + rb[i] * (1 - p))) };
    }
    return null;
}

// Exact classes, per theme path, that are not read as text on their background.
const SLATE_300 = 'text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))]';
const SLATE_400 = 'text-[color:var(--rnx-text-disabled,#94a3b8)]';
const RED_500 = 'text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))]';
const ALLOWLIST = {
    'components.breadcrumb.parts.separator': [SLATE_300], // decorative, rendered aria-hidden
    // Icons and close buttons are graphics (3:1 rule, tracked separately), not text.
    'components.input.parts.icon': [SLATE_400],
    'components.modal.parts.close': [SLATE_400],
    'components.toast.parts.close': [SLATE_400],
    'components.search.parts.icon': [SLATE_400],
    'components.fileupload.parts.icon': [SLATE_400],
    'components.emptystate.parts.icon': [SLATE_300],
    'components.errorstate.parts.icon': [RED_500]
};

const PREFIX = '(?:(?:[a-z-]+|\\[[^\\]\\s]+\\]):)*';
const RAW_PALETTE = new RegExp('^' + PREFIX + '(?:text|bg)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d+)(?:/\\d+)?$');
const TOKEN_CLASS = new RegExp('^(' + PREFIX + ')(text|bg)-\\[color:(.+)\\]$');

// Splits a class string into { state: { text, bg } } keyed by variant prefix.
// Throws nothing: raw palette classes and unresolvable values are reported by
// check(), through the `bad` list.
function parse(str, bad, tokens) {
    const states = {};
    for (const token of str.split(/\s+/)) {
        if (RAW_PALETTE.test(token)) { bad.push(`${token} is a raw palette class`); continue; }
        const m = token.match(TOKEN_CLASS);
        if (!m) continue;
        const [, prefix, kind, value] = m;
        const colour = evaluate(value, tokens);
        if (!colour) { bad.push(`${token} cannot be resolved to a colour`); continue; }
        if (colour.transparent) continue; // opacity fills are overlays, not checked
        (states[prefix] = states[prefix] || {})[kind] = { cls: token, hex: colour.hex };
    }
    return states;
}

function collect(node, path, out) {
    if (typeof node === 'string') {
        out.push({ path: path.join('.'), str: node });
    } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) collect(v, [...path, k], out);
    }
    return out;
}

function defaultFills(tokens) {
    const names = ['surface', 'background'].filter((n) => tokens[n]);
    if (!names.length) return [{ name: 'white', hex: WHITE }];
    return names.map((n) => ({ name: n, hex: tokens[n] }));
}

function check(entries, tokens = {}) {
    const failures = [];
    for (const { path, str } of entries) {
        const bad = [];
        const states = parse(str, bad, tokens);
        for (const b of bad) failures.push(`${path}: ${b}`);
        const base = states[''] || {};
        for (const [prefix, st] of Object.entries(states)) {
            // placeholder: text sits on the same fill as the base state
            const text = st.text || base.text;
            const bg = st.bg || base.bg;
            if (!st.text && !prefix.startsWith('placeholder:') && !(st.bg && text)) continue;
            if (!text) continue;
            if ((ALLOWLIST[path] || []).includes(text.cls)) continue;
            // No fill in the class string: the text sits on a card (surface) or on
            // the page (background). Both must pass.
            const fills = bg
                ? [{ name: bg.cls, hex: bg.hex }]
                : defaultFills(tokens);
            for (const fill of fills) {
                const ratio = contrast(text.hex, fill.hex);
                if (ratio < AA_NORMAL) {
                    failures.push(`${path}: ${text.cls} on ${fill.name} is ${ratio.toFixed(2)}:1`);
                }
            }
        }
    }
    return [...new Set(failures)];
}

describe('tailwind theme contrast', () => {
    const entries = collect(tailwindTheme, [], []);

    it('finds classes to check', () => {
        expect(entries.length).toBeGreaterThan(100);
        const texts = entries.flatMap((e) => e.str.split(/\s+/)).filter((t) => TOKEN_CLASS.test(t) && /(^|:)text-/.test(t));
        expect(texts.length).toBeGreaterThan(50);
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
        const failures = check([{ path: 'x', str: 'bg-[color:var(--rnx-success,#059669)] text-[color:var(--rnx-text-on-primary,#ffffff)]' }]);
        expect(failures).toEqual([
            'x: text-[color:var(--rnx-text-on-primary,#ffffff)] on bg-[color:var(--rnx-success,#059669)] is 3.77:1'
        ]);
    });

    it('fails when a text colour drops below AA', () => {
        const failures = check([{ path: 'x', str: 'text-[color:var(--rnx-text-secondary,#94a3b8)]' }]);
        expect(failures).toHaveLength(1);
        expect(failures[0]).toMatch(/^x: .* on white is 2\.\d\d:1$/);
    });

    it('fails on a color-mix that lands below AA', () => {
        const light = 'text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_30%,var(--rnx-surface,#ffffff))]';
        expect(check([{ path: 'x', str: light }])).toHaveLength(1);
        const dark = 'text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_80%,var(--rnx-surface,#ffffff))]';
        expect(check([{ path: 'x', str: dark }])).toEqual([]);
    });

    it('fails on a raw palette class or an unresolvable value', () => {
        expect(check([{ path: 'x', str: 'text-pink-700' }])).toEqual(['x: text-pink-700 is a raw palette class']);
        expect(check([{ path: 'x', str: 'text-[color:var(--rnx-primary)]' }])).toEqual([
            'x: text-[color:var(--rnx-primary)] cannot be resolved to a colour'
        ]);
    });

    it('skips overlays that mix with transparent', () => {
        const str = 'bg-[color:color-mix(in_srgb,var(--rnx-primary,#4f46e5)_20%,transparent)] text-[color:var(--rnx-text-primary,#0f172a)]';
        expect(check([{ path: 'x', str }])).toEqual([]);
    });

    it('contrast function matches known values', () => {
        expect(contrast('#000000', WHITE)).toBeCloseTo(21, 1);
        expect(contrast('#64748b', WHITE)).toBeCloseTo(4.76, 2);
        expect(contrast('#d97706', WHITE)).toBeCloseTo(3.19, 2);
    });

    it('evaluates var fallbacks and color-mix', () => {
        expect(evaluate('var(--rnx-primary,#4f46e5)')).toEqual({ hex: '#4f46e5' });
        expect(evaluate('color-mix(in_srgb,#000000_50%,#ffffff)')).toEqual({ hex: '#808080' });
        expect(evaluate('color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_100%,var(--rnx-surface,#ffffff))'))
            .toEqual({ hex: '#0f172a' });
        expect(evaluate('color-mix(in_srgb,var(--rnx-a,#ffffff)_20%,transparent)')).toEqual({ transparent: true });
        expect(evaluate('rebeccapurple')).toBeNull();
    });
});

function readCss(file) {
    return readFileSync(new URL(file, import.meta.url), 'utf8');
}

function parseTokens(body) {
    const tokens = {};
    for (const m of body.matchAll(/--rnx-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
        tokens[m[1]] = m[2].toLowerCase();
    }
    return tokens;
}

function parseRoot(file) {
    const root = readCss(file).match(/:root\s*\{([\s\S]*?)\n\}/);
    if (!root) throw new Error(`no :root block in ${file}`);
    return parseTokens(root[1]);
}

// The dark block of rnx.css: only the tokens it overrides.
function parseDark(file) {
    const m = readCss(file).match(/\[data-theme="dark"\],\s*\[data-mode="dark"\]\s*\{([\s\S]*?)\n\}/);
    if (!m) throw new Error(`no dark block in ${file}`);
    return parseTokens(m[1]);
}

// Failures that come from the palette in css/rnx.css, not from the theme.
// Each entry is { prefix, reason }, matched against the start of a failure line.
const RNX_CSS_ALLOWLIST = [];

describe('tailwind theme contrast with the css/rnx.css tokens', () => {
    const entries = collect(tailwindTheme, [], []);
    const tokens = parseRoot('../css/rnx.css');

    it('parses the tokens from the :root block', () => {
        expect(tokens.primary).toBe('#0f5c6b');
        expect(tokens.surface).toBe('#ffffff');
        expect(tokens.background).toBe('#eef1f4');
        expect(Object.keys(tokens).length).toBeGreaterThan(15);
    });

    it('every text colour reaches AA with the rnx.css tokens set', () => {
        const failures = check(entries, tokens).filter(
            (f) => !RNX_CSS_ALLOWLIST.some((a) => f.startsWith(a.prefix))
        );
        expect(failures.join('\n')).toBe('');
    });

    it('allowlist entries still match a failure', () => {
        const failures = check(entries, tokens);
        const stale = RNX_CSS_ALLOWLIST.filter((a) => !failures.some((f) => f.startsWith(a.prefix)));
        expect(stale).toEqual([]);
    });

    it('a token value changes the result', () => {
        const str = 'text-[color:var(--rnx-text-secondary,#64748b)]';
        expect(check([{ path: 'x', str }])).toEqual([]);
        expect(check([{ path: 'x', str }], { 'text-secondary': '#aaaaaa' })).toHaveLength(1);
    });
});

describe('tailwind theme contrast with the css/rnx.css dark tokens', () => {
    const entries = collect(tailwindTheme, [], []);
    const light = parseRoot('../css/rnx.css');
    const dark = parseDark('../css/rnx.css');
    // The dark block sits on top of :root, so a token it does not set stays light.
    const tokens = { ...light, ...dark };

    it('parses the tokens from the dark block', () => {
        expect(dark.surface).not.toBe(light.surface);
        expect(dark['text-primary']).not.toBe(light['text-primary']);
        expect(Object.keys(dark).length).toBeGreaterThan(15);
    });

    it('every text colour reaches AA with the dark tokens set', () => {
        expect(check(entries, tokens).join('\n')).toBe('');
    });

    it('the labels on the brand and status fills reach AA', () => {
        for (const fill of ['primary', 'primary-hover', 'primary-active', 'success', 'danger', 'info']) {
            expect(contrast(tokens['text-on-primary'], tokens[fill])).toBeGreaterThanOrEqual(AA_NORMAL);
        }
        expect(contrast(tokens['text-on-warning'], tokens.warning)).toBeGreaterThanOrEqual(AA_NORMAL);
        expect(contrast(tokens['text-on-warning'], tokens['warning-hover'])).toBeGreaterThanOrEqual(AA_NORMAL);
    });

    it('overrides every colour token that the theme reads', () => {
        const read = new Set();
        for (const { str } of entries) {
            for (const m of str.matchAll(/var\(--rnx-([a-z-]+),/g)) read.add(m[1]);
        }
        const missing = Object.keys(light).filter((t) => read.has(t) && !(t in dark));
        expect(missing).toEqual([]);
        // Tokens that :root leaves to their fallbacks need a dark value too.
        expect([...read].filter((t) => !(t in dark))).toEqual([]);
        // The theme must read something, or the check above proves nothing.
        expect(read.size).toBeGreaterThan(15);
    });

    it('a light colour left in the dark block fails the contrast check', () => {
        const broken = { ...tokens, 'text-primary': light['text-primary'] };
        expect(check(entries, broken).length).toBeGreaterThan(0);
    });
});

describe('text on warning', () => {
    it('--rnx-text-on-warning reaches AA on its warning fill in both css files', () => {
        const rnx = parseRoot('../css/rnx.css');
        const base = parseRoot('../css/themes/base.css');
        expect(contrast(rnx['text-on-warning'], rnx.warning)).toBeGreaterThanOrEqual(AA_NORMAL);
        expect(contrast(base['text-on-warning'], base.warning)).toBeGreaterThanOrEqual(AA_NORMAL);
    });

    it('the default fallback #451a03 reaches AA on #fbbf24', () => {
        expect(contrast('#451a03', '#fbbf24')).toBeGreaterThanOrEqual(AA_NORMAL);
    });
});

describe('bracketed variant prefixes', () => {
    it('are checked, not skipped', () => {
        const str = '[&_tbody_tr]:hover:bg-[color:var(--rnx-success,#059669)] [&_tbody_tr]:hover:text-[color:var(--rnx-text-on-primary,#ffffff)]';
        expect(check([{ path: 'x', str }])).toHaveLength(1);
    });

    it('flag a raw palette class behind a bracketed prefix', () => {
        expect(check([{ path: 'x', str: '[&_td]:hover:text-pink-700' }])).toEqual([
            'x: [&_td]:hover:text-pink-700 is a raw palette class'
        ]);
    });
});
