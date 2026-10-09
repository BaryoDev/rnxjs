import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { themeProvider } from '../../utils/ThemeProvider.js';
import { Spinner } from '../../components/Spinner/Spinner.js';
import { DataTable } from '../../components/DataTable/DataTable.js';
import { Autocomplete } from '../../components/Autocomplete/Autocomplete.js';
import { FileUpload } from '../../components/FileUpload/FileUpload.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const render = async (el) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(el);
    await wait(50);
    return container;
};

const loadingAutocomplete = async () => {
    const el = Autocomplete({
        items: () => new Promise((resolve) => setTimeout(() => resolve(['a', 'b']), 200)),
        debounce: 0
    });
    const container = await render(el);
    const input = container.querySelector('.autocomplete-input');
    input.value = 'x';
    input.dispatchEvent(new Event('input'));
    await wait(25);
    return container;
};

const fileWithItem = async () => {
    const el = FileUpload({ multiple: true });
    const container = await render(el);
    el.addFiles([new File(['hello'], 'a.txt', { type: 'text/plain' })]);
    await wait(50);
    return container;
};

const cases = {
    Spinner: () => render(Spinner()),
    'DataTable loading': () => render(DataTable({ columns: [{ key: 'a', label: 'A' }], rows: [], loading: true })),
    'Autocomplete loading': loadingAutocomplete,
    'FileUpload item': fileWithItem
};

describe('Bootstrap-only classes under the Tailwind theme', () => {
    afterEach(() => {
        themeProvider.setTheme('bootstrap');
        document.body.innerHTML = '';
    });

    describe.each(Object.entries(cases))('%s', (_name, make) => {
        it('emits no Bootstrap-only classes under tailwind', async () => {
            themeProvider.setTheme('tailwind');
            const html = (await make()).innerHTML;
            expect(html).not.toMatch(/visually-hidden/);
            expect(html).not.toMatch(/spinner-border/);
            expect(html).not.toMatch(/btn-danger/);
        });
    });

    it('Spinner, DataTable and Autocomplete use sr-only under tailwind', async () => {
        themeProvider.setTheme('tailwind');
        for (const name of ['Spinner', 'DataTable loading', 'Autocomplete loading']) {
            const container = await cases[name]();
            expect(container.querySelector('.sr-only')).not.toBeNull();
        }
    });

    it('FileUpload remove button keeps its hook class and is a small danger button', async () => {
        themeProvider.setTheme('tailwind');
        const container = await fileWithItem();
        const btn = container.querySelector('.file-upload-item-remove');
        expect(btn).not.toBeNull();
        expect(btn.className).toContain('bg-red-600');
    });
});

describe('Bootstrap output is unchanged', () => {
    beforeEach(() => themeProvider.setTheme('bootstrap'));
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('Spinner', async () => {
        const html = (await cases.Spinner()).innerHTML;
        expect(html).toContain('spinner-border');
        expect(html).toContain('visually-hidden');
    });

    it('DataTable loading', async () => {
        const html = (await cases['DataTable loading']()).innerHTML;
        expect(html).toContain('spinner-border');
        expect(html).toContain('visually-hidden');
    });

    it('Autocomplete loading', async () => {
        const html = (await cases['Autocomplete loading']()).innerHTML;
        expect(html).toContain('spinner-border-sm');
        expect(html).toContain('visually-hidden');
    });

    it('FileUpload item remove', async () => {
        const container = await cases['FileUpload item']();
        const btn = container.querySelector('.file-upload-item-remove');
        expect(btn.className).toContain('btn');
        expect(btn.className).toContain('btn-sm');
        expect(btn.className).toContain('btn-danger');
    });
});
