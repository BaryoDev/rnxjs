/**
 * The Tailwind theme reads --rnx-* CSS variables.
 *
 * Two guards:
 * 1. No raw palette colour class (bg-indigo-600, text-white, ...) is left in
 *    the theme or the components, because a raw class cannot be restyled by a
 *    variable.
 * 2. A real Tailwind build turns every token colour class in the theme into a
 *    rule whose declaration reads var(--rnx-...) on a colour property.
 *    Tailwind 3.4.19 already reads var() values as colours; the color: hint is
 *    kept for cn() grouping (tests/classNames.test.js), not for Tailwind.
 */

import { readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import preset, { content } from '../tailwind.preset.js';
import { tailwindTheme } from '../themes/tailwind/index.js';

const require = createRequire(import.meta.url);

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (p.endsWith('.js')) out.push(p);
    }
    return out;
}

const FAMILIES = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTILS = 'bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|divide|placeholder|from|to|via|fill|stroke|outline|shadow|accent|caret|decoration';
const RAW_PALETTE = new RegExp(
    `(?<![\\w-])(?:[a-z-]+:|\\[[^\\]]+\\]:)*(?:${UTILS})-(?:white|black|(?:${FAMILIES})-\\d{2,3})(?:\\/\\d+)?(?![\\w-])`,
    'g'
);

function collect(node, out = []) {
    if (typeof node === 'string') out.push(node);
    else if (node && typeof node === 'object') Object.values(node).forEach((v) => collect(v, out));
    return out;
}

describe('tailwind theme has no raw palette colour classes', () => {
    const files = [...walk('themes/tailwind'), ...walk('components')];

    it.each(files)('%s', (file) => {
        const found = readFileSync(file, 'utf8').match(RAW_PALETTE) || [];
        expect(found).toEqual([]);
    });

    it('the pattern catches what it should and allows transparent and current', () => {
        const hit = (s) => s.match(RAW_PALETTE) || [];
        expect(hit('bg-indigo-600')).toEqual(['bg-indigo-600']);
        expect(hit('hover:bg-slate-50 focus-visible:ring-indigo-500')).toHaveLength(2);
        expect(hit('peer-checked:bg-emerald-700')).toHaveLength(1);
        expect(hit('border-t-indigo-600 ring-amber-600/20 text-white bg-black')).toHaveLength(4);
        expect(hit('[&_tr:nth-child(odd)]:bg-slate-50')).toHaveLength(1);
        expect(hit('placeholder:text-slate-400 divide-slate-100 ring-offset-white')).toHaveLength(3);
        expect(hit('bg-transparent text-current border-transparent')).toEqual([]);
        expect(hit('bg-[color:var(--rnx-primary,#4f46e5)] text-sm border')).toEqual([]);
    });

    it('reads tokens in the theme (sanity)', () => {
        const classes = collect(tailwindTheme).flatMap((s) => s.split(/\s+/));
        expect(classes.filter((c) => c.includes('[color:') && c.includes('var(--rnx-')).length).toBeGreaterThan(100);
    });
});

// Splits `hover:bg-[color:var(--x,#fff)]` into variant prefix and utility.
function splitVariant(cls) {
    let depth = 0;
    let last = -1;
    for (let i = 0; i < cls.length; i++) {
        const ch = cls[i];
        if (ch === '[' || ch === '(') depth++;
        else if (ch === ']' || ch === ')') depth--;
        else if (ch === ':' && depth === 0) last = i;
    }
    return last === -1 ? ['', cls] : [cls.slice(0, last + 1), cls.slice(last + 1)];
}

// The CSS property each utility must set for a colour.
const PROPERTY = {
    bg: ['background-color'],
    text: ['color'],
    border: ['border-color'],
    'border-t': ['border-top-color'],
    'border-r': ['border-right-color'],
    'border-b': ['border-bottom-color'],
    'border-l': ['border-left-color'],
    ring: ['--tw-ring-color'],
    'ring-offset': ['--tw-ring-offset-color'],
    divide: ['border-color'],
    outline: ['outline-color'],
    accent: ['accent-color'],
    fill: ['fill'],
    stroke: ['stroke'],
    shadow: ['--tw-shadow-color'],
    from: ['--tw-gradient-from'],
    via: ['--tw-gradient-stops', '--tw-gradient-via'],
    to: ['--tw-gradient-to']
};

describe('real tailwind build of the token classes', () => {
    const postcss = require('postcss');
    const tailwind = require('tailwindcss');

    async function build() {
        const dir = mkdtempSync(join(tmpdir(), 'rnx-tok-'));
        writeFileSync(join(dir, 'index.html'), '<div class="p-4"></div>');
        const cfg = { presets: [preset], content: ['index.html', ...content].map((c) => (c.startsWith('/') ? c : join(dir, c))) };
        const out = await postcss([tailwind(cfg)]).process('@tailwind base;@tailwind components;@tailwind utilities;', { from: undefined });
        return postcss.parse(out.css);
    }

    it('every token colour class becomes a colour rule that reads var(--rnx-', async () => {
        const classes = [...new Set(
            collect(tailwindTheme).flatMap((s) => s.split(/\s+/)).filter((c) => c.includes('-[') && c.includes('var(--rnx-'))
        )];
        expect(classes.length).toBeGreaterThan(100);

        const root = await build();
        // Selector text with CSS escapes undone (hex escapes like \\2c for a comma, then
        // backslash-char), so it can be compared to the class name.
        const unescape = (sel) =>
            sel
                .replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
                .replace(/\\(.)/g, '$1');
        const rules = [];
        root.walkRules((rule) => {
            rules.push({ selector: unescape(rule.selector), decls: rule.nodes.filter((n) => n.type === 'decl') });
        });

        const problems = [];
        for (const cls of classes) {
            const [, utility] = splitVariant(cls);
            const util = utility.slice(0, utility.indexOf('-['));
            const props = PROPERTY[util];
            if (!props) { problems.push(`${cls}: no property known for ${util}`); continue; }
            const matching = rules.filter((r) => r.selector.includes(`.${cls}`));
            if (!matching.length) { problems.push(`${cls}: no CSS rule generated`); continue; }
            const ok = matching.some((r) =>
                r.decls.some((d) => props.includes(d.prop) && d.value.includes('var(--rnx-')));
            if (!ok) {
                const seen = matching.flatMap((r) => r.decls.map((d) => `${d.prop}: ${d.value}`)).join('; ');
                problems.push(`${cls}: expected ${props.join(' or ')} reading var(--rnx-, got ${seen}`);
            }
        }
        expect(problems).toEqual([]);
    });
});
