import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { routerPlugin } from '../../plugins/router.js';
import { PluginManager } from '../../utils/plugins.js';
import { createReactiveState } from '../../utils/createReactiveState.js';

const wait = () => new Promise(r => setTimeout(r, 50));

describe('Router Plugin review fixes', () => {
  let manager;

  function install(options) {
    manager = new PluginManager();
    window.rnx = { createReactiveState, registerComponent: () => {} };
    manager.use(routerPlugin(options));
  }

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.location.hash = '';
  });

  afterEach(() => {
    window.rnxRouter?.destroy?.();
    delete window.rnxRouter;
    delete window.rnx;
    vi.restoreAllMocks();
  });

  it('keeps the hash query out of params and exposes it as query', async () => {
    install({ routes: { '/': 'home', '/users/:id': 'user' } });
    window.rnxRouter.push('/users/7?tab=x&n=2');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('user');
    expect(window.rnxRouter.params()).toEqual({ id: '7' });
    expect(window.rnxRouter.query()).toEqual({ tab: 'x', n: '2' });
    expect(window.rnxRouter.path()).toBe('/users/7');
  });

  it('matches a trailing slash', async () => {
    install({ routes: { '/': 'home', '/users/:id': 'user', '/about': 'about' } });
    window.rnxRouter.push('/users/7/');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('user');
    expect(window.rnxRouter.params()).toEqual({ id: '7' });
    window.rnxRouter.push('/about/');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('about');
  });

  it('decodes params and survives a malformed escape', async () => {
    install({ routes: { '/users/:id': 'user' } });
    window.rnxRouter.push('/users/a%20b%2Fc');
    await wait();
    expect(window.rnxRouter.params()).toEqual({ id: 'a b/c' });
    window.rnxRouter.push('/users/100%');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('user');
    expect(window.rnxRouter.params()).toEqual({ id: '100%' });
  });

  it('decodes params in history mode', async () => {
    install({ mode: 'history', routes: { '/users/:id': 'user' } });
    window.rnxRouter.push('/users/a%20b');
    expect(window.rnxRouter.params()).toEqual({ id: 'a b' });
  });

  it('does not throw on a numeric param name and skips that route', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    install({ routes: { '/': 'home', '/x/:1': 'bad', '/ok/:id': 'ok' } });
    window.rnxRouter.push('/x/5');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('404');
    expect(warn).toHaveBeenCalled();
    window.rnxRouter.push('/ok/9');
    await wait();
    expect(window.rnxRouter.currentRoute()).toBe('ok');
  });

  it('removes its listener on destroy and does not stack on a second install', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const calls = vi.fn();

    install({ routes: { '/': 'home', '/a': 'a' }, onRouteChange: calls });
    install({ routes: { '/': 'home', '/a': 'a' }, onRouteChange: calls });

    const added = add.mock.calls.filter(c => c[0] === 'hashchange').length;
    const removed = remove.mock.calls.filter(c => c[0] === 'hashchange').length;
    expect(added - removed).toBe(1);

    window.rnxRouter.destroy();
    expect(window.rnxRouter).toBeUndefined();
    const removedAfter = remove.mock.calls.filter(c => c[0] === 'hashchange').length;
    expect(added - removedAfter).toBe(0);
  });
});
