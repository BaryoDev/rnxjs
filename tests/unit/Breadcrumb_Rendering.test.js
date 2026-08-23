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

    it('should render nav element', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const nav = container.querySelector('nav[aria-label="breadcrumb"]');
        expect(nav).not.toBeNull();

    });

    it('should render breadcrumb list', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const ol = container.querySelector('ol.breadcrumb');
        expect(ol).not.toBeNull();

    });

    it('should render all breadcrumb items', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const items = container.querySelectorAll('.breadcrumb-item');
        expect(items.length).toBe(mockItems.length);

    });

    it('should render links for non-active items', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const links = container.querySelectorAll('.breadcrumb-item a');
        expect(links.length).toBe(2); // First two items are links

    });

    it('should render active item as span', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const spans = container.querySelectorAll('.breadcrumb-item.active span');
        expect(spans.length).toBeGreaterThan(0);

    });

    it('should have correct links', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const links = container.querySelectorAll('.breadcrumb-item a');
        expect(links[0].href).toContain('/');
        expect(links[1].href).toContain('/products');

    });

    it('should render custom separator', async () => {
        const breadcrumb = Breadcrumb({
            items: mockItems,
            separator: '>'
        });

        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const separators = container.querySelectorAll('.breadcrumb-separator');
        expect(separators.length).toBeGreaterThan(0);
        expect(separators[0].textContent.trim()).toBe('>');

    });

    it('should render default separator', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const separators = container.querySelectorAll('.breadcrumb-separator');
        expect(separators[0].textContent.trim()).toBe('/');

    });

    it('should mark active item with active class', async () => {
        const breadcrumb = Breadcrumb({ items: mockItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const activeItem = container.querySelector('.breadcrumb-item.active');
        expect(activeItem).not.toBeNull();
        expect(activeItem.textContent).toContain('Electronics');

    });

    it('should escape HTML in labels', async () => {
        const maliciousItems = [
            { label: '<script>alert("xss")</script>', href: '/' },
            { label: '<img src=x onerror=alert(1)>', href: '/test', active: true }
        ];

        const breadcrumb = Breadcrumb({ items: maliciousItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const text = container.textContent;
        expect(text).toContain('<script>');

        const scripts = container.querySelectorAll('script');
        expect(scripts.length).toBe(0);

    });

    it('should escape HTML in hrefs', async () => {
        const maliciousItems = [
            { label: 'Safe', href: 'javascript:alert("xss")' },
            { label: 'Active', href: 'javascript:void(0)', active: true }
        ];

        const breadcrumb = Breadcrumb({ items: maliciousItems });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const links = container.querySelectorAll('.breadcrumb-item a');
        if (links.length > 0) {
            expect(links[0].href).toContain('javascript%3Aalert');
        }

    });

    it('should apply custom className', async () => {
        const breadcrumb = Breadcrumb({
            items: mockItems,
            className: 'my-custom-breadcrumb'
        });

        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const ol = container.querySelector('ol.breadcrumb');
        expect(ol.classList.contains('my-custom-breadcrumb')).toBe(true);

    });

    it('should handle single item', async () => {
        const breadcrumb = Breadcrumb({
            items: [{ label: 'Home', href: '/', active: true }]
        });

        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const items = container.querySelectorAll('.breadcrumb-item');
        expect(items.length).toBe(1);

    });

    it('should handle multiple items without active', async () => {
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' }
        ];

        const breadcrumb = Breadcrumb({ items });
        container.appendChild(breadcrumb);

        await new Promise(resolve => setTimeout(resolve, 50));
        const links = container.querySelectorAll('.breadcrumb-item a');
        expect(links.length).toBe(3);

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
