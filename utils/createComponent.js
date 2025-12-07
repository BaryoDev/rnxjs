export function createComponent(templateFn, initialState = {}, styles = '') {
  let component;
  const el = document.createElement('div');
  let currentState = { ...initialState };
  let effectFn = null;
  let effectCleanup = null;
  let unmountCleanup = null;
  const children = currentState.children || null;

  function render() {
    try {
      el.innerHTML = templateFn(currentState).trim();
      component = el.firstElementChild;

      if (!component) {
        console.error('[rnxJS] createComponent: templateFn must return valid HTML with a root element');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Component rendering error';
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '10px';
        errorDiv.style.border = '1px solid red';
        return errorDiv;
      }

      if (children) {
        let slot = component.querySelector('[data-slot]');
        if (!slot && component.hasAttribute('data-slot')) {
          slot = component;
        }

        if (slot) {
          Array.isArray(children) ? children.forEach(c => slot.appendChild(c)) : slot.appendChild(children);
        }
      }

      component.refs = {};
      if (component.hasAttribute('data-ref')) {
        component.refs[component.getAttribute('data-ref')] = component;
      }
      component.querySelectorAll('[data-ref]').forEach(el => {
        const name = el.getAttribute('data-ref');
        if (name) {
          component.refs[name] = el;
        }
      });

      setTimeout(() => {
        if (effectFn) {
          try {
            // Run cleanup from previous effect if exists
            if (effectCleanup && typeof effectCleanup === 'function') {
              effectCleanup();
            }
            // Run effect and store cleanup function if returned
            const cleanup = effectFn(component);
            if (cleanup && typeof cleanup === 'function') {
              effectCleanup = cleanup;
            }
          } catch (error) {
            console.error('[rnxJS] Error in useEffect:', error);
          }
        }
      }, 0);

      return component;
    } catch (error) {
      console.error('[rnxJS] Error rendering component:', error);
      const errorDiv = document.createElement('div');
      errorDiv.textContent = `Component error: ${error.message}`;
      errorDiv.style.color = 'red';
      errorDiv.style.padding = '10px';
      errorDiv.style.border = '1px solid red';
      return errorDiv;
    }
  }

  function attachMethods(comp) {
    comp.setState = setState;
    comp.useEffect = useEffect;
    comp.onUnmount = onUnmount;
    comp.getState = getState;
    comp.useState = useState;
    comp.destroy = destroy;
  }

  const setState = (newState) => {
    try {
      const oldComp = component;
      currentState = { ...currentState, ...newState };

      // Focus preservation logic
      const activeEl = document.activeElement;
      let focusRef = null;
      let selectionStart = 0;
      let selectionEnd = 0;

      if (activeEl && oldComp.contains(activeEl)) {
        focusRef = activeEl.getAttribute('data-ref');
        // Save cursor position if it's an input/textarea
        if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
          selectionStart = activeEl.selectionStart || 0;
          selectionEnd = activeEl.selectionEnd || 0;
        }
      }

      const newComp = render();
      // Re-attach methods to the new component
      attachMethods(newComp);

      if (oldComp.parentNode) {
        oldComp.replaceWith(newComp);
      }
      component = newComp;

      // Restore focus
      if (focusRef && component.refs && component.refs[focusRef]) {
        const elToFocus = component.refs[focusRef];
        requestAnimationFrame(() => {
          elToFocus.focus();
          if (elToFocus.tagName === 'INPUT' || elToFocus.tagName === 'TEXTAREA') {
            try {
              elToFocus.setSelectionRange(selectionStart, selectionEnd);
            } catch (e) {
              // Silently fail if setSelectionRange is not supported
            }
          }
        });
      }
    } catch (error) {
      console.error('[rnxJS] Error in setState:', error);
    }
  };

  const useEffect = (fn) => {
    if (typeof fn !== 'function') {
      console.warn('[rnxJS] useEffect: argument must be a function');
      return;
    }
    effectFn = fn;
  };

  const onUnmount = (fn) => {
    if (typeof fn !== 'function') {
      console.warn('[rnxJS] onUnmount: argument must be a function');
      return;
    }
    unmountCleanup = fn;
  };

  const getState = () => currentState;

  const useState = (key, initialValue) => {
    if (currentState[key] === undefined) currentState[key] = initialValue;
    const get = () => currentState[key];
    const set = (val) => setState({ [key]: val });
    return [get, set];
  };

  const destroy = () => {
    try {
      // Run effect cleanup
      if (effectCleanup && typeof effectCleanup === 'function') {
        effectCleanup();
      }
      // Run unmount cleanup
      if (unmountCleanup && typeof unmountCleanup === 'function') {
        unmountCleanup();
      }
      // Clear references
      effectCleanup = null;
      unmountCleanup = null;
      effectFn = null;
      if (component.refs) {
        component.refs = {};
      }
    } catch (error) {
      console.error('[rnxJS] Error in destroy:', error);
    }
  };

  component = render();
  attachMethods(component);

  return component;
}
