/**
 * Router Plugin for rnxJS
 *
 * Hash-based routing with parameter extraction and navigation API.
 *
 * Usage:
 * import { routerPlugin } from '@arnelirobles/rnxjs';
 *
 * rnx.plugins.use(routerPlugin, {
 *   routes: {
 *     '/': 'home',
 *     '/users': 'users',
 *     '/users/:id': 'userDetail'
 *   }
 * });
 *
 * // In HTML:
 * <div data-route="home">Home content</div>
 * <div data-route="users">Users list</div>
 * <div data-route="userDetail">User: <span data-bind="params.id"></span></div>
 *
 * // In JavaScript:
 * rnxRouter.push('/users/123');
 * rnxRouter.replace('/home');
 */

export function routerPlugin(options = {}) {
  const {
    routes = {},
    mode = 'hash', // 'hash' or 'history'
    defaultRoute = '/',
    onRouteChange = null
  } = options;

  return {
    name: 'router',

    install(ctx) {
      // Create reactive state for route
      const state = ctx.createReactiveState({
        currentRoute: '',
        params: {},
        path: defaultRoute
      });

      /**
       * Match route pattern against path and extract params
       * Pattern: '/users/:id/posts/:postId'
       * Path: '/users/123/posts/456'
       * Result: { id: '123', postId: '456' }
       */
      function matchRoute(path) {
        // Try to match each route pattern
        for (const [pattern, routeName] of Object.entries(routes)) {
          // Escape special regex chars except for :param
          const regex = new RegExp(
            '^' +
            pattern
              .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
              .replace(/:(\w+)/g, '(?<$1>[^/]+)') +    // Replace :param with capture group
            '$'
          );

          const match = path.match(regex);
          if (match) {
            return {
              name: routeName,
              params: match.groups || {},
              path: path
            };
          }
        }

        // Return 404 if no match
        return {
          name: '404',
          params: {},
          path: path
        };
      }

      /**
       * Update current route based on location
       */
      function updateRoute() {
        const path = mode === 'hash'
          ? window.location.hash.slice(1) || defaultRoute
          : window.location.pathname;

        const route = matchRoute(path);

        // Update state
        state.currentRoute = route.name;
        state.params = route.params;
        state.path = path;

        // Show/hide route elements
        document.querySelectorAll('[data-route]').forEach(el => {
          el.style.display = el.dataset.route === route.name ? '' : 'none';
        });

        // Call callback if provided
        if (typeof onRouteChange === 'function') {
          onRouteChange(route);
        }
      }

      /**
       * Navigate to path
       */
      function push(path) {
        if (mode === 'hash') {
          window.location.hash = path;
        } else {
          history.pushState({}, '', path);
          updateRoute();
        }
      }

      /**
       * Navigate without adding to history
       */
      function replace(path) {
        if (mode === 'hash') {
          window.location.replace('#' + path);
        } else {
          history.replaceState({}, '', path);
          updateRoute();
        }
      }

      /**
       * Go back in history
       */
      function back() {
        history.back();
      }

      /**
       * Go forward in history
       */
      function forward() {
        history.forward();
      }

      /**
       * Go to specific history position
       */
      function go(n) {
        history.go(n);
      }

      // Set up global router API
      window.rnxRouter = {
        push,
        replace,
        back,
        forward,
        go,
        state,
        currentRoute: () => state.currentRoute,
        params: () => state.params,
        path: () => state.path
      };

      // Listen for route changes
      if (mode === 'hash') {
        window.addEventListener('hashchange', updateRoute);
      } else {
        window.addEventListener('popstate', updateRoute);
      }

      // Initial route
      updateRoute();

      console.log('[rnxJS Router] Initialized with routes:', Object.keys(routes));
    }
  };
}

export default routerPlugin;
