/**
 * Error tracking and reporting utilities for rnxJS
 * Provides error boundary support and integration with error tracking services
 */

/**
 * Error context information
 */
export interface ErrorContext {
    /** Component name where error occurred */
    componentName?: string;
    /** Component stack trace */
    componentStack?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
    /** User information */
    user?: {
        id?: string;
        email?: string;
        username?: string;
    };
    /** Application state at time of error */
    state?: any;
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error, context: ErrorContext) => void;

/**
 * Error tracking provider interface
 */
export interface ErrorTrackingProvider {
    /** Provider name (e.g., 'sentry', 'rollbar') */
    name: string;
    /** Capture an error */
    captureError(error: Error, context: ErrorContext): void;
    /** Capture a message */
    captureMessage?(message: string, level: 'info' | 'warning' | 'error'): void;
    /** Set user context */
    setUser?(user: ErrorContext['user']): void;
    /** Add breadcrumb */
    addBreadcrumb?(breadcrumb: { message: string; category?: string; level?: string; data?: any }): void;
}

/**
 * Error tracking manager
 */
class ErrorTrackingManager {
    private enabled: boolean = false;
    private providers: ErrorTrackingProvider[] = [];
    private handlers: ErrorHandler[] = [];
    private globalContext: ErrorContext = {};
    private breadcrumbs: Array<{ timestamp: number; message: string; category?: string; data?: any }> = [];
    private maxBreadcrumbs: number = 50;

    /**
     * Enable error tracking
     */
    enable(): void {
        this.enabled = true;
        this.setupGlobalHandlers();
    }

    /**
     * Disable error tracking
     */
    disable(): void {
        this.enabled = false;
        this.removeGlobalHandlers();
    }

    /**
     * Check if error tracking is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Register an error tracking provider
     */
    registerProvider(provider: ErrorTrackingProvider): void {
        this.providers.push(provider);
    }

    /**
     * Add a custom error handler
     */
    addHandler(handler: ErrorHandler): () => void {
        this.handlers.push(handler);
        return () => {
            const index = this.handlers.indexOf(handler);
            if (index > -1) {
                this.handlers.splice(index, 1);
            }
        };
    }

    /**
     * Set global context that will be included with all errors
     */
    setContext(context: Partial<ErrorContext>): void {
        this.globalContext = { ...this.globalContext, ...context };

        // Update user context in providers
        if (context.user) {
            this.providers.forEach(provider => {
                if (provider.setUser) {
                    provider.setUser(context.user);
                }
            });
        }
    }

    /**
     * Add a breadcrumb for debugging
     */
    addBreadcrumb(message: string, category?: string, data?: any): void {
        const breadcrumb = {
            timestamp: Date.now(),
            message,
            category,
            data
        };

        this.breadcrumbs.push(breadcrumb);

        // Keep only last N breadcrumbs
        if (this.breadcrumbs.length > this.maxBreadcrumbs) {
            this.breadcrumbs.shift();
        }

        // Forward to providers
        this.providers.forEach(provider => {
            if (provider.addBreadcrumb) {
                provider.addBreadcrumb({
                    message,
                    category,
                    data
                });
            }
        });
    }

    /**
     * Capture an error
     */
    captureError(error: Error, context: ErrorContext = {}): void {
        if (!this.enabled) return;

        // Merge contexts
        const fullContext: ErrorContext = {
            ...this.globalContext,
            ...context,
            metadata: {
                ...this.globalContext.metadata,
                ...context.metadata,
                breadcrumbs: this.breadcrumbs.slice(-10) // Include last 10 breadcrumbs
            }
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('[rnxJS Error]', error);
            console.error('Context:', fullContext);
        }

        // Call custom handlers
        this.handlers.forEach(handler => {
            try {
                handler(error, fullContext);
            } catch (handlerError) {
                console.error('[rnxJS] Error in error handler:', handlerError);
            }
        });

        // Send to providers
        this.providers.forEach(provider => {
            try {
                provider.captureError(error, fullContext);
            } catch (providerError) {
                console.error(`[rnxJS] Error in provider ${provider.name}:`, providerError);
            }
        });
    }

    /**
     * Capture a message
     */
    captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
        if (!this.enabled) return;

        this.providers.forEach(provider => {
            if (provider.captureMessage) {
                try {
                    provider.captureMessage(message, level);
                } catch (error) {
                    console.error(`[rnxJS] Error capturing message in provider ${provider.name}:`, error);
                }
            }
        });
    }

    /**
     * Get recent breadcrumbs
     */
    getBreadcrumbs(): Array<{ timestamp: number; message: string; category?: string; data?: any }> {
        return [...this.breadcrumbs];
    }

    /**
     * Clear breadcrumbs
     */
    clearBreadcrumbs(): void {
        this.breadcrumbs = [];
    }

    /**
     * Setup global error handlers
     */
    private setupGlobalHandlers(): void {
        if (typeof window === 'undefined') return;

        // Handle uncaught errors
        window.addEventListener('error', this.handleGlobalError);

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    /**
     * Remove global error handlers
     */
    private removeGlobalHandlers(): void {
        if (typeof window === 'undefined') return;

        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    /**
     * Handle global errors
     */
    private handleGlobalError = (event: ErrorEvent): void => {
        this.captureError(event.error || new Error(event.message), {
            metadata: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }
        });
    };

    /**
     * Handle unhandled promise rejections
     */
    private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));

        this.captureError(error, {
            metadata: {
                type: 'unhandledRejection',
                reason: event.reason
            }
        });
    };
}

// Singleton instance
export const errorTracking = new ErrorTrackingManager();

/**
 * Sentry provider integration
 */
export class SentryProvider implements ErrorTrackingProvider {
    name = 'sentry';
    private sentry: any;

    constructor(sentry: any) {
        this.sentry = sentry;
    }

    captureError(error: Error, context: ErrorContext): void {
        this.sentry.captureException(error, {
            contexts: {
                rnxjs: context.metadata
            },
            tags: {
                component: context.componentName
            },
            user: context.user
        });
    }

    captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
        this.sentry.captureMessage(message, level);
    }

    setUser(user: ErrorContext['user']): void {
        this.sentry.setUser(user);
    }

    addBreadcrumb(breadcrumb: { message: string; category?: string; level?: string; data?: any }): void {
        this.sentry.addBreadcrumb(breadcrumb);
    }
}

/**
 * Console logger provider (for development)
 */
export class ConsoleProvider implements ErrorTrackingProvider {
    name = 'console';

    captureError(error: Error, context: ErrorContext): void {
        console.group(`[rnxJS Error] ${error.message}`);
        console.error('Error:', error);
        console.log('Context:', context);
        console.groupEnd();
    }

    captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
        const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
        logFn(`[rnxJS ${level}]`, message);
    }
}

/**
 * Wrap a function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
    fn: T,
    context?: Partial<ErrorContext>
): T {
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
        try {
            const result = fn.apply(this, args);

            // Handle async functions
            if (result && typeof result.then === 'function') {
                return result.catch((error: Error) => {
                    errorTracking.captureError(error, context || {});
                    throw error;
                }) as ReturnType<T>;
            }

            return result;
        } catch (error) {
            errorTracking.captureError(error as Error, context || {});
            throw error;
        }
    } as T;
}
