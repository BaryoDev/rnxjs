/**
 * Security tests for HTML escaping utilities
 */

import { describe, it, expect } from 'vitest';
import {
    escapeHtml,
    escapeAttribute,
    escapeJs,
    safeHtml,
    trustHtml,
    isTrustedHtml,
    sanitizeText,
    sanitizeUrl,
    sanitizeObject
} from '../../utils/security.js';

describe('escapeHtml', () => {
    it('escapes HTML tags', () => {
        expect(escapeHtml('<script>alert("xss")</script>'))
            .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('escapes ampersands', () => {
        expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("It's")).toBe('It&#x27;s');
    });

    it('escapes backticks', () => {
        expect(escapeHtml('`code`')).toBe('&#x60;code&#x60;');
    });

    it('escapes slashes', () => {
        expect(escapeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
    });

    it('escapes equals signs', () => {
        expect(escapeHtml('a=b')).toBe('a&#x3D;b');
    });

    it('handles null', () => {
        expect(escapeHtml(null)).toBe('');
    });

    it('handles undefined', () => {
        expect(escapeHtml(undefined)).toBe('');
    });

    it('converts numbers to string', () => {
        expect(escapeHtml(123)).toBe('123');
    });

    it('converts objects with toString', () => {
        const obj = { toString: () => '<b>bold</b>' };
        expect(escapeHtml(obj)).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
    });

    it('handles complex XSS payloads', () => {
        const payload = '<img src=x onerror="alert(1)">';
        const escaped = escapeHtml(payload);
        // Should not contain raw angle brackets
        expect(escaped).not.toMatch(/<[a-zA-Z]/);
    });
});

describe('escapeAttribute', () => {
    it('escapes non-alphanumeric characters', () => {
        const result = escapeAttribute('onclick="alert(1)"');
        expect(result).not.toContain('onclick=');
        expect(result).not.toContain('"');
    });

    it('preserves alphanumeric characters', () => {
        expect(escapeAttribute('hello123')).toBe('hello123');
    });

    it('handles null/undefined', () => {
        expect(escapeAttribute(null)).toBe('');
        expect(escapeAttribute(undefined)).toBe('');
    });
});

describe('escapeJs', () => {
    it('escapes single quotes', () => {
        expect(escapeJs("it's")).toBe("it\\'s");
    });

    it('escapes double quotes', () => {
        expect(escapeJs('say "hi"')).toBe('say \\"hi\\"');
    });

    it('escapes backslashes', () => {
        expect(escapeJs('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('escapes newlines', () => {
        expect(escapeJs("line1\nline2")).toBe("line1\\nline2");
    });

    it('escapes angle brackets', () => {
        expect(escapeJs('<script>')).toBe('\\x3cscript\\x3e');
    });

    it('handles null/undefined', () => {
        expect(escapeJs(null)).toBe('');
        expect(escapeJs(undefined)).toBe('');
    });
});

describe('safeHtml template tag', () => {
    it('escapes interpolated values', () => {
        const name = '<script>xss</script>';
        const result = safeHtml`<div>${name}</div>`;
        expect(result).toBe('<div>&lt;script&gt;xss&lt;&#x2F;script&gt;</div>');
    });

    it('preserves template structure', () => {
        const result = safeHtml`<div class="card"><span>${'text'}</span></div>`;
        expect(result).toBe('<div class="card"><span>text</span></div>');
    });

    it('handles multiple interpolations', () => {
        const a = '<a>';
        const b = '<b>';
        const result = safeHtml`${a} and ${b}`;
        expect(result).toBe('&lt;a&gt; and &lt;b&gt;');
    });

    it('handles trusted HTML', () => {
        const trusted = trustHtml('<b>bold</b>');
        const result = safeHtml`<div>${trusted}</div>`;
        expect(result).toBe('<div><b>bold</b></div>');
    });

    it('handles null/undefined in interpolation', () => {
        const result = safeHtml`<div>${null} ${undefined}</div>`;
        expect(result).toBe('<div> </div>');
    });
});

describe('trustHtml', () => {
    it('creates trusted HTML object', () => {
        const trusted = trustHtml('<b>bold</b>');
        expect(isTrustedHtml(trusted)).toBe(true);
        expect(trusted.toString()).toBe('<b>bold</b>');
    });

    it('handles non-string input', () => {
        const trusted = trustHtml(null);
        expect(trusted.toString()).toBe('');
    });
});

describe('isTrustedHtml', () => {
    it('returns true for trusted HTML', () => {
        expect(isTrustedHtml(trustHtml('test'))).toBe(true);
    });

    it('returns false for regular strings', () => {
        expect(isTrustedHtml('test')).toBe(false);
    });

    it('returns false for null/undefined', () => {
        expect(isTrustedHtml(null)).toBeFalsy();
        expect(isTrustedHtml(undefined)).toBeFalsy();
    });

    it('returns false for objects without marker', () => {
        expect(isTrustedHtml({ toString: () => 'test' })).toBe(false);
    });
});

describe('sanitizeText', () => {
    it('removes control characters', () => {
        const input = 'hello\x00\x01\x02world';
        expect(sanitizeText(input)).toBe('helloworld');
    });

    it('normalizes line endings', () => {
        expect(sanitizeText('a\r\nb\rc')).toBe('a\nb\nc');
    });

    it('trims whitespace', () => {
        expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('handles null/undefined', () => {
        expect(sanitizeText(null)).toBe('');
        expect(sanitizeText(undefined)).toBe('');
    });
});

describe('sanitizeUrl', () => {
    describe('blocks dangerous protocols', () => {
        it('blocks javascript:', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
            expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeNull();
            expect(sanitizeUrl('  javascript:alert(1)')).toBeNull();
        });

        it('blocks data:', () => {
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
        });

        it('blocks vbscript:', () => {
            expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull();
        });

        it('blocks file:', () => {
            expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
        });
    });

    describe('allows safe protocols', () => {
        it('allows https:', () => {
            expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
        });

        it('allows http:', () => {
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
        });

        it('allows mailto:', () => {
            expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
        });

        it('allows tel:', () => {
            expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
        });

        it('allows relative URLs', () => {
            expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
            expect(sanitizeUrl('path/to/page')).toBe('path/to/page');
            expect(sanitizeUrl('../page')).toBe('../page');
        });

        it('allows protocol-relative URLs', () => {
            expect(sanitizeUrl('//example.com/path')).toBe('//example.com/path');
        });
    });

    it('handles null/undefined', () => {
        expect(sanitizeUrl(null)).toBeNull();
        expect(sanitizeUrl(undefined)).toBeNull();
    });
});

describe('sanitizeObject', () => {
    it('removes __proto__ keys', () => {
        const input = { __proto__: { polluted: true }, name: 'safe' };
        const result = sanitizeObject(input);
        expect(result).toEqual({ name: 'safe' });
    });

    it('removes constructor keys', () => {
        const input = { constructor: 'bad', name: 'safe' };
        const result = sanitizeObject(input);
        expect(result).toEqual({ name: 'safe' });
    });

    it('removes prototype keys', () => {
        const input = { prototype: 'bad', name: 'safe' };
        const result = sanitizeObject(input);
        expect(result).toEqual({ name: 'safe' });
    });

    it('sanitizes nested objects', () => {
        const input = {
            user: {
                __proto__: { bad: true },
                name: 'alice'
            }
        };
        const result = sanitizeObject(input);
        expect(result).toEqual({ user: { name: 'alice' } });
    });

    it('sanitizes arrays', () => {
        const input = [{ __proto__: {}, name: 'a' }, { name: 'b' }];
        const result = sanitizeObject(input);
        expect(result).toEqual([{ name: 'a' }, { name: 'b' }]);
    });

    it('handles null/undefined', () => {
        expect(sanitizeObject(null)).toBeNull();
        expect(sanitizeObject(undefined)).toBeUndefined();
    });

    it('handles primitives', () => {
        expect(sanitizeObject('string')).toBe('string');
        expect(sanitizeObject(123)).toBe(123);
        expect(sanitizeObject(true)).toBe(true);
    });
});
