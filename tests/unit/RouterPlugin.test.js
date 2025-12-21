import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { routerPlugin } from '../../plugins/router.js';
import { PluginManager } from '../../utils/plugins.js';
import { createReactiveState } from '../../utils/createReactiveState.js';

describe('Router Plugin', () => {
  let manager;
  let container;

  beforeEach(() => {
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

    it('should match exact routes', (done) => {
      window.rnxRouter.push('/');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('home');
        done();
      }, 50);
    });

    it('should match parameterized routes', (done) => {
      window.rnxRouter.push('/users/123');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('userDetail');
        expect(window.rnxRouter.params()).toEqual({ id: '123' });
        done();
      }, 50);
    });

    it('should extract multiple parameters', (done) => {
      window.rnxRouter.push('/users/123/posts/456');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('postDetail');
        expect(window.rnxRouter.params()).toEqual({
          id: '123',
          postId: '456'
        });
        done();
      }, 50);
    });

    it('should return 404 for unknown routes', (done) => {
      window.rnxRouter.push('/unknown/path');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('404');
        done();
      }, 50);
    });

    it('should handle special characters in params', (done) => {
      window.rnxRouter.push('/users/john-doe');

      setTimeout(() => {
        expect(window.rnxRouter.params().id).toBe('john-doe');
        done();
      }, 50);
    });
  });

  describe('Navigation API', () => {
    beforeEach(() => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/about': 'about',
          '/contact': 'contact'
        }
      });

      manager.use(plugin);
    });

    it('should navigate with push()', (done) => {
      window.rnxRouter.push('/about');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('about');
        done();
      }, 50);
    });

    it('should navigate with replace()', (done) => {
      window.rnxRouter.replace('/contact');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('contact');
        done();
      }, 50);
    });

    it('should support back() navigation', (done) => {
      window.rnxRouter.push('/about');
      setTimeout(() => {
        window.rnxRouter.back();
        setTimeout(() => {
          // Back navigates in history
          done();
        }, 50);
      }, 50);
    });

    it('should return current route', (done) => {
      window.rnxRouter.push('/about');

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('about');
        done();
      }, 50);
    });

    it('should return current path', (done) => {
      window.rnxRouter.push('/about');

      setTimeout(() => {
        expect(window.rnxRouter.path()).toBe('/about');
        done();
      }, 50);
    });

    it('should return current params', (done) => {
      window.rnxRouter.push('/users/123');

      setTimeout(() => {
        expect(window.rnxRouter.params()).toEqual({ id: '123' });
        done();
      }, 50);
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

    it('should show active route element', (done) => {
      window.rnxRouter.push('/');

      setTimeout(() => {
        const home = container.querySelector('[data-route="home"]');
        const about = container.querySelector('[data-route="about"]');

        expect(home.style.display).not.toBe('none');
        expect(about.style.display).toBe('none');
        done();
      }, 50);
    });

    it('should toggle route elements on navigation', (done) => {
      window.rnxRouter.push('/');

      setTimeout(() => {
        const home = container.querySelector('[data-route="home"]');
        expect(home.style.display).not.toBe('none');

        window.rnxRouter.push('/about');

        setTimeout(() => {
          const home = container.querySelector('[data-route="home"]');
          const about = container.querySelector('[data-route="about"]');

          expect(home.style.display).toBe('none');
          expect(about.style.display).not.toBe('none');
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Route Callbacks', () => {
    it('should call onRouteChange callback', (done) => {
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

      setTimeout(() => {
        expect(onRouteChange).toHaveBeenCalled();
        const arg = onRouteChange.mock.calls[0][0];
        expect(arg.name).toBe('about');
        done();
      }, 50);
    });
  });

  describe('Default Route', () => {
    it('should use default route on init', (done) => {
      const plugin = routerPlugin({
        routes: {
          '/home': 'home',
          '/about': 'about'
        },
        defaultRoute: '/home'
      });

      manager.use(plugin);

      setTimeout(() => {
        expect(window.rnxRouter.currentRoute()).toBe('home');
        done();
      }, 50);
    });
  });

  describe('State Management', () => {
    it('should maintain reactive state', (done) => {
      const plugin = routerPlugin({
        routes: {
          '/': 'home',
          '/users/:id': 'userDetail'
        }
      });

      manager.use(plugin);

      window.rnxRouter.push('/users/123');

      setTimeout(() => {
        expect(window.rnxRouter.state.currentRoute).toBe('userDetail');
        expect(window.rnxRouter.state.params.id).toBe('123');
        done();
      }, 50);
    });
  });
});
