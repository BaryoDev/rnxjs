import { loadComponents } from './framework/ComponentLoader.js';
import { registerComponent } from './framework/Registry.js';
import { FAB } from './components/FAB/FAB.js';
import { createReactiveState } from './utils/createReactiveState.js';

// Mock DOM
import { Window } from 'happy-dom';
const window = new Window();
const document = window.document;
global.document = document;
global.window = window;
global.HTMLElement = window.HTMLElement;

// Register FAB
registerComponent('FAB', FAB);

// Create Test DOM
document.body.innerHTML = `
    <div id="app">
        <h1 data-bind="app.title">Initial Title</h1>
        <FAB icon="add" label="Create" onclick="alert('clicked')"></FAB>
    </div>
`;

// Create State
const state = createReactiveState({
    app: {
        title: 'Bound Title'
    }
});

console.log('--- Before Load ---');
console.log(document.body.innerHTML);

// Run Loader
loadComponents(document.body, state);

console.log('--- After Load ---');
console.log(document.body.innerHTML);

// Checks
const h1 = document.querySelector('h1');
const btn = document.querySelector('button.m3-fab');

if (h1.textContent === 'Bound Title') {
    console.log('[SUCCESS] Data Binding worked synchronously.');
} else {
    console.error(`[FAILURE] Data Binding failed. Expected "Bound Title", got "${h1.textContent}"`);
}

if (btn) {
    console.log('[SUCCESS] FAB rendered correctly.');
    if (btn.querySelector('.extendedspan').textContent === 'Create') {
        console.log('[SUCCESS] FAB label rendered.');
    } else {
        console.error('[FAILURE] FAB label missing.');
    }
} else {
    console.error('[FAILURE] FAB did not render.');
}
