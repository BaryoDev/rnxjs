/**
 * VirtualList Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Efficient rendering of large lists using virtual scrolling.
 * Only renders visible items + buffer for smooth scrolling.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, escapeAttribute } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create a virtual scrolling list component
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to render
 * @param {number} [options.itemHeight=40] - Height of each item in pixels
 * @param {number} [options.visibleCount=20] - Number of visible items
 * @param {number} [options.bufferSize=5] - Number of extra items to render above/below viewport
 * @param {Function} options.renderItem - Function to render each item (item, index) => HTML string
 *                                         ⚠️ SECURITY WARNING: You MUST escape user content yourself!
 *                                         Use escapeHtml() from '@arnelirobles/rnxjs/utils/security'
 * @param {Function} [options.renderItemSafe] - SAFE alternative: renders text-only content (auto-escaped)
 *                                               Use this instead of renderItem if you only need text.
 *                                               Returns object: { title, subtitle, content }
 * @param {string} [options.height] - Container height (CSS value, defaults to auto-calculated)
 * @param {string} [options.className=''] - Additional CSS classes for container
 * @param {Function} [options.onScroll] - Scroll event callback
 * @param {Object} [options.state] - Reactive state object (for auto-updates)
 * @returns {HTMLElement} Virtual list component
 *
 * @example
 * // UNSAFE: User content not escaped
 * const unsafeList = VirtualList({
 *   items: state.items,
 *   renderItem: (item) => `<div>${item.title}</div>`  // ❌ XSS RISK!
 * });
 *
 * @example
 * // SAFE: Using escapeHtml
 * import { escapeHtml } from '@arnelirobles/rnxjs/utils/security';
 * const safeList = VirtualList({
 *   items: state.items,
 *   renderItem: (item) => `
 *     <div class="item">
 *       <h3>${escapeHtml(item.title)}</h3>
 *       <p>${escapeHtml(item.description)}</p>
 *     </div>
 *   ` // ✅ SAFE
 * });
 *
 * @example
 * // SAFE: Using renderItemSafe (text only, auto-escaped)
 * const safeTextList = VirtualList({
 *   items: state.items,
 *   renderItemSafe: (item) => ({
 *     title: item.title,      // Auto-escaped
 *     subtitle: item.author,  // Auto-escaped
 *     content: item.preview   // Auto-escaped
 *   })
 * });
 */
export function VirtualList(options = {}) {
    const {
        items = [],
        itemHeight = 40,
        visibleCount = 20,
        bufferSize = 5,
        renderItem,
        renderItemSafe,
        height,
        className = '',
        onScroll,
        state
    } = options;

    // Validate render function
    if (!renderItem && !renderItemSafe) {
        throw new TypeError('[rnxJS] VirtualList: renderItem must be a function (or provide renderItemSafe)');
    }

    if (renderItem && typeof renderItem !== 'function') {
        throw new TypeError('[rnxJS] VirtualList: renderItem must be a function');
    }

    if (renderItemSafe && typeof renderItemSafe !== 'function') {
        throw new TypeError('[rnxJS] VirtualList: renderItemSafe must be a function');
    }

    if (!Array.isArray(items)) {
        console.warn('[rnxJS] VirtualList: items must be an array');
    }

    // Current items (mutable so state updates and refresh() re-render correctly)
    let currentItems = Array.isArray(items) ? items : [];

    // Calculate dimensions
    const containerHeight = height || `${visibleCount * itemHeight}px`;
    const getTotalHeight = () => currentItems.length * itemHeight;

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
            currentItems.length,
            Math.ceil((scrollTop + parseInt(containerHeight)) / itemHeight) + bufferSize
        );
    };

    /**
     * Render visible items
     */
    const renderVisibleItems = () => {
        calculateVisibleRange();

        const itemPartClass = cn(
            resolvePartClasses('virtuallist', 'item'),
            'rnx-virtual-list-item'
        );

        const itemsHtml = [];
        for (let i = startIndex; i < endIndex; i++) {
            const item = currentItems[i];
            if (!item) continue;

            const offsetTop = i * itemHeight;

            // Determine which render function to use
            let content;
            if (renderItemSafe) {
                // SAFE MODE: Auto-escape all content
                const data = renderItemSafe(item, i);
                const title = data?.title ? escapeHtml(data.title) : '';
                const subtitle = data?.subtitle ? escapeHtml(data.subtitle) : '';
                const itemContent = data?.content ? escapeHtml(data.content) : '';

                content = `
                    <div class="rnx-virtual-list-item-inner">
                        ${title ? `<div class="item-title">${title}</div>` : ''}
                        ${subtitle ? `<div class="item-subtitle">${subtitle}</div>` : ''}
                        ${itemContent ? `<div class="item-content">${itemContent}</div>` : ''}
                    </div>
                `;
            } else {
                // UNSAFE MODE: Developer is responsible for escaping
                content = renderItem(item, i);
            }

            itemsHtml.push(`
                <div
                    class="${itemPartClass}"
                    data-index="${i}"
                    role="listitem"
                    aria-setsize="${currentItems.length}"
                    aria-posinset="${i + 1}"
                    style="
                        position: absolute;
                        top: ${offsetTop}px;
                        height: ${itemHeight}px;
                        width: 100%;
                        left: 0;
                    "
                >
                    ${content}
                </div>
            `);
        }

        return itemsHtml.join('');
    };

    /**
     * Template function for the component
     */
    const template = () => {
        // Resolve classes from active theme
        const containerClass = cn(
            resolveClasses('virtuallist'),
            'rnx-virtual-list',
            className
        );
        const contentClass = cn(
            resolvePartClasses('virtuallist', 'container'),
            'rnx-virtual-list-content'
        );

        return `
            <div
                class="${containerClass}"
                data-ref="container"
                style="
                    height: ${escapeAttribute(containerHeight)};
                    overflow-y: auto;
                    position: relative;
                "
            >
                <div
                    class="${contentClass}"
                    data-ref="content"
                    role="list"
                    style="
                        height: ${getTotalHeight()}px;
                        position: relative;
                    "
                >
                    ${renderVisibleItems()}
                </div>
            </div>
        `;
    };

    // Create the component
    const component = createComponent(template, {
        items,
        scrollTop: 0,
        startIndex: 0,
        endIndex: 0
    });

    // Set up scroll handler (removed with stored reference in cleanup)
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
                currentItems = Array.isArray(state[itemsPath]) ? state[itemsPath] : [];
                component.setState({
                    items: currentItems
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
            container.scrollTop = getTotalHeight();
        }
    };

    component.getVisibleRange = () => ({
        startIndex,
        endIndex,
        count: endIndex - startIndex
    });

    component.refresh = () => {
        currentItems = Array.isArray(options.items) ? options.items : [];
        component.setState({
            items: currentItems
        });
    };

    return component;
}
