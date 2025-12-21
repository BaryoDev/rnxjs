/**
 * Tests for Autocomplete rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Autocomplete } from '../../components/Autocomplete/Autocomplete.js';

describe('Autocomplete Rendering', () => {
    let container;
    const mockItems = [
        { id: 1, label: 'John Doe' },
        { id: 2, label: 'Jane Smith' },
        { id: 3, label: 'Bob Johnson' },
        { id: 4, label: 'Alice Brown' }
    ];

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render autocomplete with input', (done) => {
        const autocomplete = Autocomplete({
            label: 'Select User',
            items: mockItems
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            expect(input).not.toBeNull();
            expect(input.placeholder).toBe('Search...');

            done();
        }, 50);
    });

    it('should render label', (done) => {
        const autocomplete = Autocomplete({
            label: 'Select User',
            items: mockItems
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const label = container.querySelector('label');
            expect(label).not.toBeNull();
            expect(label.textContent).toBe('Select User');

            done();
        }, 50);
    });

    it('should not render label when not provided', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const label = container.querySelector('label');
            expect(label).toBeNull();

            done();
        }, 50);
    });

    it('should render custom placeholder', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            placeholder: 'Type a name...'
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            expect(input.placeholder).toBe('Type a name...');

            done();
        }, 50);
    });

    it('should render dropdown when typing', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'john';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const dropdown = container.querySelector('.autocomplete-dropdown');
                expect(dropdown).not.toBeNull();

                done();
            }, 50);
        }, 50);
    });

    it('should render filtered items', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'john';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const items = container.querySelectorAll('.autocomplete-item');
                expect(items.length).toBe(2); // John Doe and Bob Johnson

                done();
            }, 50);
        }, 50);
    });

    it('should display no results message', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            debounce: 0,
            minChars: 1
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'xyz';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const empty = container.querySelector('.autocomplete-empty');
                expect(empty).not.toBeNull();
                expect(empty.textContent).toContain('No results found');

                done();
            }, 50);
        }, 50);
    });

    it('should render checkboxes in multiple mode', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            multiple: true,
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'j';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const checkboxes = container.querySelectorAll('.autocomplete-item input[type="checkbox"]');
                expect(checkboxes.length).toBeGreaterThan(0);

                done();
            }, 50);
        }, 50);
    });

    it('should display loading indicator for async', (done) => {
        const autocomplete = Autocomplete({
            items: async (query) => {
                return new Promise(resolve => {
                    setTimeout(() => resolve(mockItems), 100);
                });
            },
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'test';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const spinner = container.querySelector('.autocomplete-loading .spinner-border');
                expect(spinner).not.toBeNull();

                done();
            }, 25);
        }, 50);
    });

    it('should render selected tags in multiple mode', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            multiple: true,
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'j';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const item = container.querySelector('.autocomplete-item');
                item.click();

                setTimeout(() => {
                    const tags = container.querySelector('.autocomplete-tags');
                    expect(tags).not.toBeNull();

                    const badges = container.querySelectorAll('.autocomplete-tags .badge');
                    expect(badges.length).toBeGreaterThan(0);

                    done();
                }, 50);
            }, 50);
        }, 50);
    });

    it('should escape HTML in items', (done) => {
        const maliciousItems = [
            { label: '<script>alert("xss")</script>' },
            { label: '<img src=x onerror=alert(1)>' }
        ];

        const autocomplete = Autocomplete({
            items: maliciousItems,
            debounce: 0
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            input.value = 'script';
            input.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const itemText = container.textContent;
                expect(itemText).toContain('<script>');

                const scripts = container.querySelectorAll('script');
                expect(scripts.length).toBe(0);

                done();
            }, 50);
        }, 50);
    });

    it('should handle empty items array', () => {
        expect(() => {
            Autocomplete({
                items: []
            });
        }).not.toThrow();
    });

    it('should apply custom className', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            className: 'my-custom-autocomplete'
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const wrapper = container.querySelector('.autocomplete-wrapper');
            expect(wrapper.classList.contains('my-custom-autocomplete')).toBe(true);

            done();
        }, 50);
    });

    it('should render with initial value', (done) => {
        const autocomplete = Autocomplete({
            items: mockItems,
            value: 'Initial value'
        });

        container.appendChild(autocomplete);

        setTimeout(() => {
            const input = container.querySelector('.autocomplete-input');
            expect(input.value).toBe('Initial value');

            done();
        }, 50);
    });
});
