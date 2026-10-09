/**
 * Pins the default look of the Tailwind theme.
 *
 * With no --rnx-* variable set, every colour class must resolve to the hex the
 * theme had before it read tokens (commit 80e5990). The frozen table is in
 * tests/fixtures/tailwindOldHexes.json: one row per colour class, in class
 * string order, as [old class, old hex, opacity percent or null].
 *
 * A fallback may drift by 1 per channel (the rounding of a color-mix), no more.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { tailwindTheme } from '../themes/tailwind/index.js';

const OLD = JSON.parse(readFileSync(join(process.cwd(), 'tests/fixtures/tailwindOldHexes.json'), 'utf8'));
const MAX_DRIFT = 1;

const PREFIX = '(?:(?:[a-z-]+|\\[[^\\]\\s]+\\]):)*';
const UTILS = 'bg|text|border-[trblxy]|border|ring-offset|ring|divide|placeholder|from|to|via|fill|stroke|outline|shadow|accent|caret|decoration';
const NEW_CLASS = new RegExp(`^(${PREFIX})(${UTILS})-\\[color:(.+)\\]$`);
const OLD_CLASS = new RegExp(`^(${PREFIX})(${UTILS})-(?:white|slate|indigo|red|amber|emerald|sky)(?:-\\d+)?(?:/\\d+)?$`);

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

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

// Resolve a value with no variables set: every var() takes its fallback.
// Returns { hex, alpha } where alpha is the opacity percent of a mix with
// transparent, or null.
function resolve(value) {
    let m = value.match(/^#([0-9a-f]{6})$/i);
    if (m) return { hex: value.toLowerCase(), alpha: null };
    m = value.match(/^var\(--rnx-[a-z-]+,(.+)\)$/);
    if (m) return resolve(m[1]);
    m = value.match(/^color-mix\(in_srgb,(.+)\)$/);
    if (m) {
        const [first, second] = splitTop(m[1]);
        const pm = first.match(/^(.+)_(\d+(?:\.\d+)?)%$/);
        if (!pm || !second) throw new Error(`cannot parse ${value}`);
        const p = parseFloat(pm[2]);
        if (second === 'transparent') {
            const a = resolve(pm[1]);
            if (a.alpha !== null) throw new Error(`nested opacity in ${value}`);
            return { hex: a.hex, alpha: p };
        }
        const a = resolve(pm[1]);
        const b = resolve(second);
        if (a.alpha !== null || b.alpha !== null) throw new Error(`opacity inside a mix in ${value}`);
        const ra = rgb(a.hex);
        const rb = rgb(b.hex);
        return { hex: hex(ra.map((c, i) => (c * p) / 100 + (rb[i] * (100 - p)) / 100)), alpha: null };
    }
    throw new Error(`cannot resolve ${value}`);
}

function collect(node, path, out) {
    if (typeof node === 'string') out.push([path.join('.'), node]);
    else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) collect(v, [...path, k], out);
    }
    return out;
}

const drift = (a, b) => Math.max(...rgb(a).map((c, i) => Math.abs(c - rgb(b)[i])));

/** Compare the theme with the frozen table. Returns a list of problems. */
function compare(theme, table) {
    const problems = [];
    const strings = new Map(collect(theme, [], []));
    for (const path of new Set([...strings.keys(), ...Object.keys(table)])) {
        const str = strings.get(path);
        const rows = table[path] || [];
        const classes = (str || '').split(/\s+/).filter((t) => NEW_CLASS.test(t));
        const raw = (str || '').split(/\s+/).filter((t) => OLD_CLASS.test(t));
        for (const r of raw) problems.push(`${path}: ${r} is a raw palette class`);
        if (classes.length !== rows.length) {
            problems.push(`${path}: ${classes.length} colour classes, table has ${rows.length}`);
            continue;
        }
        classes.forEach((cls, i) => {
            const [oldCls, oldHex, oldAlpha] = rows[i];
            const [, prefix, util, value] = cls.match(NEW_CLASS);
            const oldPrefix = oldCls.match(OLD_CLASS)[1];
            const oldUtil = oldCls.match(OLD_CLASS)[2];
            if (prefix !== oldPrefix || util !== oldUtil) {
                problems.push(`${path}: ${cls} does not line up with ${oldCls}`);
                return;
            }
            let got;
            try {
                got = resolve(value);
            } catch (e) {
                problems.push(`${path}: ${cls}: ${e.message}`);
                return;
            }
            if (got.alpha !== oldAlpha) {
                problems.push(`${path}: ${cls} has opacity ${got.alpha}, ${oldCls} had ${oldAlpha}`);
            }
            const d = drift(got.hex, oldHex);
            if (d > MAX_DRIFT) {
                problems.push(`${path}: ${cls} resolves to ${got.hex}, ${oldCls} was ${oldHex} (off ${d})`);
            }
        });
    }
    return problems;
}

function missingFallbacks(theme) {
    const missing = [];
    for (const [path, str] of collect(theme, [], [])) {
        for (const m of str.matchAll(/var\(--rnx-[a-z-]+(.)(.{0,7})/g)) {
            if (m[1] !== ',' || !/^#[0-9a-f]{6}$/i.test(m[2])) missing.push(`${path}: ${m[0]}`);
        }
    }
    return missing;
}

describe('tailwind theme default look', () => {
    it('the frozen table covers the whole old theme', () => {
        const rows = Object.values(OLD).flat();
        expect(Object.keys(OLD).length).toBeGreaterThan(150);
        expect(rows.length).toBeGreaterThan(400);
    });

    it('every colour resolves to its old hex with no variables set', () => {
        expect(compare(tailwindTheme, OLD).join('\n')).toBe('');
    });

    it('every var(--rnx-x) has a hex fallback', () => {
        expect(missingFallbacks(tailwindTheme)).toEqual([]);
    });

    it('the fallback guard catches a var() with no fallback', () => {
        expect(missingFallbacks({ x: 'bg-[color:var(--rnx-primary)]' })).toHaveLength(1);
        expect(missingFallbacks({ x: 'divide-[color:var(--rnx-border-color-light)]' })).toHaveLength(1);
        expect(missingFallbacks({ x: 'bg-[color:var(--rnx-primary,red)]' })).toHaveLength(1);
        expect(missingFallbacks({ x: 'bg-[color:var(--rnx-primary,#4f46e5)]' })).toEqual([]);
    });

    it('fails when a ring is hardcoded', () => {
        const theme = { x: 'focus-visible:ring-[color:#ff0000]' };
        const table = { x: [['focus-visible:ring-indigo-500', '#6366f1', null]] };
        expect(compare(theme, table)).toHaveLength(1);
    });

    it('fails when a fallback drifts by more than 1', () => {
        const table = { x: [['bg-indigo-600', '#4f46e5', null]] };
        expect(compare({ x: 'bg-[color:var(--rnx-primary,#4f46e5)]' }, table)).toEqual([]);
        expect(compare({ x: 'bg-[color:var(--rnx-primary,#4f46e6)]' }, table)).toEqual([]);
        expect(compare({ x: 'bg-[color:var(--rnx-primary,#4f46e7)]' }, table)).toHaveLength(1);
    });

    it('fails when a class is dropped, reordered or loses its opacity', () => {
        const table = { x: [['bg-red-500/50', '#ef4444', 50]] };
        expect(compare({ x: '' }, table)).toHaveLength(1);
        expect(compare({ x: 'bg-[color:var(--rnx-danger,#ef4444)]' }, table)).toHaveLength(1);
        const ok = 'bg-[color:color-mix(in_srgb,var(--rnx-danger,#ef4444)_50%,transparent)]';
        expect(compare({ x: ok }, table)).toEqual([]);
    });

    it('flags a var() without a fallback', () => {
        expect(resolve.bind(null, 'var(--rnx-primary)')).toThrow();
    });
});
