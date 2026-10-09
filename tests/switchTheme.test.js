import { describe, it, expect, afterEach, vi } from 'vitest';
import { Switch } from '../components/Switch/Switch.js';
import { Checkbox } from '../components/Checkbox/Checkbox.js';
import { Radio } from '../components/Radio/Radio.js';
import { Select } from '../components/Select/Select.js';
import { setTheme, registerTheme } from '../utils/ThemeProvider.js';
import { createReactiveState } from '../utils/createReactiveState.js';
import { bindData } from '../framework/DataBinder.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('Switch theming', () => {
  afterEach(() => {
    setTheme('bootstrap');
    document.body.innerHTML = '';
  });

  describe('tailwind', () => {
    it('renders a track and a thumb around a native checkbox', async () => {
      setTheme('tailwind');
      const sw = Switch({ label: 'Alerts', name: 'alerts', value: 'on' });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      expect(input.type).toBe('checkbox');
      expect(input.getAttribute('role')).toBe('switch');
      expect(input.name).toBe('alerts');
      expect(input.value).toBe('on');
      expect(input.className).toContain('peer');
      expect(input.className).toContain('sr-only');
      const thumb = sw.querySelector('[data-part="thumb"]');
      expect(thumb).not.toBeNull();
      expect(thumb.className).toContain('peer-checked:translate-x-5');
      // track is a sibling after the input so peer-* variants apply
      expect(input.nextElementSibling.className).toContain('peer-checked:bg-[color:var(--rnx-primary,#4f46e5)]');
    });

    it('toggles checked, aria-checked and fires onchange', async () => {
      setTheme('tailwind');
      const handler = vi.fn();
      const sw = Switch({ onchange: handler });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      expect(handler).toHaveBeenCalledWith(true);
      expect(input.getAttribute('aria-checked')).toBe('true');
    });

    it('clicking the thumb toggles the input', async () => {
      setTheme('tailwind');
      const sw = Switch({ label: 'Alerts' });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      sw.querySelector('[data-part="thumb"]').click();
      expect(input.checked).toBe(true);
    });

    it('keeps disabled, checked and required on the input', async () => {
      setTheme('tailwind');
      const sw = Switch({ checked: true, disabled: true, required: true });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      expect(input.checked).toBe(true);
      expect(input.disabled).toBe(true);
      expect(input.required).toBe(true);
    });

    it('puts className on the track, not the wrapper label', async () => {
      setTheme('tailwind');
      const sw = Switch({ className: 'ml-8 bg-red-500' });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      const track = input.nextElementSibling;
      expect(track.className).toContain('bg-red-500');
      expect(track.className).not.toContain('bg-slate-300');
      expect(input.parentElement.className).not.toContain('bg-red-500');
    });

    it('falls back to the input-only markup for a theme with a thumb but no input/control parts', async () => {
      registerTheme({
        name: 'legacy-tw',
        components: {
          switch: {
            base: 'relative inline-flex h-6 w-11 rounded-full',
            parts: { wrapper: 'flex', label: 'lbl', thumb: 'thumb-x' },
            states: { checked: 'bg-indigo-600', unchecked: 'bg-slate-300' }
          }
        }
      });
      setTheme('legacy-tw');
      const sw = Switch({ label: 'Alerts' });
      document.body.appendChild(sw);
      await tick();
      const input = sw.querySelector('input');
      expect(input.className).toContain('rounded-full');
      expect(sw.querySelector('[data-part="thumb"]')).toBeNull();
    });

    it('works with data binding', async () => {
      setTheme('tailwind');
      const state = createReactiveState({ on: false });
      const sw = Switch({ 'data-bind': 'on' });
      document.body.appendChild(sw);
      await tick();
      bindData(document.body, state);
      const input = sw.querySelector('input');
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await tick();
      expect(state.on).toBe(true);
    });
  });

  describe('bootstrap', () => {
    it('keeps the original markup with no thumb', async () => {
      setTheme('bootstrap');
      const sw = Switch({ label: 'Alerts', name: 'alerts' });
      document.body.appendChild(sw);
      await tick();
      expect(sw.className).toBe('form-check form-switch');
      const input = sw.querySelector('input');
      expect(input.className).toBe('form-check-input');
      expect(input.parentElement).toBe(sw);
      expect(sw.querySelector('[data-part="thumb"]')).toBeNull();
      expect(sw.querySelectorAll('label').length).toBe(1);
      expect(sw.querySelector('label').className).toBe('form-check-label');
    });
  });
});

describe('Tailwind form controls without @tailwindcss/forms', () => {
  afterEach(() => {
    setTheme('bootstrap');
    document.body.innerHTML = '';
  });

  it('checkbox is appearance-none with a check mark and focus ring', () => {
    setTheme('tailwind');
    const cls = Checkbox({ label: 'x' }).querySelector('input').className;
    for (const c of ['appearance-none', 'h-4', 'w-4', 'border', 'checked:bg-[color:var(--rnx-primary,#4f46e5)]', 'focus-visible:ring-2', 'disabled:opacity-50']) {
      expect(cls).toContain(c);
    }
    expect(cls).toContain('checked:bg-[url(data:image/svg+xml');
  });

  it('radio is round with a dot', () => {
    setTheme('tailwind');
    const cls = Radio({ label: 'x', name: 'r', value: '1' }).querySelector('input').className;
    expect(cls).toContain('appearance-none');
    expect(cls).toContain('rounded-full');
    expect(cls).toContain('checked:bg-[url(data:image/svg+xml');
  });

  it('select is appearance-none with a chevron', () => {
    setTheme('tailwind');
    const cls = Select({ options: [{ value: 'a', label: 'A' }] }).querySelector('select').className;
    expect(cls).toContain('appearance-none');
    expect(cls).toContain('bg-[url(data:image/svg+xml');
    expect(cls).toContain('disabled:bg-[color:var(--rnx-surface,#f8fafc)]');
  });

  it('cn() keeps arbitrary background colour, image, position and size', async () => {
    const { cn } = await import('../utils/classNames.js');
    const input = 'bg-white bg-[url(x.svg)] bg-[position:right_center] bg-[length:1rem_1rem]';
    expect(cn(input)).toBe(input);
  });

  it('cn() treats gradient and image-set arbitrary values as images', async () => {
    const { cn } = await import('../utils/classNames.js');
    expect(cn('bg-[url(a.png)] bg-[linear-gradient(red,blue)]')).toBe('bg-[linear-gradient(red,blue)]');
    expect(cn('bg-[url(a.png)] bg-[radial-gradient(red,blue)]')).toBe('bg-[radial-gradient(red,blue)]');
    expect(cn('bg-[url(a.png)] bg-[conic-gradient(red,blue)]')).toBe('bg-[conic-gradient(red,blue)]');
    expect(cn('bg-[url(a.png)] bg-[image-set(url(a.png)_1x)]')).toBe('bg-[image-set(url(a.png)_1x)]');
  });

  it('bootstrap checkbox and select classes are unchanged', () => {
    setTheme('bootstrap');
    expect(Checkbox({ label: 'x' }).querySelector('input').className).not.toContain('appearance-none');
    expect(Select({ options: [] }).querySelector('select').className).not.toContain('appearance-none');
  });
});
