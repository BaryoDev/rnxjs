import { readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import preset, { content } from '../tailwind.preset.js';

const animatePlugin = /\b(animate-(in|out)|fade-(in|out)|zoom-(in|out)|slide-(in|out)-|spin-(in|out))/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

describe('tailwind theme has no plugin-only classes', () => {
  const files = [...walk('themes/tailwind'), ...walk('components')];
  it.each(files)('%s', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(animatePlugin);
  });
});

describe('tailwind preset', () => {
  it('exports content globs covering components and the theme', () => {
    expect(content.some((g) => g.endsWith('components/**/*.js'))).toBe(true);
    expect(content.some((g) => g.endsWith('themes/tailwind/**/*.js'))).toBe(true);
    expect(preset.content).toEqual(content);
  });

  it('defines the keyframes the toast animation uses', () => {
    const theme = readFileSync('themes/tailwind/index.js', 'utf8');
    expect(theme).toContain('motion-safe:animate-rnx-toast-in');
    expect(preset.theme.extend.animation['rnx-toast-in']).toBeTruthy();
    expect(preset.theme.extend.keyframes['rnx-toast-in']).toBeTruthy();
  });

  it('is exported and published', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./tailwind']).toEqual({
      import: './tailwind.preset.js',
      require: './tailwind.preset.cjs'
    });
    expect(pkg.files).toContain('tailwind.preset.js');
    expect(pkg.files).toContain('tailwind.preset.cjs');
  });
});

describe('real tailwind build', () => {
  const require = createRequire(import.meta.url);
  const postcss = require('postcss');
  const tailwind = require('tailwindcss');
  const cjsPreset = require('../tailwind.preset.cjs');

  async function build(config) {
    const dir = mkdtempSync(join(tmpdir(), 'rnx-tw-'));
    writeFileSync(join(dir, 'index.html'), '<div class="p-4"></div>');
    const cfg = { ...config, content: config.content.map((c) => (c.startsWith('/') ? c : join(dir, c))) };
    const css = '@tailwind base;@tailwind components;@tailwind utilities;';
    const out = await postcss([tailwind(cfg)]).process(css, { from: undefined });
    return out.css;
  }

  const assertFull = (css) => {
    expect(css).toContain('.sr-only');
    expect(css).toContain('animate-rnx-toast-in');
    expect(css).toContain('@keyframes rnx-toast-in');
  };

  it('generates theme classes and keyframes with the spread content (ESM)', async () => {
    assertFull(await build({ presets: [preset], content: ['index.html', ...content] }));
  });

  it('works through the CJS entry', async () => {
    expect(cjsPreset.content).toEqual(content);
    expect(cjsPreset.theme).toEqual(preset.theme);
    assertFull(await build({ presets: [cjsPreset], content: ['index.html', ...cjsPreset.content] }));
  });

  it('builds every spacing class the components emit', async () => {
    const { setTheme } = await import('../utils/ThemeProvider.js');
    const { StatCard } = await import('../components/StatCard/StatCard.js');
    const { Toast } = await import('../components/Toast/Toast.js');
    const { TopAppBar } = await import('../components/TopAppBar/TopAppBar.js');
    setTheme('tailwind');
    try {
      const els = [
        StatCard({ label: 'L', value: 1, icon: 'people', footer: 'f' }),
        Toast({ title: 'T', message: 'm' }),
        TopAppBar({ title: 'T' })
      ];
      const classes = new Set(els.flatMap((el) =>
        [el, ...el.querySelectorAll('[class]')].flatMap((n) => [...n.classList])));
      const spacing = [...classes].filter((c) => /^-?[mp][trblxyse]?-/.test(c));
      expect(spacing).toEqual(expect.arrayContaining(['ml-3', 'mt-3', 'pt-3', 'mr-auto', 'm-0']));
      const css = await build({ presets: [preset], content: ['index.html', ...content] });
      const escape = (c) => c.replace(/[.:/\[\]]/g, (ch) => '\\' + ch);
      expect(spacing.filter((c) => !css.includes(`.${escape(c)}`))).toEqual([]);
    } finally {
      setTheme('bootstrap');
    }
  });

  it('misses them when content is not spread (tailwind does not merge preset content)', async () => {
    const css = await build({ presets: [preset], content: ['index.html'] });
    expect(css).not.toContain('.sr-only');
  });
});
