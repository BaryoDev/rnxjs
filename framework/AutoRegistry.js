import * as moduleExports from '../components/index.js';
import { registerComponent } from './Registry.js';

export function autoRegisterComponents() {
  // Direct usage of imported modules is safer for bundlers
  // In global bundle (IIFE), we might rely on window, but moduleExports is reliable here if imported
  const exports = moduleExports;

  Object.entries(exports).forEach(([name, comp]) => {
    if (typeof comp === 'function' && /^[A-Z]/.test(name)) {
      registerComponent(name, comp);
    }
  });
}
