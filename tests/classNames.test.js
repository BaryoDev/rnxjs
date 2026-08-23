/**
 * Tests for class name merging (utils/classNames.js)
 *
 * `cn()` runs on every render of all 46 components, so a mis-grouped utility
 * silently deletes styling framework-wide. The theme sweep at the bottom is
 * the regression guard for that.
 */

import { describe, it, expect } from 'vitest';
import { cn, cls, twMerge, cond, variant, compose } from '../utils/classNames.js';
import { tailwindTheme } from '../themes/tailwind/index.js';
import { bootstrapTheme } from '../themes/bootstrap/index.js';

describe('cn', () => {
    describe('conflict resolution', () => {
        it('keeps the last class when two set the same property', () => {
            expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');
        });

        it('lets user classes override theme classes', () => {
            expect(cn('bg-indigo-600 text-white', 'bg-red-500')).toBe('text-white bg-red-500');
        });

        it('lets size classes override base padding and font size', () => {
            expect(cn('px-3 py-2 text-sm', 'px-2.5 py-1.5 text-xs')).toBe('px-2.5 py-1.5 text-xs');
        });

        it('keeps classes that set different properties', () => {
            expect(cn('bg-blue-500', 'text-white', 'p-4')).toBe('bg-blue-500 text-white p-4');
        });

        it('collapses exact duplicates', () => {
            expect(cn('btn', 'btn')).toBe('btn');
        });

        it('preserves the original order of surviving classes', () => {
            expect(cn('inline-flex items-center gap-2 rounded-md'))
                .toBe('inline-flex items-center gap-2 rounded-md');
        });
    });

    describe('utility grouping', () => {
        it('treats border width and border colour as different properties', () => {
            expect(cn('bg-white border-b border-slate-200'))
                .toBe('bg-white border-b border-slate-200');
        });

        it('treats each border side as its own property', () => {
            expect(cn('border border-b-2 border-slate-200'))
                .toBe('border border-b-2 border-slate-200');
        });

        it('does not confuse display with flex direction or wrapping', () => {
            expect(cn('flex flex-wrap -mx-3')).toBe('flex flex-wrap -mx-3');
            expect(cn('flex flex-col gap-0.5 p-3')).toBe('flex flex-col gap-0.5 p-3');
        });

        it('does not confuse display with grid templates', () => {
            expect(cn('grid grid-cols-7 gap-0.5')).toBe('grid grid-cols-7 gap-0.5');
        });

        it('does not confuse text alignment with text colour or font size', () => {
            expect(cn('text-left text-slate-600 text-xs')).toBe('text-left text-slate-600 text-xs');
        });

        it('keeps divide width alongside divide colour', () => {
            expect(cn('divide-y divide-slate-100')).toBe('divide-y divide-slate-100');
        });

        it('keeps a full ring stack intact', () => {
            expect(cn('ring-1 ring-inset ring-indigo-600/20'))
                .toBe('ring-1 ring-inset ring-indigo-600/20');
            expect(cn('ring-2 ring-offset-2 ring-indigo-500'))
                .toBe('ring-2 ring-offset-2 ring-indigo-500');
        });

        it('treats corner radii as separate from the all-corner radius', () => {
            expect(cn('rounded-lg rounded-t-none')).toBe('rounded-lg rounded-t-none');
        });

        it('keeps unrecognised classes verbatim', () => {
            expect(cn('my-widget another-thing')).toBe('my-widget another-thing');
        });
    });

    describe('prefix families that share a stem but not a property', () => {
        it('separates text-overflow from text colour', () => {
            expect(cn('text-ellipsis text-slate-500')).toBe('text-ellipsis text-slate-500');
            expect(cn('text-clip text-slate-500')).toBe('text-clip text-slate-500');
        });

        it('separates border-collapse from border colour', () => {
            expect(cn('border-collapse border-slate-200'))
                .toBe('border-collapse border-slate-200');
            expect(cn('border-separate border-spacing-2 border-slate-200'))
                .toBe('border-separate border-spacing-2 border-slate-200');
        });

        it('separates background position, clip, origin and blend from colour', () => {
            expect(cn('bg-white bg-center bg-clip-padding'))
                .toBe('bg-white bg-center bg-clip-padding');
            expect(cn('bg-white bg-origin-border bg-blend-multiply'))
                .toBe('bg-white bg-origin-border bg-blend-multiply');
        });

        it('separates object-fit from object-position', () => {
            expect(cn('object-cover object-center')).toBe('object-cover object-center');
        });

        it('separates shadow size from shadow colour', () => {
            expect(cn('shadow-lg shadow-indigo-500/50')).toBe('shadow-lg shadow-indigo-500/50');
        });

        it('separates the scale axes', () => {
            expect(cn('scale-x-100 scale-y-50')).toBe('scale-x-100 scale-y-50');
        });

        it('separates divide reverse from divide width', () => {
            expect(cn('divide-y-2 divide-y-reverse')).toBe('divide-y-2 divide-y-reverse');
        });

        it('separates ring opacity from ring colour', () => {
            expect(cn('ring-indigo-500 ring-opacity-50')).toBe('ring-indigo-500 ring-opacity-50');
        });

        it('still merges within a single property', () => {
            expect(cn('align-top align-middle')).toBe('align-middle');
            expect(cn('object-cover object-contain')).toBe('object-contain');
            expect(cn('shadow-sm shadow-lg')).toBe('shadow-lg');
            expect(cn('bg-center bg-top')).toBe('bg-top');
        });
    });

    describe('Bootstrap flexbox and breakpoint classes', () => {
        it('treats flex-column as a direction, not a flex shorthand', () => {
            expect(cn('d-flex flex-column flex-grow-1'))
                .toBe('d-flex flex-column flex-grow-1');
            expect(cn('flex-column-reverse flex-shrink-0 flex-fill'))
                .toBe('flex-column-reverse flex-shrink-0 flex-fill');
        });

        it('merges opposing flex directions across both spellings', () => {
            expect(cn('flex-row flex-column')).toBe('flex-column');
            expect(cn('flex-grow-0 flex-grow-1')).toBe('flex-grow-1');
        });

        it('separates align-items, align-self and align-content', () => {
            expect(cn('d-flex align-items-center align-self-end align-content-between'))
                .toBe('d-flex align-items-center align-self-end align-content-between');
        });

        it('never merges across a responsive breakpoint infix', () => {
            // Different media queries — collapsing them would drop a breakpoint.
            expect(cn('m-3 m-md-5')).toBe('m-3 m-md-5');
            expect(cn('flex-sm-row flex-md-column')).toBe('flex-sm-row flex-md-column');
            expect(cn('d-none d-lg-block')).toBe('d-none d-lg-block');
        });

        it('does not mistake a trailing size suffix for a breakpoint infix', () => {
            expect(cn('max-w-screen-sm max-w-screen-lg')).toBe('max-w-screen-lg');
            expect(cn('btn btn-primary btn-sm')).toBe('btn btn-primary btn-sm');
        });
    });

    describe('variant prefixes', () => {
        it('scopes conflicts to a single variant', () => {
            expect(cn('bg-white hover:bg-slate-50')).toBe('bg-white hover:bg-slate-50');
        });

        it('resolves conflicts within the same variant', () => {
            expect(cn('hover:bg-slate-50 hover:bg-red-50')).toBe('hover:bg-red-50');
        });

        it('keeps focus, hover and active states side by side', () => {
            expect(cn('bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'))
                .toBe('bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800');
        });

        it('handles arbitrary variants containing colons', () => {
            expect(cn('[&_tbody_tr:nth-child(odd)]:bg-slate-50/60 bg-white'))
                .toBe('[&_tbody_tr:nth-child(odd)]:bg-slate-50/60 bg-white');
        });

        it('handles important markers', () => {
            expect(cn('!bg-white bg-red-500')).toBe('bg-red-500');
        });
    });

    describe('Bootstrap classes', () => {
        it('resolves button colour variants', () => {
            expect(cn('btn btn-primary', 'btn-danger')).toBe('btn btn-danger');
        });

        it('does not treat btn-group as a colour variant', () => {
            expect(cn('btn-group btn-primary')).toBe('btn-group btn-primary');
        });

        it('keeps outline variants in the colour-variant group', () => {
            expect(cn('btn btn-primary', 'btn-outline-secondary')).toBe('btn btn-outline-secondary');
        });

        it('keeps button size separate from button colour', () => {
            expect(cn('btn btn-primary btn-sm')).toBe('btn btn-primary btn-sm');
        });

        it('keeps the long-form border sides', () => {
            expect(cn('form-control border-end-0 border-secondary'))
                .toBe('form-control border-end-0 border-secondary');
        });
    });

    describe('argument handling', () => {
        it('accepts objects with boolean conditions', () => {
            expect(cn('a', { b: true, c: false }, ['d'])).toBe('a b d');
        });

        it('ignores null, undefined and non-strings', () => {
            expect(cn('a', null, undefined, false, 0, 'b')).toBe('a b');
        });

        it('returns an empty string with no arguments', () => {
            expect(cn()).toBe('');
        });

        it('splits multi-class strings', () => {
            expect(cn('  a   b  ')).toBe('a b');
        });
    });

    describe('aliases and helpers', () => {
        it('cls behaves like cn', () => {
            expect(cls('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');
        });

        it('twMerge behaves like cn', () => {
            expect(twMerge('px-4 py-2', 'px-6')).toBe('py-2 px-6');
        });

        it('cond applies classes conditionally', () => {
            expect(cond('text-red-500', true)).toBe('text-red-500');
            expect(cond('text-red-500', false)).toBe('');
        });

        it('variant resolves and falls back', () => {
            const variants = { primary: 'bg-blue-500', default: 'bg-gray-500' };
            expect(variant(variants, 'primary')).toBe('bg-blue-500');
            expect(variant(variants, 'missing')).toBe('bg-gray-500');
        });

        it('compose merges the output of multiple functions', () => {
            const composed = compose(() => 'btn', (v) => `btn-${v}`);
            expect(composed('primary')).toBe('btn btn-primary');
        });
    });
});

describe('theme integrity under cn', () => {
    /**
     * Flatten every class string a theme declares.
     * @param {Object} node - Theme fragment
     * @param {string} path - Dotted path for failure messages
     * @param {Array} out - Accumulator
     */
    function collect(node, path, out) {
        Object.entries(node || {}).forEach(([key, value]) => {
            if (typeof value === 'string') out.push([`${path}.${key}`, value]);
            else if (value && typeof value === 'object') collect(value, `${path}.${key}`, out);
        });
    }

    it.each([
        ['tailwind', tailwindTheme],
        ['bootstrap', bootstrapTheme]
    ])('%s theme survives cn() with no class silently deleted', (_name, theme) => {
        const strings = [];
        collect(theme.components, '', strings);
        expect(strings.length).toBeGreaterThan(0);

        const losses = strings.flatMap(([path, value]) => {
            const before = value.split(/\s+/).filter(Boolean);
            const after = new Set(cn(value).split(/\s+/).filter(Boolean));
            const dropped = before.filter(c => !after.has(c));
            return dropped.length ? [`${path}: ${dropped.join(', ')}`] : [];
        });

        expect(losses).toEqual([]);
    });
});
