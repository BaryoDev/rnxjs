class ErrorTrackingManager {
  constructor() {
    this.enabled = false;
    this.providers = [];
    this.handlers = [];
    this.globalContext = {};
    this.breadcrumbs = [];
    this.maxBreadcrumbs = 50;
    /**
     * Handle global errors
     */
    this.handleGlobalError = (event) => {
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
    this.handleUnhandledRejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureError(error, {
        metadata: {
          type: "unhandledRejection",
          reason: event.reason
        }
      });
    };
  }
  /**
   * Enable error tracking
   */
  enable() {
    this.enabled = true;
    this.setupGlobalHandlers();
  }
  /**
   * Disable error tracking
   */
  disable() {
    this.enabled = false;
    this.removeGlobalHandlers();
  }
  /**
   * Check if error tracking is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Register an error tracking provider
   */
  registerProvider(provider) {
    this.providers.push(provider);
  }
  /**
   * Add a custom error handler
   */
  addHandler(handler) {
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
  setContext(context) {
    this.globalContext = { ...this.globalContext, ...context };
    if (context.user) {
      this.providers.forEach((provider) => {
        if (provider.setUser) {
          provider.setUser(context.user);
        }
      });
    }
  }
  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(message, category, data) {
    const breadcrumb = {
      timestamp: Date.now(),
      message,
      category,
      data
    };
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
    this.providers.forEach((provider) => {
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
  captureError(error, context = {}) {
    if (!this.enabled) return;
    const fullContext = {
      ...this.globalContext,
      ...context,
      metadata: {
        ...this.globalContext.metadata,
        ...context.metadata,
        breadcrumbs: this.breadcrumbs.slice(-10)
        // Include last 10 breadcrumbs
      }
    };
    if (true) {
      console.error("[rnxJS Error]", error);
      console.error("Context:", fullContext);
    }
    this.handlers.forEach((handler) => {
      try {
        handler(error, fullContext);
      } catch (handlerError) {
        console.error("[rnxJS] Error in error handler:", handlerError);
      }
    });
    this.providers.forEach((provider) => {
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
  captureMessage(message, level = "info") {
    if (!this.enabled) return;
    this.providers.forEach((provider) => {
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
  getBreadcrumbs() {
    return [...this.breadcrumbs];
  }
  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    if (typeof window === "undefined") return;
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }
  /**
   * Remove global error handlers
   */
  removeGlobalHandlers() {
    if (typeof window === "undefined") return;
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }
}
const errorTracking = new ErrorTrackingManager();
class SentryProvider {
  constructor(sentry) {
    this.name = "sentry";
    this.sentry = sentry;
  }
  captureError(error, context) {
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
  captureMessage(message, level) {
    this.sentry.captureMessage(message, level);
  }
  setUser(user) {
    this.sentry.setUser(user);
  }
  addBreadcrumb(breadcrumb) {
    this.sentry.addBreadcrumb(breadcrumb);
  }
}
class ConsoleProvider {
  constructor() {
    this.name = "console";
  }
  captureError(error, context) {
    console.group(`[rnxJS Error] ${error.message}`);
    console.error("Error:", error);
    console.log("Context:", context);
    console.groupEnd();
  }
  captureMessage(message, level) {
    const logFn = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
    logFn(`[rnxJS ${level}]`, message);
  }
}
function withErrorTracking(fn, context) {
  return function(...args) {
    try {
      const result = fn.apply(this, args);
      if (result && typeof result.then === "function") {
        return result.catch((error) => {
          errorTracking.captureError(error, context || {});
          throw error;
        });
      }
      return result;
    } catch (error) {
      errorTracking.captureError(error, context || {});
      throw error;
    }
  };
}
export {
  ConsoleProvider,
  SentryProvider,
  errorTracking,
  withErrorTracking
};
