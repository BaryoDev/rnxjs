
import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';

export function Tooltip({ title = '', placement = 'top', children = '' }) {
    // Tooltip wrapper needs to be an inline element usually, accessing the child directly is hard without VDOM
    // so we wrap in a span
    const template = () => `
        <span data-bs-toggle="tooltip" data-bs-placement="${placement}" title="${title}" data-slot></span>
    `;

    const component = createComponent(template, { title, placement, children });

    component.useEffect((el) => {
        if (!bs.isAvailable() || !bs.Tooltip) return;

        const instance = new bs.Tooltip(el);

        return () => instance.dispose();
    });

    return component;
}
