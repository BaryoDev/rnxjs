import * as exports from '../index.js';
import { registerComponent } from './Registry.js';

export function autoRegisterComponents() {
  Object.entries(exports).forEach(([name, comp]) => {
    if (typeof comp === 'function' && /^[A-Z]/.test(name)) {
      registerComponent(name, comp);
    }
  });
}
