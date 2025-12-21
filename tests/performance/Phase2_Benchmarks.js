/**
 * Performance Benchmarks for Sprint 4 Phase 2 Components
 *
 * Run with: node tests/performance/Phase2_Benchmarks.js
 * Tests rendering performance, memory usage, and interaction latency
 */

import { FileUpload } from '../../components/FileUpload/FileUpload.js';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Sidebar } from '../../components/Sidebar/Sidebar.js';
import { Stepper } from '../../components/Stepper/Stepper.js';
import { Dropdown } from '../../components/Dropdown/Dropdown.js';

class Benchmark {
    constructor(name) {
        this.name = name;
        this.results = [];
    }

    measure(label, fn, iterations = 1000) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push(end - start);
        }

        const avg = times.reduce((a, b) => a + b) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        this.results.push({
            label,
            avg: avg.toFixed(4),
            min: min.toFixed(4),
            max: max.toFixed(4),
            iterations
        });

        return { avg, min, max };
    }

    report() {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Benchmark: ${this.name}`);
        console.log(`${'='.repeat(70)}`);
        console.table(this.results);
    }
}

// FileUpload Benchmarks
export function benchmarkFileUpload() {
    const bench = new Benchmark('FileUpload Component');

    bench.measure('Create FileUpload instance', () => {
        FileUpload({
            accept: ['.jpg', '.png'],
            maxSize: 1024 * 5
        });
    });

    bench.measure('Add 10 files', () => {
        const upload = FileUpload();
        const files = Array.from({ length: 10 }, (_, i) =>
            new File(['content'], `file${i}.txt`, { type: 'text/plain' })
        );
        upload.addFiles(files);
    });

    bench.measure('Get files list', () => {
        const upload = FileUpload();
        const files = Array.from({ length: 5 }, (_, i) =>
            new File(['content'], `file${i}.txt`, { type: 'text/plain' })
        );
        upload.addFiles(files);
        upload.getFiles();
    });

    bench.measure('Validate file (100 iterations)', () => {
        const upload = FileUpload({
            maxSize: 1024 * 5,
            accept: ['.jpg', '.png']
        });
        const file = new File(['x'.repeat(2000)], 'test.jpg', { type: 'image/jpeg' });
        upload.addFiles([file]);
    }, 100);

    bench.report();
}

// ProgressBar Benchmarks
export function benchmarkProgressBar() {
    const bench = new Benchmark('ProgressBar Component');

    bench.measure('Create ProgressBar instance', () => {
        ProgressBar({ value: 50 });
    });

    bench.measure('Set value to 75', () => {
        const progress = ProgressBar({ value: 0 });
        progress.setValue(75);
    });

    bench.measure('Get current value', () => {
        const progress = ProgressBar({ value: 50 });
        progress.getValue();
    });

    bench.measure('Animate to 100% (50 updates)', () => {
        const progress = ProgressBar({ value: 0 });
        for (let i = 0; i <= 100; i += 2) {
            progress.setValue(i);
        }
    }, 50);

    bench.measure('Create variant (100 iterations)', () => {
        ProgressBar({ value: 50, variant: 'success', striped: true, animated: true });
    }, 100);

    bench.report();
}

// Tooltip Benchmarks
export function benchmarkTooltip() {
    const bench = new Benchmark('Tooltip Component');

    const element = document.createElement('button');
    document.body.appendChild(element);

    bench.measure('Create Tooltip instance', () => {
        Tooltip({
            element: element,
            content: 'Test tooltip',
            position: 'top'
        });
    });

    bench.measure('Show tooltip', () => {
        const tooltip = Tooltip({
            element: element,
            content: 'Test',
            delay: 0
        });
        tooltip.show();
    });

    bench.measure('Hide tooltip', () => {
        const tooltip = Tooltip({
            element: element,
            content: 'Test',
            delay: 0
        });
        tooltip.show();
        tooltip.hide();
    });

    bench.measure('Update content', () => {
        const tooltip = Tooltip({
            element: element,
            content: 'Initial',
            delay: 0
        });
        tooltip.show();
        tooltip.setContent('Updated content that is much longer than before');
    });

    bench.measure('Reposition on different sides (100 iterations)', () => {
        const positions = ['top', 'bottom', 'left', 'right'];
        const tooltip = Tooltip({
            element: element,
            content: 'Test',
            position: positions[0],
            delay: 0
        });
        positions.forEach(pos => {
            tooltip.show();
            tooltip.hide();
        });
    }, 100);

    document.body.removeChild(element);
    bench.report();
}

// Sidebar Benchmarks
export function benchmarkSidebar() {
    const bench = new Benchmark('Sidebar Component');

    const items = Array.from({ length: 15 }, (_, i) => ({
        id: `item${i}`,
        label: `Menu Item ${i}`,
        href: `#/item${i}`
    }));

    bench.measure('Create Sidebar with 15 items', () => {
        Sidebar({ items });
    });

    bench.measure('Toggle sidebar', () => {
        const sidebar = Sidebar({ items, defaultOpen: true });
        sidebar.toggle();
        sidebar.toggle();
    });

    bench.measure('Set active item', () => {
        const sidebar = Sidebar({ items });
        for (let i = 0; i < items.length; i++) {
            sidebar.setActiveItem(`item${i}`);
        }
    });

    const itemsWithChildren = [
        {
            id: 'parent1',
            label: 'Parent 1',
            children: [
                { id: 'child1', label: 'Child 1' },
                { id: 'child2', label: 'Child 2' }
            ]
        },
        {
            id: 'parent2',
            label: 'Parent 2',
            children: [
                { id: 'child3', label: 'Child 3' },
                { id: 'child4', label: 'Child 4' }
            ]
        }
    ];

    bench.measure('Create Sidebar with nested items', () => {
        Sidebar({ items: itemsWithChildren });
    });

    bench.measure('Nested menu traversal (100 iterations)', () => {
        const sidebar = Sidebar({ items: itemsWithChildren });
        itemsWithChildren.forEach(parent => {
            sidebar.setActiveItem(parent.id);
            if (parent.children) {
                parent.children.forEach(child => {
                    sidebar.setActiveItem(child.id);
                });
            }
        });
    }, 100);

    bench.report();
}

// Stepper Benchmarks
export function benchmarkStepper() {
    const bench = new Benchmark('Stepper Component');

    const steps = Array.from({ length: 10 }, (_, i) => ({
        title: `Step ${i + 1}`,
        content: `<p>Content for step ${i + 1}</p>`
    }));

    bench.measure('Create Stepper with 10 steps', () => {
        Stepper({ steps });
    });

    bench.measure('Navigate through all steps', () => {
        const stepper = Stepper({ steps, currentStep: 0 });
        for (let i = 0; i < steps.length - 1; i++) {
            stepper.nextStep();
        }
    });

    bench.measure('Random step access (100 iterations)', () => {
        const stepper = Stepper({ steps, currentStep: 0 });
        for (let i = 0; i < 100; i++) {
            const randomStep = Math.floor(Math.random() * steps.length);
            stepper.setStep(randomStep);
        }
    }, 100);

    bench.measure('Check step state queries', () => {
        const stepper = Stepper({ steps, currentStep: 5 });
        stepper.isFirstStep();
        stepper.isLastStep();
        stepper.getTotalSteps();
        stepper.getStep();
    });

    bench.measure('Vertical orientation (50 iterations)', () => {
        Stepper({
            steps: steps.slice(0, 5),
            orientation: 'vertical'
        });
    }, 50);

    bench.report();
}

// Dropdown Benchmarks
export function benchmarkDropdown() {
    const bench = new Benchmark('Dropdown Component');

    const items = Array.from({ length: 20 }, (_, i) => ({
        id: `item${i}`,
        label: `Menu Item ${i}`,
        icon: i % 2 === 0 ? '📝' : '🔍'
    }));

    bench.measure('Create Dropdown with 20 items', () => {
        Dropdown({ items });
    });

    bench.measure('Open dropdown', () => {
        const dropdown = Dropdown({ items });
        dropdown.open();
    });

    bench.measure('Open and close', () => {
        const dropdown = Dropdown({ items });
        dropdown.open();
        dropdown.close();
    });

    bench.measure('Toggle dropdown (50 times)', () => {
        const dropdown = Dropdown({ items });
        for (let i = 0; i < 50; i++) {
            dropdown.toggle();
        }
    });

    const itemsWithBadges = items.map((item, i) => ({
        ...item,
        badge: String(Math.floor(Math.random() * 100))
    }));

    bench.measure('Create with badges (100 iterations)', () => {
        Dropdown({ items: itemsWithBadges });
    }, 100);

    const itemsWithDividers = [
        items[0],
        { divider: true },
        items[1],
        { divider: true },
        items[2]
    ];

    bench.measure('Complex menu structure (50 iterations)', () => {
        Dropdown({
            items: itemsWithDividers,
            position: 'bottom-right',
            variant: 'outline'
        });
    }, 50);

    bench.report();
}

// Run all benchmarks
export function runAllBenchmarks() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     Sprint 4 Phase 2 - Performance Benchmarks                 ║');
    console.log('║     Testing 6 Enhancement Components                          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');

    benchmarkFileUpload();
    benchmarkProgressBar();
    benchmarkTooltip();
    benchmarkSidebar();
    benchmarkStepper();
    benchmarkDropdown();

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     Benchmark Complete                                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllBenchmarks();
}
