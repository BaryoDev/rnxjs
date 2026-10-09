import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import themeProvider, { setMode, getMode, getResolvedMode } from '../utils/ThemeProvider.js';
import * as api from '../index.js';

// A matchMedia that tracks its listeners so a leak shows up as a count.
function mockMatchMedia(initialDark) {
  const state = { dark: initialDark, listeners: new Set(), added: 0, removed: 0 };
  window.matchMedia = vi.fn(() => ({
    get matches() { return state.dark; },
    addEventListener: (type, fn) => { if (type === 'change') { state.listeners.add(fn); state.added++; } },
    removeEventListener: (type, fn) => { if (type === 'change') { state.listeners.delete(fn); state.removed++; } }
  }));
  state.flip = (dark) => {
    state.dark = dark;
    [...state.listeners].forEach((fn) => fn({ matches: dark }));
  };
  return state;
}

const attr = () => document.documentElement.getAttribute('data-mode');

describe('colour mode', () => {
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    setMode('light');
    localStorage.clear();
    document.documentElement.removeAttribute('data-mode');
  });

  afterEach(() => {
    setMode('light');
    window.matchMedia = realMatchMedia;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is exported from the package index', () => {
    expect(api.setMode).toBeTypeOf('function');
    expect(api.getMode).toBeTypeOf('function');
    expect(api.getResolvedMode).toBeTypeOf('function');
  });

  it('setMode("dark") sets the attribute and both getters', () => {
    setMode('dark');
    expect(attr()).toBe('dark');
    expect(getMode()).toBe('dark');
    expect(getResolvedMode()).toBe('dark');
  });

  it('setMode("light") sets the attribute and both getters', () => {
    setMode('dark');
    setMode('light');
    expect(attr()).toBe('light');
    expect(getMode()).toBe('light');
    expect(getResolvedMode()).toBe('light');
  });

  it('setMode("system") resolves from prefers-color-scheme', () => {
    mockMatchMedia(true);
    setMode('system');
    expect(getMode()).toBe('system');
    expect(getResolvedMode()).toBe('dark');
    expect(attr()).toBe('dark');
  });

  it('system resolves to light when the browser has no matchMedia', () => {
    window.matchMedia = undefined;
    setMode('system');
    expect(getMode()).toBe('system');
    expect(getResolvedMode()).toBe('light');
    expect(attr()).toBe('light');
  });

  it('ignores a value that is not a mode', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    setMode('dark');
    setMode('purple');
    expect(getMode()).toBe('dark');
    expect(attr()).toBe('dark');
    expect(err).toHaveBeenCalled();
  });

  it('defaults to light', () => {
    expect(getMode()).toBe('light');
    expect(getResolvedMode()).toBe('light');
  });

  it('persists the choice under rnx-mode', () => {
    setMode('dark');
    expect(localStorage.getItem('rnx-mode')).toBe('dark');
    setMode('system');
    expect(localStorage.getItem('rnx-mode')).toBe('system');
  });

  it('a new provider restores the stored choice and applies it', async () => {
    localStorage.setItem('rnx-mode', 'dark');
    vi.resetModules();
    const fresh = await import('../utils/ThemeProvider.js');
    expect(fresh.getMode()).toBe('dark');
    expect(fresh.getResolvedMode()).toBe('dark');
    expect(attr()).toBe('dark');
  });

  it('a new provider ignores a bad stored value and leaves the document alone', async () => {
    localStorage.setItem('rnx-mode', 'purple');
    vi.resetModules();
    const fresh = await import('../utils/ThemeProvider.js');
    expect(fresh.getMode()).toBe('light');
    expect(attr()).toBeNull();
  });

  it('follows prefers-color-scheme live in system mode', () => {
    const mq = mockMatchMedia(false);
    setMode('system');
    expect(getResolvedMode()).toBe('light');
    mq.flip(true);
    expect(getResolvedMode()).toBe('dark');
    expect(attr()).toBe('dark');
    expect(getMode()).toBe('system');
    mq.flip(false);
    expect(attr()).toBe('light');
  });

  it('removes the listener when switching away from system', () => {
    const mq = mockMatchMedia(false);
    setMode('system');
    expect(mq.listeners.size).toBe(1);
    setMode('light');
    expect(mq.listeners.size).toBe(0);
    mq.flip(true);
    expect(getResolvedMode()).toBe('light');
    expect(attr()).toBe('light');
  });

  it('keeps one listener when system is set twice', () => {
    const mq = mockMatchMedia(false);
    setMode('system');
    setMode('system');
    expect(mq.listeners.size).toBe(1);
    expect(mq.added).toBe(2);
    expect(mq.removed).toBe(1);
  });

  it('falls back to addListener on old browsers and removes it too', () => {
    const listeners = new Set();
    window.matchMedia = () => ({
      matches: false,
      addListener: (fn) => listeners.add(fn),
      removeListener: (fn) => listeners.delete(fn)
    });
    setMode('system');
    expect(listeners.size).toBe(1);
    setMode('dark');
    expect(listeners.size).toBe(0);
  });

  it('still applies the mode when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('denied'); }
    });
    expect(() => setMode('dark')).not.toThrow();
    expect(attr()).toBe('dark');
    expect(getMode()).toBe('dark');
  });

  it('starts light when reading storage throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => {}
    });
    vi.resetModules();
    const fresh = await import('../utils/ThemeProvider.js');
    expect(fresh.getMode()).toBe('light');
  });

  it('notifies subscribers on a mode change and a system change', () => {
    const mq = mockMatchMedia(false);
    const seen = [];
    const off = themeProvider.subscribe((theme, info) => seen.push(info.resolvedMode));
    setMode('dark');
    setMode('system');
    mq.flip(true);
    expect(seen).toEqual(['dark', 'light', 'dark']);
    off();
    setMode('light');
    expect(seen).toHaveLength(3);
  });
});
