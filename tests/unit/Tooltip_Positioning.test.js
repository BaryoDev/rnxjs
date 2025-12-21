/**
 * Tests for Tooltip positioning and behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';

describe('Tooltip Positioning', () => {
    let container;
    let targetElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        targetElement = document.createElement('button');
        targetElement.textContent = 'Hover me';
        container.appendChild(targetElement);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render tooltip element', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip'
        });

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();

            done();
        }, 50);
    });

    it('should position tooltip on top by default', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'top'
        });

        tooltip.show();

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();
            expect(tooltipElement.classList.contains('top')).toBe(true);

            done();
        }, 50);
    });

    it('should position tooltip on bottom', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'bottom'
        });

        tooltip.show();

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('bottom')).toBe(true);

            done();
        }, 50);
    });

    it('should position tooltip on left', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'left'
        });

        tooltip.show();

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('left')).toBe(true);

            done();
        }, 50);
    });

    it('should position tooltip on right', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'right'
        });

        tooltip.show();

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('right')).toBe(true);

            done();
        }, 50);
    });

    it('should show tooltip on mouse enter', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            delay: 0
        });

        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        targetElement.dispatchEvent(mouseEnterEvent);

        setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();
            expect(tooltipElement.classList.contains('visible')).toBe(true);

            done();
        }, 50);
    });

    it('should hide tooltip on mouse leave', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            delay: 0
        });

        tooltip.show();

        setTimeout(() => {
            const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
            targetElement.dispatchEvent(mouseLeaveEvent);

            setTimeout(() => {
                const tooltipElement = document.querySelector('.tooltip');
                expect(tooltipElement.classList.contains('visible')).toBe(false);

                done();
            }, 50);
        }, 50);
    });

    it('should respect delay setting', (done) => {
        const delay = 100;
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            delay: delay
        });

        const startTime = Date.now();
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        targetElement.dispatchEvent(mouseEnterEvent);

        // Tooltip should not be visible immediately
        setTimeout(() => {
            let tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement === null || !tooltipElement.classList.contains('visible')).toBe(true);

            // Wait for delay
            setTimeout(() => {
                tooltipElement = document.querySelector('.tooltip');
                expect(tooltipElement).not.toBeNull();

                done();
            }, delay + 50);
        }, 10);
    });

    it('should update content dynamically', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Initial content'
        });

        tooltip.show();

        setTimeout(() => {
            tooltip.setContent('Updated content');

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.textContent).toContain('Updated content');

            done();
        }, 50);
    });

    it('should display arrow when enabled', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            arrow: true
        });

        tooltip.show();

        setTimeout(() => {
            const arrow = document.querySelector('.tooltip-arrow');
            expect(arrow).not.toBeNull();

            done();
        }, 50);
    });

    it('should not display arrow when disabled', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            arrow: false
        });

        tooltip.show();

        setTimeout(() => {
            const arrow = document.querySelector('.tooltip-arrow');
            expect(arrow).toBeNull();

            done();
        }, 50);
    });

    it('should destroy tooltip and remove from DOM', (done) => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip'
        });

        tooltip.show();

        setTimeout(() => {
            tooltip.destroy();

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).toBeNull();

            done();
        }, 50);
    });
});
