import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(join(root, 'package.json'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        if (['node_modules', '.git', 'dist', 'tests', 'create-rnxjs-app', 'packages'].includes(name)) continue;
        const full = join(dir, name);
        // design notes describe files that are planned, not shipped
        if (full === join(root, 'docs', 'design')) continue;
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.(md|js)$/.test(name)) out.push(full);
    }
    return out;
}

describe('package exports', () => {
    it('resolves the security subpath the docs tell people to import', () => {
        const resolved = require.resolve(`${pkg.name}/utils/security`);
        expect(resolved.endsWith(join('utils', 'security.js'))).toBe(true);
    });

    it('resolves every documented subpath that is not a build output', () => {
        const pattern = new RegExp(`${pkg.name.replace('/', '\\/')}\\/([A-Za-z0-9_./-]+)`, 'g');
        const found = new Set();
        for (const file of [...walk(root)]) {
            const text = readFileSync(file, 'utf8');
            for (const m of text.matchAll(pattern)) {
                const sub = m[1].replace(/[.]+$/, '');
                if (sub.startsWith('dist/') || sub.includes('*')) continue; // built at publish time
                found.add(sub);
            }
        }
        expect(found.size).toBeGreaterThan(0);

        const missing = [];
        for (const sub of found) {
            try {
                const resolved = require.resolve(`${pkg.name}/${sub}`);
                if (!existsSync(resolved)) missing.push(sub);
            } catch {
                missing.push(sub);
            }
        }
        expect(missing).toEqual([]);
    });
});
