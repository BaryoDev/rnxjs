import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeHtml, sanitizeUrl } from '../../utils/security.js';

function parse(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

describe('sanitizeUrl', () => {
    beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}); });

    it('blocks a scheme broken up with tab, newline or control characters', () => {
        expect(sanitizeUrl('java\tscript:alert(1)')).toBeNull();
        expect(sanitizeUrl('java\nscript:alert(1)')).toBeNull();
        expect(sanitizeUrl('\u0001javascript:alert(1)')).toBeNull();
        expect(sanitizeUrl('  JaVaScRiPt:alert(1)')).toBeNull();
    });

    it('keeps normal urls', () => {
        expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a');
        expect(sanitizeUrl('/a/b?c=d')).toBe('/a/b?c=d');
    });
});

describe('sanitizeHtml URL attributes', () => {
    beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}); });

    it('removes form action with an entity-hidden javascript scheme', () => {
        const out = parse(sanitizeHtml('<form action="java&#9;script:alert(1)"><input></form>'));
        expect(out.querySelector('form').hasAttribute('action')).toBe(false);
    });

    it('removes formaction with an entity-hidden javascript scheme', () => {
        const out = parse(sanitizeHtml('<form><button formaction="java&#10;script:alert(2)">go</button></form>'));
        expect(out.querySelector('button').hasAttribute('formaction')).toBe(false);
    });

    it('removes xlink:href with an entity-hidden javascript scheme', () => {
        const out = sanitizeHtml('<svg><a xlink:href="java&#9;script:alert(3)"><text>x</text></a></svg>');
        expect(out.toLowerCase()).not.toContain('script:');
        expect(out.toLowerCase()).not.toContain('xlink:href');
    });

    it('removes href and src with hidden schemes', () => {
        const out = parse(sanitizeHtml('<a href="java&#13;script:alert(1)">a</a><img src="java&#9;script:alert(1)">'));
        expect(out.querySelector('a').hasAttribute('href')).toBe(false);
        expect(out.querySelector('img').hasAttribute('src')).toBe(false);
    });

    it('removes poster and background javascript urls', () => {
        const out = parse(sanitizeHtml('<video poster="javascript:alert(1)"></video><table background="java&#9;script:alert(1)"></table>'));
        expect(out.querySelector('video').hasAttribute('poster')).toBe(false);
        expect(out.querySelector('table').hasAttribute('background')).toBe(false);
    });

    it('drops unsafe srcset entries and keeps safe ones', () => {
        const out = parse(sanitizeHtml('<img srcset="/a.png 1x, java&#9;script:alert(1) 2x">'));
        expect(out.querySelector('img').getAttribute('srcset')).toBe('/a.png 1x');
        const none = parse(sanitizeHtml('<img srcset="javascript:alert(1) 1x">'));
        expect(none.querySelector('img').hasAttribute('srcset')).toBe(false);
    });

    it('keeps safe urls and strips on* handlers and scripts', () => {
        const out = parse(sanitizeHtml('<form action="/save"><a href="https://example.com" onclick="x()">a</a></form><script>x()</script>'));
        expect(out.querySelector('form').getAttribute('action')).toBe('/save');
        expect(out.querySelector('a').getAttribute('href')).toBe('https://example.com');
        expect(out.querySelector('a').hasAttribute('onclick')).toBe(false);
        expect(out.querySelector('script')).toBeNull();
    });
});
