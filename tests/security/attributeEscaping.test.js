import { describe, it, expect, afterEach } from 'vitest';
import { Tab } from '../../components/Tabs/Tab.js';
import { Card } from '../../components/Card/Card.js';
import { Container } from '../../components/Container/Container.js';
import { Row } from '../../components/Row/Row.js';
import { Column } from '../../components/Column/Column.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.js';
import { Skeleton } from '../../components/Skeleton/Skeleton.js';
import { Input } from '../../components/Input/Input.js';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb.js';
import { Dropdown } from '../../components/Dropdown/Dropdown.js';
import { Badge } from '../../components/Badge/Badge.js';
import { Button } from '../../components/Button/Button.js';
import { Alert } from '../../components/Alert/Alert.js';

const PAYLOAD = 'x" onmouseover="window.__pwned=1" y="';

function hasHandler(root) {
    const all = [root, ...root.querySelectorAll('*')];
    return all.some(el => Array.from(el.attributes).some(a => a.name.startsWith('on')));
}

describe('attribute escaping in component templates', () => {
    let host;
    afterEach(() => { host?.remove(); });

    async function mount(el) {
        host = document.createElement('div');
        document.body.appendChild(host);
        host.appendChild(el);
        await new Promise(resolve => setTimeout(resolve, 30));
        return host;
    }

    it('Tab keeps a quote-bearing title inside the attribute', async () => {
        const root = await mount(Tab({ title: 'a" onmouseover="x', id: 'i" onfocus="y' }));
        const tab = root.querySelector('[data-tab]');
        expect(tab).not.toBeNull();
        expect(hasHandler(root)).toBe(false);
        expect(tab.getAttribute('title')).toContain('onmouseover');
        expect(tab.getAttribute('id')).toContain('onfocus');
    });

    const withClassName = {
        Card: () => Card({ title: 't', className: PAYLOAD }),
        Container: () => Container({ className: PAYLOAD }),
        Row: () => Row({ className: PAYLOAD }),
        Column: () => Column({ className: PAYLOAD }),
        Pagination: () => Pagination({ totalPages: 3, currentPage: 1, className: PAYLOAD }),
        ProgressBar: () => ProgressBar({ value: 10, className: PAYLOAD }),
        Skeleton: () => Skeleton({ className: PAYLOAD }),
        Input: () => Input({ label: 'L', className: PAYLOAD }),
        Breadcrumb: () => Breadcrumb({ items: [{ label: 'a', href: '/' }], className: PAYLOAD }),
        Dropdown: () => Dropdown({ label: 'd', items: [{ label: 'a', id: 'a' }], className: PAYLOAD }),
        Badge: () => Badge({ text: 'b', className: PAYLOAD }),
        Button: () => Button({ label: 'b', className: PAYLOAD }),
        Alert: () => Alert({ message: 'm', className: PAYLOAD }),
    };

    for (const [name, make] of Object.entries(withClassName)) {
        it(`${name} className renders as class text, no event handler attribute`, async () => {
            const root = await mount(make());
            expect(hasHandler(root)).toBe(false);
        });
    }
});
