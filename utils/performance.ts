/**
 * Performance monitoring utilities for rnxJS
 * Helps identify bottlenecks and slow operations in development
 */

/**
 * Performance measure entry
 */
export interface PerformanceMeasure {
    name: string;
    duration: number;
    timestamp: number;
}

/**
 * Performance report for a specific operation
 */
export interface PerformanceReport {
    count: number;
    total: number;
    min: number;
    max: number;
    avg: number;
}

/**
 * Performance monitoring class
 * Tracks performance marks and measures for rnxJS operations
 */
class RnxPerformance {
    private enabled: boolean;
    private marks: Map<string, number>;
    private measures: PerformanceMeasure[];
    private slowOperationThreshold: number;

    constructor() {
        this.enabled = false;
        this.marks = new Map();
        this.measures = [];
        this.slowOperationThreshold = 16; // Frame budget (60fps)
    }

    /**
     * Enable performance monitoring
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * Disable performance monitoring
     */
    disable(): void {
        this.enabled = false;
    }

    /**
     * Check if performance monitoring is enabled
     * @returns True if enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Set threshold for slow operation warnings (in ms)
     * @param threshold - Threshold in milliseconds (default: 16ms for 60fps)
     */
    setSlowOperationThreshold(threshold: number): void {
        this.slowOperationThreshold = threshold;
    }

    /**
     * Create a performance mark
     * @param name - Mark name
     */
    mark(name: string): void {
        if (!this.enabled) return;

        if (typeof performance !== 'undefined' && performance.now) {
            this.marks.set(name, performance.now());
        } else {
            this.marks.set(name, Date.now());
        }
    }

    /**
     * Measure duration between two marks
     * @param name - Measure name
     * @param startMark - Start mark name
     * @param endMark - End mark name (optional, uses current time if not provided)
     */
    measure(name: string, startMark: string, endMark?: string): void {
        if (!this.enabled) return;

        const start = this.marks.get(startMark);
        if (start === undefined) {
            console.warn(`[rnxJS Perf] Start mark "${startMark}" not found`);
            return;
        }

        let end: number;
        if (endMark) {
            const endMarkValue = this.marks.get(endMark);
            if (endMarkValue === undefined) {
                console.warn(`[rnxJS Perf] End mark "${endMark}" not found`);
                return;
            }
            end = endMarkValue;
        } else {
            end = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
        }

        const duration = end - start;
        this.measures.push({ name, duration, timestamp: Date.now() });

        // Warn about slow operations
        if (duration > this.slowOperationThreshold) {
            console.warn(
                `[rnxJS Perf] Slow operation: "${name}" took ${duration.toFixed(2)}ms ` +
                `(threshold: ${this.slowOperationThreshold}ms)`
            );
        }
    }

    /**
     * Get performance report with statistics
     * @returns Report object with statistics for each measured operation
     */
    getReport(): Record<string, PerformanceReport> {
        const report: Record<string, PerformanceReport> = {};

        for (const { name, duration } of this.measures) {
            if (!report[name]) {
                report[name] = {
                    count: 0,
                    total: 0,
                    min: Infinity,
                    max: 0,
                    avg: 0
                };
            }

            report[name].count++;
            report[name].total += duration;
            report[name].min = Math.min(report[name].min, duration);
            report[name].max = Math.max(report[name].max, duration);
        }

        // Calculate averages
        for (const name in report) {
            report[name].avg = report[name].total / report[name].count;
        }

        return report;
    }

    /**
     * Get all raw measures
     * @returns Array of all performance measures
     */
    getMeasures(): PerformanceMeasure[] {
        return [...this.measures];
    }

    /**
     * Clear all marks and measures
     */
    clear(): void {
        this.marks.clear();
        this.measures = [];
    }

    /**
     * Log performance report to console as a table
     */
    logReport(): void {
        const report = this.getReport();

        if (Object.keys(report).length === 0) {
            console.log('[rnxJS Perf] No performance data collected');
            return;
        }

        console.log('[rnxJS Performance Report]');
        console.table(report);
    }
}

// Singleton instance
export const rnxPerf = new RnxPerformance();

/**
 * Wrap a function with performance monitoring
 * @param name - Operation name for performance tracking
 * @param fn - Function to wrap
 * @returns Wrapped function with performance tracking
 */
export function withPerf<T extends (...args: any[]) => any>(
    name: string,
    fn: T
): T {
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
        rnxPerf.mark(`${name}:start`);
        try {
            const result = fn.apply(this, args);

            // Handle async functions
            if (result && typeof result.then === 'function') {
                return result.then(
                    (value: any) => {
                        rnxPerf.measure(name, `${name}:start`);
                        return value;
                    },
                    (error: any) => {
                        rnxPerf.measure(name, `${name}:start`);
                        throw error;
                    }
                ) as ReturnType<T>;
            }

            rnxPerf.measure(name, `${name}:start`);
            return result;
        } catch (error) {
            rnxPerf.measure(name, `${name}:start`);
            throw error;
        }
    } as T;
}

/**
 * Performance timing decorator (for class methods)
 * @param name - Operation name (optional, uses method name if not provided)
 */
export function perf(name?: string) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const perfName = name || `${target.constructor.name}.${propertyKey}`;

        descriptor.value = withPerf(perfName, originalMethod);
        return descriptor;
    };
}
