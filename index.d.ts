// TypeScript definitions for rnxJS
// Type definitions for @arnelirobles/rnxjs 0.1.9
// Project: https://github.com/arnelirobles/rnxjs
// Definitions by: Arnel Isiderio Robles

export interface ReactiveState<T extends object = any> {
    /**
     * Subscribe to changes on a specific property path
     * @param path - Dot-notation path (e.g., 'user.email')
     * @param callback - Called with new value when path changes
     * @returns Unsubscribe function
     */
    subscribe(path: string, callback: (value: any) => void): () => void;

    /**
     * Get nested property value from object
     * @param path - Dot-notation path
     * @returns Property value or undefined
     */
    getNestedValue(path: string): any;

    /**
     * Unsubscribe all listeners
     */
    $unsubscribeAll(): void;

    /**
     * Destroy the reactive state and cleanup all resources
     */
    $destroy(): void;
}

export interface Component extends HTMLElement {
    /**
     * Update component state and trigger re-render
     * @param newState - Partial state to merge with current state
     */
    setState(newState: any): void;

    /**
     * Hook called after component renders
     * @param fn - Effect function, can return cleanup function
     */
    useEffect(fn: (component: Component) => void | (() => void)): void;

    /**
     * Hook called when component is destroyed
     * @param fn - Cleanup function
     */
    onUnmount(fn: () => void): void;

    /**
     * Get current component state
     * @returns Current state object
     */
    getState(): any;

    /**
     * Create a state getter/setter pair for a specific key
     * @param key - State property key
     * @param initialValue - Initial value if key doesn't exist
     * @returns Tuple of [getter, setter]
     */
    useState<T = any>(key: string, initialValue: T): [() => T, (value: T) => void];

    /**
     * Manually destroy the component and run cleanup
     */
    destroy(): void;

    /**
     * Object containing refs to elements with data-ref attributes
     */
    refs: Record<string, HTMLElement>;
}

/**
 * Creates a reactive state object using ES6 Proxy
 * Automatically notifies subscribers when state changes
 * @param initialState - Initial state object
 * @returns Reactive state proxy with subscribe/unsubscribe methods
 */
export function createReactiveState<T extends object>(
    initialState: T
): T & ReactiveState<T>;

/**
 * Create a component from a template function
 * @param templateFn - Function that returns HTML template string
 * @param initialState - Initial component state
 * @param styles - Optional CSS styles
 * @returns Component element
 */
export function createComponent(
    templateFn: (state: any) => string,
    initialState?: any,
    styles?: string
): Component;

/**
 * Register a component with a custom tag name
 * @param tagName - Tag name for the component
 * @param componentFunc - Component function
 */
export function registerComponent(
    tagName: string,
    componentFunc: (props: any) => Component
): void;

/**
 * Load all registered components in the given root element
 * @param root - Root element to search for components
 * @param reactiveState - Optional reactive state for data binding
 */
export function loadComponents(
    root?: Document | HTMLElement,
    reactiveState?: ReactiveState
): void;

/**
 * Automatically register all exported component functions
 */
export function autoRegisterComponents(): void;

/**
 * Bind data-bind attributes to reactive state
 * Sets up two-way binding for inputs and one-way binding for display elements
 * @param rootElement - Root element to search for data-bind attributes
 * @param state - Reactive state object
 */
export function bindData(
    rootElement?: Document | HTMLElement,
    state?: ReactiveState
): void;

/**
 * Unbind all data bindings for a root element
 * @param rootElement - Root element to unbind
 */
export function unbindData(rootElement: HTMLElement): void;

// Bootstrap Component Types
export interface ButtonProps {
    label?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    size?: 'sm' | 'lg';
    block?: boolean | 'true' | 'false';
    onclick?: () => void;
    children?: Node | Node[];
}

export interface InputProps {
    name?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    children?: Node | Node[];
}

export interface AlertProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    dismissible?: boolean | 'true' | 'false';
    children?: Node | Node[];
}

export interface CardProps {
    title?: string;
    subtitle?: string;
    children?: Node | Node[];
}

// Component Functions
export function Button(props: ButtonProps): Component;
export function Input(props: InputProps): Component;
export function Alert(props: AlertProps): Component;
export function Badge(props: any): Component;
export function Card(props: CardProps): Component;
export function Checkbox(props: any): Component;
export function Col(props: any): Component;
export function Container(props: any): Component;
export function FormGroup(props: any): Component;
export function Modal(props: any): Component;
export function Pagination(props: any): Component;
export function Radio(props: any): Component;
export function Row(props: any): Component;
export function Select(props: any): Component;
export function Spinner(props: any): Component;
export function Tabs(props: any): Component;
export function Textarea(props: any): Component;
export function Toast(props: any): Component;

// ============================================
// Security Utilities
// ============================================

/**
 * Trusted HTML wrapper type
 */
export interface TrustedHtml {
    __rnxTrustedHtml: true;
    toString(): string;
    valueOf(): string;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param str - String to escape (non-strings are converted)
 * @returns Escaped string safe for HTML insertion
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(str: any): string;

/**
 * Escape string for use in HTML attributes
 * More aggressive escaping for attribute context
 * @param str - String to escape
 * @returns Escaped string safe for attribute values
 */
export function escapeAttribute(str: any): string;

/**
 * Escape string for use in JavaScript string context
 * @param str - String to escape
 * @returns Escaped string safe for JS strings
 */
export function escapeJs(str: any): string;

/**
 * Template tag for safe HTML with automatic escaping
 * All interpolated values are automatically escaped unless wrapped with trustHtml()
 *
 * @example
 * const name = '<script>alert("xss")</script>';
 * const html = safeHtml`<div>Hello, ${name}!</div>`;
 * // Returns: '<div>Hello, &lt;script&gt;...&lt;/script&gt;!</div>'
 */
export function safeHtml(strings: TemplateStringsArray, ...values: any[]): string;

/**
 * Mark a string as trusted HTML (bypass escaping)
 * USE WITH EXTREME CAUTION - only for pre-sanitized content
 * @param html - Pre-sanitized HTML string
 * @returns Trusted HTML object
 */
export function trustHtml(html: string): TrustedHtml;

/**
 * Check if a value is trusted HTML
 * @param value - Value to check
 * @returns True if trusted HTML
 */
export function isTrustedHtml(value: any): value is TrustedHtml;

/**
 * Sanitize a string for safe display
 * Removes control characters and normalizes whitespace
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeText(str: any): string;

/**
 * Sanitize a URL to prevent javascript: and data: attacks
 * @param url - URL to sanitize
 * @returns Safe URL or null if unsafe
 */
export function sanitizeUrl(url: string): string | null;

/**
 * Sanitize object keys to prevent prototype pollution
 * @param obj - Object to sanitize
 * @returns Sanitized object (deep clone)
 */
export function sanitizeObject<T extends object>(obj: T): T;
