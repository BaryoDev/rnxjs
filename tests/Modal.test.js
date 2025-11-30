
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from '../components/Modal/Modal.js';
import { bs } from '../utils/bootstrap.js';

// Mock window.bootstrap
const mockModalInstance = {
    show: vi.fn(),
    hide: vi.fn(),
    toggle: vi.fn(),
    dispose: vi.fn()
};

const MockModalConstructor = vi.fn(() => mockModalInstance);
MockModalConstructor.getInstance = vi.fn(() => null);

describe('Modal Component Integration', () => {
    beforeEach(() => {
        // Setup global bootstrap mock
        window.bootstrap = {
            Modal: MockModalConstructor
        };
        mockModalInstance.show.mockClear();
        mockModalInstance.hide.mockClear();
        mockModalInstance.toggle.mockClear();
        mockModalInstance.dispose.mockClear();
        MockModalConstructor.mockClear();
        MockModalConstructor.getInstance.mockClear();
    });

    afterEach(() => {
        delete window.bootstrap;
    });

    it('should initialize Bootstrap Modal on mount', () => {
        const modal = Modal({ id: 'test-modal', title: 'Test' });
        document.body.appendChild(modal);

        // Wait for useEffect (increased timeout to 20ms to be safe)
        return new Promise(resolve => {
            setTimeout(() => {
                try {
                    expect(window.bootstrap.Modal).toHaveBeenCalledWith(modal);
                    // Check if methods are attached
                    expect(typeof modal.show).toBe('function');
                    expect(typeof modal.hide).toBe('function');
                } catch (e) {
                    console.error('Initialization Check Failed:', e);
                    throw e;
                }
                resolve();
            }, 20);
        });
    });

    it('should call bootstrap show() when component.show() is called', async () => {
        const modal = Modal({ id: 'test-modal' });
        document.body.appendChild(modal);

        await new Promise(r => setTimeout(r, 20));

        modal.show();
        expect(mockModalInstance.show).toHaveBeenCalled();
    });

    it('should dispose bootstrap instance on destroy/unmount', async () => {
        const modal = Modal({ id: 'test-modal' });
        document.body.appendChild(modal);

        await new Promise(r => setTimeout(r, 20));

        // Simulate unmount/destroy
        modal.destroy();
        expect(mockModalInstance.dispose).toHaveBeenCalled();
    });

    it('should handle missing bootstrap gracefully', async () => {
        // Remove bootstrap
        delete window.bootstrap;

        const modal = Modal({ id: 'test-modal' });
        document.body.appendChild(modal);

        await new Promise(r => setTimeout(r, 20));

        // Should not have attached methods
        expect(modal.show).toBeUndefined();
        // Should not accept calls (no error thrown)
    });

    it('should reuse existing instance if available', async () => {
        const existingInstance = { ...mockModalInstance, id: 'existing' };
        MockModalConstructor.getInstance.mockReturnValue(existingInstance);

        const modal = Modal({ id: 'test-modal' });
        document.body.appendChild(modal);

        await new Promise(r => setTimeout(r, 20));

        // Should NOT have called new constructor
        expect(MockModalConstructor).not.toHaveBeenCalled();
        // But should have attached methods wrapping the existing instance
        modal.show();
        expect(existingInstance.show).toHaveBeenCalled();
    });
});
