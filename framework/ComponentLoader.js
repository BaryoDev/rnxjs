import { registeredComponents } from './Registry.js';

export function loadComponents(root = document) {
  Object.keys(registeredComponents).forEach(tag => {
    const elements = root.querySelectorAll(tag);
    elements.forEach(el => {
      const ComponentFunc = registeredComponents[tag];
      const props = {};

      for (let attr of el.attributes) {
        const name = attr.name;
        const value = attr.value;

        if (name.startsWith('on')) {
          console.warn(`⚠️ "${name}" should be passed as a JS function, not as a string. Skipping...`);
          continue;
        }

        props[name] = value;
      }

      const children = Array.from(el.childNodes).filter(n => n.nodeType !== 8);
      if (children.length) props.children = children;

      if (el.getAttribute('visible') === 'false') return;

      const condition = el.getAttribute('data-if');
      if (condition && !eval(condition)) return;

      const comp = ComponentFunc(props);
      el.replaceWith(comp);
      loadComponents(comp);
    });
  });
}
