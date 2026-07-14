/**
 * Bootstrap Theme for rnxJS v2.0
 *
 * This theme preserves 100% backward compatibility with v1.x Bootstrap classes.
 * All current component behavior is maintained exactly as-is.
 *
 * @module themes/bootstrap
 */

export const bootstrapTheme = {
  name: 'bootstrap',

  components: {
    // ============================================================================
    // CORE COMPONENTS
    // ============================================================================

    button: {
      base: 'btn',
      variants: {
        filled: 'btn-primary',
        outlined: 'btn-outline-primary',
        text: 'btn-link',
        elevated: 'btn-primary elevated',
        tonal: 'btn-secondary',
        // Standard Bootstrap variants
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-info',
        light: 'btn-light',
        dark: 'btn-dark'
      },
      sizes: {
        sm: 'btn-sm',
        lg: 'btn-lg'
      },
      modifiers: {
        block: 'w-100'
      },
      states: {
        disabled: 'disabled'
      }
    },

    badge: {
      base: 'badge',
      variants: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        danger: 'bg-danger',
        warning: 'bg-warning',
        info: 'bg-info',
        light: 'bg-light',
        dark: 'bg-dark'
      },
      modifiers: {
        pill: 'rounded-pill'
      }
    },

    alert: {
      base: 'alert',
      variants: {
        primary: 'alert-primary',
        secondary: 'alert-secondary',
        success: 'alert-success',
        danger: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info',
        light: 'alert-light',
        dark: 'alert-dark'
      },
      modifiers: {
        dismissible: 'alert-dismissible fade show'
      }
    },

    spinner: {
      base: 'spinner-border',
      variants: {
        border: 'spinner-border',
        grow: 'spinner-grow'
      },
      sizes: {
        sm: 'spinner-border-sm'
      }
    },

    icon: {
      base: 'bi' // Bootstrap Icons
    },

    // ============================================================================
    // LAYOUT COMPONENTS
    // ============================================================================

    container: {
      base: 'container',
      variants: {
        fluid: 'container-fluid',
        sm: 'container-sm',
        md: 'container-md',
        lg: 'container-lg',
        xl: 'container-xl',
        xxl: 'container-xxl'
      }
    },

    row: {
      base: 'row',
      modifiers: {
        noGutters: 'g-0'
      }
    },

    column: {
      base: 'col',
      sizes: {
        auto: 'col-auto',
        1: 'col-1', 2: 'col-2', 3: 'col-3', 4: 'col-4',
        5: 'col-5', 6: 'col-6', 7: 'col-7', 8: 'col-8',
        9: 'col-9', 10: 'col-10', 11: 'col-11', 12: 'col-12'
      }
    },

    // ============================================================================
    // CARD COMPONENTS
    // ============================================================================

    card: {
      base: 'card',
      variants: {
        outlined: 'card',
        elevated: 'shadow',
        filled: 'bg-light'
      },
      parts: {
        header: 'card-header',
        body: 'card-body',
        footer: 'card-footer text-muted',
        title: 'card-title mb-0',
        subtitle: 'text-muted'
      }
    },

    statcard: {
      base: 'card',
      parts: {
        body: 'card-body',
        title: 'card-title h6 text-muted mb-2',
        value: 'h3 mb-0',
        trend: 'small'
      }
    },

    // ============================================================================
    // FORM COMPONENTS
    // ============================================================================

    input: {
      base: 'form-control',
      sizes: {
        sm: 'form-control-sm',
        lg: 'form-control-lg'
      },
      states: {
        disabled: 'disabled',
        readonly: 'readonly'
      },
      parts: {
        wrapper: 'input-group',
        label: 'form-label',
        floatingWrapper: 'form-floating',
        icon: 'input-group-text bg-transparent border-end-0'
      }
    },

    textarea: {
      base: 'form-control',
      sizes: {
        sm: 'form-control-sm',
        lg: 'form-control-lg'
      },
      states: {
        disabled: 'disabled',
        readonly: 'readonly'
      }
    },

    select: {
      base: 'form-select',
      sizes: {
        sm: 'form-select-sm',
        lg: 'form-select-lg'
      },
      states: {
        disabled: 'disabled'
      }
    },

    checkbox: {
      base: 'form-check-input',
      parts: {
        wrapper: 'form-check',
        label: 'form-check-label'
      },
      states: {
        checked: 'checked',
        disabled: 'disabled'
      }
    },

    radio: {
      base: 'form-check-input',
      parts: {
        wrapper: 'form-check',
        label: 'form-check-label'
      },
      states: {
        checked: 'checked',
        disabled: 'disabled'
      }
    },

    switch: {
      base: 'form-check-input',
      parts: {
        wrapper: 'form-check form-switch',
        label: 'form-check-label'
      },
      states: {
        checked: 'checked',
        disabled: 'disabled'
      }
    },

    slider: {
      base: 'form-range',
      states: {
        disabled: 'disabled'
      }
    },

    formgroup: {
      base: 'mb-3',
      parts: {
        label: 'form-label',
        help: 'form-text text-muted',
        error: 'invalid-feedback d-block'
      }
    },

    // ============================================================================
    // NAVIGATION COMPONENTS
    // ============================================================================

    navigationbar: {
      base: 'navbar navbar-expand-lg',
      variants: {
        light: 'navbar-light bg-light',
        dark: 'navbar-dark bg-dark',
        primary: 'navbar-dark bg-primary'
      },
      parts: {
        brand: 'navbar-brand',
        toggler: 'navbar-toggler',
        collapse: 'collapse navbar-collapse',
        nav: 'navbar-nav',
        item: 'nav-item',
        link: 'nav-link'
      }
    },

    navigationdrawer: {
      base: 'offcanvas offcanvas-start',
      parts: {
        header: 'offcanvas-header',
        body: 'offcanvas-body',
        title: 'offcanvas-title'
      }
    },

    sidebar: {
      base: 'sidebar',
      parts: {
        nav: 'nav flex-column',
        item: 'nav-item',
        link: 'nav-link'
      },
      states: {
        active: 'active'
      }
    },

    topappbar: {
      base: 'navbar navbar-expand-lg navbar-light bg-light',
      parts: {
        brand: 'navbar-brand',
        nav: 'navbar-nav ms-auto'
      }
    },

    breadcrumb: {
      base: 'breadcrumb',
      parts: {
        item: 'breadcrumb-item',
        active: 'breadcrumb-item active'
      }
    },

    tabs: {
      base: 'nav nav-tabs',
      variants: {
        tabs: 'nav-tabs',
        pills: 'nav-pills'
      },
      parts: {
        item: 'nav-item',
        link: 'nav-link',
        content: 'tab-content',
        pane: 'tab-pane'
      },
      states: {
        active: 'active'
      }
    },

    // ============================================================================
    // FEEDBACK COMPONENTS
    // ============================================================================

    modal: {
      base: 'modal fade',
      sizes: {
        sm: 'modal-sm',
        lg: 'modal-lg',
        xl: 'modal-xl'
      },
      parts: {
        dialog: 'modal-dialog',
        content: 'modal-content',
        header: 'modal-header',
        body: 'modal-body',
        footer: 'modal-footer',
        title: 'modal-title'
      },
      modifiers: {
        centered: 'modal-dialog-centered',
        scrollable: 'modal-dialog-scrollable'
      }
    },

    toast: {
      base: 'toast',
      parts: {
        header: 'toast-header',
        body: 'toast-body'
      },
      states: {
        show: 'show'
      }
    },

    tooltip: {
      base: 'tooltip',
      parts: {
        arrow: 'tooltip-arrow',
        inner: 'tooltip-inner'
      }
    },

    dropdown: {
      base: 'dropdown',
      parts: {
        toggle: 'dropdown-toggle',
        menu: 'dropdown-menu',
        item: 'dropdown-item',
        divider: 'dropdown-divider'
      },
      states: {
        show: 'show'
      }
    },

    // ============================================================================
    // PROGRESS & STATUS COMPONENTS
    // ============================================================================

    progressbar: {
      base: 'progress',
      parts: {
        bar: 'progress-bar'
      },
      variants: {
        striped: 'progress-bar-striped',
        animated: 'progress-bar-striped progress-bar-animated'
      }
    },

    stepper: {
      base: 'stepper',
      parts: {
        step: 'stepper-step',
        connector: 'stepper-connector'
      },
      states: {
        active: 'active',
        completed: 'completed'
      }
    },

    skeleton: {
      base: 'placeholder-glow',
      parts: {
        item: 'placeholder'
      }
    },

    // ============================================================================
    // DATA DISPLAY COMPONENTS
    // ============================================================================

    datatable: {
      base: 'table',
      variants: {
        striped: 'table-striped',
        bordered: 'table-bordered',
        hover: 'table-hover',
        sm: 'table-sm'
      },
      parts: {
        wrapper: 'table-responsive',
        head: 'thead',
        body: 'tbody',
        row: '',
        cell: ''
      }
    },

    list: {
      base: 'list-group',
      parts: {
        item: 'list-group-item'
      },
      states: {
        active: 'active',
        disabled: 'disabled'
      },
      modifiers: {
        flush: 'list-group-flush'
      }
    },

    virtuallist: {
      base: 'virtual-list',
      parts: {
        container: 'virtual-list-container',
        item: 'virtual-list-item'
      }
    },

    accordion: {
      base: 'accordion',
      parts: {
        item: 'accordion-item',
        header: 'accordion-header',
        button: 'accordion-button',
        collapse: 'accordion-collapse collapse',
        body: 'accordion-body'
      },
      states: {
        show: 'show',
        collapsed: 'collapsed'
      },
      modifiers: {
        flush: 'accordion-flush'
      }
    },

    pagination: {
      base: 'pagination',
      sizes: {
        sm: 'pagination-sm',
        lg: 'pagination-lg'
      },
      parts: {
        item: 'page-item',
        link: 'page-link'
      },
      states: {
        active: 'active',
        disabled: 'disabled'
      }
    },

    // ============================================================================
    // SPECIALIZED COMPONENTS
    // ============================================================================

    chips: {
      base: 'badge rounded-pill',
      variants: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        danger: 'bg-danger'
      }
    },

    fab: {
      base: 'btn btn-primary rounded-circle fab',
      sizes: {
        sm: 'btn-sm',
        lg: 'btn-lg'
      }
    },

    segmentedbutton: {
      base: 'btn-group',
      parts: {
        button: 'btn btn-outline-primary'
      },
      states: {
        active: 'active'
      }
    },

    autocomplete: {
      base: 'autocomplete',
      parts: {
        input: 'form-control',
        dropdown: 'dropdown-menu',
        item: 'dropdown-item'
      },
      states: {
        show: 'show'
      }
    },

    search: {
      base: 'input-group',
      parts: {
        input: 'form-control',
        button: 'btn btn-outline-secondary'
      }
    },

    datepicker: {
      base: 'datepicker',
      parts: {
        input: 'form-control',
        calendar: 'datepicker-calendar card shadow-lg',
        header: 'card-header',
        body: 'card-body'
      }
    },

    fileupload: {
      base: 'file-upload',
      parts: {
        input: 'form-control',
        label: 'form-label',
        preview: 'file-upload-preview'
      }
    },

    // ============================================================================
    // STATE COMPONENTS
    // ============================================================================

    emptystate: {
      base: 'empty-state text-center py-5',
      parts: {
        icon: 'empty-state-icon mb-3 text-muted',
        title: 'h4',
        description: 'text-muted mb-4',
        action: 'btn btn-primary'
      }
    },

    errorstate: {
      base: 'error-state alert alert-danger',
      parts: {
        icon: 'bi bi-exclamation-triangle me-2',
        title: 'alert-heading h5',
        message: 'mb-0'
      }
    },

    errorboundary: {
      base: 'error-boundary',
      parts: {
        container: 'alert alert-danger',
        title: 'alert-heading',
        message: 'mb-0'
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
      mr: (size) => `me-${size}`, // Bootstrap 5 uses me/ms
      mb: (size) => `mb-${size}`,
      ml: (size) => `ms-${size}`,
      mx: (size) => `mx-${size}`,
      my: (size) => `my-${size}`,
      // Padding
      p: (size) => `p-${size}`,
      pt: (size) => `pt-${size}`,
      pr: (size) => `pe-${size}`,
      pb: (size) => `pb-${size}`,
      pl: (size) => `ps-${size}`,
      px: (size) => `px-${size}`,
      py: (size) => `py-${size}`
    },

    layout: {
      flex: 'd-flex',
      inlineFlex: 'd-inline-flex',
      block: 'd-block',
      inlineBlock: 'd-inline-block',
      inline: 'd-inline',
      none: 'd-none',
      grid: 'd-grid'
    },

    flexbox: {
      row: 'flex-row',
      column: 'flex-column',
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      justifyStart: 'justify-content-start',
      justifyCenter: 'justify-content-center',
      justifyEnd: 'justify-content-end',
      justifyBetween: 'justify-content-between',
      justifyAround: 'justify-content-around',
      alignStart: 'align-items-start',
      alignCenter: 'align-items-center',
      alignEnd: 'align-items-end',
      alignStretch: 'align-items-stretch'
    },

    sizing: {
      w25: 'w-25',
      w50: 'w-50',
      w75: 'w-75',
      w100: 'w-100',
      wAuto: 'w-auto',
      h25: 'h-25',
      h50: 'h-50',
      h75: 'h-75',
      h100: 'h-100',
      hAuto: 'h-auto'
    },

    text: {
      left: 'text-start',
      center: 'text-center',
      right: 'text-end',
      muted: 'text-muted',
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      danger: 'text-danger',
      warning: 'text-warning',
      info: 'text-info'
    },

    background: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      danger: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info',
      light: 'bg-light',
      dark: 'bg-dark',
      white: 'bg-white',
      transparent: 'bg-transparent'
    },

    borders: {
      border: 'border',
      borderTop: 'border-top',
      borderRight: 'border-end',
      borderBottom: 'border-bottom',
      borderLeft: 'border-start',
      border0: 'border-0',
      rounded: 'rounded',
      roundedCircle: 'rounded-circle',
      roundedPill: 'rounded-pill'
    },

    shadows: {
      sm: 'shadow-sm',
      default: 'shadow',
      lg: 'shadow-lg',
      none: 'shadow-none'
    }
  }
};

export default bootstrapTheme;
