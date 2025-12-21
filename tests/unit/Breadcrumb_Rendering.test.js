/**
 * Tests for Breadcrumb rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb.js';

describe('Breadcrumb Rendering', () => {
    let container;
    const mockItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics', href: '/products/electronics', active: true }
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

    it('should render nav element', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const nav = container.querySelector('nav[aria-label="breadcrumb"]');
            expect(nav).not.toBeNull();

            done();
        }, 50);
    });

    it('should render breadcrumb list', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const ol = container.querySelector('ol.breadcrumb');
            expect(ol).not.toBeNull();

            done();
        }, 50);
    });

    it('should render all breadcrumb items', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const items = container.querySelectorAll('.breadcrumb-item');
            expect(items.length).toBe(mockItems.length);

            done();
        }, 50);
    });

    it('should render links for non-active items', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const links = container.querySelectorAll('.breadcrumb-item a');
            expect(links.length).toBe(2); // First two items are links

            done();
        }, 50);
    });

    it('should render active item as span', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const spans = container.querySelectorAll('.breadcrumb-item.active span');
            expect(spans.length).toBeGreaterThan(0);

            done();
        }, 50);
    });

    it('should have correct links', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const links = container.querySelectorAll('.breadcrumb-item a');
            expect(links[0].href).toContain('/');
            expect(links[1].href).toContain('/products');

            done();
        }, 50);
    });

    it('should render custom separator', (done) => {
        const breadcrumb = Breadcrumb({
            items: mockItems,
            separator: '>'
        });

        container.appendChild(breadcrumb);

        setTimeout(() => {
            const separators = container.querySelectorAll('.breadcrumb-separator');
            expect(separators.length).toBeGreaterThan(0);
            expect(separators[0].textContent.trim()).toBe('>');

            done();
        }, 50);
    });

    it('should render default separator', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const separators = container.querySelectorAll('.breadcrumb-separator');
            expect(separators[0].textContent.trim()).toBe('/');

            done();
        }, 50);
    });

    it('should mark active item with active class', (done) => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const activeItem = container.querySelector('.breadcrumb-item.active');
            expect(activeItem).not.toBeNull();
            expect(activeItem.textContent).toContain('Electronics');

            done();
        }, 50);
    });

    it('should escape HTML in labels', (done) => {
        const maliciousItems = [
            { label: '<script>alert("xss")</script>', href: '/' },
            { label: '<img src=x onerror=alert(1)>', href: '/test', active: true }
        ];

        const breadcrumb = Breadcrumb({ items: maliciousItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const text = container.textContent;
            expect(text).toContain('<script>');

            const scripts = container.querySelectorAll('script');
            expect(scripts.length).toBe(0);

            done();
        }, 50);
    });

    it('should escape HTML in hrefs', (done) => {
        const maliciousItems = [
            { label: 'Safe', href: 'javascript:alert("xss")' },
            { label: 'Active', href: 'javascript:void(0)', active: true }
        ];

        const breadcrumb = Breadcrumb({ items: maliciousItems });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const links = container.querySelectorAll('.breadcrumb-item a');
            if (links.length > 0) {
                expect(links[0].href).toContain('javascript%3Aalert');
            }

            done();
        }, 50);
    });

    it('should apply custom className', (done) => {
        const breadcrumb = Breadcrumb({
            items: mockItems,
            className: 'my-custom-breadcrumb'
        });

        container.appendChild(breadcrumb);

        setTimeout(() => {
            const ol = container.querySelector('ol.breadcrumb');
            expect(ol.classList.contains('my-custom-breadcrumb')).toBe(true);

            done();
        }, 50);
    });

    it('should handle single item', (done) => {
        const breadcrumb = Breadcrumb({
            items: [{ label: 'Home', href: '/', active: true }]
        });

        container.appendChild(breadcrumb);

        setTimeout(() => {
            const items = container.querySelectorAll('.breadcrumb-item');
            expect(items.length).toBe(1);

            done();
        }, 50);
    });

    it('should handle multiple items without active', (done) => {
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' }
        ];

        const breadcrumb = Breadcrumb({ items });
        container.appendChild(breadcrumb);

        setTimeout(() => {
            const links = container.querySelectorAll('.breadcrumb-item a');
            expect(links.length).toBe(3);

            done();
        }, 50);
    });

    it('should throw error for empty items', () => {
        expect(() => {
            Breadcrumb({ items: [] });
        }).toThrow('items must be a non-empty array');
    });

    it('should throw error for missing items', () => {
        expect(() => {
            Breadcrumb({});
        }).toThrow('items must be a non-empty array');
    });
});
