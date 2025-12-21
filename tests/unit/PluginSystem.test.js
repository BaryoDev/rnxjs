import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PluginManager } from '../../utils/plugins.js';

describe('Plugin System', () => {
  let manager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('PluginManager', () => {
    it('should be created', () => {
      expect(manager).toBeDefined();
      expect(manager.plugins).toBeInstanceOf(Map);
      expect(manager.hooks).toBeInstanceOf(Map);
    });

    it('should register a plugin object', () => {
      const plugin = {
        name: 'test-plugin',
        install: vi.fn()
      };

      manager.use(plugin);

      expect(manager.hasPlugin('test-plugin')).toBe(true);
      expect(plugin.install).toHaveBeenCalled();
    });

    it('should register a plugin factory function', () => {
      const factory = vi.fn(() => ({
        name: 'factory-plugin',
        install: vi.fn()
      }));

      manager.use(factory, { option: 'value' });

      expect(factory).toHaveBeenCalledWith({ option: 'value' });
      expect(manager.hasPlugin('factory-plugin')).toBe(true);
    });

    it('should prevent duplicate plugin registration', () => {
      const plugin1 = {
        name: 'duplicate',
        install: vi.fn()
      };

      const plugin2 = {
        name: 'duplicate',
        install: vi.fn()
      };

      manager.use(plugin1);
      manager.use(plugin2);

      expect(plugin2.install).not.toHaveBeenCalled();
      expect(manager.getPlugins().size).toBe(1);
    });

    it('should throw on invalid plugin', () => {
      expect(() => manager.use(null)).toThrow();
      expect(() => manager.use({})).toThrow(); // No name
      expect(() => manager.use({ name: 123 })).toThrow(); // Invalid name type
    });

    it('should call plugin install hook', () => {
      const install = vi.fn();
      const plugin = {
        name: 'test',
        install
      };

      manager.use(plugin);

      expect(install).toHaveBeenCalled();
      expect(install.mock.calls[0][0]).toHaveProperty('plugins');
    });

    it('should register plugin hooks', () => {
      const hookHandler = vi.fn();
      const plugin = {
        name: 'test',
        hooks: {
          'custom:hook': hookHandler
        }
      };

      manager.use(plugin);

      expect(manager.hooks.get('custom:hook')).toContain(hookHandler);
    });

    it('should get registered plugin', () => {
      const plugin = { name: 'test' };
      manager.use(plugin);

      expect(manager.getPlugin('test')).toBe(plugin);
      expect(manager.getPlugin('nonexistent')).toBeUndefined();
    });

    it('should check if plugin is registered', () => {
      const plugin = { name: 'test' };
      manager.use(plugin);

      expect(manager.hasPlugin('test')).toBe(true);
      expect(manager.hasPlugin('other')).toBe(false);
    });

    it('should return copy of all plugins', () => {
      const plugin1 = { name: 'plugin1' };
      const plugin2 = { name: 'plugin2' };

      manager.use(plugin1);
      manager.use(plugin2);

      const plugins = manager.getPlugins();
      expect(plugins.size).toBe(2);
      expect(plugins.get('plugin1')).toBe(plugin1);
      expect(plugins.get('plugin2')).toBe(plugin2);
    });
  });

  describe('Hook System', () => {
    it('should add hook handler', () => {
      const handler = vi.fn();
      manager.addHook('test:event', handler);

      expect(manager.hooks.get('test:event')).toContain(handler);
    });

    it('should run all hooks for a name', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.addHook('test:event', handler1);
      manager.addHook('test:event', handler2);

      await manager.runHook('test:event', { data: 'test' });

      expect(handler1).toHaveBeenCalledWith({ data: 'test' });
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle nonexistent hooks gracefully', async () => {
      await manager.runHook('nonexistent', {});
      // Should not throw
    });

    it('should continue on hook error', async () => {
      const handler1 = vi.fn(() => { throw new Error('Hook error'); });
      const handler2 = vi.fn();

      manager.addHook('test', handler1);
      manager.addHook('test', handler2);

      await manager.runHook('test', {});

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should throw on invalid hook parameters', () => {
      expect(() => manager.addHook(123, () => {})).toThrow();
      expect(() => manager.addHook('test', 'not a function')).toThrow();
    });

    it('should support multiple handlers per hook', async () => {
      const handlers = [vi.fn(), vi.fn(), vi.fn()];
      handlers.forEach((h, i) => manager.addHook('test', h));

      await manager.runHook('test', {});

      handlers.forEach(h => expect(h).toHaveBeenCalled());
    });
  });

  describe('Plugin Context', () => {
    it('should provide context to plugins', () => {
      let ctx;
      const plugin = {
        name: 'test',
        install(context) {
          ctx = context;
        }
      };

      manager.use(plugin);

      expect(ctx).toHaveProperty('plugins');
      expect(ctx).toHaveProperty('addHook');
      expect(ctx).toHaveProperty('runHook');
    });

    it('should support nested plugin installation', () => {
      let installCount = 0;

      const plugin1 = {
        name: 'plugin1',
        install: (ctx) => {
          installCount++;
          expect(ctx.plugins).toBeInstanceOf(Map);
        }
      };

      const plugin2 = {
        name: 'plugin2',
        install: (ctx) => {
          installCount++;
        }
      };

      manager.use(plugin1);
      manager.use(plugin2);

      expect(installCount).toBe(2);
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should call install on plugin registration', () => {
      const install = vi.fn();

      manager.use({
        name: 'test',
        install
      });

      expect(install).toHaveBeenCalledTimes(1);
    });

    it('should handle install errors', () => {
      const plugin = {
        name: 'error-plugin',
        install: () => {
          throw new Error('Install failed');
        }
      };

      expect(() => manager.use(plugin)).toThrow();
      expect(manager.hasPlugin('error-plugin')).toBe(false);
    });

    it('should support post-install hooks', async () => {
      const postInstall = vi.fn();

      const plugin = {
        name: 'test',
        install: (ctx) => {
          ctx.addHook('plugin:installed', postInstall);
        }
      };

      manager.use(plugin);
      await manager.runHook('plugin:installed', { name: 'test' });

      expect(postInstall).toHaveBeenCalled();
    });
  });
});
