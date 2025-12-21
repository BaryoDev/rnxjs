/**
 * Tests for performance monitoring utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rnxPerf, withPerf, perf } from '../utils/performance.ts';

describe('Performance Monitoring', () => {
    beforeEach(() => {
        rnxPerf.clear();
        rnxPerf.disable();
    });

    afterEach(() => {
        rnxPerf.clear();
        rnxPerf.disable();
    });

    describe('Enable/Disable', () => {
        it('should start disabled by default', () => {
            expect(rnxPerf.isEnabled()).toBe(false);
        });

        it('should enable monitoring', () => {
            rnxPerf.enable();
            expect(rnxPerf.isEnabled()).toBe(true);
        });

        it('should disable monitoring', () => {
            rnxPerf.enable();
            rnxPerf.disable();
            expect(rnxPerf.isEnabled()).toBe(false);
        });

        it('should not record marks when disabled', () => {
            rnxPerf.mark('test');
            const report = rnxPerf.getReport();
            expect(Object.keys(report).length).toBe(0);
        });
    });

    describe('Marks and Measures', () => {
        beforeEach(() => {
            rnxPerf.enable();
        });

        it('should create performance marks', () => {
            rnxPerf.mark('start');
            rnxPerf.mark('end');

            // Marks are internal, but we can verify they work via measures
            rnxPerf.measure('duration', 'start', 'end');
            const measures = rnxPerf.getMeasures();

            expect(measures.length).toBe(1);
            expect(measures[0].name).toBe('duration');
        });

        it('should measure duration between marks', () => {
            rnxPerf.mark('start');

            // Simulate some work
            const start = performance.now();
            while (performance.now() - start < 10) {
                // Busy wait for ~10ms
            }

            rnxPerf.mark('end');
            rnxPerf.measure('operation', 'start', 'end');

            const measures = rnxPerf.getMeasures();
            expect(measures.length).toBe(1);
            expect(measures[0].duration).toBeGreaterThan(0);
        });

        it('should measure from mark to current time if no end mark', () => {
            rnxPerf.mark('start');

            // Simulate some work
            const start = performance.now();
            while (performance.now() - start < 5) {
                // Busy wait for ~5ms
            }

            rnxPerf.measure('operation', 'start');

            const measures = rnxPerf.getMeasures();
            expect(measures.length).toBe(1);
            expect(measures[0].duration).toBeGreaterThan(0);
        });

        it('should warn if start mark not found', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            rnxPerf.measure('test', 'nonexistent');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Start mark "nonexistent" not found')
            );

            consoleWarnSpy.mockRestore();
        });

        it('should warn if end mark not found', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            rnxPerf.mark('start');
            rnxPerf.measure('test', 'start', 'nonexistent');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('End mark "nonexistent" not found')
            );

            consoleWarnSpy.mockRestore();
        });

        it('should store multiple measures', () => {
            rnxPerf.mark('op1-start');
            rnxPerf.mark('op1-end');
            rnxPerf.measure('operation1', 'op1-start', 'op1-end');

            rnxPerf.mark('op2-start');
            rnxPerf.mark('op2-end');
            rnxPerf.measure('operation2', 'op2-start', 'op2-end');

            const measures = rnxPerf.getMeasures();
            expect(measures.length).toBe(2);
        });
    });

    describe('Performance Reports', () => {
        beforeEach(() => {
            rnxPerf.enable();
        });

        it('should generate report with statistics', () => {
            // Create multiple measures with same name
            for (let i = 0; i < 5; i++) {
                rnxPerf.mark(`test-${i}-start`);
                rnxPerf.mark(`test-${i}-end`);
                rnxPerf.measure('test-operation', `test-${i}-start`, `test-${i}-end`);
            }

            const report = rnxPerf.getReport();

            expect(report['test-operation']).toBeDefined();
            expect(report['test-operation'].count).toBe(5);
            expect(report['test-operation'].total).toBeGreaterThan(0);
            expect(report['test-operation'].min).toBeDefined();
            expect(report['test-operation'].max).toBeDefined();
            expect(report['test-operation'].avg).toBeDefined();
        });

        it('should calculate correct statistics', () => {
            // Manually set measures with known durations
            rnxPerf['measures'] = [
                { name: 'op', duration: 10, timestamp: Date.now() },
                { name: 'op', duration: 20, timestamp: Date.now() },
                { name: 'op', duration: 30, timestamp: Date.now() }
            ];

            const report = rnxPerf.getReport();

            expect(report['op'].count).toBe(3);
            expect(report['op'].total).toBe(60);
            expect(report['op'].min).toBe(10);
            expect(report['op'].max).toBe(30);
            expect(report['op'].avg).toBe(20);
        });

        it('should handle multiple operation types in report', () => {
            rnxPerf['measures'] = [
                { name: 'op1', duration: 10, timestamp: Date.now() },
                { name: 'op2', duration: 20, timestamp: Date.now() },
                { name: 'op1', duration: 15, timestamp: Date.now() }
            ];

            const report = rnxPerf.getReport();

            expect(Object.keys(report).length).toBe(2);
            expect(report['op1'].count).toBe(2);
            expect(report['op2'].count).toBe(1);
        });

        it('should return empty report when no measures', () => {
            const report = rnxPerf.getReport();
            expect(Object.keys(report).length).toBe(0);
        });
    });

    describe('Slow Operation Warnings', () => {
        beforeEach(() => {
            rnxPerf.enable();
        });

        it('should warn about slow operations', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            rnxPerf.setSlowOperationThreshold(5); // 5ms threshold

            // Create a slow operation
            rnxPerf['measures'].push({
                name: 'slow-op',
                duration: 50,
                timestamp: Date.now()
            });

            rnxPerf.mark('start');
            rnxPerf.mark('end');

            // Manually trigger measure to test warning
            const start = rnxPerf['marks'].get('start');
            const end = start + 50; // 50ms duration
            rnxPerf['marks'].set('end', end);
            rnxPerf.measure('slow-op', 'start', 'end');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Slow operation: "slow-op"')
            );

            consoleWarnSpy.mockRestore();
        });

        it('should not warn about fast operations', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            rnxPerf.setSlowOperationThreshold(100);

            rnxPerf.mark('start');
            rnxPerf.mark('end');
            rnxPerf.measure('fast-op', 'start', 'end');

            // Should not warn (unless operation actually took > 100ms)
            const warnings = consoleWarnSpy.mock.calls.filter(call =>
                call[0]?.includes('Slow operation')
            );
            expect(warnings.length).toBe(0);

            consoleWarnSpy.mockRestore();
        });

        it('should allow custom threshold', () => {
            rnxPerf.setSlowOperationThreshold(50);
            expect(rnxPerf['slowOperationThreshold']).toBe(50);
        });
    });

    describe('Clear and Reset', () => {
        beforeEach(() => {
            rnxPerf.enable();
        });

        it('should clear all marks and measures', () => {
            rnxPerf.mark('test');
            rnxPerf.measure('test-measure', 'test');

            expect(rnxPerf.getMeasures().length).toBeGreaterThan(0);

            rnxPerf.clear();

            expect(rnxPerf.getMeasures().length).toBe(0);
            expect(rnxPerf.getReport()).toEqual({});
        });
    });

    describe('Log Report', () => {
        beforeEach(() => {
            rnxPerf.enable();
        });

        it('should log report to console as table', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});

            rnxPerf['measures'] = [
                { name: 'op', duration: 10, timestamp: Date.now() }
            ];

            rnxPerf.logReport();

            expect(consoleLogSpy).toHaveBeenCalledWith('[rnxJS Performance Report]');
            expect(consoleTableSpy).toHaveBeenCalled();

            consoleLogSpy.mockRestore();
            consoleTableSpy.mockRestore();
        });

        it('should log message when no data collected', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            rnxPerf.logReport();

            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[rnxJS Perf] No performance data collected'
            );

            consoleLogSpy.mockRestore();
        });
    });
});

describe('withPerf Wrapper', () => {
    beforeEach(() => {
        rnxPerf.clear();
        rnxPerf.enable();
    });

    afterEach(() => {
        rnxPerf.clear();
        rnxPerf.disable();
    });

    it('should wrap synchronous function', () => {
        const fn = (a, b) => a + b;
        const wrappedFn = withPerf('add', fn);

        const result = wrappedFn(2, 3);

        expect(result).toBe(5);
        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('add');
    });

    it('should wrap async function', async () => {
        const fn = async (x) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return x * 2;
        };
        const wrappedFn = withPerf('multiply', fn);

        const result = await wrappedFn(5);

        expect(result).toBe(10);
        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('multiply');
    });

    it('should measure even if function throws', () => {
        const fn = () => {
            throw new Error('Test error');
        };
        const wrappedFn = withPerf('error-fn', fn);

        expect(() => wrappedFn()).toThrow('Test error');

        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('error-fn');
    });

    it('should measure even if async function rejects', async () => {
        const fn = async () => {
            throw new Error('Async error');
        };
        const wrappedFn = withPerf('async-error', fn);

        await expect(wrappedFn()).rejects.toThrow('Async error');

        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('async-error');
    });

    it('should preserve function context (this)', () => {
        const obj = {
            value: 42,
            getValue() {
                return this.value;
            }
        };

        obj.getValue = withPerf('getValue', obj.getValue);

        expect(obj.getValue()).toBe(42);
    });

    it('should not measure when monitoring disabled', () => {
        rnxPerf.disable();

        const fn = (x) => x * 2;
        const wrappedFn = withPerf('test', fn);

        wrappedFn(5);

        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(0);
    });
});

describe('perf Decorator', () => {
    beforeEach(() => {
        rnxPerf.clear();
        rnxPerf.enable();
    });

    afterEach(() => {
        rnxPerf.clear();
        rnxPerf.disable();
    });

    it('should decorate class method', () => {
        class TestClass {
            calculate(a, b) {
                return a + b;
            }
        }

        // Apply decorator manually
        const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'calculate');
        const decorated = perf()(TestClass.prototype, 'calculate', descriptor);
        Object.defineProperty(TestClass.prototype, 'calculate', decorated);

        const instance = new TestClass();
        const result = instance.calculate(3, 4);

        expect(result).toBe(7);
        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('TestClass.calculate');
    });

    it('should allow custom name', () => {
        class TestClass {
            process() {
                return 'done';
            }
        }

        // Apply decorator manually with custom name
        const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'process');
        const decorated = perf('custom-operation')(TestClass.prototype, 'process', descriptor);
        Object.defineProperty(TestClass.prototype, 'process', decorated);

        const instance = new TestClass();
        instance.process();

        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('custom-operation');
    });

    it('should work with async methods', async () => {
        class TestClass {
            async asyncOperation() {
                await new Promise(resolve => setTimeout(resolve, 10));
                return 'complete';
            }
        }

        // Apply decorator manually
        const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'asyncOperation');
        const decorated = perf()(TestClass.prototype, 'asyncOperation', descriptor);
        Object.defineProperty(TestClass.prototype, 'asyncOperation', decorated);

        const instance = new TestClass();
        const result = await instance.asyncOperation();

        expect(result).toBe('complete');
        const measures = rnxPerf.getMeasures();
        expect(measures.length).toBe(1);
        expect(measures[0].name).toBe('TestClass.asyncOperation');
    });
});
