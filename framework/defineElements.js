// v3 custom elements.
//
// A capitalised tag name cannot mean "component": the HTML parser lowercases
// it, so <Button> and <button> arrive identical. Hyphenated names are what the
// spec reserves for custom elements, so they never collide with native ones.
//
//   <rnx-data-table sortable filterable></rnx-data-table>
//
// Design notes in docs/design/2026-08-25-v3-custom-elements.md.

import * as components from '../components/index.js';

/** DataTable -> rnx-data-table */
export function tagFor(name) {
  return 'rnx-' + name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Children are not available in connectedCallback.
 *
 * The parser fires it when the opening tag is seen, before the children exist,
 * so reading them there gets an empty element for server-rendered HTML. There
 * is no finishedParsingChildrenCallback in the spec, so this is a fallback:
 * a document that is still loading may not have delivered our children yet, so
 * wait for it. Anything else (dynamic insertion, upgrade of existing markup)
 * already has them.
 */
function whenChildrenReady(el, run) {
  const doc = el.ownerDocument;

  // Still streaming: our children may be many tokens away, so wait for the
  // document rather than guessing.
  if (doc && doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', run, { once: true });
    return;
  }

  // Measured: even in a complete document, connectedCallback runs with zero
  // children and they attach on the next microtask. Calling run() here reads
  // an empty element every time.
  queueMicrotask(run);
}

/** Reactive state is looked up by walking ancestors, the way a control finds its form. */
function stateFor(el) {
  const host = el.closest('[data-rnx-state]');
  if (!host) return null;
  const name = host.getAttribute('data-rnx-state');
  return (globalThis.__rnxStates && globalThis.__rnxStates[name]) || null;
}

/** Register a named state so <rnx-app state="name"> can resolve it. */
export function provideState(name, state) {
  globalThis.__rnxStates = globalThis.__rnxStates || {};
  globalThis.__rnxStates[name] = state;
  return state;
}

const BOOLEAN_ISH = new Set(['true', 'false']);

function coerce(value) {
  if (value === '') return true;                 // bare attribute, <x sortable>
  if (BOOLEAN_ISH.has(value)) return value === 'true';
  if (value !== '' && !Number.isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if ((value.startsWith('{') || value.startsWith('[')) ) {
    try { return JSON.parse(value); } catch { /* keep the string */ }
  }
  return value;
}

function propsFrom(el) {
  const props = {};
  for (const { name, value } of el.attributes) {
    if (name === 'class') { props.className = value; continue; }
    if (name.startsWith('data-rnx')) continue;
    // kebab attributes become camelCase props: page-size -> pageSize
    const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    props[key] = coerce(value);
  }
  return props;
}

/**
 * Define one component as a custom element. Idempotent, so calling
 * defineElements() twice is safe.
 */
export function defineElement(name, Component, { observed = [] } = {}) {
  const tag = tagFor(name);
  if (typeof customElements === 'undefined' || customElements.get(tag)) return tag;

  class RnxElement extends HTMLElement {
    static get observedAttributes() { return observed; }

    connectedCallback() {
      if (this.hasAttribute('data-rnx-ignore')) return;
      whenChildrenReady(this, () => this.#render());
    }

    attributeChangedCallback(_n, prev, next) {
      if (prev !== next && this.#ready) this.#render();
    }

    disconnectedCallback() {
      this.#rendered?.dispatchEvent?.(new CustomEvent('rnx:unmount'));
    }

    #ready = false;
    #rendered = null;

    #render() {
      const props = propsFrom(this);
      const state = stateFor(this);
      if (state) props.state = state;

      // Light DOM on purpose. A shadow root would cut the component off from
      // Bootstrap, from css/rnx.css and from the className escape hatch, which
      // is the opposite of what this library is for.
      const children = Array.from(this.childNodes);
      if (children.length) props.children = children;

      let out;
      try {
        out = Component(props);
      } catch (err) {
        console.error(`[rnxJS] <${tag}> failed to render:`, err);
        return;
      }

      if (!(out instanceof Node)) {
        console.error(`[rnxJS] <${tag}> did not return an element`);
        return;
      }

      // A component that ignores its children silently loses them here. The
      // usual cause is a self-closing tag: custom elements have no self-closing
      // form, so <rnx-textarea /> nests whatever follows it instead of ending.
      const orphaned = children.filter((n) => n.nodeType === 1 && !out.contains(n));
      if (orphaned.length) {
        console.warn(
          `[rnxJS] <${tag}> discarded ${orphaned.length} child element(s): ` +
          orphaned.map((n) => `<${n.localName}>`).join(', ') +
          `. If you wrote <${tag} />, close it with </${tag}> instead.`
        );
      }

      this.replaceChildren(out);
      this.#rendered = out;
      this.#ready = true;
      this.setAttribute('data-rnx-ready', '');
    }
  }

  customElements.define(tag, RnxElement);
  return tag;
}

/**
 * Define every exported component as <rnx-*>.
 * Returns the tag names defined, so a caller can assert on them.
 */
export function defineElements() {
  const defined = [];
  for (const [name, Component] of Object.entries(components)) {
    if (typeof Component !== 'function' || !/^[A-Z]/.test(name)) continue;
    defined.push(defineElement(name, Component));
  }
  return defined;
}
