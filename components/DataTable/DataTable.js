/**
 * DataTable Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Sortable, filterable, paginated data display.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const themeState = (component, state) => {
    const theme = themeProvider.getTheme();
    return (theme && theme.components[component] && theme.components[component].states &&
        theme.components[component].states[state]) || '';
};

/**
 * Create a data table with sorting, filtering, and pagination
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.columns - Column definitions [{key, label, sortable, filterable, width}]
 * @param {Array} options.rows - Data rows (array of objects)
 * @param {number} options.pageSize - Items per page (default: 10)
 * @param {boolean} options.sortable - Enable sorting (default: true)
 * @param {boolean} options.filterable - Enable filtering (default: true)
 * @param {boolean} options.selectable - Enable row selection (default: false)
 * @param {boolean} options.loading - Show loading state (default: false)
 * @param {string} options.error - Error message to display (default: null)
 * @param {string} options.emptyMessage - Message when no data (default: 'No data available')
 * @param {string} options.ariaLabel - Accessible label for the table region (default: 'Data table')
 * @param {Function} options.onSort - Callback on sort change
 * @param {Function} options.onFilter - Callback on filter change
 * @param {Function} options.onPageChange - Callback on page change
 * @param {Function} options.onSelectionChange - Callback on selection change
 * @param {Function} options.onRowClick - Callback on row click
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} DataTable component
 *
 * @example
 * const table = DataTable({
 *   columns: [
 *     { key: 'name', label: 'Name', sortable: true, filterable: true },
 *     { key: 'email', label: 'Email', sortable: true },
 *     { key: 'role', label: 'Role' }
 *   ],
 *   rows: [
 *     { id: 1, name: 'John', email: 'john@example.com', role: 'Admin' },
 *     { id: 2, name: 'Jane', email: 'jane@example.com', role: 'User' }
 *   ],
 *   pageSize: 10,
 *   onSort: (column, direction) => console.log(column, direction),
 *   onPageChange: (page) => console.log(page)
 * });
 */
export function DataTable({
    columns = [],
    rows = [],
    pageSize = 10,
    sortable = true,
    filterable = true,
    selectable = false,
    loading = false,
    error = null,
    emptyMessage = 'No data available',
    ariaLabel = 'Data table',
    onSort,
    onFilter,
    onPageChange,
    onSelectionChange,
    onRowClick,
    className = ''
} = {}) {
    if (!Array.isArray(columns)) {
        columns = [];
    }

    if (!Array.isArray(rows)) {
        rows = [];
    }

    // Columns are required whenever there is data to display;
    // with no data at all, render an empty table instead of throwing
    if (columns.length === 0 && rows.length > 0) {
        throw new Error('DataTable: columns must be a non-empty array');
    }

    // Component state
    let currentPage = 1;
    let sortColumn = null;
    let sortDirection = 'asc';
    let filterQuery = '';
    let selectedRows = new Set();

    const colSpan = Math.max(columns.length, 1) + (selectable ? 1 : 0);

    /**
     * Filter rows based on query
     */
    const filterRows = (data) => {
        if (!filterQuery || !filterable) {
            return data;
        }

        const query = filterQuery.toLowerCase();
        return data.filter(row =>
            columns.some(col =>
                String(row[col.key] || '').toLowerCase().includes(query)
            )
        );
    };

    /**
     * Sort rows based on column and direction
     */
    const sortRows = (data) => {
        if (!sortColumn || !sortable) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn] ?? '';
            const bVal = b[sortColumn] ?? '';

            let comparison = 0;
            if (typeof aVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else {
                comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    /**
     * Get paginated data
     */
    const getDisplayData = () => {
        const filtered = filterRows(rows);
        const sorted = sortRows(filtered);
        const start = (currentPage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    };

    /**
     * Get total number of pages
     */
    const getTotalPages = () => {
        const filtered = filterRows(rows);
        return Math.ceil(filtered.length / pageSize);
    };

    /**
     * Get total number of filtered rows
     */
    const getTotalRows = () => {
        return filterRows(rows).length;
    };

    /**
     * Render table header
     */
    const renderHeader = () => {
        const headClass = resolvePartClasses('datatable', 'head');
        const thClass = resolvePartClasses('datatable', 'th');
        const checkboxClass = resolveClasses('checkbox');

        return `
            <thead class="${headClass}">
                <tr>
                    ${selectable ? `
                        <th scope="col" class="${cn(thClass, 'datatable-checkbox')}" style="width: 40px;">
                            <input type="checkbox" class="${checkboxClass}" data-ref="selectAll" aria-label="Select all rows" />
                        </th>
                    ` : ''}
                    ${columns.map(col => {
                        const isSortable = Boolean(col.sortable);
                        const isSorted = sortColumn === col.key;
                        const ariaSort = isSortable
                            ? ` aria-sort="${isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}"`
                            : '';
                        return `
                        <th
                            scope="col"
                            class="${cn(thClass, 'datatable-header', isSortable ? 'sortable' : '', isSorted ? `sorted-${sortDirection}` : '')}"
                            data-column="${escapeHtml(col.key)}"
                            ${isSortable ? 'tabindex="0"' : ''}${ariaSort}
                            style="${col.width ? `width: ${escapeHtml(col.width)};` : ''}"
                        >
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                                <span>${escapeHtml(col.label)}</span>
                                ${isSortable ? `
                                    <i aria-hidden="true" class="bi ${
                                        isSorted
                                            ? sortDirection === 'asc'
                                                ? 'bi-sort-up'
                                                : 'bi-sort-down'
                                            : 'bi-arrow-down-up'
                                    }" style="opacity: 0.5;"></i>
                                ` : ''}
                            </div>
                        </th>
                    `;
                    }).join('')}
                </tr>
            </thead>
        `;
    };

    /**
     * Render table body
     */
    const renderBody = () => {
        const bodyClass = resolvePartClasses('datatable', 'body');
        const rowClass = resolvePartClasses('datatable', 'row');
        const tdClass = resolvePartClasses('datatable', 'td') || resolvePartClasses('datatable', 'cell');
        const checkboxClass = resolveClasses('checkbox');
        const centered = 'text-align: center; padding: 1.5rem 0.5rem;';

        if (loading) {
            return `
                <tbody class="${bodyClass}">
                    <tr>
                        <td colspan="${colSpan}" style="${centered}">
                            <div class="${cn(resolveClasses('spinner', { variant: 'border', size: 'sm' }), 'spinner-border')}" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            `;
        }

        if (error) {
            return `
                <tbody class="${bodyClass}">
                    <tr>
                        <td colspan="${colSpan}" class="${resolveUtility('text', 'danger')}" style="${centered}" role="alert">
                            <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
                            ${escapeHtml(error)}
                        </td>
                    </tr>
                </tbody>
            `;
        }

        const displayData = getDisplayData();
        if (displayData.length === 0) {
            return `
                <tbody class="${bodyClass}">
                    <tr>
                        <td colspan="${colSpan}" class="${resolveUtility('text', 'muted')}" style="${centered}">
                            ${escapeHtml(emptyMessage)}
                        </td>
                    </tr>
                </tbody>
            `;
        }

        return `
            <tbody class="${bodyClass}">
                ${displayData.map((row, idx) => `
                    <tr
                        class="${cn(rowClass, 'datatable-row', selectedRows.has(idx) ? 'table-active' : '')}"
                        data-row-index="${idx}"
                        data-row-id="${escapeHtml(String(row.id ?? idx))}"
                        ${selectedRows.has(idx) ? 'aria-selected="true"' : ''}
                    >
                        ${selectable ? `
                            <td class="${cn(tdClass, 'datatable-checkbox')}">
                                <input
                                    type="checkbox"
                                    class="${cn(checkboxClass, 'datatable-row-checkbox')}"
                                    data-row-index="${idx}"
                                    aria-label="Select row"
                                    ${selectedRows.has(idx) ? 'checked' : ''}
                                />
                            </td>
                        ` : ''}
                        ${columns.map(col => `
                            <td class="${tdClass}" data-column="${escapeHtml(col.key)}">
                                ${escapeHtml(String(row[col.key] || ''))}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;
    };

    /**
     * Render pagination
     */
    const renderPagination = () => {
        const totalPages = getTotalPages();
        const totalRows = getTotalRows();

        if (totalPages <= 1) {
            return '';
        }

        const listClass = cn(resolveClasses('pagination', { size: 'sm' }));
        const itemClass = resolvePartClasses('pagination', 'item');
        const linkClass = resolvePartClasses('pagination', 'link');
        const activeState = themeState('pagination', 'active') || 'active';
        const disabledState = themeState('pagination', 'disabled') || 'disabled';

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 1rem;">
                <small class="${resolveUtility('text', 'muted')}">
                    Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalRows)}
                    of ${totalRows} results
                </small>
                <nav aria-label="Table pagination">
                    <ul class="${listClass}" style="margin-bottom: 0; list-style: none;">
                        <li class="${cn(itemClass, currentPage === 1 ? disabledState : '')}">
                            <button type="button" class="${cn(linkClass, 'datatable-prev-page')}" aria-label="Previous page" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''}>
                                <i class="bi bi-chevron-left" aria-hidden="true"></i>
                            </button>
                        </li>
                        <li class="${cn(itemClass, activeState)}" aria-current="page">
                            <span class="${cn(linkClass, activeState)}">
                                Page ${currentPage} of ${totalPages}
                            </span>
                        </li>
                        <li class="${cn(itemClass, currentPage >= totalPages ? disabledState : '')}">
                            <button type="button" class="${cn(linkClass, 'datatable-next-page')}" aria-label="Next page" ${currentPage >= totalPages ? 'disabled aria-disabled="true"' : ''}>
                                <i class="bi bi-chevron-right" aria-hidden="true"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        `;
    };

    /**
     * Render filter bar
     */
    const renderFilterBar = () => {
        if (!filterable) {
            return '';
        }

        return `
            <div style="margin-bottom: 1rem;">
                <input
                    type="text"
                    class="${cn(resolveClasses('input', { size: 'sm' }), 'datatable-search')}"
                    placeholder="Search all columns..."
                    aria-label="Filter table"
                    value="${escapeHtml(filterQuery)}"
                    data-ref="searchInput"
                />
            </div>
        `;
    };

    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const containerClass = cn('datatable-container', className);
        const tableWrapperClass = cn(
            resolvePartClasses('datatable', 'wrapper'),
            'table-responsive'
        );
        const tableClass = cn(resolveClasses('datatable'), 'datatable');

        return `
            <div class="${containerClass}">
                ${renderFilterBar()}
                <div class="${tableWrapperClass}" role="region" aria-label="${escapeHtml(ariaLabel)}" tabindex="0">
                    <table class="${tableClass}">
                        ${renderHeader()}
                        ${renderBody()}
                    </table>
                </div>
                ${renderPagination()}
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        currentPage,
        sortColumn,
        sortDirection,
        filterQuery,
        selectedRows: Array.from(selectedRows)
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        // Search/filter
        const searchInput = el.querySelector('.datatable-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterQuery = e.target.value;
                currentPage = 1;
                component.setState({
                    filterQuery,
                    currentPage
                });
                if (onFilter) {
                    onFilter(filterQuery);
                }
            });
        }

        // Sorting
        el.querySelectorAll('th.sortable').forEach(header => {
            const doSort = () => {
                const column = header.dataset.column;

                if (sortColumn === column) {
                    // Toggle direction
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    // New column
                    sortColumn = column;
                    sortDirection = 'asc';
                }

                currentPage = 1;
                component.setState({
                    sortColumn,
                    sortDirection,
                    currentPage
                });

                if (onSort) {
                    onSort(column, sortDirection);
                }
            };

            header.addEventListener('click', doSort);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    doSort();
                }
            });
        });

        // Pagination
        const prevBtn = el.querySelector('.datatable-prev-page');
        const nextBtn = el.querySelector('.datatable-next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    component.setState({ currentPage });
                    if (onPageChange) {
                        onPageChange(currentPage);
                    }
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = getTotalPages();
                if (currentPage < totalPages) {
                    currentPage++;
                    component.setState({ currentPage });
                    if (onPageChange) {
                        onPageChange(currentPage);
                    }
                }
            });
        }

        // Row selection
        if (selectable) {
            const selectAllCheckbox = el.querySelector('[data-ref="selectAll"]');
            const rowCheckboxes = el.querySelectorAll('.datatable-row-checkbox');

            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    rowCheckboxes.forEach((checkbox, idx) => {
                        checkbox.checked = isChecked;
                        if (isChecked) {
                            selectedRows.add(idx);
                        } else {
                            selectedRows.delete(idx);
                        }
                    });
                    component.setState({
                        selectedRows: Array.from(selectedRows)
                    });
                    if (onSelectionChange) {
                        onSelectionChange(Array.from(selectedRows));
                    }
                });
            }

            rowCheckboxes.forEach((checkbox, idx) => {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedRows.add(idx);
                    } else {
                        selectedRows.delete(idx);
                    }
                    component.setState({
                        selectedRows: Array.from(selectedRows)
                    });
                    if (onSelectionChange) {
                        onSelectionChange(Array.from(selectedRows));
                    }
                });
            });
        }

        // Row click
        if (onRowClick) {
            el.querySelectorAll('.datatable-row').forEach((row) => {
                row.addEventListener('click', (e) => {
                    // Don't trigger on checkbox or button clicks
                    if (e.target.closest('input[type="checkbox"], button')) {
                        return;
                    }

                    const rowIndex = parseInt(row.dataset.rowIndex);
                    const displayData = getDisplayData();
                    if (displayData[rowIndex]) {
                        onRowClick(displayData[rowIndex], rowIndex);
                    }
                });

                // Add cursor pointer style
                row.style.cursor = 'pointer';
            });
        }

        // Listeners are attached to elements replaced on re-render;
        // they are released with the old DOM subtree.
        return () => {};
    });

    // Export utility methods
    component.getCurrentPage = () => currentPage;
    component.setCurrentPage = (page) => {
        currentPage = Math.max(1, Math.min(page, getTotalPages()));
        component.setState({ currentPage });
    };
    component.getSortColumn = () => sortColumn;
    component.getSortDirection = () => sortDirection;
    component.getFilterQuery = () => filterQuery;
    component.setFilterQuery = (query) => {
        filterQuery = query;
        currentPage = 1;
        component.setState({ filterQuery, currentPage });
    };
    component.getSelectedRows = () => Array.from(selectedRows);
    component.clearSelection = () => {
        selectedRows.clear();
        component.setState({ selectedRows: [] });
    };
    component.getTotalRows = () => getTotalRows();
    component.getTotalPages = () => getTotalPages();

    return component;
}
