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
      // A second install replaces the first instead of stacking listeners
      if (window.rnxRouter && typeof window.rnxRouter.destroy === 'function') {
        window.rnxRouter.destroy();
      }

      // Create reactive state for route
      const state = ctx.createReactiveState({
        currentRoute: '',
        params: {},
        query: {},
        path: defaultRoute
      });

      // Compile each pattern once. Param names must be valid group names
      // (a letter, _ or $ first), so a route like '/x/:1' is skipped with a warning.
      const compiled = [];
      for (const [pattern, routeName] of Object.entries(routes)) {
        const bad = /:(\d\w*)/.exec(pattern);
        if (bad) {
          console.warn(`[rnxJS Router] Skipping route "${pattern}": invalid param name ":${bad[1]}"`);
          continue;
        }
        try {
          const regex = new RegExp(
            '^' +
            pattern
              .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
              .replace(/:(\w+)/g, '(?<$1>[^/]+)') +    // Replace :param with capture group
            '/?$'
          );
          compiled.push({ regex, routeName });
        } catch (error) {
          console.warn(`[rnxJS Router] Skipping route "${pattern}":`, error.message);
        }
      }

      function decodeParam(value) {
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }

      /**
       * Match route pattern against path and extract params
       * Pattern: '/users/:id/posts/:postId'
       * Path: '/users/123/posts/456'
       * Result: { id: '123', postId: '456' }
       * Params are URI-decoded. A trailing slash matches the same route.
       */
      function matchRoute(path) {
        for (const { regex, routeName } of compiled) {
          const match = path.match(regex);
          if (match) {
            const params = {};
            for (const [key, value] of Object.entries(match.groups || {})) {
              params[key] = decodeParam(value);
            }
            return { name: routeName, params, path };
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
       * Split a location into path and query. The query never reaches params.
       */
      function readLocation() {
        let raw = mode === 'hash'
          ? window.location.hash.slice(1) || defaultRoute
          : window.location.pathname;

        let search = '';
        const q = raw.indexOf('?');
        if (q !== -1) {
          search = raw.slice(q + 1);
          raw = raw.slice(0, q);
        }
        if (mode !== 'hash') {
          search = window.location.search.slice(1);
        }

        const hashAt = raw.indexOf('#');
        if (hashAt !== -1) raw = raw.slice(0, hashAt);

        const query = {};
        new URLSearchParams(search).forEach((value, key) => { query[key] = value; });

        return { path: raw || defaultRoute, query };
      }

      /**
       * Update current route based on location
       */
      function updateRoute() {
        const { path, query } = readLocation();

        const route = matchRoute(path);

        // Update state
        state.currentRoute = route.name;
        state.params = route.params;
        state.query = query;
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

      const eventName = mode === 'hash' ? 'hashchange' : 'popstate';

      /**
       * Remove the listener and the global API
       */
      function destroy() {
        window.removeEventListener(eventName, updateRoute);
        if (window.rnxRouter === api) {
          delete window.rnxRouter;
        }
      }

      // Set up global router API
      const api = {
        push,
        replace,
        back,
        forward,
        go,
        state,
        currentRoute: () => state.currentRoute,
        params: () => state.params,
        query: () => state.query,
        path: () => state.path,
        destroy
      };
      window.rnxRouter = api;

      // Listen for route changes
      window.addEventListener(eventName, updateRoute);

      // Initial route
      updateRoute();

      console.log('[rnxJS Router] Initialized with routes:', Object.keys(routes));
    }
  };
}

export default routerPlugin;
