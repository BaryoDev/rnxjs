import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bindData, unbindData } from '../../framework/DataBinder.js';
import { createReactiveState } from '../../utils/createReactiveState.ts';
import { storagePlugin } from '../../plugins/storage.js';
import { PluginManager } from '../../utils/plugins.js';

describe('prototype pollution guards', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
        delete Object.prototype.polluted;
    });

    describe('DataBinder', () => {
        let container;
        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });
        afterEach(() => {
            unbindData(container);
            container.remove();
        });

        it.each(['__proto__.polluted', 'constructor.prototype.polluted', 'user.__proto__.polluted'])(
            'data-bind="%s" does not reach Object.prototype',
            (path) => {
                const state = createReactiveState({ user: { name: '' } });
                container.innerHTML = `<input data-bind="${path}" />`;
                bindData(container, state);
                const input = container.querySelector('input');
                input.value = 'yes';
                input.dispatchEvent(new Event('input'));
                state.$flushSync();
                expect({}.polluted).toBeUndefined();
            }
        );

        it('still binds a normal nested path', () => {
            const state = createReactiveState({ user: { name: '' } });
            container.innerHTML = '<input data-bind="user.name" />';
            bindData(container, state);
            const input = container.querySelector('input');
            input.value = 'Ann';
            input.dispatchEvent(new Event('input'));
            state.$flushSync();
            expect(state.user.name).toBe('Ann');
        });
    });

    describe('storage plugin', () => {
        let store;
        let manager;
        beforeEach(() => {
            store = {
                data: {},
                getItem(k) { return this.data[k] ?? null; },
                setItem(k, v) { this.data[k] = v; },
                removeItem(k) { delete this.data[k]; },
            };
            manager = new PluginManager();
            window.rnx = { createReactiveState };
            manager.use(storagePlugin({ storage: store, prefix: 't_' }));
        });
        afterEach(() => { delete window.rnx.storage; });

        it('does not pollute Object.prototype from stored keys', () => {
            store.setItem('t_app', JSON.stringify({ '__proto__.polluted': 'yes', theme: 'dark' }));
            const state = createReactiveState({ theme: 'light' });
            window.rnx.storage.persist(state, 'app', ['theme', '__proto__.polluted']);
            expect({}.polluted).toBeUndefined();
            expect(state.theme).toBe('dark');
        });

        it('restores only watched paths', () => {
            store.setItem('t_app', JSON.stringify({ theme: 'dark', role: 'admin' }));
            const state = createReactiveState({ theme: 'light', role: 'user' });
            window.rnx.storage.persist(state, 'app', ['theme']);
            expect(state.theme).toBe('dark');
            expect(state.role).toBe('user');
        });
    });
});
