/**
 * Dark-mode classes in the Tailwind theme: the tick and dot, the scrim, the
 * ring offset. Each is checked in the theme strings and in a real Tailwind
 * build, because an arbitrary variant that Tailwind cannot generate fails
 * silently in the browser.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import preset from '../tailwind.preset.js';
import { tailwindTheme } from '../themes/tailwind/index.js';

const require = createRequire(import.meta.url);
const NON_TEXT = 3;

const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((s) => (s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

function tokens(file, selector) {
    const css = readFileSync(join(process.cwd(), file), 'utf8');
    const re = selector === 'root'
        ? /:root\s*\{([\s\S]*?)\n\}/
        : /\[data-theme="dark"\],\s*\[data-mode="dark"\]\s*\{([\s\S]*?)\n\}/;
    const out = {};
    for (const m of css.match(re)[1].matchAll(/--rnx-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2].toLowerCase();
    return out;
}

// The colour a data-URI mark is drawn in: stroke for the tick, fill for the dot.
function markColour(cls) {
    const uri = cls.match(/bg-\[url\((.+)\)\]$/)[1];
    const raw = uri.match(/(?:stroke|fill)=%27(?!none)([^%]+|%23[0-9a-f]{6})%27/i)[1];
    return raw === 'white' ? '#ffffff' : '#' + raw.replace('%23', '');
}

const MARKS = { checkbox: tailwindTheme.components.checkbox.base, radio: tailwindTheme.components.radio.base };
const light = tokens('css/rnx.css', 'root');
const dark = { ...light, ...tokens('css/rnx.css', 'dark') };

function tickClass(base, selector) {
    const re = new RegExp('(?:^| )' + selector.replace(/[[\]]/g, '\\$&') + ':checked:bg-\\[url\\(\\S+\\)\\]');
    return (base.match(re) || [])[0];
}

describe('tick and dot on a checked control', () => {
    for (const [name, base] of Object.entries(MARKS)) {
        it(`${name}: light mark reaches 3:1 on the checked fill, fallback and rnx.css`, () => {
            const cls = base.split(' ').find((c) => c.startsWith('checked:bg-[url('));
            const fallback = base.match(/checked:bg-\[color:var\(--rnx-primary,(#[0-9a-f]{6})\)\]/i)[1];
            expect(contrast(markColour(cls), fallback)).toBeGreaterThanOrEqual(NON_TEXT);
            expect(contrast(markColour(cls), light.primary)).toBeGreaterThanOrEqual(NON_TEXT);
        });

        for (const sel of ['[[data-mode=dark]_&]', '[[data-theme=dark]_&]']) {
            it(`${name}: ${sel} mark reaches 3:1 on the dark checked fill`, () => {
                const cls = tickClass(base, sel);
                expect(cls).toBeTruthy();
                expect(contrast(markColour(cls.trim()), dark.primary)).toBeGreaterThanOrEqual(NON_TEXT);
            });
        }
    }

    it('the check fails for a white mark on the dark fill', () => {
        expect(contrast('#ffffff', dark.primary)).toBeLessThan(NON_TEXT);
    });
});

describe('scrim', () => {
    const overlays = {
        modal: tailwindTheme.components.modal.parts.overlay,
        navigationdrawer: tailwindTheme.components.navigationdrawer.parts.overlay
    };

    for (const [name, str] of Object.entries(overlays)) {
        it(`${name}: keeps the light scrim and adds a dark one`, () => {
            expect(str).toContain('bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_50%,transparent)]');
            expect(str).toContain('[[data-mode=dark]_&]:bg-[color:rgb(0_0_0/0.6)]');
            expect(str).toContain('[[data-theme=dark]_&]:bg-[color:rgb(0_0_0/0.6)]');
        });
    }

    it('the dark scrim darkens the dark surface it covers', () => {
        const a = 0.6;
        const covered = [1, 3, 5].map((i) => parseInt(dark.surface.slice(i, i + 2), 16) * (1 - a));
        const hex = '#' + covered.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
        expect(lum(hex)).toBeLessThan(lum(dark.surface) / 2);
    });
});

describe('real tailwind build of the dark classes', () => {
    const postcss = require('postcss');
    const tailwind = require('tailwindcss');
    let css;

    const build = async () => {
        if (css) return css;
        const out = await postcss([tailwind({ presets: [preset], content: [join(process.cwd(), 'themes/tailwind/index.js')] })])
            .process('@tailwind utilities;', { from: undefined });
        css = out.css;
        return css;
    };

    it('generates the dark scrim for both attributes', async () => {
        const out = await build();
        expect(out).toMatch(/\[data-mode=dark\] \.\\\[\\\[data-mode\\=dark\\\]_\\&\\\]\\:bg-\\\[color\\:rgb[^{]*\{\s*background-color: rgb\(0 0 0\/0\.6\)/);
        expect(out).toMatch(/\[data-theme=dark\] \.\\\[\\\[data-theme\\=dark\\\]_\\&\\\]\\:bg-\\\[color\\:rgb[^{]*\{\s*background-color: rgb\(0 0 0\/0\.6\)/);
    });

    it('generates the dark tick and dot with the dark label colour', async () => {
        const out = await build();
        for (const attr of ['data-mode', 'data-theme']) {
            const rules = out.split('}').filter((r) => r.includes(`[${attr}=dark] .`) && r.includes(':checked') && r.includes('svg'));
            expect(rules).toHaveLength(2);
            for (const r of rules) {
                expect(r).toContain('%230b1216');
                expect(r).not.toContain('%27white%27');
            }
        }
    });

    it('generates the ring offset from --rnx-surface', async () => {
        const out = await build();
        expect(out).toMatch(/--tw-ring-offset-color:\s*var\(--rnx-surface,\s*#ffffff\)/);
    });
});
