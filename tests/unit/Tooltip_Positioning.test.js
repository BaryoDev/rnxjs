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

    it('should render tooltip element', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip'
        });

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();
    });

    it('should position tooltip on top by default', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'top'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();
            expect(tooltipElement.classList.contains('top')).toBe(true);
    });

    it('should position tooltip on bottom', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'bottom'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('bottom')).toBe(true);
    });

    it('should position tooltip on left', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'left'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('left')).toBe(true);
    });

    it('should position tooltip on right', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            position: 'right'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.classList.contains('right')).toBe(true);
    });

    it('should show tooltip on mouse enter', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            delay: 0
        });

        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        targetElement.dispatchEvent(mouseEnterEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).not.toBeNull();
            expect(tooltipElement.classList.contains('visible')).toBe(true);
    });

    it('should hide tooltip on mouse leave', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            delay: 0
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
            targetElement.dispatchEvent(mouseLeaveEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
                const tooltipElement = document.querySelector('.tooltip');
                expect(tooltipElement.classList.contains('visible')).toBe(false);
    });

    it('should respect delay setting', async () => {
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
        await new Promise(resolve => setTimeout(resolve, 10));
            let tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement === null || !tooltipElement.classList.contains('visible')).toBe(true);

            // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delay + 50));
                tooltipElement = document.querySelector('.tooltip');
                expect(tooltipElement).not.toBeNull();
    });

    it('should update content dynamically', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Initial content'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            tooltip.setContent('Updated content');

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement.textContent).toContain('Updated content');
    });

    it('should display arrow when enabled', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            arrow: true
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const arrow = document.querySelector('.tooltip-arrow');
            expect(arrow).not.toBeNull();
    });

    it('should not display arrow when disabled', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip',
            arrow: false
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            const arrow = document.querySelector('.tooltip-arrow');
            expect(arrow).toBeNull();
    });

    it('should destroy tooltip and remove from DOM', async () => {
        const tooltip = Tooltip({
            element: targetElement,
            content: 'Test tooltip'
        });

        tooltip.show();

        await new Promise(resolve => setTimeout(resolve, 50));
            tooltip.destroy();

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).toBeNull();
    });
});