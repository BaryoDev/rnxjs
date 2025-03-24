import { createComponent } from '../../utils/createComponent.js';

export function Tabs({ children = '' }) {
  const template = () => `
    <div>
      <ul class="nav nav-tabs" role="tablist" data-ref="nav"></ul>
      <div class="tab-content" data-ref="content"></div>
    </div>
  `;

  const tabs = createComponent(template, { children });

  tabs.useEffect(() => {
    const tabElements = tabs.querySelectorAll('[data-tab]');
    const nav = tabs.refs.nav;
    const content = tabs.refs.content;

    tabElements.forEach((el, i) => {
      const tabId = `tab-${i}`;
      const title = el.getAttribute('title') || `Tab ${i + 1}`;
      const active = i === 0;

      // Nav
      const navItem = document.createElement('li');
      navItem.className = 'nav-item';
      navItem.innerHTML = `
        <button class="nav-link ${active ? 'active' : ''}" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button" role="tab">${title}</button>
      `;
      nav.appendChild(navItem);

      // Content
      el.classList.add('tab-pane', 'fade', active ? 'show active' : '');
      el.id = tabId;
      content.appendChild(el);
    });
  });

  return tabs;
}
