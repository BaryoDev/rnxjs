/**
 * Tests for DataTable rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataTable } from '../../components/DataTable/DataTable.js';

describe('DataTable Rendering', () => {
    let container;
    const mockColumns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role' }
    ];

    const mockRows = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin' }
    ];

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    it('should render table with columns and rows', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            pageSize: 10
        });

        container.appendChild(table);

        setTimeout(() => {
            const tableElement = container.querySelector('table.datatable');
            expect(tableElement).not.toBeNull();

            const headers = container.querySelectorAll('thead th');
            expect(headers.length).toBe(mockColumns.length);

            const rows = container.querySelectorAll('tbody tr');
            expect(rows.length).toBe(mockRows.length);

            done();
        }, 50);
    });

    it('should render correct column headers', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        setTimeout(() => {
            const headers = container.querySelectorAll('thead th');
            const headerTexts = Array.from(headers).map(h => h.textContent.trim());

            expect(headerTexts).toContain('ID');
            expect(headerTexts).toContain('Name');
            expect(headerTexts).toContain('Email');
            expect(headerTexts).toContain('Role');

            done();
        }, 50);
    });

    it('should render correct data in cells', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        setTimeout(() => {
            const cells = container.querySelectorAll('tbody td');
            const cellTexts = Array.from(cells).map(c => c.textContent.trim());

            expect(cellTexts).toContain('1');
            expect(cellTexts).toContain('John Doe');
            expect(cellTexts).toContain('john@example.com');
            expect(cellTexts).toContain('Admin');

            done();
        }, 50);
    });

    it('should display loading state', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: [],
            loading: true
        });

        container.appendChild(table);

        setTimeout(() => {
            const spinner = container.querySelector('.spinner-border');
            expect(spinner).not.toBeNull();

            const loadingText = container.textContent;
            expect(loadingText).toContain('Loading');

            done();
        }, 50);
    });

    it('should display error state', (done) => {
        const errorMessage = 'Failed to load data';
        const table = DataTable({
            columns: mockColumns,
            rows: [],
            error: errorMessage
        });

        container.appendChild(table);

        setTimeout(() => {
            const errorDisplay = container.textContent;
            expect(errorDisplay).toContain(errorMessage);

            const warningIcon = container.querySelector('.bi-exclamation-triangle');
            expect(warningIcon).not.toBeNull();

            done();
        }, 50);
    });

    it('should display empty message when no rows', (done) => {
        const emptyMsg = 'No users found';
        const table = DataTable({
            columns: mockColumns,
            rows: [],
            emptyMessage: emptyMsg
        });

        container.appendChild(table);

        setTimeout(() => {
            const message = container.textContent;
            expect(message).toContain(emptyMsg);

            done();
        }, 50);
    });

    it('should render search filter when filterable', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            filterable: true
        });

        container.appendChild(table);

        setTimeout(() => {
            const searchInput = container.querySelector('.datatable-search');
            expect(searchInput).not.toBeNull();
            expect(searchInput.placeholder).toContain('Search');

            done();
        }, 50);
    });

    it('should not render search filter when not filterable', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            filterable: false
        });

        container.appendChild(table);

        setTimeout(() => {
            const searchInput = container.querySelector('.datatable-search');
            expect(searchInput).toBeNull();

            done();
        }, 50);
    });

    it('should render sort indicators on sortable columns', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            sortable: true
        });

        container.appendChild(table);

        setTimeout(() => {
            const sortableHeaders = container.querySelectorAll('th.sortable');
            expect(sortableHeaders.length).toBeGreaterThan(0);

            const sortIcons = container.querySelectorAll('th.sortable i');
            expect(sortIcons.length).toBeGreaterThan(0);

            done();
        }, 50);
    });

    it('should render checkboxes when selectable', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            selectable: true
        });

        container.appendChild(table);

        setTimeout(() => {
            const selectAllCheckbox = container.querySelector('[data-ref="selectAll"]');
            expect(selectAllCheckbox).not.toBeNull();

            const rowCheckboxes = container.querySelectorAll('.datatable-row-checkbox');
            expect(rowCheckboxes.length).toBe(mockRows.length);

            done();
        }, 50);
    });

    it('should not render checkboxes when not selectable', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            selectable: false
        });

        container.appendChild(table);

        setTimeout(() => {
            const selectAllCheckbox = container.querySelector('[data-ref="selectAll"]');
            expect(selectAllCheckbox).toBeNull();

            const rowCheckboxes = container.querySelectorAll('.datatable-row-checkbox');
            expect(rowCheckboxes.length).toBe(0);

            done();
        }, 50);
    });

    it('should render pagination when needed', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            pageSize: 2
        });

        container.appendChild(table);

        setTimeout(() => {
            const pagination = container.querySelector('nav[aria-label="Table pagination"]');
            expect(pagination).not.toBeNull();

            const prevBtn = container.querySelector('.datatable-prev-page');
            const nextBtn = container.querySelector('.datatable-next-page');
            expect(prevBtn).not.toBeNull();
            expect(nextBtn).not.toBeNull();

            done();
        }, 50);
    });

    it('should hide pagination with single page', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows.slice(0, 5),
            pageSize: 10
        });

        container.appendChild(table);

        setTimeout(() => {
            const pagination = container.querySelector('nav[aria-label="Table pagination"]');
            expect(pagination).toBeNull();

            done();
        }, 50);
    });

    it('should display row count in pagination', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            pageSize: 2
        });

        container.appendChild(table);

        setTimeout(() => {
            const paginationText = container.textContent;
            expect(paginationText).toContain('1');
            expect(paginationText).toContain('2');
            expect(paginationText).toContain('5'); // Total rows

            done();
        }, 50);
    });

    it('should apply custom className', (done) => {
        const customClass = 'my-custom-table';
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            className: customClass
        });

        container.appendChild(table);

        setTimeout(() => {
            const wrapper = container.querySelector('.datatable-container');
            expect(wrapper.classList.contains(customClass)).toBe(true);

            done();
        }, 50);
    });

    it('should escape HTML in data', (done) => {
        const maliciousData = [
            {
                id: 1,
                name: '<script>alert("xss")</script>',
                email: 'test@example.com',
                role: '<img src=x onerror=alert(1)>'
            }
        ];

        const table = DataTable({
            columns: mockColumns,
            rows: maliciousData
        });

        container.appendChild(table);

        setTimeout(() => {
            const tableContent = container.textContent;
            expect(tableContent).toContain('<script>');
            expect(tableContent).not.toContain('alert("xss")');

            const scripts = container.querySelectorAll('script');
            expect(scripts.length).toBe(0);

            done();
        }, 50);
    });

    it('should handle empty columns array', () => {
        expect(() => {
            DataTable({
                columns: [],
                rows: mockRows
            });
        }).toThrow('columns must be a non-empty array');
    });

    it('should handle missing columns', () => {
        expect(() => {
            DataTable({
                rows: mockRows
            });
        }).toThrow('columns must be a non-empty array');
    });

    it('should handle undefined rows', (done) => {
        const table = DataTable({
            columns: mockColumns
        });

        container.appendChild(table);

        setTimeout(() => {
            const emptyMessage = container.textContent;
            expect(emptyMessage).toContain('No data available');

            done();
        }, 50);
    });

    it('should render with default empty message', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: []
        });

        container.appendChild(table);

        setTimeout(() => {
            const message = container.textContent;
            expect(message).toContain('No data available');

            done();
        }, 50);
    });

    it('should render responsive wrapper', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        setTimeout(() => {
            const responsive = container.querySelector('.table-responsive');
            expect(responsive).not.toBeNull();

            done();
        }, 50);
    });

    it('should properly structure table HTML', (done) => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        setTimeout(() => {
            const thead = container.querySelector('table > thead');
            const tbody = container.querySelector('table > tbody');

            expect(thead).not.toBeNull();
            expect(tbody).not.toBeNull();

            const theadRows = thead.querySelectorAll('tr');
            const tbodyRows = tbody.querySelectorAll('tr');

            expect(theadRows.length).toBe(1);
            expect(tbodyRows.length).toBe(mockRows.length);

            done();
        }, 50);
    });
});
