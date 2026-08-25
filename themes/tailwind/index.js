/**
 * Tailwind Theme for rnxJS v2.0
 *
 * Professional design system built with Tailwind CSS.
 *
 * Design language:
 * - Indigo primary with slate neutrals; semantic emerald/red/amber/sky
 * - 14px UI density (text-sm controls) for production applications
 * - rounded-md controls, rounded-lg surfaces
 * - Depth discipline: shadow-sm on cards/controls, shadow-lg for popovers,
 *   shadow-xl for modals only
 * - Complete interactive states: hover, active press, focus-visible ring,
 *   disabled — on every control; motion-reduce respected
 * - WCAG AA contrast (warning uses dark text on amber-400)
 *
 * @module themes/tailwind
 */

export const tailwindTheme = {
  name: 'tailwind',

  components: {
    // ============================================================================
    // CORE COMPONENTS
    // ============================================================================

    button: {
      base: 'inline-flex items-center justify-center gap-2 font-medium rounded-md select-none transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none',
      variants: {
        filled: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
        outlined: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100',
        text: 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
        elevated: 'bg-white text-indigo-600 shadow-md hover:bg-indigo-50 active:bg-indigo-100',
        tonal: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200',
        // Color variants
        primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
        secondary: 'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 active:bg-slate-100',
        success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500',
        danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
        warning: 'bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500 active:bg-amber-600 focus-visible:ring-amber-400',
        info: 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 focus-visible:ring-sky-500',
        light: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
        dark: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-700 focus-visible:ring-slate-600'
      },
      sizes: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base'
      },
      modifiers: {
        block: 'w-full'
      },
      states: {
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
        loading: 'opacity-70 cursor-wait pointer-events-none'
      }
    },

    badge: {
      base: 'inline-flex items-center gap-1 font-medium ring-1 ring-inset',
      variants: {
        primary: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        secondary: 'bg-slate-50 text-slate-700 ring-slate-500/20',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        danger: 'bg-red-50 text-red-700 ring-red-600/20',
        warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
        info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
        light: 'bg-slate-50 text-slate-600 ring-slate-400/20',
        dark: 'bg-slate-900 text-white ring-slate-900'
      },
      sizes: {
        sm: 'px-1.5 py-0.5 text-xs rounded',
        md: 'px-2 py-0.5 text-xs rounded-md',
        lg: 'px-2.5 py-1 text-sm rounded-md'
      },
      modifiers: {
        pill: 'rounded-full'
      }
    },

    alert: {
      base: 'rounded-lg border p-4 text-sm',
      variants: {
        primary: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        secondary: 'bg-slate-50 border-slate-200 text-slate-700',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-sky-50 border-sky-200 text-sky-800',
        light: 'bg-white border-slate-200 text-slate-700',
        dark: 'bg-slate-900 border-slate-800 text-slate-100'
      },
      modifiers: {
        dismissible: 'pr-12 relative'
      }
    },

    spinner: {
      base: 'animate-spin rounded-full border-2 border-slate-200 motion-reduce:animate-[spin_1.5s_linear_infinite]',
      variants: {
        border: 'border-t-indigo-600',
        grow: 'animate-ping'
      },
      sizes: {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
      }
    },

    icon: {
      base: 'inline-block shrink-0',
      sizes: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
      }
    },

    // ============================================================================
    // LAYOUT COMPONENTS
    // ============================================================================

    container: {
      base: 'mx-auto px-4 sm:px-6 lg:px-8',
      variants: {
        fluid: 'w-full',
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        xxl: 'max-w-screen-2xl'
      }
    },

    row: {
      base: 'flex flex-wrap -mx-3',
      modifiers: {
        noGutters: 'mx-0'
      }
    },

    column: {
      base: 'px-3',
      sizes: {
        auto: 'flex-auto',
        1: 'w-1/12', 2: 'w-2/12', 3: 'w-3/12', 4: 'w-4/12',
        5: 'w-5/12', 6: 'w-6/12', 7: 'w-7/12', 8: 'w-8/12',
        9: 'w-9/12', 10: 'w-10/12', 11: 'w-11/12', 12: 'w-full'
      }
    },

    // ============================================================================
    // CARD COMPONENTS
    // ============================================================================

    card: {
      base: 'bg-white rounded-lg overflow-hidden',
      variants: {
        outlined: 'border border-slate-200 shadow-sm',
        elevated: 'shadow-md',
        filled: 'bg-slate-50 border border-slate-200'
      },
      parts: {
        header: 'px-5 py-4 border-b border-slate-200',
        body: 'px-5 py-4',
        footer: 'px-5 py-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600',
        title: 'text-base font-semibold text-slate-900',
        subtitle: 'text-sm text-slate-500 mt-0.5'
      }
    },

    statcard: {
      base: 'bg-white rounded-lg p-5 border border-slate-200 shadow-sm',
      parts: {
        body: '',
        title: 'text-sm font-medium text-slate-500',
        value: 'text-2xl font-semibold text-slate-900 mt-1 tabular-nums',
        trend: 'text-xs font-medium text-slate-500 mt-2'
      }
    },

    // ============================================================================
    // FORM COMPONENTS
    // ============================================================================

    input: {
      base: 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
      sizes: {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base'
      },
      states: {
        disabled: 'bg-slate-50 text-slate-500 cursor-not-allowed',
        readonly: 'bg-slate-50',
        error: 'border-red-500 focus:ring-red-500 focus:border-red-500'
      },
      parts: {
        wrapper: 'relative',
        label: 'block text-sm font-medium text-slate-700 mb-1.5',
        floatingWrapper: 'relative',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
        help: 'mt-1.5 text-xs text-slate-500',
        error: 'mt-1.5 text-xs text-red-600'
      }
    },

    textarea: {
      base: 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
      sizes: {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base'
      },
      states: {
        disabled: 'bg-slate-50 text-slate-500 cursor-not-allowed',
        readonly: 'bg-slate-50'
      }
    },

    select: {
      base: 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
      sizes: {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base'
      },
      states: {
        disabled: 'bg-slate-50 text-slate-500 cursor-not-allowed'
      }
    },

    checkbox: {
      base: 'w-4 h-4 rounded border-slate-300 text-indigo-600 shadow-sm transition-colors duration-150 motion-reduce:transition-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
      parts: {
        wrapper: 'flex items-center gap-2',
        label: 'text-sm text-slate-700 select-none'
      },
      states: {
        checked: 'bg-indigo-600 border-indigo-600',
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },

    radio: {
      base: 'w-4 h-4 border-slate-300 text-indigo-600 shadow-sm transition-colors duration-150 motion-reduce:transition-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
      parts: {
        wrapper: 'flex items-center gap-2',
        label: 'text-sm text-slate-700 select-none'
      },
      states: {
        checked: 'bg-indigo-600 border-indigo-600',
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },

    switch: {
      base: 'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
      parts: {
        wrapper: 'flex items-center gap-3',
        label: 'text-sm text-slate-700 select-none',
        thumb: 'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 motion-reduce:transition-none'
      },
      states: {
        checked: 'bg-indigo-600',
        unchecked: 'bg-slate-300',
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },

    slider: {
      base: 'w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
      states: {
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },

    formgroup: {
      base: 'mb-4',
      parts: {
        label: 'block text-sm font-medium text-slate-700 mb-1.5',
        help: 'mt-1.5 text-xs text-slate-500',
        error: 'mt-1.5 text-xs text-red-600'
      }
    },

    // ============================================================================
    // NAVIGATION COMPONENTS
    // ============================================================================

    navigationbar: {
      base: 'bg-white border-b border-slate-200',
      variants: {
        light: 'bg-white text-slate-900',
        dark: 'bg-slate-900 text-white border-slate-800',
        primary: 'bg-indigo-600 text-white border-indigo-700'
      },
      parts: {
        brand: 'text-base font-semibold tracking-tight',
        toggler: 'p-2 rounded-md hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        collapse: 'flex-grow',
        nav: 'flex items-center gap-1',
        item: '',
        link: 'px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      }
    },

    navigationdrawer: {
      base: 'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 motion-reduce:transition-none',
      parts: {
        header: 'px-5 py-4 border-b border-slate-200',
        body: 'p-3 overflow-y-auto',
        title: 'text-base font-semibold text-slate-900',
        overlay: 'fixed inset-0 bg-slate-900/50 z-40'
      }
    },

    sidebar: {
      base: 'bg-white border-r border-slate-200 h-full',
      parts: {
        nav: 'flex flex-col gap-0.5 p-3',
        item: '',
        link: 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      },
      states: {
        active: 'bg-indigo-50 text-indigo-700'
      }
    },

    topappbar: {
      base: 'bg-white border-b border-slate-200 px-4 sm:px-6 py-3',
      parts: {
        brand: 'text-base font-semibold tracking-tight text-slate-900',
        nav: 'flex items-center gap-2 ml-auto'
      }
    },

    breadcrumb: {
      base: 'flex items-center gap-2 text-sm',
      parts: {
        item: 'text-slate-500 hover:text-slate-900 transition-colors duration-150 motion-reduce:transition-none',
        active: 'text-slate-900 font-medium',
        separator: 'text-slate-300 select-none'
      }
    },

    tabs: {
      base: 'border-b border-slate-200',
      variants: {
        tabs: 'flex gap-6',
        pills: 'flex gap-2 border-none'
      },
      parts: {
        item: '',
        link: 'py-3 px-1 -mb-px text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset',
        content: 'py-5',
        pane: 'hidden'
      },
      states: {
        active: 'border-indigo-600 text-indigo-600'
      }
    },

    // ============================================================================
    // FEEDBACK COMPONENTS
    // ============================================================================

    modal: {
      base: 'fixed inset-0 z-50 overflow-y-auto',
      sizes: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
      },
      parts: {
        overlay: 'fixed inset-0 bg-slate-900/50 transition-opacity motion-reduce:transition-none',
        dialog: 'relative bg-white rounded-lg shadow-xl mx-auto my-8 w-full',
        content: 'relative',
        header: 'flex items-start justify-between px-5 py-4 border-b border-slate-200',
        body: 'px-5 py-4 text-sm text-slate-700',
        footer: 'flex justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50',
        title: 'text-base font-semibold text-slate-900',
        close: 'absolute top-3 right-3 p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      },
      modifiers: {
        centered: 'flex items-center min-h-screen',
        scrollable: 'overflow-y-auto max-h-[90vh]'
      }
    },

    toast: {
      base: 'pointer-events-auto bg-white rounded-lg shadow-lg ring-1 ring-slate-900/10 overflow-hidden',
      parts: {
        header: 'flex items-center px-4 py-3 border-b border-slate-100 text-sm font-medium text-slate-900',
        body: 'px-4 py-3 text-sm text-slate-700',
        close: 'absolute top-3 right-3 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      },
      states: {
        show: 'animate-in slide-in-from-top'
      }
    },

    tooltip: {
      base: 'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-md max-w-xs',
      parts: {
        arrow: 'absolute w-2 h-2 bg-slate-900 transform rotate-45',
        inner: ''
      }
    },

    dropdown: {
      base: 'relative inline-block',
      parts: {
        toggle: 'inline-flex items-center justify-center gap-1.5',
        menu: 'absolute z-50 mt-1.5 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/10 min-w-[12rem] py-1',
        item: 'block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:bg-slate-100',
        divider: 'h-px bg-slate-200 my-1'
      },
      states: {
        show: 'block',
        hide: 'hidden'
      }
    },

    // ============================================================================
    // PROGRESS & STATUS COMPONENTS
    // ============================================================================

    progressbar: {
      base: 'w-full bg-slate-200 rounded-full h-2 overflow-hidden',
      parts: {
        bar: 'h-full bg-indigo-600 rounded-full transition-[width] duration-300 motion-reduce:transition-none'
      },
      variants: {
        striped: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
        animated: 'animate-pulse'
      }
    },

    stepper: {
      base: 'flex items-center',
      parts: {
        step: 'flex items-center relative',
        connector: 'flex-1 h-0.5 bg-slate-200 mx-4',
        circle: 'w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none',
        label: 'absolute top-11 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500 whitespace-nowrap'
      },
      states: {
        active: 'border-indigo-600 bg-indigo-600 text-white',
        completed: 'border-indigo-600 bg-white text-indigo-600',
        pending: 'border-slate-300 bg-white text-slate-400'
      }
    },

    skeleton: {
      base: 'animate-pulse motion-reduce:animate-none',
      parts: {
        item: 'bg-slate-200 rounded-md'
      },
      variants: {
        text: 'h-4 bg-slate-200 rounded w-full',
        circle: 'rounded-full bg-slate-200',
        rect: 'bg-slate-200 rounded-md'
      }
    },

    // ============================================================================
    // DATA DISPLAY COMPONENTS
    // ============================================================================

    datatable: {
      base: 'min-w-full divide-y divide-slate-200',
      variants: {
        striped: '[&_tbody_tr:nth-child(odd)]:bg-slate-50/60',
        bordered: 'border border-slate-200',
        hover: '[&_tbody_tr]:hover:bg-slate-50',
        compact: 'text-sm [&_td]:py-2 [&_th]:py-2'
      },
      parts: {
        wrapper: 'overflow-x-auto rounded-lg border border-slate-200 shadow-sm',
        head: 'bg-slate-50',
        body: 'bg-white divide-y divide-slate-100',
        row: 'transition-colors duration-150 motion-reduce:transition-none',
        th: 'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide',
        td: 'px-4 py-3 whitespace-nowrap text-sm text-slate-700'
      }
    },

    list: {
      base: 'divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm',
      parts: {
        item: 'px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        active: 'bg-indigo-50 text-indigo-700',
        disabled: 'opacity-50 cursor-not-allowed'
      },
      modifiers: {
        flush: 'border-x-0 rounded-none shadow-none'
      }
    },

    virtuallist: {
      base: 'relative overflow-auto',
      parts: {
        container: 'relative',
        item: 'absolute left-0 right-0'
      }
    },

    accordion: {
      base: 'divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm',
      parts: {
        item: '',
        header: '',
        button: 'flex items-center justify-between w-full px-4 py-3.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset',
        collapse: 'overflow-hidden transition-all duration-200 motion-reduce:transition-none',
        body: 'px-4 pb-4 text-sm text-slate-600'
      },
      states: {
        show: 'max-h-96',
        hide: 'max-h-0',
        expanded: 'rotate-180'
      },
      modifiers: {
        flush: 'border-x-0 rounded-none shadow-none'
      }
    },

    pagination: {
      base: 'flex items-center gap-1',
      sizes: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      },
      parts: {
        item: '',
        link: 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      },
      states: {
        active: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      }
    },

    // ============================================================================
    // SPECIALIZED COMPONENTS
    // ============================================================================

    chips: {
      base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors duration-150 motion-reduce:transition-none',
      variants: {
        primary: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        secondary: 'bg-slate-50 text-slate-700 ring-slate-500/20',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        danger: 'bg-red-50 text-red-700 ring-red-600/20'
      },
      modifiers: {
        removable: 'pr-1'
      }
    },

    fab: {
      base: 'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl active:bg-indigo-800 transition-all duration-150 motion-reduce:transition-none flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
      sizes: {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
      }
    },

    segmentedbutton: {
      base: 'inline-flex rounded-lg bg-slate-100 p-1',
      parts: {
        button: 'px-3.5 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      },
      states: {
        active: 'bg-white shadow-sm text-slate-900'
      }
    },

    autocomplete: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        dropdown: 'absolute z-50 mt-1.5 w-full bg-white rounded-lg shadow-lg ring-1 ring-slate-900/10 max-h-60 overflow-auto py-1',
        item: 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        show: 'block',
        hide: 'hidden'
      }
    },

    search: {
      base: 'relative',
      parts: {
        input: 'w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
        button: 'absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      }
    },

    datepicker: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        calendar: 'absolute z-50 mt-1.5 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/10 p-3',
        header: 'flex items-center justify-between mb-3',
        body: 'grid grid-cols-7 gap-0.5',
        day: 'w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        selected: 'bg-indigo-600 text-white hover:bg-indigo-700',
        today: 'font-semibold text-indigo-600'
      }
    },

    fileupload: {
      base: '',
      parts: {
        zone: 'border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors duration-150 motion-reduce:transition-none',
        input: 'hidden',
        label: 'block text-sm font-medium text-slate-700 mb-1.5',
        preview: 'mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3',
        icon: 'mx-auto text-slate-400 mb-3'
      },
      states: {
        dragover: 'border-indigo-500 bg-indigo-50'
      }
    },

    // ============================================================================
    // STATE COMPONENTS
    // ============================================================================

    emptystate: {
      base: 'text-center py-12 px-6',
      parts: {
        icon: 'mx-auto mb-4 text-slate-300',
        title: 'text-base font-semibold text-slate-900 mb-1',
        description: 'text-sm text-slate-500 mb-6 max-w-sm mx-auto',
        action: 'inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
      }
    },

    errorstate: {
      base: 'rounded-lg bg-red-50 border border-red-200 p-6',
      parts: {
        icon: 'inline-block mr-2 text-red-500',
        title: 'text-base font-semibold text-red-800 mb-1',
        message: 'text-sm text-red-700',
        action: 'mt-4 inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
      }
    },

    errorboundary: {
      base: 'rounded-lg bg-red-50 border border-red-200 p-6',
      parts: {
        container: 'max-w-2xl mx-auto',
        title: 'text-base font-semibold text-red-800 mb-2',
        message: 'text-sm text-red-700 font-mono',
        stack: 'mt-4 p-4 bg-red-100 rounded-md text-xs font-mono overflow-auto'
      }
    }
  },

  // ============================================================================
  // UTILITY CLASSES
  // ============================================================================

  utilities: {
    spacing: {
      // Margin
      m: (size) => `m-${size}`,
      mt: (size) => `mt-${size}`,
      mr: (size) => `mr-${size}`,
      mb: (size) => `mb-${size}`,
      ml: (size) => `ml-${size}`,
      mx: (size) => `mx-${size}`,
      my: (size) => `my-${size}`,
      // Padding
      p: (size) => `p-${size}`,
      pt: (size) => `pt-${size}`,
      pr: (size) => `pr-${size}`,
      pb: (size) => `pb-${size}`,
      pl: (size) => `pl-${size}`,
      px: (size) => `px-${size}`,
      py: (size) => `py-${size}`
    },

    layout: {
      flex: 'flex',
      inlineFlex: 'inline-flex',
      block: 'block',
      inlineBlock: 'inline-block',
      inline: 'inline',
      none: 'hidden',
      grid: 'grid'
    },

    flexbox: {
      row: 'flex-row',
      column: 'flex-col',
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      justifyStart: 'justify-start',
      justifyCenter: 'justify-center',
      justifyEnd: 'justify-end',
      justifyBetween: 'justify-between',
      justifyAround: 'justify-around',
      alignStart: 'items-start',
      alignCenter: 'items-center',
      alignEnd: 'items-end',
      alignStretch: 'items-stretch'
    },

    sizing: {
      w25: 'w-1/4',
      w50: 'w-1/2',
      w75: 'w-3/4',
      w100: 'w-full',
      wAuto: 'w-auto',
      h25: 'h-1/4',
      h50: 'h-1/2',
      h75: 'h-3/4',
      h100: 'h-full',
      hAuto: 'h-auto'
    },

    text: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      muted: 'text-slate-500',
      primary: 'text-indigo-600',
      secondary: 'text-slate-600',
      success: 'text-emerald-600',
      danger: 'text-red-600',
      warning: 'text-amber-600',
      info: 'text-sky-600'
    },

    background: {
      primary: 'bg-indigo-600',
      secondary: 'bg-slate-600',
      success: 'bg-emerald-600',
      danger: 'bg-red-600',
      warning: 'bg-amber-400',
      info: 'bg-sky-600',
      light: 'bg-slate-100',
      dark: 'bg-slate-900',
      white: 'bg-white',
      transparent: 'bg-transparent'
    },

    borders: {
      border: 'border',
      borderTop: 'border-t',
      borderRight: 'border-r',
      borderBottom: 'border-b',
      borderLeft: 'border-l',
      border0: 'border-0',
      rounded: 'rounded-md',
      roundedFull: 'rounded-full',
      roundedLg: 'rounded-lg'
    },

    shadows: {
      sm: 'shadow-sm',
      default: 'shadow',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      none: 'shadow-none'
    }
  }
};

export default tailwindTheme;
