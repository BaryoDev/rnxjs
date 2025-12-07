import { describe, it, expect } from 'vitest';
import { loadComponents } from '../../framework/ComponentLoader.js';
import { registerComponent } from '../../framework/Registry.js';
import { FAB } from '../../components/FAB/FAB.js';

// Ensure FAB is registered
registerComponent('FAB', FAB);

describe('FAB Rendering Integration', () => {
    it('should replace <FAB> tag with button', () => {
        document.body.innerHTML = `<FAB icon="add" variant="primary"></FAB>`;
        loadComponents(document.body);

        // Debug output
        console.log('DOM Content:', document.body.innerHTML);

        const btn = document.querySelector('button.m3-fab');
        expect(btn).not.toBeNull();
        expect(btn.innerHTML).toContain('add');
    });

    it('should replace <FAB> tag even when using custom tag name if registered', () => {
        // This tests if the registry lookups are case sensitive or not, or strictly exact
        // Assuming exact match for now based on implementation
        document.body.innerHTML = `<FAB icon="edit"></FAB>`;
        loadComponents(document.body);

        const btn = document.querySelector('button.m3-fab');
        expect(btn).not.toBeNull();
        expect(btn.innerHTML).toContain('edit');
    });
});
