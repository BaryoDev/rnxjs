export const registeredComponents = {};

export function registerComponent(tagName, componentFunc) {
  registeredComponents[tagName] = componentFunc;
}
