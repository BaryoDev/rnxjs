/**
 * DatePicker Component for rnxJS
 * Calendar-based date selection with mobile fallback
 */

import { createComponent } from '../../utils/createComponent.js';
import { Input } from '../Input/Input.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create a date picker with calendar popup
 *
 * @param {Object} options - Configuration options
 * @param {string} options.label - Input label
 * @param {string} options.value - Initial date value (YYYY-MM-DD format)
 * @param {string} options.format - Date format (default: 'YYYY-MM-DD')
 * @param {string} options.min - Minimum date (YYYY-MM-DD)
 * @param {string} options.max - Maximum date (YYYY-MM-DD)
 * @param {Array} options.disabledDates - Array of disabled dates (YYYY-MM-DD format)
 * @param {Function} options.onchange - Change callback: (date) => {}
 * @param {string} options.className - Additional CSS classes
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
    className = ''
}) {
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
            className
        });
    }

    let isOpen = false;
    let selectedDate = value;
    let currentMonth = new Date();

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

        let html = `
            <div class="datepicker-calendar">
                <div class="datepicker-header d-flex justify-content-between align-items-center p-2">
                    <button class="btn btn-sm btn-outline-secondary datepicker-prev" type="button">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <span class="fw-bold">${year} - ${String(month + 1).padStart(2, '0')}</span>
                    <button class="btn btn-sm btn-outline-secondary datepicker-next" type="button">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                <table class="w-100 mb-0">
                    <thead>
                        <tr>
                            <th class="text-center text-muted small">Su</th>
                            <th class="text-center text-muted small">Mo</th>
                            <th class="text-center text-muted small">Tu</th>
                            <th class="text-center text-muted small">We</th>
                            <th class="text-center text-muted small">Th</th>
                            <th class="text-center text-muted small">Fr</th>
                            <th class="text-center text-muted small">Sa</th>
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

                    html += `
                        <td class="text-center p-1">
                            <button
                                type="button"
                                class="btn btn-sm w-100 datepicker-day ${isSelected ? 'btn-primary' : 'btn-light'} ${disabled ? 'disabled' : ''}"
                                data-date="${dateStr}"
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
        return `
            <div class="datepicker-wrapper ${className}" data-ref="wrapper">
                <div class="mb-2">
                    <label class="form-label">${escapeHtml(label)}</label>
                    <div class="input-group">
                        <input
                            type="text"
                            class="form-control datepicker-input"
                            value="${selectedDate}"
                            placeholder="YYYY-MM-DD"
                            readonly
                            data-ref="input"
                        />
                        <button class="btn btn-outline-secondary" type="button" data-ref="triggerBtn">
                            <i class="bi bi-calendar"></i>
                        </button>
                    </div>
                </div>
                ${isOpen ? `
                    <div class="datepicker-dropdown card shadow-sm" data-ref="dropdown">
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
     * Setup event listeners
     */
    component.useEffect((el) => {
        // Toggle dropdown
        const trigger = el.refs.triggerBtn;
        if (trigger) {
            trigger.addEventListener('click', () => {
                isOpen = !isOpen;
                component.setState({ isOpen });
            });
        }

        // Date selection
        if (el.refs.dropdown) {
            el.refs.dropdown.querySelectorAll('.datepicker-day:not(:disabled)').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    selectedDate = e.target.dataset.date;
                    isOpen = false;
                    component.setState({ isOpen, selectedDate });
                    if (onchange) {
                        onchange(selectedDate);
                    }
                });
            });

            // Month navigation
            el.refs.dropdown.querySelector('.datepicker-prev')?.addEventListener('click', () => {
                currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
                component.setState({ currentMonth });
            });

            el.refs.dropdown.querySelector('.datepicker-next')?.addEventListener('click', () => {
                currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
                component.setState({ currentMonth });
            });
        }

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
    component.getValue = () => selectedDate;
    component.setValue = (newDate) => {
        selectedDate = newDate;
        component.setState({ selectedDate });
    };

    return component;
}
