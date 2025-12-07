import { describe, it, expect } from 'vitest';
import { loadComponents } from '../../framework/ComponentLoader.js';
import { registerComponent } from '../../framework/Registry.js';
import { FAB } from '../../components/FAB/FAB.js';

registerComponent('FAB', FAB);

describe('ComponentLoader Regression Tests', () => {
    it('should hydrate <FAB> (uppercase)', () => {
        document.body.innerHTML = `<FAB icon="add"></FAB>`;
        loadComponents(document.body);
        const btn = document.querySelector('button.m3-fab');
        expect(btn).not.toBeNull();
    });

    it('should hydrate <fab> (lowercase)', () => {
        document.body.innerHTML = `<fab icon="edit"></fab>`;
        loadComponents(document.body);
        const btn = document.querySelector('button.m3-fab');
        expect(btn).not.toBeNull();
        expect(btn.innerHTML).toContain('edit');
    });

    it('should hydrate mixed case if possible (custom elements usually lowercased by parser)', () => {
        // In valid HTML, tags are case-insensitive.
        // But invalid/custom tags might be preserved or lowercased depending on parser.
        // happy-dom usually lowercases.
        document.body.innerHTML = `<FaB icon="delete"></FaB>`;
        loadComponents(document.body);
        const btn = document.querySelector('button.m3-fab');
        expect(btn).not.toBeNull();
    });
});
