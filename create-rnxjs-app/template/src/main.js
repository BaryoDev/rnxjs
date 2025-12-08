import 'bootstrap/dist/css/bootstrap.min.css';
import { autoRegisterComponents, loadComponents, createComponent, registerComponent } from '@arnelirobles/rnxjs';

function Counter(props) {
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

registerComponent('Counter', Counter);

// Initialize
autoRegisterComponents();
loadComponents();
