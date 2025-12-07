import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createComponent } from '../utils/createComponent.js';

describe('createComponent', () => {
    describe('Basic Rendering', () => {
        it('should create a component from template function', () => {
            const template = () => '<div>Hello World</div>';
            const component = createComponent(template);

            expect(component.tagName).toBe('DIV');
            expect(component.textContent).toBe('Hello World');
        });

        it('should handle initial state', () => {
            const template = (state) => `<div>${state.message}</div>`;
            const component = createComponent(template, { message: 'Test' });

            expect(component.textContent).toBe('Test');
        });

        it('should handle empty template', () => {
            const template = () => '';
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const component = createComponent(template);
            expect(component.textContent).toContain('Component rendering error');

            consoleSpy.mockRestore();
        });
    });

    describe('State Management', () => {
        it('should update component when setState is called', () => {
            const template = (state) => `<div>${state.count}</div>`;
            const component = createComponent(template, { count: 0 });
            document.body.appendChild(component); // Attach to DOM for setState to work

            expect(component.textContent).toBe('0');

            component.setState({ count: 5 });
            expect(document.body.lastChild.textContent).toBe('5');

            document.body.removeChild(document.body.lastChild);
        });

        it('should merge state correctly', () => {
            const template = (state) => `<div>${state.a} ${state.b}</div>`;
            const component = createComponent(template, { a: 1, b: 2 });
            document.body.appendChild(component);

            component.setState({ a: 10 });
            expect(document.body.lastChild.textContent).toBe('10 2');

            document.body.removeChild(document.body.lastChild);
        });

        it('should expose getState method', () => {
            const component = createComponent(() => '<div></div>', { count: 5 });
            expect(component.getState()).toEqual({ count: 5 });
        });
    });

    describe('Refs System', () => {
        it('should populate refs from data-ref attributes', () => {
            const template = () => `
        <div>
          <input data-ref="input" />
          <button data-ref="btn">Click</button>
        </div>
      `;
            const component = createComponent(template);

            expect(component.refs.input).toBeDefined();
            expect(component.refs.input.tagName).toBe('INPUT');
            expect(component.refs.btn).toBeDefined();
            expect(component.refs.btn.tagName).toBe('BUTTON');
        });

        it('should handle missing data-ref names', () => {
            const template = () => '<div><span data-ref="">Test</span></div>';
            const component = createComponent(template);

            expect(Object.keys(component.refs).length).toBe(0);
        });
    });

    describe('Focus Preservation', () => {
        it('should preserve focus on re-render', (done) => {
            const template = (state) => `
        <div>
          <input data-ref="input" value="${state.value}" />
        </div>
      `;
            const component = createComponent(template, { value: 'test' });
            document.body.appendChild(component);

            component.refs.input.focus();
            expect(document.activeElement).toBe(component.refs.input);

            component.setState({ value: 'updated' });

            setTimeout(() => {
                expect(document.activeElement.tagName).toBe('INPUT');
                document.body.removeChild(document.body.lastChild);
                done();
            }, 50);
        });
    });

    describe('useEffect Hook', () => {
        it('should call effect after component renders', (done) => {
            const template = () => '<div>Test</div>';
            const component = createComponent(template);
            const effectFn = vi.fn();

            component.useEffect(effectFn);

            setTimeout(() => {
                expect(effectFn).toHaveBeenCalledWith(component);
                done();
            }, 50);
        });

        it('should call cleanup function on re-render', (done) => {
            const template = (state) => `<div>${state.count}</div>`;
            const component = createComponent(template, { count: 0 });
            const cleanup = vi.fn();

            component.useEffect(() => cleanup);

            setTimeout(() => {
                component.setState({ count: 1 });

                setTimeout(() => {
                    expect(cleanup).toHaveBeenCalled();
                    done();
                }, 50);
            }, 50);
        });

        it('should validate effect function', () => {
            const component = createComponent(() => '<div></div>');
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            component.useEffect('not a function');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('onUnmount Hook', () => {
        it('should call onUnmount when destroy is called', () => {
            const component = createComponent(() => '<div></div>');
            const unmountFn = vi.fn();

            component.onUnmount(unmountFn);
            component.destroy();

            expect(unmountFn).toHaveBeenCalled();
        });

        it('should validate unmount function', () => {
            const component = createComponent(() => '<div></div>');
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            component.onUnmount('not a function');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('useState Hook', () => {
        it('should create state getter and setter', () => {
            const component = createComponent(() => '<div></div>', {});
            const [getCount, setCount] = component.useState('count', 0);

            expect(getCount()).toBe(0);

            setCount(5);
            expect(getCount()).toBe(5);
        });

        it('should not override existing state', () => {
            const component = createComponent(() => '<div></div>', { count: 10 });
            const [getCount] = component.useState('count', 0);

            expect(getCount()).toBe(10);
        });
    });

    describe('Children and Slots', () => {
        it('should insert children into slots', () => {
            const template = () => '<div class="wrapper"><span data-slot></span></div>';
            const child = document.createElement('p');
            child.textContent = 'Child content';

            const component = createComponent(template, { children: child });

            expect(component.querySelector('p')).toBeDefined();
            expect(component.querySelector('p').textContent).toBe('Child content');
        });

        it('should handle array of children', () => {
            const template = () => '<div><span data-slot></span></div>';
            const child1 = document.createElement('p');
            const child2 = document.createElement('span');

            const component = createComponent(template, { children: [child1, child2] });

            expect(component.querySelectorAll('[data-slot] > *').length).toBe(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle template function errors', () => {
            const template = () => {
                throw new Error('Template error');
            };
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const component = createComponent(template);
            expect(component.textContent).toContain('Component error');

            consoleSpy.mockRestore();
        });

        it('should handle setState errors gracefully', () => {
            const template = (state) => {
                if (state.error) throw new Error('Render error');
                return '<div>OK</div>';
            };
            const component = createComponent(template, { error: false });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            component.setState({ error: true });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Cleanup', () => {
        it('should cleanup all resources on destroy', (done) => {
            const component = createComponent(() => '<div data-ref="test"></div>');
            const effectCleanup = vi.fn();
            const unmountCleanup = vi.fn();

            component.useEffect(() => effectCleanup);
            component.onUnmount(unmountCleanup);

            // Wait for effect to run
            setTimeout(() => {
                component.destroy();

                expect(effectCleanup).toHaveBeenCalled();
                expect(unmountCleanup).toHaveBeenCalled();
                expect(Object.keys(component.refs).length).toBe(0);
                done();
            }, 20);
        });
    });
});
