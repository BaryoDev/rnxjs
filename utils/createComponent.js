export function createComponent(templateFn, initialState = {}, styles = '') {
    let component;
    const el = document.createElement('div');
    let currentState = { ...initialState };
    let effectFn = null;
    const children = currentState.children || null;
  
    function render() {
      el.innerHTML = templateFn(currentState).trim();
      component = el.firstElementChild;
  
      if (children && component.querySelector('[data-slot]')) {
        const slot = component.querySelector('[data-slot]');
        Array.isArray(children) ? children.forEach(c => slot.appendChild(c)) : slot.appendChild(children);
      }
  
      component.refs = {};
      component.querySelectorAll('[data-ref]').forEach(el => {
        const name = el.getAttribute('data-ref');
        component.refs[name] = el;
      });
  
      if (effectFn) setTimeout(() => effectFn(component), 0);
      return component;
    }
  
    component = render();
  
  component.setState = (newState) => {
    const oldComp = component;
    currentState = { ...currentState, ...newState };
    const newComp = render();
    oldComp.replaceWith(newComp);
    component = newComp;
  };
  
    component.useEffect = (fn) => {
      effectFn = fn;
    };
  
    component.getState = () => currentState;
  
    component.useState = (key, initialValue) => {
      if (currentState[key] === undefined) currentState[key] = initialValue;
      const get = () => currentState[key];
      const set = (val) => component.setState({ [key]: val });
      return [get, set];
    };
  
    return component;
  }
  