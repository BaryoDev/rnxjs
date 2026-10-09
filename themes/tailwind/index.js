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
 *   disabled, on every control; motion-reduce respected
 * - Token aware: every colour is an arbitrary value reading an --rnx-* CSS
 *   variable, with the old Tailwind hex as the fallback, for example
 *   bg-[color:var(--rnx-primary,#4f46e5)]. With no variables set every colour
 *   resolves to the old Tailwind hex (within 1 per channel, pinned by
 *   tests/tailwindDefaults.test.js). Set the variables in your own CSS to
 *   restyle the theme, no Tailwind config change. --rnx-surface is the card
 *   fill, --rnx-surface-hover the hover fill. Tints and shades with no token
 *   are color-mix() of a token with --rnx-surface or --rnx-text-primary.
 *   Tailwind 3.4.19 already reads var() values as colours; the color: hint is
 *   there so cn() groups these classes as colours and not sizes or widths.
 * - WCAG AA: text colours reach 4.5:1 on white, checked by
 *   tests/tailwindContrast.test.js, against the fill in the same class string
 *   (white if none). Excluded: decorative text (breadcrumb separator) and
 *   icons and close buttons (graphics, not text). Warning buttons read
 *   --rnx-text-on-warning.
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
      base: 'inline-flex items-center justify-center gap-2 font-medium rounded-md select-none transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)] focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] disabled:opacity-50 disabled:pointer-events-none',
      variants: {
        filled: 'bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-sm hover:bg-[color:var(--rnx-primary-hover,#4338ca)] active:bg-[color:var(--rnx-primary-active,#3730a3)]',
        outlined: 'border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] shadow-sm hover:bg-[color:var(--rnx-surface-hover,#f8fafc)] active:bg-[color:var(--rnx-surface-variant,#f1f5f9)]',
        text: 'text-[color:var(--rnx-primary,#4f46e5)] hover:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] active:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_85%,var(--rnx-primary,#305fff))]',
        elevated: 'bg-[color:var(--rnx-surface,#ffffff)] text-[color:var(--rnx-primary,#4f46e5)] shadow-md hover:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] active:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_85%,var(--rnx-primary,#305fff))]',
        tonal: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] text-[color:var(--rnx-primary-hover,#4338ca)] hover:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_85%,var(--rnx-primary,#305fff))] active:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_72%,var(--rnx-primary,#375efb))]',
        // Color variants
        primary: 'bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-sm hover:bg-[color:var(--rnx-primary-hover,#4338ca)] active:bg-[color:var(--rnx-primary-active,#3730a3)]',
        secondary: 'bg-[color:var(--rnx-surface,#ffffff)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] shadow-sm hover:bg-[color:var(--rnx-surface-hover,#f8fafc)] active:bg-[color:var(--rnx-surface-variant,#f1f5f9)]',
        success: 'bg-[color:var(--rnx-success,#047857)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-sm hover:bg-[color:var(--rnx-success-hover,#065f46)] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_27%,var(--rnx-success-hover,#036241))] focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_1%,var(--rnx-success,#10bb82))]',
        danger: 'bg-[color:var(--rnx-danger,#dc2626)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-sm hover:bg-[color:var(--rnx-danger-hover,#b91c1c)] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_17%,var(--rnx-danger-hover,#b51c18))] focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))]',
        warning: 'bg-[color:var(--rnx-warning,#fbbf24)] text-[color:var(--rnx-text-on-warning,#451a03)] shadow-sm hover:bg-[color:var(--rnx-warning-hover,#f59e0b)] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_15%,var(--rnx-warning-hover,#fd8800))] focus-visible:ring-[color:var(--rnx-warning,#fbbf24)]',
        info: 'bg-[color:var(--rnx-info,#0369a1)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-sm hover:bg-[color:var(--rnx-info-hover,#075985)] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_22%,var(--rnx-info-hover,#0b5881))] focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_1%,var(--rnx-info,#0ea6eb))]',
        light: 'bg-[color:var(--rnx-surface-variant,#f1f5f9)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] hover:bg-[color:var(--rnx-border-color,#e2e8f0)] active:bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] focus-visible:ring-[color:var(--rnx-text-disabled,#94a3b8)]',
        dark: 'bg-[color:var(--rnx-text-primary,#0f172a)] text-[color:var(--rnx-surface,#ffffff)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_71%,var(--rnx-secondary,#435565))] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] focus-visible:ring-[color:var(--rnx-secondary,#475569)]'
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
        primary: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] text-[color:var(--rnx-primary-hover,#4338ca)] ring-[color:color-mix(in_srgb,var(--rnx-primary,#4f46e5)_20%,transparent)]',
        secondary: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] ring-[color:color-mix(in_srgb,var(--rnx-text-secondary,#64748b)_20%,transparent)]',
        success: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-success,#11e682))] text-[color:var(--rnx-success,#047857)] ring-[color:color-mix(in_srgb,color-mix(in_srgb,var(--rnx-surface,#ffffff)_2%,var(--rnx-success,#009466))_20%,transparent)]',
        danger: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-danger,#ee2626))] text-[color:var(--rnx-danger-hover,#b91c1c)] ring-[color:color-mix(in_srgb,var(--rnx-danger,#dc2626)_20%,transparent)]',
        warning: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_90%,var(--rnx-warning,#ffd737))] text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_1%,var(--rnx-warning-hover,#913e0c))] ring-[color:color-mix(in_srgb,color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_15%,var(--rnx-warning-hover,#fd8800))_20%,transparent)]',
        info: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-info,#059bff))] text-[color:var(--rnx-info,#0369a1)] ring-[color:color-mix(in_srgb,color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_1%,var(--rnx-info,#0285c9))_20%,transparent)]',
        light: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:var(--rnx-secondary,#475569)] ring-[color:color-mix(in_srgb,var(--rnx-text-disabled,#94a3b8)_20%,transparent)]',
        dark: 'bg-[color:var(--rnx-text-primary,#0f172a)] text-[color:var(--rnx-surface,#ffffff)] ring-[color:var(--rnx-text-primary,#0f172a)]'
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
        primary: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_72%,var(--rnx-primary,#375efb))] text-[color:var(--rnx-primary-active,#3730a3)]',
        secondary: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] border-[color:var(--rnx-border-color,#e2e8f0)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))]',
        success: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-success,#11e682))] border-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_5%,var(--rnx-success-hover,#afffd9))] text-[color:var(--rnx-success-hover,#065f46)]',
        danger: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-danger,#ee2626))] border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_76%,var(--rnx-danger,#fb2222))] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_17%,var(--rnx-danger-hover,#b51c18))]',
        warning: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_90%,var(--rnx-warning,#ffd737))] border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_48%,var(--rnx-warning,#fbcf1e))] text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_1%,var(--rnx-warning-hover,#913e0c))]',
        info: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-info,#059bff))] border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_72%,var(--rnx-info,#09a6f8))] text-[color:var(--rnx-info-hover,#075985)]',
        light: 'bg-[color:var(--rnx-surface,#ffffff)] border-[color:var(--rnx-border-color,#e2e8f0)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))]',
        dark: 'bg-[color:var(--rnx-text-primary,#0f172a)] border-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_71%,var(--rnx-secondary,#435565))] text-[color:var(--rnx-surface-variant,#f1f5f9)]'
      },
      modifiers: {
        dismissible: 'pr-12 relative'
      }
    },

    spinner: {
      base: 'animate-spin rounded-full border-2 border-[color:var(--rnx-border-color,#e2e8f0)] motion-reduce:animate-[spin_1.5s_linear_infinite]',
      variants: {
        border: 'border-t-[color:var(--rnx-primary,#4f46e5)]',
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
      base: 'bg-[color:var(--rnx-surface,#ffffff)] rounded-lg overflow-hidden',
      variants: {
        outlined: 'border border-[color:var(--rnx-border-color,#e2e8f0)] shadow-sm',
        elevated: 'shadow-md',
        filled: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] border border-[color:var(--rnx-border-color,#e2e8f0)]'
      },
      parts: {
        header: 'px-5 py-4 border-b border-[color:var(--rnx-border-color,#e2e8f0)]',
        body: 'px-5 py-4',
        footer: 'px-5 py-4 border-t border-[color:var(--rnx-border-color,#e2e8f0)] bg-[color:var(--rnx-surface-hover,#f8fafc)] text-sm text-[color:var(--rnx-secondary,#475569)]',
        title: 'text-base font-semibold text-[color:var(--rnx-text-primary,#0f172a)]',
        subtitle: 'text-sm text-[color:var(--rnx-text-secondary,#64748b)] mt-0.5'
      }
    },

    statcard: {
      base: 'bg-[color:var(--rnx-surface,#ffffff)] rounded-lg p-5 border border-[color:var(--rnx-border-color,#e2e8f0)] shadow-sm',
      parts: {
        body: '',
        title: 'text-sm font-medium text-[color:var(--rnx-text-secondary,#64748b)]',
        value: 'text-2xl font-semibold text-[color:var(--rnx-text-primary,#0f172a)] mt-1 tabular-nums',
        trend: 'text-xs font-medium text-[color:var(--rnx-text-secondary,#64748b)] mt-2',
        icon: 'ml-3',
        footer: 'mt-3 pt-3 border-t border-[color:var(--rnx-border-color,#e2e8f0)]'
      }
    },

    // ============================================================================
    // FORM COMPONENTS
    // ============================================================================

    input: {
      base: 'w-full rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] px-3 py-2 text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm placeholder:text-[color:var(--rnx-text-secondary,#64748b)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
      sizes: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-11 px-4 text-base'
      },
      states: {
        disabled: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:var(--rnx-text-secondary,#64748b)] cursor-not-allowed',
        readonly: 'bg-[color:var(--rnx-surface-hover,#f8fafc)]',
        error: 'border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))] focus:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))] focus:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))]'
      },
      parts: {
        wrapper: 'relative',
        label: 'block text-sm font-medium text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] mb-1.5',
        floatingWrapper: 'relative',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--rnx-text-disabled,#94a3b8)] pointer-events-none',
        help: 'mt-1.5 text-xs text-[color:var(--rnx-text-secondary,#64748b)]',
        error: 'mt-1.5 text-xs text-[color:var(--rnx-danger,#dc2626)]'
      }
    },

    textarea: {
      base: 'w-full rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] px-3 py-2 text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm placeholder:text-[color:var(--rnx-text-secondary,#64748b)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
      sizes: {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base'
      },
      states: {
        disabled: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:var(--rnx-text-secondary,#64748b)] cursor-not-allowed',
        readonly: 'bg-[color:var(--rnx-surface-hover,#f8fafc)]'
      }
    },

    select: {
      base: 'w-full appearance-none rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] bg-[position:right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%3E%3Cpath%20fill=%27none%27%20stroke=%27%2364748b%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20d=%27M6%208l4%204%204-4%27/%3E%3C/svg%3E)] px-3 py-2 pr-9 text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] disabled:cursor-not-allowed disabled:bg-[color:var(--rnx-surface-hover,#f8fafc)] disabled:text-[color:var(--rnx-text-secondary,#64748b)] [&[multiple]]:bg-none [&[multiple]]:pr-3',
      sizes: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-11 px-4 text-base'
      },
      states: {
        disabled: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:var(--rnx-text-secondary,#64748b)] cursor-not-allowed'
      }
    },

    checkbox: {
      base: 'h-4 w-4 rounded shrink-0 appearance-none border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] bg-center bg-no-repeat bg-contain shadow-sm transition-colors duration-150 motion-reduce:transition-none checked:border-[color:var(--rnx-primary,#4f46e5)] checked:bg-[color:var(--rnx-primary,#4f46e5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)] disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%3E%3Cpath%20fill=%27none%27%20stroke=%27white%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20d=%27M3.5%208.5l3%203%206-6.5%27/%3E%3C/svg%3E)]',
      parts: {
        wrapper: 'flex items-center gap-2',
        label: 'text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] select-none'
      }
    },

    radio: {
      base: 'h-4 w-4 rounded-full shrink-0 appearance-none border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] bg-center bg-no-repeat bg-contain shadow-sm transition-colors duration-150 motion-reduce:transition-none checked:border-[color:var(--rnx-primary,#4f46e5)] checked:bg-[color:var(--rnx-primary,#4f46e5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)] disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%3E%3Ccircle%20cx=%278%27%20cy=%278%27%20r=%273%27%20fill=%27white%27/%3E%3C/svg%3E)]',
      parts: {
        wrapper: 'flex items-center gap-2',
        label: 'text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] select-none'
      }
    },

    switch: {
      // The input is a visually hidden native checkbox (peer). Track and thumb
      // are siblings that react to its state through peer-* variants, so the
      // control submits with a form and stays keyboard accessible.
      base: 'absolute inset-0 rounded-full bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] transition-colors duration-150 motion-reduce:transition-none peer-checked:bg-[color:var(--rnx-primary,#4f46e5)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)] peer-disabled:opacity-50',
      parts: {
        wrapper: 'flex items-center gap-3',
        label: 'text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] select-none',
        control: 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer',
        input: 'peer sr-only',
        thumb: 'absolute left-1 top-1 h-4 w-4 rounded-full bg-[color:var(--rnx-surface,#ffffff)] shadow transition-transform duration-150 motion-reduce:transition-none peer-checked:translate-x-5 peer-disabled:opacity-50'
      },
      states: {
        disabled: 'cursor-not-allowed'
      }
    },

    slider: {
      base: 'w-full h-2 bg-[color:var(--rnx-border-color,#e2e8f0)] rounded-full appearance-none cursor-pointer accent-[color:var(--rnx-primary,#4f46e5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)]',
      states: {
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },

    formgroup: {
      base: 'mb-4',
      parts: {
        label: 'block text-sm font-medium text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] mb-1.5',
        help: 'mt-1.5 text-xs text-[color:var(--rnx-text-secondary,#64748b)]',
        error: 'mt-1.5 text-xs text-[color:var(--rnx-danger,#dc2626)]'
      }
    },

    // ============================================================================
    // NAVIGATION COMPONENTS
    // ============================================================================

    navigationbar: {
      base: 'bg-[color:var(--rnx-surface,#ffffff)] border-b border-[color:var(--rnx-border-color,#e2e8f0)]',
      variants: {
        light: 'bg-[color:var(--rnx-surface,#ffffff)] text-[color:var(--rnx-text-primary,#0f172a)]',
        dark: 'bg-[color:var(--rnx-text-primary,#0f172a)] text-[color:var(--rnx-surface,#ffffff)] border-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_71%,var(--rnx-secondary,#435565))]',
        primary: 'bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] border-[color:var(--rnx-primary-hover,#4338ca)]'
      },
      parts: {
        brand: 'text-base font-semibold tracking-tight',
        toggler: 'p-2 rounded-md hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
        collapse: 'flex-grow',
        nav: 'flex items-center gap-1',
        item: '',
        link: 'px-3 py-2 text-sm font-medium rounded-md text-[color:var(--rnx-secondary,#475569)] hover:text-[color:var(--rnx-text-primary,#0f172a)] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      }
    },

    navigationdrawer: {
      base: 'fixed inset-y-0 left-0 z-50 w-72 bg-[color:var(--rnx-surface,#ffffff)] shadow-xl transform transition-transform duration-300 motion-reduce:transition-none',
      parts: {
        header: 'px-5 py-4 border-b border-[color:var(--rnx-border-color,#e2e8f0)]',
        body: 'p-3 overflow-y-auto',
        title: 'text-base font-semibold text-[color:var(--rnx-text-primary,#0f172a)]',
        overlay: 'fixed inset-0 bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_50%,transparent)] z-40'
      }
    },

    sidebar: {
      base: 'bg-[color:var(--rnx-surface,#ffffff)] border-r border-[color:var(--rnx-border-color,#e2e8f0)] h-full',
      parts: {
        nav: 'flex flex-col gap-0.5 p-3',
        item: '',
        link: 'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[color:var(--rnx-secondary,#475569)] hover:text-[color:var(--rnx-text-primary,#0f172a)] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      },
      states: {
        active: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] text-[color:var(--rnx-primary-hover,#4338ca)]'
      }
    },

    topappbar: {
      base: 'bg-[color:var(--rnx-surface,#ffffff)] border-b border-[color:var(--rnx-border-color,#e2e8f0)] px-4 sm:px-6 py-3',
      parts: {
        brand: 'text-base font-semibold tracking-tight text-[color:var(--rnx-text-primary,#0f172a)]',
        title: 'm-0',
        nav: 'flex items-center gap-2 ml-auto'
      }
    },

    breadcrumb: {
      base: 'flex items-center gap-2 text-sm',
      parts: {
        item: 'text-[color:var(--rnx-text-secondary,#64748b)] hover:text-[color:var(--rnx-text-primary,#0f172a)] transition-colors duration-150 motion-reduce:transition-none',
        active: 'text-[color:var(--rnx-text-primary,#0f172a)] font-medium',
        // decorative: Breadcrumb renders it aria-hidden, so no contrast requirement
        separator: 'text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] select-none'
      }
    },

    tabs: {
      base: 'border-b border-[color:var(--rnx-border-color,#e2e8f0)]',
      variants: {
        tabs: 'flex gap-6',
        pills: 'flex gap-2 border-none'
      },
      parts: {
        item: '',
        link: 'py-3 px-1 -mb-px text-sm font-medium border-b-2 border-transparent text-[color:var(--rnx-text-secondary,#64748b)] hover:text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] hover:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-inset',
        content: 'py-5',
        pane: 'hidden'
      },
      states: {
        active: 'border-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-primary,#4f46e5)]'
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
        overlay: 'fixed inset-0 bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_50%,transparent)] transition-opacity motion-reduce:transition-none',
        dialog: 'relative bg-[color:var(--rnx-surface,#ffffff)] rounded-lg shadow-xl mx-auto my-8 w-full',
        content: 'relative',
        header: 'flex items-start justify-between px-5 py-4 border-b border-[color:var(--rnx-border-color,#e2e8f0)]',
        body: 'px-5 py-4 text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))]',
        footer: 'flex justify-end gap-2 px-5 py-4 border-t border-[color:var(--rnx-border-color,#e2e8f0)] bg-[color:var(--rnx-surface-hover,#f8fafc)]',
        title: 'text-base font-semibold text-[color:var(--rnx-text-primary,#0f172a)]',
        close: 'absolute top-3 right-3 p-2 rounded-md text-[color:var(--rnx-text-disabled,#94a3b8)] hover:text-[color:var(--rnx-secondary,#475569)] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      },
      modifiers: {
        centered: 'flex items-center min-h-screen',
        scrollable: 'overflow-y-auto max-h-[90vh]'
      }
    },

    toast: {
      base: 'pointer-events-auto bg-[color:var(--rnx-surface,#ffffff)] rounded-lg shadow-lg ring-1 ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_10%,transparent)] overflow-hidden',
      parts: {
        header: 'flex items-center px-4 py-3 border-b border-[color:var(--rnx-border-color-light,#f1f5f9)] text-sm font-medium text-[color:var(--rnx-text-primary,#0f172a)]',
        title: 'mr-auto',
        body: 'px-4 py-3 text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))]',
        close: 'absolute top-3 right-3 p-1.5 rounded-md text-[color:var(--rnx-text-disabled,#94a3b8)] hover:text-[color:var(--rnx-secondary,#475569)] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      },
      states: {
        show: 'motion-safe:animate-rnx-toast-in'
      }
    },

    tooltip: {
      base: 'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-[color:var(--rnx-surface,#ffffff)] bg-[color:var(--rnx-text-primary,#0f172a)] rounded-md shadow-md max-w-xs',
      parts: {
        arrow: 'absolute w-2 h-2 bg-[color:var(--rnx-text-primary,#0f172a)] transform rotate-45',
        inner: ''
      }
    },

    dropdown: {
      base: 'relative inline-block',
      parts: {
        toggle: 'inline-flex items-center justify-center gap-1.5',
        menu: 'absolute z-50 mt-1.5 bg-[color:var(--rnx-surface,#ffffff)] rounded-lg shadow-lg ring-1 ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_10%,transparent)] min-w-[12rem] py-1',
        item: 'block w-full text-left px-3 py-2 text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] hover:text-[color:var(--rnx-text-primary,#0f172a)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:bg-[color:var(--rnx-surface-variant,#f1f5f9)]',
        divider: 'h-px bg-[color:var(--rnx-border-color,#e2e8f0)] my-1'
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
      base: 'w-full bg-[color:var(--rnx-border-color,#e2e8f0)] rounded-full h-2 overflow-hidden',
      parts: {
        bar: 'h-full bg-[color:var(--rnx-primary,#4f46e5)] rounded-full transition-[width] duration-300 motion-reduce:transition-none'
      },
      variants: {
        striped: 'bg-gradient-to-r from-[color:var(--rnx-primary,#4f46e5)] to-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
        animated: 'animate-pulse'
      }
    },

    stepper: {
      base: 'flex items-center',
      parts: {
        step: 'flex items-center relative',
        connector: 'flex-1 h-0.5 bg-[color:var(--rnx-border-color,#e2e8f0)] mx-4',
        circle: 'w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none',
        label: 'absolute top-11 left-1/2 -translate-x-1/2 text-xs font-medium text-[color:var(--rnx-text-secondary,#64748b)] whitespace-nowrap'
      },
      states: {
        active: 'border-[color:var(--rnx-primary,#4f46e5)] bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)]',
        completed: 'border-[color:var(--rnx-primary,#4f46e5)] bg-[color:var(--rnx-surface,#ffffff)] text-[color:var(--rnx-primary,#4f46e5)]',
        pending: 'border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] text-[color:var(--rnx-text-secondary,#64748b)]'
      }
    },

    skeleton: {
      base: 'animate-pulse motion-reduce:animate-none',
      parts: {
        item: 'bg-[color:var(--rnx-border-color,#e2e8f0)] rounded-md'
      },
      variants: {
        text: 'h-4 bg-[color:var(--rnx-border-color,#e2e8f0)] rounded w-full',
        circle: 'rounded-full bg-[color:var(--rnx-border-color,#e2e8f0)]',
        rect: 'bg-[color:var(--rnx-border-color,#e2e8f0)] rounded-md'
      }
    },

    // ============================================================================
    // DATA DISPLAY COMPONENTS
    // ============================================================================

    datatable: {
      base: 'min-w-full divide-y divide-[color:var(--rnx-border-color,#e2e8f0)]',
      variants: {
        striped: '[&_tbody_tr:nth-child(odd)]:bg-[color:color-mix(in_srgb,var(--rnx-surface-hover,#f8fafc)_60%,transparent)]',
        bordered: 'border border-[color:var(--rnx-border-color,#e2e8f0)]',
        hover: '[&_tbody_tr]:hover:bg-[color:var(--rnx-surface-hover,#f8fafc)]',
        compact: 'text-sm [&_td]:py-2 [&_th]:py-2'
      },
      parts: {
        wrapper: 'overflow-x-auto rounded-lg border border-[color:var(--rnx-border-color,#e2e8f0)] shadow-sm',
        head: 'bg-[color:var(--rnx-surface-hover,#f8fafc)]',
        body: 'bg-[color:var(--rnx-surface,#ffffff)] divide-y divide-[color:var(--rnx-border-color-light,#f1f5f9)]',
        row: 'transition-colors duration-150 motion-reduce:transition-none',
        th: 'px-4 py-3 text-left text-xs font-semibold text-[color:var(--rnx-secondary,#475569)] uppercase tracking-wide',
        td: 'px-4 py-3 whitespace-nowrap text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))]'
      }
    },

    list: {
      base: 'divide-y divide-[color:var(--rnx-border-color-light,#f1f5f9)] rounded-lg border border-[color:var(--rnx-border-color,#e2e8f0)] bg-[color:var(--rnx-surface,#ffffff)] shadow-sm',
      parts: {
        item: 'px-4 py-3 text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] hover:bg-[color:var(--rnx-surface-hover,#f8fafc)] transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        active: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] text-[color:var(--rnx-primary-hover,#4338ca)]',
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
      base: 'divide-y divide-[color:var(--rnx-border-color,#e2e8f0)] rounded-lg border border-[color:var(--rnx-border-color,#e2e8f0)] bg-[color:var(--rnx-surface,#ffffff)] shadow-sm',
      parts: {
        item: '',
        header: '',
        button: 'flex items-center justify-between w-full px-4 py-3.5 text-left text-sm font-medium text-[color:var(--rnx-text-primary,#0f172a)] hover:bg-[color:var(--rnx-surface-hover,#f8fafc)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-inset',
        collapse: 'overflow-hidden transition-all duration-200 motion-reduce:transition-none',
        body: 'px-4 pb-4 text-sm text-[color:var(--rnx-secondary,#475569)]'
      },
      states: {
        show: 'max-h-[10000px]',
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
        link: 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] text-sm font-medium text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] shadow-sm hover:bg-[color:var(--rnx-surface-hover,#f8fafc)] active:bg-[color:var(--rnx-surface-variant,#f1f5f9)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      },
      states: {
        active: 'bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] border-[color:var(--rnx-primary,#4f46e5)] hover:bg-[color:var(--rnx-primary-hover,#4338ca)] active:bg-[color:var(--rnx-primary-active,#3730a3)]',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      }
    },

    // ============================================================================
    // SPECIALIZED COMPONENTS
    // ============================================================================

    chips: {
      base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors duration-150 motion-reduce:transition-none',
      variants: {
        primary: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))] text-[color:var(--rnx-primary-hover,#4338ca)] ring-[color:color-mix(in_srgb,var(--rnx-primary,#4f46e5)_20%,transparent)]',
        secondary: 'bg-[color:var(--rnx-surface-hover,#f8fafc)] text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] ring-[color:color-mix(in_srgb,var(--rnx-text-secondary,#64748b)_20%,transparent)]',
        success: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-success,#11e682))] text-[color:var(--rnx-success,#047857)] ring-[color:color-mix(in_srgb,color-mix(in_srgb,var(--rnx-surface,#ffffff)_2%,var(--rnx-success,#009466))_20%,transparent)]',
        danger: 'bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-danger,#ee2626))] text-[color:var(--rnx-danger-hover,#b91c1c)] ring-[color:color-mix(in_srgb,var(--rnx-danger,#dc2626)_20%,transparent)]'
      },
      modifiers: {
        removable: 'pr-1'
      }
    },

    fab: {
      base: 'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] shadow-lg hover:bg-[color:var(--rnx-primary-hover,#4338ca)] hover:shadow-xl active:bg-[color:var(--rnx-primary-active,#3730a3)] transition-all duration-150 motion-reduce:transition-none flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)]',
      sizes: {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
      }
    },

    segmentedbutton: {
      base: 'inline-flex rounded-lg bg-[color:var(--rnx-surface-variant,#f1f5f9)] p-1',
      parts: {
        button: 'px-3.5 py-1.5 text-sm font-medium rounded-md text-[color:var(--rnx-secondary,#475569)] hover:text-[color:var(--rnx-text-primary,#0f172a)] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      },
      states: {
        active: 'bg-[color:var(--rnx-surface,#ffffff)] shadow-sm text-[color:var(--rnx-text-primary,#0f172a)]'
      }
    },

    autocomplete: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] px-3 py-2 text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm placeholder:text-[color:var(--rnx-text-secondary,#64748b)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
        dropdown: 'absolute z-50 mt-1.5 w-full bg-[color:var(--rnx-surface,#ffffff)] rounded-lg shadow-lg ring-1 ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_10%,transparent)] max-h-60 overflow-auto py-1',
        item: 'px-3 py-2 text-sm text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] cursor-pointer transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        show: 'block',
        hide: 'hidden'
      }
    },

    search: {
      base: 'relative',
      parts: {
        input: 'w-full pl-9 pr-4 py-2 rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm placeholder:text-[color:var(--rnx-text-secondary,#64748b)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
        icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--rnx-text-disabled,#94a3b8)] pointer-events-none',
        button: 'absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] text-xs font-medium rounded hover:bg-[color:var(--rnx-primary-hover,#4338ca)] active:bg-[color:var(--rnx-primary-active,#3730a3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]'
      }
    },

    datepicker: {
      base: 'relative',
      parts: {
        input: 'w-full rounded-md border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] bg-[color:var(--rnx-surface,#ffffff)] px-3 py-2 text-sm text-[color:var(--rnx-text-primary,#0f172a)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))]',
        calendar: 'absolute z-50 mt-1.5 bg-[color:var(--rnx-surface,#ffffff)] rounded-lg shadow-lg ring-1 ring-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_10%,transparent)] p-3',
        header: 'flex items-center justify-between mb-3',
        body: 'grid grid-cols-7 gap-0.5',
        day: 'w-9 h-9 rounded-md hover:bg-[color:var(--rnx-surface-variant,#f1f5f9)] flex items-center justify-center text-sm cursor-pointer transition-colors duration-150 motion-reduce:transition-none'
      },
      states: {
        selected: 'bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] hover:bg-[color:var(--rnx-primary-hover,#4338ca)]',
        today: 'font-semibold text-[color:var(--rnx-primary,#4f46e5)]'
      }
    },

    fileupload: {
      base: '',
      parts: {
        zone: 'border-2 border-dashed border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))] rounded-lg p-8 text-center bg-[color:var(--rnx-surface,#ffffff)] hover:border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_33%,var(--rnx-primary,#4353f5))] hover:bg-[color:color-mix(in_srgb,color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))_30%,transparent)] transition-colors duration-150 motion-reduce:transition-none',
        input: 'hidden',
        label: 'block text-sm font-medium text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_34%,var(--rnx-secondary,#46576b))] mb-1.5',
        preview: 'mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3',
        icon: 'mx-auto text-[color:var(--rnx-text-disabled,#94a3b8)] mb-3'
      },
      states: {
        dragover: 'border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_92%,var(--rnx-primary,#2a5cff))]'
      }
    },

    // ============================================================================
    // STATE COMPONENTS
    // ============================================================================

    emptystate: {
      base: 'text-center py-12 px-6',
      parts: {
        icon: 'mx-auto mb-4 text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_75%,var(--rnx-secondary,#2f5787))]',
        title: 'text-base font-semibold text-[color:var(--rnx-text-primary,#0f172a)] mb-1',
        description: 'text-sm text-[color:var(--rnx-text-secondary,#64748b)] mb-6 max-w-sm mx-auto',
        action: 'inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium bg-[color:var(--rnx-primary,#4f46e5)] text-[color:var(--rnx-text-on-primary,#ffffff)] rounded-md shadow-sm hover:bg-[color:var(--rnx-primary-hover,#4338ca)] active:bg-[color:var(--rnx-primary-active,#3730a3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_14%,var(--rnx-primary,#4a4def))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)]'
      }
    },

    errorstate: {
      base: 'rounded-lg bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-danger,#ee2626))] border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_76%,var(--rnx-danger,#fb2222))] p-6',
      parts: {
        icon: 'inline-block mr-2 text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))]',
        title: 'text-base font-semibold text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_17%,var(--rnx-danger-hover,#b51c18))] mb-1',
        message: 'text-sm text-[color:var(--rnx-danger-hover,#b91c1c)]',
        action: 'mt-4 inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-[color:var(--rnx-danger,#dc2626)] text-[color:var(--rnx-text-on-primary,#ffffff)] rounded-md shadow-sm hover:bg-[color:var(--rnx-danger-hover,#b91c1c)] active:bg-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_17%,var(--rnx-danger-hover,#b51c18))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_19%,var(--rnx-danger,#eb1818))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--rnx-surface,#ffffff)]'
      }
    },

    errorboundary: {
      base: 'rounded-lg bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_94%,var(--rnx-danger,#ee2626))] border border-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_76%,var(--rnx-danger,#fb2222))] p-6',
      parts: {
        container: 'max-w-2xl mx-auto',
        title: 'text-base font-semibold text-[color:color-mix(in_srgb,var(--rnx-text-primary,#0f172a)_17%,var(--rnx-danger-hover,#b51c18))] mb-2',
        message: 'text-sm text-[color:var(--rnx-danger-hover,#b91c1c)] font-mono',
        stack: 'mt-4 p-4 bg-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_88%,var(--rnx-danger,#f70d0d))] rounded-md text-xs font-mono overflow-auto'
      }
    }
  },

  // ============================================================================
  // UTILITY CLASSES
  // ============================================================================

  utilities: {
    // Icon set used by every component; replace className to use another set
    icon: {
      className: (name) => `bi bi-${name}`
    },

    a11y: {
      srOnly: 'sr-only'
    },

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
      muted: 'text-[color:var(--rnx-text-secondary,#64748b)]',
      primary: 'text-[color:var(--rnx-primary,#4f46e5)]',
      secondary: 'text-[color:var(--rnx-secondary,#475569)]',
      success: 'text-[color:var(--rnx-success,#047857)]',
      danger: 'text-[color:var(--rnx-danger,#dc2626)]',
      warning: 'text-[color:color-mix(in_srgb,var(--rnx-surface,#ffffff)_1%,var(--rnx-warning-hover,#b35107))]',
      info: 'text-[color:var(--rnx-info,#0369a1)]'
    },

    background: {
      primary: 'bg-[color:var(--rnx-primary,#4f46e5)]',
      secondary: 'bg-[color:var(--rnx-secondary,#475569)]',
      success: 'bg-[color:var(--rnx-success,#047857)]',
      danger: 'bg-[color:var(--rnx-danger,#dc2626)]',
      warning: 'bg-[color:var(--rnx-warning,#fbbf24)]',
      info: 'bg-[color:var(--rnx-info,#0369a1)]',
      light: 'bg-[color:var(--rnx-surface-variant,#f1f5f9)]',
      dark: 'bg-[color:var(--rnx-text-primary,#0f172a)]',
      white: 'bg-[color:var(--rnx-surface,#ffffff)]',
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
