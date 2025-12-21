/**
 * Autocomplete Component for rnxJS
 * Search-as-you-type with async support and keyboard navigation
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create an autocomplete input with dropdown suggestions
 *
 * @param {Object} options - Configuration options
 * @param {string} options.label - Input label
 * @param {Array|Function} options.items - Array of items or async function returning items
 * @param {string} options.placeholder - Input placeholder
 * @param {string} options.value - Initial value
 * @param {boolean} options.multiple - Enable multiple selection (default: false)
 * @param {number} options.debounce - Debounce delay in ms (default: 300)
 * @param {number} options.minChars - Minimum characters to trigger search (default: 1)
 * @param {Function} options.renderItem - Custom item renderer (default: label)
 * @param {Function} options.onchange - Change callback: (value) => {}
 * @param {Function} options.onselect - Selection callback: (item) => {}
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} Autocomplete component
 *
 * @example
 * const autocomplete = Autocomplete({
 *   label: 'Select User',
 *   items: [
 *     { id: 1, label: 'John Doe' },
 *     { id: 2, label: 'Jane Smith' },
 *     { id: 3, label: 'Bob Johnson' }
 *   ],
 *   onselect: (item) => console.log('Selected:', item)
 * });
 */
export function Autocomplete({
    label = '',
    items = [],
    placeholder = 'Search...',
    value = '',
    multiple = false,
    debounce = 300,
    minChars = 1,
    renderItem = (item) => item.label || String(item),
    onchange,
    onselect,
    className = ''
}) {
    let isOpen = false;
    let isLoading = false;
    let selectedItems = multiple ? [] : null;
    let inputValue = value;
    let filteredItems = [];
    let highlightedIndex = -1;
    let debounceTimer = null;

    const isAsync = typeof items === 'function';

    /**
     * Filter items based on query
     */
    const filterItems = async (query) => {
        if (query.length < minChars) {
            return [];
        }

        if (isAsync) {
            isLoading = true;
            try {
                const results = await items(query);
                isLoading = false;
                component.setState({ isLoading, filteredItems: results });
                return results;
            } catch (error) {
                isLoading = false;
                component.setState({ isLoading });
                return [];
            }
        } else {
            const query_lower = query.toLowerCase();
            return items.filter(item => {
                const itemText = renderItem(item).toLowerCase();
                return itemText.includes(query_lower);
            });
        }
    };

    /**
     * Handle input change
     */
    const handleInputChange = (query) => {
        inputValue = query;
        highlightedIndex = -1;
        isOpen = query.length > 0;

        if (onchange) {
            onchange(query);
        }

        // Debounce search
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            filteredItems = await filterItems(query);
            component.setState({
                inputValue,
                isOpen,
                filteredItems,
                highlightedIndex
            });
        }, debounce);

        component.setState({ inputValue, isOpen, isLoading });
    };

    /**
     * Handle item selection
     */
    const selectItem = (item) => {
        if (multiple) {
            const exists = selectedItems.find(sel => sel === item);
            if (exists) {
                selectedItems = selectedItems.filter(sel => sel !== item);
            } else {
                selectedItems.push(item);
            }
        } else {
            selectedItems = item;
            inputValue = renderItem(item);
            isOpen = false;
        }

        highlightedIndex = -1;
        component.setState({
            selectedItems,
            inputValue,
            isOpen,
            filteredItems: [],
            highlightedIndex
        });

        if (onselect) {
            onselect(multiple ? selectedItems : selectedItems);
        }
    };

    /**
     * Handle keyboard navigation
     */
    const handleKeyboard = (e) => {
        if (!isOpen || filteredItems.length === 0) {
            if (e.key === 'Enter' && inputValue.length > 0) {
                isOpen = true;
                component.setState({ isOpen });
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                highlightedIndex = Math.min(highlightedIndex + 1, filteredItems.length - 1);
                component.setState({ highlightedIndex });
                break;

            case 'ArrowUp':
                e.preventDefault();
                highlightedIndex = Math.max(highlightedIndex - 1, -1);
                component.setState({ highlightedIndex });
                break;

            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    selectItem(filteredItems[highlightedIndex]);
                }
                break;

            case 'Escape':
                e.preventDefault();
                isOpen = false;
                highlightedIndex = -1;
                component.setState({ isOpen, highlightedIndex });
                break;

            default:
                break;
        }
    };

    /**
     * Template function
     */
    const template = () => {
        return `
            <div class="autocomplete-wrapper ${className}" data-ref="wrapper">
                ${label ? `<label class="form-label">${escapeHtml(label)}</label>` : ''}
                <div class="position-relative">
                    <input
                        type="text"
                        class="form-control autocomplete-input"
                        placeholder="${escapeHtml(placeholder)}"
                        value="${escapeHtml(inputValue)}"
                        autocomplete="off"
                        data-ref="input"
                    />
                    ${isLoading ? `
                        <div class="autocomplete-loading">
                            <div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ` : ''}
                    ${isOpen && filteredItems.length > 0 ? `
                        <div class="autocomplete-dropdown card shadow-sm" data-ref="dropdown">
                            <ul class="list-group list-group-flush mb-0">
                                ${filteredItems.map((item, index) => `
                                    <li class="list-group-item autocomplete-item ${index === highlightedIndex ? 'active' : ''} ${multiple && selectedItems.includes(item) ? 'selected' : ''}"
                                        data-index="${index}">
                                        ${multiple ? `
                                            <input type="checkbox" class="form-check-input me-2"
                                                ${selectedItems.includes(item) ? 'checked' : ''}
                                                data-index="${index}" />
                                        ` : ''}
                                        ${escapeHtml(renderItem(item))}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${isOpen && filteredItems.length === 0 && inputValue.length >= minChars && !isLoading ? `
                        <div class="autocomplete-empty text-center text-muted p-3">
                            No results found
                        </div>
                    ` : ''}
                </div>
                ${multiple && selectedItems.length > 0 ? `
                    <div class="autocomplete-tags mt-2">
                        ${selectedItems.map((item, index) => `
                            <span class="badge bg-primary me-2">
                                ${escapeHtml(renderItem(item))}
                                <button type="button" class="btn-close btn-close-white ms-1 autocomplete-remove"
                                    data-index="${index}" aria-label="Remove"></button>
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        inputValue,
        isOpen,
        isLoading,
        filteredItems,
        highlightedIndex,
        selectedItems
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        const input = el.querySelector('.autocomplete-input');

        if (input) {
            // Input change
            input.addEventListener('input', (e) => {
                handleInputChange(e.target.value);
            });

            // Keyboard navigation
            input.addEventListener('keydown', handleKeyboard);

            // Focus
            input.addEventListener('focus', () => {
                if (inputValue.length > 0) {
                    isOpen = true;
                    component.setState({ isOpen });
                }
            });
        }

        // Item selection
        el.querySelectorAll('.autocomplete-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                // Don't trigger on checkbox click in multiple mode
                if (multiple && e.target.type === 'checkbox') {
                    return;
                }

                const index = parseInt(item.dataset.index);
                selectItem(filteredItems[index]);
            });
        });

        // Checkbox selection in multiple mode
        el.querySelectorAll('.autocomplete-item input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectItem(filteredItems[index]);
            });
        });

        // Remove tag
        el.querySelectorAll('.autocomplete-remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.index);
                selectedItems.splice(index, 1);
                component.setState({ selectedItems });
            });
        });

        // Close on outside click
        const handleOutsideClick = (e) => {
            if (!el.contains(e.target)) {
                isOpen = false;
                component.setState({ isOpen });
            }
        };

        if (isOpen) {
            setTimeout(() => {
                document.addEventListener('click', handleOutsideClick);
            }, 0);

            return () => {
                document.removeEventListener('click', handleOutsideClick);
            };
        }
    });

    // Export methods
    component.getValue = () => multiple ? selectedItems : selectedItems;
    component.setValue = (newValue) => {
        if (multiple) {
            selectedItems = Array.isArray(newValue) ? newValue : [];
        } else {
            selectedItems = newValue;
            inputValue = newValue ? renderItem(newValue) : '';
        }
        component.setState({ selectedItems, inputValue });
    };
    component.clear = () => {
        selectedItems = multiple ? [] : null;
        inputValue = '';
        isOpen = false;
        component.setState({ selectedItems, inputValue, isOpen });
    };

    return component;
}
