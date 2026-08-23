/**
 * Tests for ProgressBar rendering and state
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.js';

describe('ProgressBar Rendering', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render progress bar with default props', async () => {
        const progress = ProgressBar();
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const wrapper = container.querySelector('.progress-bar-wrapper');
        expect(wrapper).not.toBeNull();

        const bar = container.querySelector('.progress-bar');
        expect(bar).not.toBeNull();

    });

    it('should render with initial value', async () => {
        const progress = ProgressBar({
            value: 50
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        const width = bar.style.width;
        expect(width).toBe('50%');

    });

    it('should clamp value between 0 and 100', async () => {
        const progress = ProgressBar({ value: 150 });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.style.width).toBe('100%');

    });

    it('should render with color variant', async () => {
        const progress = ProgressBar({
            value: 50,
            variant: 'success'
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.classList.contains('progress-bar-success')).toBe(true);

    });

    it('should render striped pattern', async () => {
        const progress = ProgressBar({
            value: 50,
            striped: true
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.classList.contains('striped')).toBe(true);

    });

    it('should apply animated class when striped and animated', async () => {
        const progress = ProgressBar({
            value: 50,
            striped: true,
            animated: true
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.classList.contains('striped')).toBe(true);
        expect(bar.classList.contains('animated')).toBe(true);

    });

    it('should render indeterminate state', async () => {
        const progress = ProgressBar({
            indeterminate: true
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.classList.contains('indeterminate')).toBe(true);

    });

    it('should render all color variants', async () => {
        const variants = ['primary', 'success', 'danger', 'warning', 'info'];
        let completed = 0;

        for (const variant of variants) {
            const div = document.createElement('div');
            container.appendChild(div);

            const progress = ProgressBar({
                value: 50,
                variant: variant
            });
            div.appendChild(progress);

            await new Promise(resolve => setTimeout(resolve, 50));
            const bar = div.querySelector('.progress-bar');
            expect(bar.classList.contains(`progress-bar-${variant}`)).toBe(true);

            completed++;
            if (completed === variants.length) {
            }
        }
    });

    it('should display percentage text', async () => {
        const progress = ProgressBar({
            value: 75,
            showLabel: true
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const bar = container.querySelector('.progress-bar');
        expect(bar.textContent).toMatch(/75|%/);

    });

    it('should handle height prop', async () => {
        const progress = ProgressBar({
            value: 50,
            height: '20px'
        });
        container.appendChild(progress);

        await new Promise(resolve => setTimeout(resolve, 50));
        const wrapper = container.querySelector('.progress-bar-wrapper');
        expect(wrapper.style.height).toBe('20px');

    });
});
