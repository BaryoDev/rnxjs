import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';

export function Toast({ header = '', body = '', autohide = true, delay = 5000 }) {
  const template = () => `
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
      <div class="toast-header">
        <strong class="me-auto">${header}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" data-rnx-ignore="true"></button>
      </div>
      <div class="toast-body">
        ${body}
      </div>
    </div>
  `;

  const toast = createComponent(template, { header, body, autohide, delay });

  toast.useEffect((el) => {
    if (!bs.isAvailable() || !bs.Toast) return;

    // Use getOrCreateInstance if available (BS5), otherwise new
    const bsToast = bs.Toast.getOrCreateInstance
      ? bs.Toast.getOrCreateInstance(el)
      : new bs.Toast(el);

    bsToast.show();

    // Expose methods
    el.show = () => bsToast.show();
    el.hide = () => bsToast.hide();
    el.dispose = () => bsToast.dispose();

    return () => bsToast.dispose();
  });

  return toast;
}
