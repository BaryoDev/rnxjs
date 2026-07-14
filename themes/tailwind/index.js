/**
 * Tailwind Theme for rnxJS v2.0
 *
 * Professional, minimal, and clean design system built with Tailwind CSS.
 * Features:
 * - Mobile-first responsive design
 * - Professional color palette (blue-600 primary, slate-600 secondary)
 * - Clean typography with Inter font
 * - Minimal shadows and smooth transitions
 * - Modern, accessible components
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
      base: 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      variants: {
        filled: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outlined: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        text: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        elevated: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-blue-500',
        tonal: 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500',
        // Color variants
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
        info: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
        light: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500',
        dark: 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700'
      },
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      },
      modifiers: {
        block: 'w-full'
      },
      states: {
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      }
    },

    badge: {
      base: 'inline-flex items-center font-medium',
      variants: {
        primary: 'bg-blue-100 text-blue-700',
        secondary: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        danger: 'bg-red-100 text-red-700',
        warning: 'bg-amber-100 text-amber-700',
        info: 'bg-sky-100 text-sky-700',
        light: 'bg-slate-50 text-slate-600',
        dark: 'bg-slate-800 text-white'
      },
      sizes: {
        sm: 'px-2 py-0.5 text-xs rounded',
        md: 'px-2.5 py-0.5 text-sm rounded-md',
        lg: 'px-3 py-1 text-base rounded-lg'
      },
      modifiers: {
        pill: 'rounded-full'
      }
    },

    alert: {
      base: 'rounded-lg p-4 border-l-4',
      variants: {
        primary: 'bg-blue-50 border-blue-500 text-blue-900',
        secondary: 'bg-slate-50 border-slate-500 text-slate-900',
        success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
        danger: 'bg-red-50 border-red-500 text-red-900',
        warning: 'bg-amber-50 border-amber-500 text-amber-900',
        info: 'bg-sky-50 border-sky-500 text-sky-900',
        light: 'bg-slate-50 border-slate-300 text-slate-700',
        dark: 'bg-slate-800 border-slate-700 text-white'
      },
      modifiers: {
        dismissible: 'pr-12 relative'
      }
    },

    spinner: {
      base: 'animate-spin rounded-full border-2 border-slate-200',
      variants: {
        border: 'border-t-blue-600',
        grow: 'animate-ping'
      },
      sizes: {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
      }
    },

    icon: {
      base: 'inline-block',
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
      base: 'flex flex-wrap -mx-4',
      modifiers: {
        noGutters: 'mx-0'
      }
    },

    column: {
      base: 'px-4',
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
        outlined: 'border border-slate-200',
        elevated: 'shadow-md',
        filled: 'bg-slate-50 border border-slate-100'
      },
      parts: {
        header: 'px-6 py-4 border-b border-slate-200 bg-slate-50',
        body: 'px-6 py-4',
        footer: 'px-6 py-4 border-t border-slate-200 bg-slate-50 text-slate-600',
        title: 'text-lg font-semibold text-slate-900',
        subtitle: 'text-sm text-slate-600 mt-1'
      }
    },

    statcard: {
      base: 'bg-white rounded-lg p-6 border border-slate-200',
      parts: {
        body: '',
        title: 'text-sm font-medium text-slate-600 mb-2',
        value: 'text-3xl font-bold text-slate-900',
        trend: 'text-xs text-slate-500 mt-2'
      }
    },

    // ============================================================================
    // FORM COMPONENTS
    // ============================================================================

    input: {
      base: 'w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg'
      },
      states: {
        disabled: 'bg-slate-100 cursor-not-allowed opacity-60',
        readonly: 'bg-slate-50',
        error: 'border-red-500 focus:ring-red-500'
      },
      parts: {
        wrapper: 'relative',
        label: 'block text-sm font-medium text-slate-700 mb-1',
        floatingWrapper: 'relative',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
        help: 'mt-1 text-sm text-slate-500',
        error: 'mt-1 text-sm text-red-600'
      }
    },

    textarea: {
      base: 'w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg'
      },
      states: {
        disabled: 'bg-slate-100 cursor-not-allowed opacity-60',
        readonly: 'bg-slate-50'
      }
    },

    select: {
      base: 'w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg'
      },
      states: {
        disabled: 'bg-slate-100 cursor-not-allowed opacity-60'
      }
    },

    checkbox: {
      base: 'w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200',
      parts: {
        wrapper: 'flex items-center',
        label: 'ml-2 text-sm text-slate-700'
      },
      states: {
        checked: 'bg-blue-600 border-blue-600',
        disabled: 'opacity-60 cursor-not-allowed'
      }
    },

    radio: {
      base: 'w-4 h-4 text-blue-600 border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200',
      parts: {
        wrapper: 'flex items-center',
        label: 'ml-2 text-sm text-slate-700'
      },
      states: {
        checked: 'bg-blue-600 border-blue-600',
        disabled: 'opacity-60 cursor-not-allowed'
      }
    },

    switch: {
      base: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      parts: {
        wrapper: 'flex items-center',
        label: 'ml-3 text-sm text-slate-700',
        thumb: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform'
      },
      states: {
        checked: 'bg-blue-600',
        unchecked: 'bg-slate-200',
        disabled: 'opacity-60 cursor-not-allowed'
      }
    },

    slider: {
      base: 'w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600',
      states: {
        disabled: 'opacity-60 cursor-not-allowed'
      }
    },

    formgroup: {
      base: 'mb-4',
      parts: {
        label: 'block text-sm font-medium text-slate-700 mb-1',
        help: 'mt-1 text-sm text-slate-500',
        error: 'mt-1 text-sm text-red-600'
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
        primary: 'bg-blue-600 text-white border-blue-700'
      },
      parts: {
        brand: 'text-xl font-bold',
        toggler: 'p-2 rounded-lg hover:bg-slate-100',
        collapse: 'flex-grow',
        nav: 'flex space-x-1',
        item: '',
        link: 'px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200'
      }
    },

    navigationdrawer: {
      base: 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300',
      parts: {
        header: 'p-6 border-b border-slate-200',
        body: 'p-6 overflow-y-auto',
        title: 'text-xl font-semibold text-slate-900',
        overlay: 'fixed inset-0 bg-black bg-opacity-50 z-40'
      }
    },

    sidebar: {
      base: 'bg-white border-r border-slate-200 h-full',
      parts: {
        nav: 'flex flex-col space-y-1 p-4',
        item: '',
        link: 'flex items-center px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-700'
      },
      states: {
        active: 'bg-blue-50 text-blue-600 font-medium'
      }
    },

    topappbar: {
      base: 'bg-white border-b border-slate-200 px-6 py-4',
      parts: {
        brand: 'text-xl font-bold text-slate-900',
        nav: 'flex items-center space-x-4 ml-auto'
      }
    },

    breadcrumb: {
      base: 'flex items-center space-x-2 text-sm',
      parts: {
        item: 'text-slate-600 hover:text-slate-900',
        active: 'text-slate-900 font-medium',
        separator: 'text-slate-400'
      }
    },

    tabs: {
      base: 'border-b border-slate-200',
      variants: {
        tabs: 'flex space-x-8',
        pills: 'flex space-x-2 border-none'
      },
      parts: {
        item: '',
        link: 'py-3 px-1 border-b-2 border-transparent hover:border-slate-300 transition-colors duration-200 text-slate-600 hover:text-slate-900',
        content: 'py-6',
        pane: 'hidden'
      },
      states: {
        active: 'border-blue-600 text-blue-600 font-medium'
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
        overlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
        dialog: 'relative bg-white rounded-lg shadow-xl mx-auto my-8',
        content: 'relative',
        header: 'px-6 py-4 border-b border-slate-200',
        body: 'px-6 py-4',
        footer: 'px-6 py-4 border-t border-slate-200 bg-slate-50',
        title: 'text-lg font-semibold text-slate-900',
        close: 'absolute top-4 right-4 text-slate-400 hover:text-slate-600'
      },
      modifiers: {
        centered: 'flex items-center min-h-screen',
        scrollable: 'overflow-y-auto max-h-[90vh]'
      }
    },

    toast: {
      base: 'pointer-events-auto bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden',
      parts: {
        header: 'p-4 border-b border-slate-200',
        body: 'p-4',
        close: 'absolute top-4 right-4 text-slate-400 hover:text-slate-600'
      },
      states: {
        show: 'animate-in slide-in-from-top'
      }
    },

    tooltip: {
      base: 'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg',
      parts: {
        arrow: 'absolute w-2 h-2 bg-slate-900 transform rotate-45',
        inner: ''
      }
    },

    dropdown: {
      base: 'relative inline-block',
      parts: {
        toggle: 'inline-flex items-center justify-center',
        menu: 'absolute z-50 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 min-w-[12rem] py-1',
        item: 'block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200',
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
        bar: 'h-full bg-blue-600 transition-all duration-300'
      },
      variants: {
        striped: 'bg-gradient-to-r from-blue-600 to-blue-500',
        animated: 'animate-pulse'
      }
    },

    stepper: {
      base: 'flex items-center',
      parts: {
        step: 'flex items-center relative',
        connector: 'flex-1 h-0.5 bg-slate-200 mx-4',
        circle: 'w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold',
        label: 'absolute top-12 left-1/2 -translate-x-1/2 text-sm text-slate-600 whitespace-nowrap'
      },
      states: {
        active: 'border-blue-600 bg-blue-600 text-white',
        completed: 'border-emerald-600 bg-emerald-600 text-white',
        pending: 'border-slate-300 bg-white text-slate-600'
      }
    },

    skeleton: {
      base: 'animate-pulse',
      parts: {
        item: 'bg-slate-200 rounded'
      },
      variants: {
        text: 'h-4 bg-slate-200 rounded w-full',
        circle: 'rounded-full bg-slate-200',
        rect: 'bg-slate-200 rounded'
      }
    },

    // ============================================================================
    // DATA DISPLAY COMPONENTS
    // ============================================================================

    datatable: {
      base: 'min-w-full divide-y divide-slate-200',
      variants: {
        striped: '[&_tbody_tr:nth-child(odd)]:bg-slate-50',
        bordered: 'border border-slate-200',
        hover: '[&_tbody_tr]:hover:bg-slate-50',
        compact: 'text-sm'
      },
      parts: {
        wrapper: 'overflow-x-auto rounded-lg border border-slate-200',
        head: 'bg-slate-50',
        body: 'bg-white divide-y divide-slate-200',
        row: '',
        th: 'px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider',
        td: 'px-6 py-4 whitespace-nowrap text-sm text-slate-900'
      }
    },

    list: {
      base: 'divide-y divide-slate-200 rounded-lg border border-slate-200',
      parts: {
        item: 'px-6 py-4 hover:bg-slate-50 transition-colors duration-200'
      },
      states: {
        active: 'bg-blue-50 border-l-4 border-l-blue-600',
        disabled: 'opacity-60 cursor-not-allowed'
      },
      modifiers: {
        flush: 'border-x-0 rounded-none'
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
      base: 'divide-y divide-slate-200 rounded-lg border border-slate-200',
      parts: {
        item: '',
        header: '',
        button: 'flex items-center justify-between w-full px-6 py-4 text-left font-medium text-slate-900 hover:bg-slate-50 transition-colors duration-200',
        collapse: 'overflow-hidden transition-all duration-200',
        body: 'px-6 py-4 text-slate-700'
      },
      states: {
        show: 'max-h-96',
        hide: 'max-h-0',
        expanded: 'rotate-180'
      },
      modifiers: {
        flush: 'border-x-0 rounded-none'
      }
    },

    pagination: {
      base: 'flex items-center space-x-1',
      sizes: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      parts: {
        item: '',
        link: 'px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors duration-200 text-slate-700'
      },
      states: {
        active: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
        disabled: 'opacity-60 cursor-not-allowed pointer-events-none'
      }
    },

    // ============================================================================
    // SPECIALIZED COMPONENTS
    // ============================================================================

    chips: {
      base: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      variants: {
        primary: 'bg-blue-100 text-blue-700',
        secondary: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        danger: 'bg-red-100 text-red-700'
      },
      modifiers: {
        removable: 'pr-1'
      }
    },

    fab: {
      base: 'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center',
      sizes: {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
      }
    },

    segmentedbutton: {
      base: 'inline-flex rounded-lg bg-slate-100 p-1',
      parts: {
        button: 'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-slate-700 hover:text-slate-900'
      },
      states: {
        active: 'bg-white shadow-sm text-slate-900'
      }
    },

    autocomplete: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        dropdown: 'absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto',
        item: 'px-4 py-2 hover:bg-slate-100 cursor-pointer transition-colors duration-200'
      },
      states: {
        show: 'block',
        hide: 'hidden'
      }
    },

    search: {
      base: 'relative',
      parts: {
        input: 'w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
        button: 'absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700'
      }
    },

    datepicker: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        calendar: 'absolute z-50 mt-2 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 p-4',
        header: 'flex items-center justify-between mb-4',
        body: 'grid grid-cols-7 gap-1',
        day: 'w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer'
      },
      states: {
        selected: 'bg-blue-600 text-white hover:bg-blue-700',
        today: 'ring-2 ring-blue-600'
      }
    },

    fileupload: {
      base: 'border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors duration-200',
      parts: {
        input: 'hidden',
        label: 'block text-sm font-medium text-slate-700 mb-2',
        preview: 'mt-4 grid grid-cols-4 gap-4',
        icon: 'mx-auto text-slate-400 mb-4'
      },
      states: {
        dragover: 'border-blue-500 bg-blue-50'
      }
    },

    // ============================================================================
    // STATE COMPONENTS
    // ============================================================================

    emptystate: {
      base: 'text-center py-12',
      parts: {
        icon: 'mx-auto mb-4 text-slate-400',
        title: 'text-xl font-semibold text-slate-900 mb-2',
        description: 'text-slate-600 mb-6',
        action: 'inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
      }
    },

    errorstate: {
      base: 'rounded-lg bg-red-50 border border-red-200 p-6',
      parts: {
        icon: 'inline-block mr-2 text-red-600',
        title: 'text-lg font-semibold text-red-900 mb-2',
        message: 'text-red-700',
        action: 'mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
      }
    },

    errorboundary: {
      base: 'rounded-lg bg-red-50 border border-red-200 p-6',
      parts: {
        container: 'max-w-2xl mx-auto',
        title: 'text-lg font-semibold text-red-900 mb-2',
        message: 'text-red-700 font-mono text-sm',
        stack: 'mt-4 p-4 bg-red-100 rounded text-xs font-mono overflow-auto'
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
      muted: 'text-slate-600',
      primary: 'text-blue-600',
      secondary: 'text-slate-600',
      success: 'text-emerald-600',
      danger: 'text-red-600',
      warning: 'text-amber-600',
      info: 'text-sky-600'
    },

    background: {
      primary: 'bg-blue-600',
      secondary: 'bg-slate-600',
      success: 'bg-emerald-600',
      danger: 'bg-red-600',
      warning: 'bg-amber-500',
      info: 'bg-sky-600',
      light: 'bg-slate-100',
      dark: 'bg-slate-800',
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
      rounded: 'rounded',
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
