import * as moduleExports from '../components/index.js';
import { registerComponent } from './Registry.js';

export function autoRegisterComponents() {
  // In global bundle (IIFE), use window.rnx, otherwise use module exports
  const exports = (typeof window !== 'undefined' && window.rnx) || moduleExports;

  Object.entries(exports).forEach(([name, comp]) => {
    if (typeof comp === 'function' && /^[A-Z]/.test(name)) {
      registerComponent(name, comp);
    }
  });
}
