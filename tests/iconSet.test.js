import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { setTheme, registerTheme } from '../utils/ThemeProvider.js';
import { tailwindTheme } from '../themes/tailwind/index.js';
import { resolveIcon } from '../utils/icon.js';
import { Icon } from '../components/Icon/Icon.js';
import { Button } from '../components/Button/Button.js';
import { Input } from '../components/Input/Input.js';
import { Chips } from '../components/Chips/Chips.js';
import { FAB } from '../components/FAB/FAB.js';
import { NavigationBar } from '../components/NavigationBar/NavigationBar.js';
import { NavigationDrawer } from '../components/NavigationDrawer/NavigationDrawer.js';
import { TopAppBar } from '../components/TopAppBar/TopAppBar.js';
import { SegmentedButton } from '../components/SegmentedButton/SegmentedButton.js';
import { StatCard } from '../components/StatCard/StatCard.js';
import { EmptyState } from '../components/EmptyState/EmptyState.js';
import { ErrorState } from '../components/ErrorState/ErrorState.js';
import { List } from '../components/List/List.js';
import { DataTable } from '../components/DataTable/DataTable.js';
import { toastPlugin } from '../plugins/toast.js';

const iconClasses = (el) =>
  [...(el.matches('i') ? [el] : []), ...el.querySelectorAll('i')].map((i) => i.getAttribute('class') || '');

describe('icon set', () => {
  beforeAll(() => {
    registerTheme({
      ...tailwindTheme,
      name: 'phosphor-test',
      utilities: { ...tailwindTheme.utilities, icon: { className: (n) => `ph ph-${n}` } }
    });
  });

  afterEach(() => {
    setTheme('bootstrap');
    document.body.innerHTML = '';
  });

  it('defaults to Bootstrap Icons and strips a bi- prefix', () => {
    expect(resolveIcon('check')).toBe('bi bi-check');
    expect(resolveIcon('bi-check')).toBe('bi bi-check');
    expect(resolveIcon('')).toBe('');
  });

  it('falls back to Bootstrap Icons for a theme without an icon utility', () => {
    registerTheme({ name: 'bare-test', components: {} });
    setTheme('bare-test');
    expect(resolveIcon('check')).toBe('bi bi-check');
  });

  it('every component takes its icons from the theme', () => {
    setTheme('phosphor-test');
    const rendered = [
      Icon({ name: 'heart' }),
      Button({ icon: 'plus', label: 'Add' }),
      Input({ icon: 'search' }),
      Chips({ items: [{ label: 'A', selected: true }, { label: 'B', icon: 'star' }] }),
      FAB({ icon: 'plus' }),
      NavigationBar({ items: [{ label: 'Home', icon: 'house' }] }),
      NavigationDrawer({ links: [{ label: 'Home', href: '#', icon: 'house' }] }),
      TopAppBar({ title: 'T', leadingIcon: 'list', trailingIcon: 'gear' }),
      SegmentedButton({ options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', icon: 'grid' }], selected: 'a' }),
      StatCard({ label: 'L', value: 1, icon: 'people', change: { value: 5, trend: 'up' } }),
      EmptyState({ icon: 'inbox' }),
      ErrorState({ icon: 'bug' }),
      List({ items: [{ text: 'x', leadingIcon: 'person', trailingIcon: 'chevron-right' }] }),
      DataTable({ columns: [{ key: 'a', label: 'A', sortable: true }], rows: Array.from({ length: 12 }, (_, i) => ({ a: i })), pageSize: 5 }),
      DataTable({ columns: [{ key: 'a', label: 'A' }], error: 'boom' })
    ];

    for (const el of rendered) {
      document.body.appendChild(el);
      const classes = iconClasses(el);
      expect(classes.length, el.outerHTML).toBeGreaterThan(0);
      for (const c of classes) {
        expect(c, el.outerHTML).toMatch(/\bph-/);
        expect(c, el.outerHTML).not.toMatch(/\bbi\b|\bbi-/);
      }
    }
  });

  it('toast icons come from the theme', () => {
    setTheme('phosphor-test');
    window.rnx = window.rnx || {};
    toastPlugin({ duration: 0 }).install();
    window.rnx.toast.success('ok');
    const classes = iconClasses(document.querySelector('.rnx-toast'));
    expect(classes).toEqual(['ph ph-check-circle-fill', 'ph ph-x']);
    delete window.rnx.toast;
  });

  it('no component or plugin hardcodes a Bootstrap Icons class', () => {
    const files = [];
    const walk = (dir) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.js')) files.push(p);
      }
    };
    walk('components');
    walk('plugins');
    const offenders = files.filter((f) => /["'`\s]bi[\s"'`]|bi-\$\{|["'`\s]bi-[a-z]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
