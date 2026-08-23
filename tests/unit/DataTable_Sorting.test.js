/**
 * Tests for DataTable sorting functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataTable } from '../../components/DataTable/DataTable.js';

describe('DataTable Sorting', () => {
    let container;
    const mockColumns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
        { key: 'role', label: 'Role', sortable: false }
    ];

    const mockRows = [
        { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35, role: 'User' },
        { id: 1, name: 'Alice', email: 'alice@example.com', age: 28, role: 'Admin' },
        { id: 2, name: 'Bob', email: 'bob@example.com', age: 32, role: 'Moderator' }
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

    it('should sort ascending on first click', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            pageSize: 10
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const cells = container.querySelectorAll('tbody td[data-column="name"]');
                const names = Array.from(cells).map(c => c.textContent.trim());

                expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should sort descending on second click', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            pageSize: 10
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');

            // First click - ascending
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                // Second click - descending
                nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                    const cells = container.querySelectorAll('tbody td[data-column="name"]');
                    const names = Array.from(cells).map(c => c.textContent.trim());

                    expect(names).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    it('should toggle sort direction', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const idHeader = container.querySelector('[data-column="id"]');

            // First sort: ascending
            idHeader.click();
            expect(table.getSortDirection()).toBe('asc');

            // Second sort: descending
            idHeader.click();
            expect(table.getSortDirection()).toBe('desc');
    });

    it('should sort numeric columns correctly', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const ageHeader = container.querySelector('[data-column="age"]');
            ageHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const cells = container.querySelectorAll('tbody td[data-column="age"]');
                const ages = Array.from(cells).map(c => parseInt(c.textContent.trim()));

                expect(ages).toEqual([28, 32, 35]);
    });

    it('should change sort column', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            const ageHeader = container.querySelector('[data-column="age"]');

            // Sort by name
            nameHeader.click();
            expect(table.getSortColumn()).toBe('name');

        await new Promise(resolve => setTimeout(resolve, 50));
                // Sort by age (changes sort column)
                ageHeader.click();
                expect(table.getSortColumn()).toBe('age');
    });

    it('should not sort non-sortable columns', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const roleHeader = container.querySelector('[data-column="role"]');
            expect(roleHeader.classList.contains('sortable')).toBe(false);

            // Clicking should not trigger sort
            roleHeader.click();
            expect(table.getSortColumn()).toBeNull();
    });

    it('should call onSort callback', async () => {
        const onSort = vi.fn();
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            onSort
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(onSort).toHaveBeenCalledWith('name', 'asc');

                nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                    expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should display sort indicator on active column', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(nameHeader.classList.contains('sorted-asc')).toBe(true);

                const icon = nameHeader.querySelector('i');
                expect(icon.classList.contains('bi-sort-up')).toBe(true);
    });

    it('should update sort indicator on descending', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                nameHeader.click(); // Second click

        await new Promise(resolve => setTimeout(resolve, 50));
                    expect(nameHeader.classList.contains('sorted-desc')).toBe(true);

                    const icon = nameHeader.querySelector('i');
                    expect(icon.classList.contains('bi-sort-down')).toBe(true);
    });

    it('should reset page on sort', async () => {
        const manyRows = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            name: ['Alice', 'Bob', 'Charlie'][i % 3],
            email: `user${i}@example.com`,
            age: 20 + i,
            role: 'User'
        }));

        const table = DataTable({
            columns: mockColumns,
            rows: manyRows,
            pageSize: 5
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            // Go to page 2
            const nextBtn = container.querySelector('.datatable-next-page');
            nextBtn.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(table.getCurrentPage()).toBe(2);

                // Sort
                const nameHeader = container.querySelector('[data-column="name"]');
                nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                    // Should reset to page 1
                    expect(table.getCurrentPage()).toBe(1);
    });

    it('should handle case-insensitive string sorting', async () => {
        const rows = [
            { id: 1, name: 'zebra', email: 'z@example.com', age: 20, role: 'User' },
            { id: 2, name: 'Apple', email: 'a@example.com', age: 25, role: 'User' },
            { id: 3, name: 'Banana', email: 'b@example.com', age: 30, role: 'User' }
        ];

        const table = DataTable({
            columns: mockColumns,
            rows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                const cells = container.querySelectorAll('tbody td[data-column="name"]');
                const names = Array.from(cells).map(c => c.textContent.trim());

                expect(names[0].toLowerCase()).toBe('apple');
                expect(names[1].toLowerCase()).toBe('banana');
                expect(names[2].toLowerCase()).toBe('zebra');
    });

    it('should track sort state via getSortColumn', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            expect(table.getSortColumn()).toBeNull();

            const idHeader = container.querySelector('[data-column="id"]');
            idHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                expect(table.getSortColumn()).toBe('id');
    });

    it('should sort with null/undefined values', async () => {
        const rows = [
            { id: 1, name: 'Alice', email: 'alice@example.com', age: 28, role: 'User' },
            { id: 2, name: null, email: 'bob@example.com', age: null, role: 'Admin' },
            { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35, role: 'User' }
        ];

        const table = DataTable({
            columns: mockColumns,
            rows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');
            nameHeader.click();

        await new Promise(resolve => setTimeout(resolve, 50));
                // Should not throw error
                const cells = container.querySelectorAll('tbody tr');
                expect(cells.length).toBe(3);
    });

    it('should handle sorting disabled', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows,
            sortable: false
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const headers = container.querySelectorAll('th.sortable');
            expect(headers.length).toBe(0);
    });

    it('should update getSortDirection', async () => {
        const table = DataTable({
            columns: mockColumns,
            rows: mockRows
        });

        container.appendChild(table);

        await new Promise(resolve => setTimeout(resolve, 50));
            const nameHeader = container.querySelector('[data-column="name"]');

            nameHeader.click();
            expect(table.getSortDirection()).toBe('asc');

        await new Promise(resolve => setTimeout(resolve, 50));
                nameHeader.click();
                expect(table.getSortDirection()).toBe('desc');
    });
});