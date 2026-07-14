/**
 * DatePicker Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Calendar-based date selection with mobile fallback.
 */

import { createComponent } from '../../utils/createComponent.js';
import { Input } from '../Input/Input.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let datePickerUid = 0;

const chevronLeftSvg = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="10 3 5 8 10 13"></polyline></svg>';
const chevronRightSvg = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="6 3 11 8 6 13"></polyline></svg>';
const calendarSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5"></rect><line x1="1.5" y1="6" x2="14.5" y2="6"></line><line x1="5" y1="1" x2="5" y2="4"></line><line x1="11" y1="1" x2="11" y2="4"></line></svg>';

/**
 * Resolve just the state classes for a component (without its base classes)
 */
const stateClasses = (component, state) => {
    const base = resolveClasses(component);
    const withState = resolveClasses(component, { [state]: true });
    return withState.startsWith(base) ? withState.slice(base.length).trim() : withState;
};

/**
 * Create a date picker with calendar popup
 *
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.label] - Input label (associated via for/id)
 * @param {string} [options.value] - Initial date value (YYYY-MM-DD format)
 * @param {string} [options.format] - Date format (default: 'YYYY-MM-DD')
 * @param {string} [options.min] - Minimum date (YYYY-MM-DD)
 * @param {string} [options.max] - Maximum date (YYYY-MM-DD)
 * @param {Array} [options.disabledDates] - Array of disabled dates (YYYY-MM-DD format)
 * @param {Function} [options.onchange] - Change callback: (date) => {}
 * @param {string} [options.id] - Input HTML id attribute (auto-generated if omitted)
 * @param {string} [options.className] - Additional CSS classes
 * @returns {HTMLElement} DatePicker component
 *
 * @example
 * const picker = DatePicker({
 *   label: 'Birth Date',
 *   value: '2024-01-15',
 *   min: '2000-01-01',
 *   onchange: (date) => console.log(date)
 * });
 */
export function DatePicker({
    label = '',
    value = '',
    format = 'YYYY-MM-DD',
    min = null,
    max = null,
    disabledDates = [],
    onchange,
    id,
    className = ''
} = {}) {
    // Check if mobile (use native picker)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Return native HTML5 date input on mobile
        return Input({
            type: 'date',
            label,
            value,
            min,
            max,
            onchange,
            id,
            className
        });
    }

    let isOpen = false;
    let selectedDate = value;
    let currentMonth = new Date();

    const finalId = id || `datepicker-${++datePickerUid}`;

    /**
     * Parse date string to Date object
     */
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    /**
     * Format date to string
     */
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * Check if date is disabled
     */
    const isDisabled = (dateStr) => {
        if (min && dateStr < min) return true;
        if (max && dateStr > max) return true;
        if (disabledDates.includes(dateStr)) return true;
        return false;
    };

    /**
     * Render calendar
     */
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const headerClass = cn(resolvePartClasses('datepicker', 'header'), 'datepicker-header');
        const navBtnClass = resolveClasses('button', { variant: 'secondary', size: 'sm' });
        const dayClass = resolvePartClasses('datepicker', 'day') || resolveClasses('button', { variant: 'light', size: 'sm' });
        const daySelectedClass = stateClasses('datepicker', 'selected') || resolveClasses('button', { variant: 'primary', size: 'sm' });
        const dayTodayClass = stateClasses('datepicker', 'today');
        const todayStr = formatDate(new Date());

        let html = `
            <div class="datepicker-calendar">
                <div class="${headerClass}" style="display: flex; align-items: center; justify-content: space-between;">
                    <button class="${navBtnClass} datepicker-prev" type="button" aria-label="Previous month">
                        ${chevronLeftSvg}
                    </button>
                    <span class="datepicker-title" aria-live="polite">${year} - ${String(month + 1).padStart(2, '0')}</span>
                    <button class="${navBtnClass} datepicker-next" type="button" aria-label="Next month">
                        ${chevronRightSvg}
                    </button>
                </div>
                <table class="datepicker-grid" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th class="datepicker-weekday" scope="col"><abbr title="Sunday">Su</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Monday">Mo</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Tuesday">Tu</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Wednesday">We</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Thursday">Th</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Friday">Fr</abbr></th>
                            <th class="datepicker-weekday" scope="col"><abbr title="Saturday">Sa</abbr></th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let day = 1;
        for (let i = 0; i < 6; i++) {
            html += '<tr>';
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < startingDayOfWeek) || day > daysInMonth) {
                    html += '<td></td>';
                } else {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const disabled = isDisabled(dateStr);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    html += `
                        <td style="text-align: center; padding: 1px;">
                            <button
                                type="button"
                                class="${cn(dayClass, isToday ? dayTodayClass : '', isSelected ? daySelectedClass : '')} datepicker-day ${disabled ? 'disabled' : ''}"
                                data-date="${dateStr}"
                                ${isSelected ? 'aria-pressed="true"' : ''}
                                ${disabled ? 'disabled' : ''}
                            >
                                ${day}
                            </button>
                        </td>
                    `;
                    day++;
                }
            }
            html += '</tr>';
            if (day > daysInMonth) break;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    };

    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const wrapperClass = cn(resolveClasses('datepicker'), 'datepicker-wrapper', className);
        const labelClass = resolvePartClasses('input', 'label');
        const inputClass = cn(resolvePartClasses('datepicker', 'input'), 'datepicker-input');
        const calendarClass = cn(resolvePartClasses('datepicker', 'calendar'), 'datepicker-dropdown');
        const triggerClass = resolveClasses('button', { variant: 'secondary' });

        return `
            <div class="${wrapperClass}" data-ref="wrapper">
                <div class="datepicker-field-group">
                    ${label ? `<label class="${labelClass}" for="${escapeHtml(finalId)}">${escapeHtml(label)}</label>` : ''}
                    <div class="datepicker-field" style="display: flex; align-items: center; gap: 0.5rem;">
                        <input
                            type="text"
                            id="${escapeHtml(finalId)}"
                            class="${inputClass}"
                            value="${escapeHtml(selectedDate)}"
                            placeholder="YYYY-MM-DD"
                            readonly
                            aria-haspopup="dialog"
                            aria-expanded="${isOpen ? 'true' : 'false'}"
                            data-ref="input"
                        />
                        <button class="${triggerClass} datepicker-toggle" type="button"
                            aria-label="${isOpen ? 'Close calendar' : 'Open calendar'}"
                            aria-expanded="${isOpen ? 'true' : 'false'}"
                            data-ref="triggerBtn">
                            ${calendarSvg}
                        </button>
                    </div>
                </div>
                ${isOpen ? `
                    <div class="${calendarClass}" role="dialog" aria-modal="false" aria-label="Choose date" data-ref="dropdown">
                        ${renderCalendar()}
                    </div>
                ` : ''}
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        isOpen,
        selectedDate,
        currentMonth
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

        // Toggle dropdown
        const trigger = el.refs.triggerBtn;
        if (trigger) {
            on(trigger, 'click', () => {
                isOpen = !isOpen;
                component.setState({ isOpen });
            });
        }

        // Date selection
        if (el.refs.dropdown) {
            el.refs.dropdown.querySelectorAll('.datepicker-day:not(:disabled)').forEach((btn) => {
                on(btn, 'click', () => {
                    selectedDate = btn.dataset.date;
                    isOpen = false;
                    component.setState({ isOpen, selectedDate });
                    if (onchange) {
                        onchange(selectedDate);
                    }
                });
            });

            // Month navigation
            const prevBtn = el.refs.dropdown.querySelector('.datepicker-prev');
            if (prevBtn) {
                on(prevBtn, 'click', () => {
                    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
                    component.setState({ currentMonth });
                });
            }

            const nextBtn = el.refs.dropdown.querySelector('.datepicker-next');
            if (nextBtn) {
                on(nextBtn, 'click', () => {
                    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
                    component.setState({ currentMonth });
                });
            }
        }

        // Close on outside click
        const handleOutsideClick = (e) => {
            if (isOpen && !el.contains(e.target)) {
                isOpen = false;
                component.setState({ isOpen });
            }
        };
        on(document, 'click', handleOutsideClick);

        // Dismiss calendar with Escape
        const handleKeydown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                isOpen = false;
                component.setState({ isOpen });
            }
        };
        on(document, 'keydown', handleKeydown);

        return () => cleanups.forEach(fn => fn());
    });

    // Export methods
    component.getValue = () => selectedDate;
    component.setValue = (newDate) => {
        selectedDate = newDate;
        component.setState({ selectedDate });
    };

    return component;
}
