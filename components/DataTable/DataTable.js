/**
 * DataTable Component for rnxJS
 * Sortable, filterable, paginated data display
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

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
    onSort,
    onFilter,
    onPageChange,
    onSelectionChange,
    onRowClick,
    className = ''
}) {
    // Validate inputs
    if (!Array.isArray(columns) || columns.length === 0) {
        throw new Error('DataTable: columns must be a non-empty array');
    }

    if (!Array.isArray(rows)) {
        rows = [];
    }

    // Component state
    let currentPage = 1;
    let sortColumn = null;
    let sortDirection = 'asc';
    let filterQuery = '';
    let selectedRows = new Set();

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
        return `
            <thead>
                <tr>
                    ${selectable ? `
                        <th class="datatable-checkbox" style="width: 40px;">
                            <input type="checkbox" class="form-check-input" data-ref="selectAll" />
                        </th>
                    ` : ''}
                    ${columns.map(col => `
                        <th
                            class="datatable-header ${col.sortable ? 'sortable' : ''} ${sortColumn === col.key ? `sorted-${sortDirection}` : ''}"
                            data-column="${col.key}"
                            style="${col.width ? `width: ${col.width};` : ''}"
                        >
                            <div class="d-flex align-items-center justify-content-between">
                                <span>${escapeHtml(col.label)}</span>
                                ${col.sortable ? `
                                    <i class="bi ${
                                        sortColumn === col.key
                                            ? sortDirection === 'asc'
                                                ? 'bi-sort-up'
                                                : 'bi-sort-down'
                                            : 'bi-arrow-down-up'
                                    } ms-2 opacity-50"></i>
                                ` : ''}
                            </div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
        `;
    };

    /**
     * Render table body
     */
    const renderBody = () => {
        if (loading) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${columns.length + (selectable ? 1 : 0)}" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            `;
        }

        if (error) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${columns.length + (selectable ? 1 : 0)}" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            ${escapeHtml(error)}
                        </td>
                    </tr>
                </tbody>
            `;
        }

        const displayData = getDisplayData();
        if (displayData.length === 0) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${columns.length + (selectable ? 1 : 0)}" class="text-center text-muted py-4">
                            ${escapeHtml(emptyMessage)}
                        </td>
                    </tr>
                </tbody>
            `;
        }

        return `
            <tbody>
                ${displayData.map((row, idx) => `
                    <tr
                        class="datatable-row ${selectedRows.has(idx) ? 'table-active' : ''}"
                        data-row-index="${idx}"
                        data-row-id="${row.id || idx}"
                    >
                        ${selectable ? `
                            <td class="datatable-checkbox">
                                <input
                                    type="checkbox"
                                    class="form-check-input datatable-row-checkbox"
                                    data-row-index="${idx}"
                                    ${selectedRows.has(idx) ? 'checked' : ''}
                                />
                            </td>
                        ` : ''}
                        ${columns.map(col => `
                            <td data-column="${col.key}">
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

        return `
            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <small class="text-muted">
                    Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalRows)}
                    of ${totalRows} results
                </small>
                <nav aria-label="Table pagination">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                            <button class="page-link datatable-prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">
                                Page ${currentPage} of ${totalPages}
                            </span>
                        </li>
                        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
                            <button class="page-link datatable-next-page" ${currentPage >= totalPages ? 'disabled' : ''}>
                                <i class="bi bi-chevron-right"></i>
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
            <div class="mb-3">
                <input
                    type="text"
                    class="form-control form-control-sm datatable-search"
                    placeholder="Search all columns..."
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
        return `
            <div class="datatable-container ${className}">
                ${renderFilterBar()}
                <div class="table-responsive">
                    <table class="table table-hover table-sm datatable">
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
            header.addEventListener('click', () => {
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

        // Return cleanup function
        return () => {
            // Cleanup event listeners (handled by component auto-cleanup)
        };
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
