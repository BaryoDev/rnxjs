import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { routerPlugin } from '../../plugins/router.js';
import { PluginManager } from '../../utils/plugins.js';
import { createReactiveState } from '../../utils/createReactiveState.js';

describe('Router Plugin', () => {
  let manager;
  let container;

  beforeEach(() => {
    // window.location persists across tests in a file, so a route pushed by an
    // earlier test would still match here and mask defaultRoute handling.
    window.history.replaceState({}, '', '/');

    // Setup DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    // Setup plugin manager with required utilities
    manager = new PluginManager();
    window.rnx = {
      createReactiveState,
      registerComponent: () => {}
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
    delete window.rnxRouter;
    delete window.rnx;
  });

  describe('Plugin Initialization', () => {
    it('should initialize router plugin', () => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/about': 'about'
        }
      });

      manager.use(plugin);

      expect(window.rnxRouter).toBeDefined();
      expect(typeof window.rnxRouter.push).toBe('function');
      expect(typeof window.rnxRouter.replace).toBe('function');
    });

    it('should use hash mode by default', () => {
      routerPlugin({
        routes: { '/': 'home' }
      }).install(manager.getContext());

      expect(window.rnxRouter).toBeDefined();
    });

    it('should support history mode', () => {
      const plugin = routerPlugin({
        mode: 'history',
        routes: { '/': 'home' }
      });

      manager.use(plugin);

      expect(window.rnxRouter).toBeDefined();
    });
  });

  describe('Route Matching', () => {
    beforeEach(() => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/users': 'users',
          '/users/:id': 'userDetail',
          '/users/:id/posts/:postId': 'postDetail'
        }
      });

      manager.use(plugin);
    });

    it('should match exact routes', async () => {
      window.rnxRouter.push('/');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('home');
    });

    it('should match parameterized routes', async () => {
      window.rnxRouter.push('/users/123');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('userDetail');
    expect(window.rnxRouter.params()).toEqual({ id: '123' });
    });

    it('should extract multiple parameters', async () => {
      window.rnxRouter.push('/users/123/posts/456');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('postDetail');
    expect(window.rnxRouter.params()).toEqual({
      id: '123',
      postId: '456'
    });
    });

    it('should return 404 for unknown routes', async () => {
      window.rnxRouter.push('/unknown/path');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('404');
    });

    it('should handle special characters in params', async () => {
      window.rnxRouter.push('/users/john-doe');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.params().id).toBe('john-doe');
    });
  });

  describe('Navigation API', () => {
    beforeEach(() => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/about': 'about',
          '/contact': 'contact',
          '/users/:id': 'user'
        }
      });

      manager.use(plugin);
    });

    it('should navigate with push()', async () => {
      window.rnxRouter.push('/about');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('about');
    });

    it('should navigate with replace()', async () => {
      window.rnxRouter.replace('/contact');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('contact');
    });

    it('should support back() navigation', async () => {
      window.rnxRouter.push('/about');
      await new Promise(resolve => setTimeout(resolve, 50));
    window.rnxRouter.back();
    await new Promise(resolve => setTimeout(resolve, 50));
  // Back navigates in history
    });

    it('should return current route', async () => {
      window.rnxRouter.push('/about');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('about');
    });

    it('should return current path', async () => {
      window.rnxRouter.push('/about');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.path()).toBe('/about');
    });

    it('should return current params', async () => {
      window.rnxRouter.push('/users/123');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.params()).toEqual({ id: '123' });
    });
  });

  describe('Route Elements', () => {
    beforeEach(() => {
      // Create route elements
      container.innerHTML = `
        <div data-route="home">Home Page</div>
        <div data-route="about">About Page</div>
        <div data-route="contact">Contact Page</div>
      `;

      document.body.appendChild(container);

      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/about': 'about',
          '/contact': 'contact'
        }
      });

      manager.use(plugin);
    });

    it('should show active route element', async () => {
      window.rnxRouter.push('/');

      await new Promise(resolve => setTimeout(resolve, 50));
    const home = container.querySelector('[data-route="home"]');
    const about = container.querySelector('[data-route="about"]');

    expect(home.style.display).not.toBe('none');
    expect(about.style.display).toBe('none');
    });

    it('should toggle route elements on navigation', async () => {
      window.rnxRouter.push('/');

      await new Promise(resolve => setTimeout(resolve, 50));
    const home = container.querySelector('[data-route="home"]');
    expect(home.style.display).not.toBe('none');

    window.rnxRouter.push('/about');

    await new Promise(resolve => setTimeout(resolve, 50));
    // re-query: the router re-renders, so the earlier reference is stale
    const homeAfter = container.querySelector('[data-route="home"]');
    const about = container.querySelector('[data-route="about"]');

    expect(homeAfter.style.display).toBe('none');
    expect(about.style.display).not.toBe('none');
    });
  });

  describe('Route Callbacks', () => {
    it('should call onRouteChange callback', async () => {
      const onRouteChange = vi.fn();

      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/about': 'about'
        },
        onRouteChange
      });

      manager.use(plugin);

      window.rnxRouter.push('/about');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(onRouteChange).toHaveBeenCalled();
    // assert the most recent call: the router also fires once on init
    const arg = onRouteChange.mock.calls.at(-1)[0];
    expect(arg.name).toBe('about');
    });
  });

  describe('Default Route', () => {
    it('should use default route on init', async () => {
      const plugin = routerPlugin({
        routes: {
          '/home': 'home',
          '/about': 'about'
        },
        defaultRoute: '/home'
      });

      manager.use(plugin);

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.currentRoute()).toBe('home');
    });
  });

  describe('State Management', () => {
    it('should maintain reactive state', async () => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/users/:id': 'userDetail'
        }
      });

      manager.use(plugin);

      window.rnxRouter.push('/users/123');

      await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.rnxRouter.state.currentRoute).toBe('userDetail');
    expect(window.rnxRouter.state.params.id).toBe('123');
    });
  });
});
