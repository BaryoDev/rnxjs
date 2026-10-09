import { readFileSync, readdirSync, statSync } from 'node:fs';
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
    expect(pkg.exports['./tailwind']).toBe('./tailwind.preset.js');
    expect(pkg.files).toContain('tailwind.preset.js');
  });
});
