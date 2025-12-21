// Core Utilities
export { createComponent } from './utils/createComponent.js';
export { createReactiveState } from './utils/createReactiveState.js';
export { setBootstrap, getBootstrap } from './utils/config.js';

// Security Utilities
export {
  escapeHtml,
  escapeAttribute,
  escapeJs,
  safeHtml,
  trustHtml,
  isTrustedHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeObject
} from './utils/security.js';

// Framework
export { registerComponent } from './framework/Registry.js';
export { loadComponents } from './framework/ComponentLoader.js';
export { autoRegisterComponents } from './framework/AutoRegistry.js';
export { bindData } from './framework/DataBinder.js';

// Plugin System
export { PluginManager, plugins } from './utils/plugins.js';

// Official Plugins
export { default as routerPlugin } from './plugins/router.js';
export { default as toastPlugin } from './plugins/toast.js';
export { default as storagePlugin } from './plugins/storage.js';

// Components
export * from './components/index.js';
