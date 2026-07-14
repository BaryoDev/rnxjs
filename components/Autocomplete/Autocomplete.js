/**
 * Autocomplete Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Search-as-you-type with async support, keyboard navigation and
 * WAI-ARIA combobox semantics.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let autocompleteUid = 0;

/**
 * Resolve just the state classes for a component (without its base classes)
 */
const stateClasses = (component, state) => {
    const base = resolveClasses(component);
    const withState = resolveClasses(component, { [state]: true });
    return withState.startsWith(base) ? withState.slice(base.length).trim() : withState;
};

/**
 * Create an autocomplete input with dropdown suggestions
 *
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.label] - Input label (associated via for/id)
 * @param {Array|Function} [options.items] - Array of items or async function returning items
 * @param {string} [options.placeholder] - Input placeholder
 * @param {string} [options.value] - Initial value
 * @param {boolean} [options.multiple] - Enable multiple selection (default: false)
 * @param {number} [options.debounce] - Debounce delay in ms (default: 300)
 * @param {number} [options.minChars] - Minimum characters to trigger search (default: 1)
 * @param {Function} [options.renderItem] - Custom item renderer (default: label)
 * @param {Function} [options.onchange] - Change callback: (value) => {}
 * @param {Function} [options.onselect] - Selection callback: (item) => {}
 * @param {string} [options.id] - Input HTML id attribute (auto-generated if omitted)
 * @param {string} [options.className] - Additional CSS classes
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
    renderItem = (item) => (item && item.label) || String(item),
    onchange,
    onselect,
    id,
    className = ''
} = {}) {
    let isOpen = false;
    let isLoading = false;
    let selectedItems = multiple ? [] : null;
    let inputValue = value;
    let filteredItems = [];
    let highlightedIndex = -1;
    let debounceTimer = null;

    const finalId = id || `autocomplete-${++autocompleteUid}`;
    const listboxId = `${finalId}-listbox`;
    const optionId = (index) => `${finalId}-option-${index}`;

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
                const itemText = String(renderItem(item)).toLowerCase();
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
        // Resolve classes from active theme
        const wrapperClass = cn(resolveClasses('autocomplete'), 'autocomplete-wrapper', className);
        const labelClass = resolvePartClasses('input', 'label');
        const inputClass = cn(resolvePartClasses('autocomplete', 'input'), 'autocomplete-input');
        const dropdownClass = cn(
            resolvePartClasses('autocomplete', 'dropdown'),
            stateClasses('autocomplete', 'show'),
            'autocomplete-dropdown'
        );
        const itemClass = cn(resolvePartClasses('autocomplete', 'item'), 'autocomplete-item');
        const tagClass = cn(resolveClasses('chips', { variant: 'primary' }), 'badge');
        const checkboxClass = resolveClasses('checkbox');
        const spinnerClass = cn(resolveClasses('spinner', { variant: 'border', size: 'sm' }), 'spinner-border spinner-border-sm');

        const expanded = isOpen && filteredItems.length > 0;
        const isItemSelected = (item) => multiple ? selectedItems.includes(item) : selectedItems === item;

        return `
            <div class="${wrapperClass}" data-ref="wrapper">
                ${label ? `<label class="${labelClass}" for="${escapeHtml(finalId)}">${escapeHtml(label)}</label>` : ''}
                <div class="autocomplete-field" style="position: relative;">
                    <input
                        type="text"
                        id="${escapeHtml(finalId)}"
                        class="${inputClass}"
                        role="combobox"
                        aria-expanded="${expanded ? 'true' : 'false'}"
                        aria-autocomplete="list"
                        aria-controls="${escapeHtml(listboxId)}"
                        ${expanded && highlightedIndex >= 0 ? `aria-activedescendant="${escapeHtml(optionId(highlightedIndex))}"` : ''}
                        placeholder="${escapeHtml(placeholder)}"
                        value="${escapeHtml(inputValue)}"
                        autocomplete="off"
                        data-ref="input"
                    />
                    ${isLoading ? `
                        <div class="autocomplete-loading">
                            <div class="${spinnerClass}" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ` : ''}
                    ${expanded ? `
                        <div class="${dropdownClass}" data-ref="dropdown">
                            <ul class="autocomplete-list" id="${escapeHtml(listboxId)}" role="listbox" ${multiple ? 'aria-multiselectable="true"' : ''} style="list-style: none; margin: 0; padding: 0;">
                                ${filteredItems.map((item, index) => `
                                    <li id="${escapeHtml(optionId(index))}"
                                        role="option"
                                        aria-selected="${isItemSelected(item) ? 'true' : 'false'}"
                                        class="${itemClass} ${index === highlightedIndex ? 'active' : ''} ${multiple && selectedItems.includes(item) ? 'selected' : ''}"
                                        data-index="${index}">
                                        ${multiple ? `
                                            <input type="checkbox" class="${checkboxClass}" style="margin-right: 0.5rem;" tabindex="-1"
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
                        <div class="${cn(resolvePartClasses('autocomplete', 'item'), 'autocomplete-empty')}" role="status">
                            No results found
                        </div>
                    ` : ''}
                </div>
                ${multiple && selectedItems.length > 0 ? `
                    <div class="autocomplete-tags" style="margin-top: 0.5rem;">
                        ${selectedItems.map((item, index) => `
                            <span class="${tagClass}">
                                ${escapeHtml(renderItem(item))}
                                <button type="button" class="autocomplete-remove"
                                    data-index="${index}" aria-label="Remove ${escapeHtml(renderItem(item))}">&times;</button>
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
     * Setup event listeners (all removed again in the returned cleanup)
     */
    component.useEffect((el) => {
        const cleanups = [];
        const on = (target, event, handler) => {
            target.addEventListener(event, handler);
            cleanups.push(() => target.removeEventListener(event, handler));
        };

        const input = el.querySelector('.autocomplete-input');

        if (input) {
            // Input change
            on(input, 'input', (e) => {
                handleInputChange(e.target.value);
            });

            // Keyboard navigation
            on(input, 'keydown', handleKeyboard);

            // Focus
            on(input, 'focus', () => {
                if (inputValue.length > 0) {
                    isOpen = true;
                    component.setState({ isOpen });
                }
            });
        }

        // Item selection
        el.querySelectorAll('.autocomplete-item').forEach((item) => {
            on(item, 'click', (e) => {
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
            on(checkbox, 'change', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectItem(filteredItems[index]);
            });
        });

        // Remove tag
        el.querySelectorAll('.autocomplete-remove').forEach((btn) => {
            on(btn, 'click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.index);
                selectedItems.splice(index, 1);
                component.setState({ selectedItems });
            });
        });

        // Close on outside click
        const handleOutsideClick = (e) => {
            if (isOpen && !el.contains(e.target)) {
                isOpen = false;
                component.setState({ isOpen });
            }
        };
        on(document, 'click', handleOutsideClick);

        return () => cleanups.forEach(fn => fn());
    });

    component.onUnmount(() => {
        clearTimeout(debounceTimer);
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
