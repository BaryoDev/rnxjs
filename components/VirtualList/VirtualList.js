/**
 * VirtualList Component for rnxJS
 * Efficient rendering of large lists using virtual scrolling
 * Only renders visible items + buffer for smooth scrolling
 */

import { createComponent } from '../../utils/createComponent.js';

/**
 * Create a virtual scrolling list component
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to render
 * @param {number} [options.itemHeight=40] - Height of each item in pixels
 * @param {number} [options.visibleCount=20] - Number of visible items
 * @param {number} [options.bufferSize=5] - Number of extra items to render above/below viewport
 * @param {Function} options.renderItem - Function to render each item (item, index) => HTML string
 * @param {string} [options.height] - Container height (CSS value, defaults to auto-calculated)
 * @param {string} [options.className=''] - Additional CSS classes for container
 * @param {Function} [options.onScroll] - Scroll event callback
 * @param {Object} [options.state] - Reactive state object (for auto-updates)
 * @returns {HTMLElement} Virtual list component
 *
 * @example
 * const list = VirtualList({
 *   items: state.items,
 *   itemHeight: 50,
 *   visibleCount: 20,
 *   renderItem: (item, index) => `
 *     <div class="list-item">
 *       <h3>${item.title}</h3>
 *       <p>${item.description}</p>
 *     </div>
 *   `
 * });
 */
export function VirtualList(options) {
    const {
        items = [],
        itemHeight = 40,
        visibleCount = 20,
        bufferSize = 5,
        renderItem,
        height,
        className = '',
        onScroll,
        state
    } = options;

    if (!renderItem || typeof renderItem !== 'function') {
        throw new TypeError('[rnxJS] VirtualList: renderItem must be a function');
    }

    if (!Array.isArray(items)) {
        console.warn('[rnxJS] VirtualList: items must be an array');
    }

    // Calculate dimensions
    const containerHeight = height || `${visibleCount * itemHeight}px`;
    const totalHeight = items.length * itemHeight;

    // Component state
    let scrollTop = 0;
    let startIndex = 0;
    let endIndex = 0;

    /**
     * Calculate which items should be visible
     */
    const calculateVisibleRange = () => {
        startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
        endIndex = Math.min(
            items.length,
            Math.ceil((scrollTop + parseInt(containerHeight)) / itemHeight) + bufferSize
        );
    };

    /**
     * Render visible items
     */
    const renderVisibleItems = () => {
        calculateVisibleRange();

        const itemsHtml = [];
        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i];
            if (!item) continue;

            const offsetTop = i * itemHeight;
            itemsHtml.push(`
                <div
                    class="rnx-virtual-list-item"
                    data-index="${i}"
                    style="
                        position: absolute;
                        top: ${offsetTop}px;
                        height: ${itemHeight}px;
                        width: 100%;
                        left: 0;
                    "
                >
                    ${renderItem(item, i)}
                </div>
            `);
        }

        return itemsHtml.join('');
    };

    /**
     * Template function for the component
     */
    const template = () => `
        <div
            class="rnx-virtual-list ${className}"
            data-ref="container"
            style="
                height: ${containerHeight};
                overflow-y: auto;
                position: relative;
            "
        >
            <div
                class="rnx-virtual-list-content"
                data-ref="content"
                style="
                    height: ${totalHeight}px;
                    position: relative;
                "
            >
                ${renderVisibleItems()}
            </div>
        </div>
    `;

    // Create the component
    const component = createComponent(template, {
        items,
        scrollTop: 0,
        startIndex: 0,
        endIndex: 0
    });

    // Set up scroll handler
    component.useEffect((el) => {
        const container = el.refs.container;
        if (!container) return;

        const handleScroll = () => {
            const newScrollTop = container.scrollTop;

            // Only update if scroll position changed significantly
            if (Math.abs(newScrollTop - scrollTop) > itemHeight / 2) {
                scrollTop = newScrollTop;

                // Update visible items
                const content = el.refs.content;
                if (content) {
                    const prevStart = startIndex;
                    const prevEnd = endIndex;

                    calculateVisibleRange();

                    // Only re-render if visible range changed
                    if (startIndex !== prevStart || endIndex !== prevEnd) {
                        content.innerHTML = renderVisibleItems();
                    }
                }

                // Call user scroll callback
                if (onScroll && typeof onScroll === 'function') {
                    onScroll({
                        scrollTop: newScrollTop,
                        startIndex,
                        endIndex,
                        visibleItems: endIndex - startIndex
                    });
                }
            }
        };

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    });

    // Subscribe to state changes if reactive state provided
    if (state && typeof state.subscribe === 'function') {
        const itemsPath = options.itemsPath || 'items';

        component.useEffect(() => {
            const unsubscribe = state.subscribe(itemsPath, () => {
                // Items changed, re-render
                component.setState({
                    items: state[itemsPath] || []
                });
            });

            return unsubscribe;
        });
    }

    // Add utility methods
    component.scrollToIndex = (index) => {
        const container = component.refs.container;
        if (container) {
            container.scrollTop = index * itemHeight;
        }
    };

    component.scrollToTop = () => {
        const container = component.refs.container;
        if (container) {
            container.scrollTop = 0;
        }
    };

    component.scrollToBottom = () => {
        const container = component.refs.container;
        if (container) {
            container.scrollTop = totalHeight;
        }
    };

    component.getVisibleRange = () => ({
        startIndex,
        endIndex,
        count: endIndex - startIndex
    });

    component.refresh = () => {
        component.setState({
            items: options.items || []
        });
    };

    return component;
}
