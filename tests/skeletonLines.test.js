import { describe, it, expect, afterEach } from 'vitest';
import { themeProvider } from '../utils/ThemeProvider.js';
import { Skeleton } from '../components/Skeleton/Skeleton.js';

afterEach(() => themeProvider.setTheme('bootstrap'));

describe.each(['bootstrap', 'tailwind'])('Skeleton lines under %s', (theme) => {
    it.each([[1, 1], [3, 3], ['3', 3], ['5', 5]])('lines=%j renders %i bars', (lines, expected) => {
        themeProvider.setTheme(theme);
        const el = Skeleton({ variant: 'text', lines });
        expect(el.querySelectorAll('.skeleton-line').length).toBe(expected);
    });
});
