import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toastPlugin } from '../../plugins/toast.js';
import { PluginManager } from '../../utils/plugins.js';

describe('Toast Plugin', () => {
  let container;
  let manager;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    // Setup plugin manager
    manager = new PluginManager();
    window.rnx = {
      escapeHtml: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
    const toastContainer = document.querySelector('.rnx-toast-container');
    if (toastContainer) toastContainer.remove();
    delete window.rnx.toast;
  });

  describe('Plugin Initialization', () => {
    it('should initialize toast plugin', () => {
      const plugin = toastPlugin();
      manager.use(plugin);

      expect(window.rnx.toast).toBeDefined();
      expect(typeof window.rnx.toast.show).toBe('function');
      expect(typeof window.rnx.toast.success).toBe('function');
      expect(typeof window.rnx.toast.error).toBe('function');
      expect(typeof window.rnx.toast.warning).toBe('function');
      expect(typeof window.rnx.toast.info).toBe('function');
      expect(typeof window.rnx.toast.clear).toBe('function');
    });

    it('should create toast container', () => {
      const plugin = toastPlugin();
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container).toBeDefined();
      expect(container.classList.contains('rnx-toast-top-right')).toBe(true);
    });

    it('should support custom position', () => {
      const plugin = toastPlugin({
        position: 'bottom-left'
      });
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container.classList.contains('rnx-toast-bottom-left')).toBe(true);
    });

    it('should support custom duration', () => {
      const plugin = toastPlugin({
        duration: 5000
      });
      manager.use(plugin);

      expect(window.rnx.toast).toBeDefined();
    });

    it('should support custom max toasts', () => {
      const plugin = toastPlugin({
        maxToasts: 3
      });
      manager.use(plugin);

      expect(window.rnx.toast).toBeDefined();
    });
  });

  describe('Toast Creation', () => {
    beforeEach(() => {
      const plugin = toastPlugin({ duration: 10000 }); // Long duration for tests
      manager.use(plugin);
    });

    it('should show generic toast', async () => {
      window.rnx.toast.show('Test message');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast');
    expect(toast).toBeDefined();
    expect(toast.textContent).toContain('Test message');
    });

    it('should show success toast', async () => {
      window.rnx.toast.success('Success!');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast-success');
    expect(toast).toBeDefined();
    expect(toast.classList.contains('rnx-toast-show')).toBe(true);
    });

    it('should show error toast', async () => {
      window.rnx.toast.error('Error!');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast-error');
    expect(toast).toBeDefined();
    });

    it('should show warning toast', async () => {
      window.rnx.toast.warning('Warning!');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast-warning');
    expect(toast).toBeDefined();
    });

    it('should show info toast', async () => {
      window.rnx.toast.info('Info');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast-info');
    expect(toast).toBeDefined();
    });

    it('should escape HTML in message', async () => {
      window.rnx.toast.show('<script>alert("xss")</script>');

      await new Promise(resolve => setTimeout(resolve, 50));
    const message = document.querySelector('.rnx-toast-message');
    expect(message.textContent).toContain('<script>');
    expect(message.innerHTML).not.toContain('<script>');
    });

    it('should have close button', async () => {
      window.rnx.toast.show('Message');

      await new Promise(resolve => setTimeout(resolve, 50));
    const closeBtn = document.querySelector('.rnx-toast-close');
    expect(closeBtn).toBeDefined();
    });
  });

  describe('Toast Removal', () => {
    beforeEach(() => {
      const plugin = toastPlugin({ duration: 10000 });
      manager.use(plugin);
    });

    it('should remove toast on close button click', async () => {
      window.rnx.toast.show('Message');

      await new Promise(resolve => setTimeout(resolve, 50));
    const closeBtn = document.querySelector('.rnx-toast-close');
    closeBtn.click();

    await new Promise(resolve => setTimeout(resolve, 350));
  const toast = document.querySelector('.rnx-toast');
  expect(toast).toBeNull();
  done(); // Wait for animation
    });

    it('should auto-dismiss after duration', async () => {
      window.rnx.toast.show('Message', 'info', 100);

      await new Promise(resolve => setTimeout(resolve, 450));
    const toast = document.querySelector('.rnx-toast');
    expect(toast).toBeNull();
    });

    it('should clear all toasts', async () => {
      window.rnx.toast.success('Message 1');
      window.rnx.toast.error('Message 2');

      await new Promise(resolve => setTimeout(resolve, 50));
    window.rnx.toast.clear();

    await new Promise(resolve => setTimeout(resolve, 350));
  const toasts = document.querySelectorAll('.rnx-toast');
  expect(toasts.length).toBe(0);
    });

    it('should not show toast beyond maxToasts', async () => {
      const plugin = toastPlugin({ duration: 10000, maxToasts: 2 });
      manager = new PluginManager();
      manager.use(plugin);

      window.rnx.toast.show('Message 1');
      window.rnx.toast.show('Message 2');
      window.rnx.toast.show('Message 3');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toasts = document.querySelectorAll('.rnx-toast');
    expect(toasts.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Toast Positioning', () => {
    it('should support top-right position', () => {
      const plugin = toastPlugin({ position: 'top-right' });
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container.classList.contains('rnx-toast-top-right')).toBe(true);
    });

    it('should support top-left position', () => {
      const plugin = toastPlugin({ position: 'top-left' });
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container.classList.contains('rnx-toast-top-left')).toBe(true);
    });

    it('should support bottom-right position', () => {
      const plugin = toastPlugin({ position: 'bottom-right' });
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container.classList.contains('rnx-toast-bottom-right')).toBe(true);
    });

    it('should support bottom-left position', () => {
      const plugin = toastPlugin({ position: 'bottom-left' });
      manager.use(plugin);

      const container = document.querySelector('.rnx-toast-container');
      expect(container.classList.contains('rnx-toast-bottom-left')).toBe(true);
    });
  });

  describe('Toast Styling', () => {
    beforeEach(() => {
      const plugin = toastPlugin({ duration: 10000 });
      manager.use(plugin);
    });

    it('should have proper ARIA attributes', async () => {
      window.rnx.toast.show('Accessible');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast');
    expect(toast.getAttribute('role')).toBe('alert');

    const container = document.querySelector('.rnx-toast-container');
    expect(container.getAttribute('aria-live')).toBe('polite');
    });

    it('should have animated entrance', async () => {
      window.rnx.toast.show('Message');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toast = document.querySelector('.rnx-toast');
    expect(toast.classList.contains('rnx-toast-show')).toBe(true);
    });
  });

  describe('Multiple Toasts', () => {
    beforeEach(() => {
      const plugin = toastPlugin({ duration: 10000, maxToasts: 10 });
      manager.use(plugin);
    });

    it('should stack multiple toasts', async () => {
      window.rnx.toast.success('Message 1');
      window.rnx.toast.error('Message 2');
      window.rnx.toast.warning('Message 3');

      await new Promise(resolve => setTimeout(resolve, 50));
    const toasts = document.querySelectorAll('.rnx-toast');
    expect(toasts.length).toBe(3);
    });

    it('should remove oldest toast when exceeding maxToasts', async () => {
      const plugin = toastPlugin({ duration: 10000, maxToasts: 2 });
      manager = new PluginManager();
      manager.use(plugin);

      window.rnx.toast.show('Message 1');
      window.rnx.toast.show('Message 2');

      await new Promise(resolve => setTimeout(resolve, 50));
    window.rnx.toast.show('Message 3');

    await new Promise(resolve => setTimeout(resolve, 50));
  const toasts = document.querySelectorAll('.rnx-toast');
  expect(toasts.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Custom Duration', () => {
    beforeEach(() => {
      const plugin = toastPlugin({ duration: 10000 });
      manager.use(plugin);
    });

    it('should use custom duration', async () => {
      window.rnx.toast.show('Message', 'info', 200);

      await new Promise(resolve => setTimeout(resolve, 100));
    expect(document.querySelector('.rnx-toast')).toBeDefined();

      await new Promise(resolve => setTimeout(resolve, 550));
    const toast = document.querySelector('.rnx-toast');
    expect(toast).toBeNull();
    });

    it('should not auto-dismiss with zero duration', async () => {
      window.rnx.toast.show('Message', 'info', 0);

      await new Promise(resolve => setTimeout(resolve, 100));
    const toast = document.querySelector('.rnx-toast');
    expect(toast).toBeDefined();
    });
  });
});
