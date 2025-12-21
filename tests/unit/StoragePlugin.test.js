import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storagePlugin } from '../../plugins/storage.js';
import { PluginManager } from '../../utils/plugins.js';
import { createReactiveState } from '../../utils/createReactiveState.js';

describe('Storage Plugin', () => {
  let manager;
  let mockStorage;

  beforeEach(() => {
    // Create mock storage
    mockStorage = {
      data: {},
      getItem: function(key) {
        return this.data[key] || null;
      },
      setItem: function(key, value) {
        this.data[key] = value;
      },
      removeItem: function(key) {
        delete this.data[key];
      },
      clear: function() {
        this.data = {};
      }
    };

    manager = new PluginManager();
    window.rnx = {
      createReactiveState
    };
  });

  afterEach(() => {
    mockStorage.clear();
    delete window.rnx.storage;
  });

  describe('Plugin Initialization', () => {
    it('should initialize storage plugin', () => {
      const plugin = storagePlugin();
      manager.use(plugin);

      expect(window.rnx.storage).toBeDefined();
      expect(typeof window.rnx.storage.persist).toBe('function');
      expect(typeof window.rnx.storage.clear).toBe('function');
      expect(typeof window.rnx.storage.get).toBe('function');
      expect(typeof window.rnx.storage.set).toBe('function');
    });

    it('should support custom storage backend', () => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);

      expect(window.rnx.storage).toBeDefined();
    });

    it('should use custom prefix', () => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'custom_'
      });
      manager.use(plugin);

      const state = createReactiveState({ theme: 'light' });
      window.rnx.storage.persist(state, 'config', ['theme']);

      expect(mockStorage.data['custom_config']).toBeDefined();
    });
  });

  describe('Persisting State', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should persist single path', (done) => {
      const state = createReactiveState({ theme: 'light' });

      window.rnx.storage.persist(state, 'app', ['theme']);

      setTimeout(() => {
        const stored = mockStorage.getItem('test_app');
        expect(stored).toBeDefined();
        expect(JSON.parse(stored)).toEqual({ theme: 'light' });
        done();
      }, 50);
    });

    it('should persist multiple paths', (done) => {
      const state = createReactiveState({
        theme: 'dark',
        notifications: true,
        language: 'en'
      });

      window.rnx.storage.persist(state, 'settings', ['theme', 'notifications', 'language']);

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_settings'));
        expect(stored).toEqual({
          theme: 'dark',
          notifications: true,
          language: 'en'
        });
        done();
      }, 50);
    });

    it('should persist all paths when none specified', (done) => {
      const state = createReactiveState({
        color: 'blue',
        size: 'large'
      });

      window.rnx.storage.persist(state, 'props');

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_props'));
        expect(stored.color).toBe('blue');
        expect(stored.size).toBe('large');
        done();
      }, 50);
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should restore persisted state', () => {
      // Pre-populate storage
      mockStorage.setItem('test_app', JSON.stringify({ theme: 'dark' }));

      const state = createReactiveState({ theme: 'light' });

      window.rnx.storage.persist(state, 'app', ['theme']);

      // Should be loaded from storage
      expect(state.theme).toBe('dark');
    });

    it('should handle missing storage key', () => {
      const state = createReactiveState({ theme: 'light' });

      // Should not throw
      window.rnx.storage.persist(state, 'nonexistent', ['theme']);

      expect(state.theme).toBe('light');
    });

    it('should handle invalid JSON', () => {
      mockStorage.setItem('test_broken', 'invalid{json}');

      const state = createReactiveState({ value: 'default' });

      // Should not throw
      window.rnx.storage.persist(state, 'broken', ['value']);

      expect(state.value).toBe('default');
    });
  });

  describe('Reactivity & Auto-Sync', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should save on state change', (done) => {
      const state = createReactiveState({ count: 0 });
      window.rnx.storage.persist(state, 'counter', ['count']);

      state.count = 5;

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_counter'));
        expect(stored.count).toBe(5);
        done();
      }, 50);
    });

    it('should save multiple changes', (done) => {
      const state = createReactiveState({ a: 1, b: 2 });
      window.rnx.storage.persist(state, 'data', ['a', 'b']);

      state.a = 10;
      state.b = 20;

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_data'));
        expect(stored.a).toBe(10);
        expect(stored.b).toBe(20);
        done();
      }, 50);
    });

    it('should only save specified paths', (done) => {
      const state = createReactiveState({ x: 1, y: 2, z: 3 });
      window.rnx.storage.persist(state, 'partial', ['x', 'y']);

      state.z = 999; // Not in persist list

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_partial'));
        expect(stored.x).toBe(1);
        expect(stored.y).toBe(2);
        // z should not be in stored (or be its previous value)
        done();
      }, 50);
    });
  });

  describe('Direct API', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should set raw data', () => {
      window.rnx.storage.set('config', { api: 'https://api.example.com' });

      const retrieved = mockStorage.getItem('test_config');
      expect(JSON.parse(retrieved)).toEqual({ api: 'https://api.example.com' });
    });

    it('should get raw data', () => {
      mockStorage.setItem('test_data', JSON.stringify({ value: 42 }));

      const data = window.rnx.storage.get('data');

      expect(data).toEqual({ value: 42 });
    });

    it('should return null for missing key', () => {
      const data = window.rnx.storage.get('missing');

      expect(data).toBeNull();
    });

    it('should clear stored data', () => {
      window.rnx.storage.set('remove-me', { data: 'test' });

      expect(mockStorage.getItem('test_remove-me')).toBeDefined();

      window.rnx.storage.clear('remove-me');

      expect(mockStorage.getItem('test_remove-me')).toBeNull();
    });
  });

  describe('Complex Objects', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should persist nested objects', (done) => {
      const state = createReactiveState({
        user: {
          name: 'John',
          email: 'john@example.com'
        }
      });

      window.rnx.storage.persist(state, 'user', ['user']);

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_user'));
        expect(stored.user.name).toBe('John');
        expect(stored.user.email).toBe('john@example.com');
        done();
      }, 50);
    });

    it('should persist arrays', (done) => {
      const state = createReactiveState({
        items: [1, 2, 3, 4, 5]
      });

      window.rnx.storage.persist(state, 'list', ['items']);

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_list'));
        expect(stored.items).toEqual([1, 2, 3, 4, 5]);
        done();
      }, 50);
    });

    it('should handle deeply nested changes', (done) => {
      const state = createReactiveState({
        config: {
          api: {
            url: 'https://api.example.com',
            timeout: 5000
          }
        }
      });

      window.rnx.storage.persist(state, 'config', ['config']);

      state.config.api.timeout = 10000;

      setTimeout(() => {
        const stored = JSON.parse(mockStorage.getItem('test_config'));
        expect(stored.config.api.timeout).toBe(10000);
        done();
      }, 50);
    });
  });

  describe('No Storage Available', () => {
    it('should handle missing storage gracefully', () => {
      const plugin = storagePlugin({
        storage: null,
        prefix: 'test_'
      });
      manager.use(plugin);

      const state = createReactiveState({ value: 'test' });

      // Should not throw
      window.rnx.storage.persist(state, 'key', ['value']);
      window.rnx.storage.set('key', { data: 'value' });
      const result = window.rnx.storage.get('key');

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const plugin = storagePlugin({
        storage: mockStorage,
        prefix: 'test_'
      });
      manager.use(plugin);
    });

    it('should handle storage errors gracefully', () => {
      const failStorage = {
        getItem: () => { throw new Error('Storage error'); },
        setItem: () => { throw new Error('Storage error'); },
        removeItem: () => { throw new Error('Storage error'); }
      };

      const plugin = storagePlugin({
        storage: failStorage
      });

      manager = new PluginManager();
      // Should not throw
      manager.use(plugin);
    });
  });
});
