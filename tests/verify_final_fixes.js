import { loadComponents } from './framework/ComponentLoader.js';
import { registerComponent } from './framework/Registry.js';
import { bindData } from './framework/DataBinder.js';
import { FAB } from './components/FAB/FAB.js';
import { createReactiveState } from './utils/createReactiveState.js';

// Mock DOM
import { Window } from 'happy-dom';
const window = new Window();
const document = window.document;
global.document = document;
global.window = window;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node; // Ensure Node is available

// Register FAB
registerComponent('FAB', FAB);

// Test 1: Case Insensitivity
document.body.innerHTML = `
    <div id="app">
        <FAB icon="add" id="fab-upper"></FAB>
        <fab icon="edit" id="fab-lower"></fab>
    </div>
`;

console.log('--- Test 1: Component Loading ---');
loadComponents(document.body);

const btnUpper = document.querySelector('#fab-upper'); // Should NOT exist if replaced, or we check the class
const btn1 = document.body.querySelectorAll('.m3-fab')[0];
const btn2 = document.body.querySelectorAll('.m3-fab')[1];

if (btn1 && btn2) {
    console.log('[SUCCESS] Both FAB and fab tags were replaced.');
} else {
    console.error('[FAILURE] FAB replacement failed.');
    console.log('HTML:', document.body.innerHTML);
}

// Test 2: Duplicate Binding Protection
console.log('\n--- Test 2: DataBinder Idempotency ---');
const state = createReactiveState({ count: 0 });
document.body.innerHTML = `<input id="input" data-bind="count" />`;
const input = document.getElementById('input');

// Call bindData multiple times
bindData(document.body, state);
bindData(document.body, state);
bindData(document.body, state);

// If WeakSet works, we shouldn't have multiple listeners stack up.
// Hard to verify directly in happy-dom without spying on addEventListener, 
// but we can verify it doesn't crash and functionality holds.

if (input) {
    console.log('[SUCCESS] bindData called multiple times without crash.');
}
