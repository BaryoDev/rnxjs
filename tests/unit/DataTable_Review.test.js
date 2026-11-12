import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataTable } from '../../components/DataTable/DataTable.js';

const wait = (ms = 60) => new Promise(r => setTimeout(r, ms));

describe('DataTable review fixes', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => container.remove());

    it('renders 0 and false instead of blank cells', async () => {
        const table = DataTable({
            columns: [{ key: 'name', label: 'Name' }, { key: 'qty', label: 'Qty' }, { key: 'ok', label: 'Ok' }],
            rows: [{ name: 'a', qty: 0, ok: false }, { name: 'b', qty: null, ok: undefined }]
        });
        container.appendChild(table);
        await wait();

        const rows = container.querySelectorAll('tbody tr');
        const cells = (tr) => Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
        expect(cells(rows[0])).toEqual(['a', '0', 'false']);
        expect(cells(rows[1])).toEqual(['b', '', '']);
    });

    it('finds a row by searching for 0', async () => {
        const table = DataTable({
            columns: [{ key: 'name', label: 'Name' }, { key: 'qty', label: 'Qty' }],
            rows: [{ name: 'a', qty: 0 }, { name: 'b', qty: 5 }]
        });
        container.appendChild(table);
        await wait();
        table.setFilterQuery('0');
        await wait();
        const names = Array.from(container.querySelectorAll('tbody tr')).map(tr => tr.querySelector('td').textContent.trim());
        expect(names).toEqual(['a']);
    });

    it('keeps selection tied to the row, not the position on the page', async () => {
        const rows = Array.from({ length: 6 }, (_, i) => ({ id: i, name: `row${i}` }));
        const seen = [];
        const table = DataTable({
            columns: [{ key: 'name', label: 'Name' }],
            rows,
            pageSize: 3,
            selectable: true,
            onSelectionChange: (sel) => seen.push(sel)
        });
        container.appendChild(table);
        await wait();

        const first = container.querySelector('.datatable-row-checkbox');
        first.checked = true;
        first.dispatchEvent(new Event('change', { bubbles: true }));
        expect(table.getSelectedRows()).toEqual([0]);
        await wait();

        container.querySelector('.datatable-next-page').click();
        await wait();
        expect(table.getCurrentPage()).toBe(2);

        const checked = container.querySelectorAll('.datatable-row-checkbox:checked');
        expect(checked.length).toBe(0);

        const pageTwoFirst = container.querySelector('.datatable-row-checkbox');
        pageTwoFirst.checked = true;
        pageTwoFirst.dispatchEvent(new Event('change', { bubbles: true }));
        await wait();
        expect(table.getSelectedRows().sort()).toEqual([0, 3]);
        expect(seen[seen.length - 1].sort()).toEqual([0, 3]);
    });
});
