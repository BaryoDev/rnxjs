import { autoRegisterComponents, loadComponents, createComponent, registerComponent } from '@arnelirobles/rnxjs';

// Define a custom component
function Counter(props) {
    const [count, setCount] = this.useState('count', 0);

    return createComponent(() => `
    <div>
      <h3>Counter: ${count()}</h3>
      <Button label="Increment" variant="success" onclick="increment"></Button>
      <Button label="Decrement" variant="danger" onclick="decrement"></Button>
    </div>
  `, props);
}

// Add event handlers to the prototype or handle them in useEffect
// For simplicity in this template, let's use useEffect for handlers if we want them scoped,
// OR we can just attach them to the window if we are lazy, but let's do it right.
// Actually, rnxJS's createComponent binds 'this' in a specific way? 
// Wait, looking at my own code:
// createComponent returns a component.
// In the template above: onclick="increment"
// This expects 'increment' to be in the global scope or reachable.
// rnxJS doesn't auto-bind local functions to string handlers.
// So we should use useEffect to attach listeners properly or use global functions.

// Let's rewrite Counter to use useEffect for listeners, which is cleaner.
function CounterImproved(props) {
    const [count, setCount] = this.useState('count', 0);

    const comp = createComponent(() => `
    <div class="text-center">
      <h3 class="mb-3">Counter: ${count()}</h3>
      <div class="d-flex justify-content-center gap-2">
        <Button label="-" variant="danger" data-ref="btnDec"></Button>
        <Button label="+" variant="success" data-ref="btnInc"></Button>
      </div>
    </div>
  `, props);

    comp.useEffect(() => {
        comp.refs.btnDec.addEventListener('click', () => setCount(count() - 1));
        comp.refs.btnInc.addEventListener('click', () => setCount(count() + 1));
    });

    return comp;
}

registerComponent('Counter', CounterImproved);

// Initialize
autoRegisterComponents();
loadComponents();
