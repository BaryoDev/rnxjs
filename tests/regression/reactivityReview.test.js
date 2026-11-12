import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createReactiveState } from '../../utils/createReactiveState.ts';
import { createReactiveState as createReactiveStateJs } from '../../utils/createReactiveState.js';
import { createComponent } from '../../utils/createComponent.js';
import { bindData } from '../../framework/DataBinder.js';

describe.each([
    ['ts', createReactiveState],
    ['js', createReactiveStateJs],
])('createReactiveState paths and delete (%s)', (_name, make) => {
    it('notifies the new path after reverse', () => {
        const state = make({ items: [{ done: false }, { done: false }] });
        const seen = [];
        state.subscribe('items.0.done', v => seen.push(['0', v]));
        state.subscribe('items.1.done', v => seen.push(['1', v]));

        void state.items[0].done; // reading creates the cached proxies at the old paths
        void state.items[1].done;
        state.items.reverse();
        state.$flushSync();
        seen.length = 0;

        state.items[0].done = true;
        state.$flushSync();
        expect(seen).toEqual([['0', true]]);
    });

    it('notifies the new path after splice and unshift', () => {
        const state = make({ items: [{ n: 1 }, { n: 2 }] });
        const spliced = [];
        state.subscribe('items.2.n', v => spliced.push(v));
        void state.items[1].n;
        state.items.unshift({ n: 0 });
        state.$flushSync();
        spliced.length = 0;

        state.items[2].n = 10;
        state.$flushSync();
        expect(spliced).toEqual([10]);
    });

    it('returns the same proxy for the same path', () => {
        const state = make({ user: { name: 'a' } });
        expect(state.user).toBe(state.user);
    });

    it('notifies on delete', () => {
        const state = make({ user: { name: 'a', age: 3 } });
        const seen = [];
        state.subscribe('user.name', v => seen.push(['name', v]));
        state.subscribe('user', () => seen.push(['user']));

        delete state.user.name;
        state.$flushSync();

        expect('name' in state.user).toBe(false);
        expect(seen).toContainEqual(['name', undefined]);
        expect(seen).toContainEqual(['user']);
    });

    it('does not notify when deleting a missing key', () => {
        const state = make({ user: { name: 'a' } });
        const cb = vi.fn();
        state.subscribe('user.zip', cb);
        delete state.user.zip;
        state.$flushSync();
        expect(cb).not.toHaveBeenCalled();
    });

    it('still copes with a circular object', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const a = { name: 'a' };
        a.self = a;
        const state = make({ a });
        expect(state.a.name).toBe('a');
        expect(() => state.a.self.self.name).not.toThrow();
    });
});

describe('data-for row update', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => container.remove());

    it('updates a row when a field of an existing item changes in place', () => {
        container.innerHTML = '<ul><li data-for="user in users"><span data-bind="user.name"></span></li></ul>';
        const state = createReactiveState({ users: [{ name: 'A' }, { name: 'B' }] });
        bindData(container, state);
        expect(container.querySelector('li').textContent).toBe('A');

        state.users[0].name = 'C';
        state.$flushSync();

        const rows = container.querySelectorAll('li');
        expect(rows[0].textContent).toBe('C');
        expect(rows[1].textContent).toBe('B');
    });
});

describe('createComponent useEffect', () => {
    it('keeps every effect and runs every cleanup', async () => {
        const comp = createComponent(() => '<div></div>');
        const a = vi.fn();
        const b = vi.fn();
        const cleanA = vi.fn();
        const cleanB = vi.fn();
        comp.useEffect(() => { a(); return cleanA; });
        comp.useEffect(() => { b(); return cleanB; });
        document.body.appendChild(comp);
        await new Promise(r => setTimeout(r, 20));
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);

        comp.destroy();
        expect(cleanA).toHaveBeenCalledTimes(1);
        expect(cleanB).toHaveBeenCalledTimes(1);
        comp.remove();
    });
});
