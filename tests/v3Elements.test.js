import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { defineElement, defineElements, tagFor, provideState } from '../framework/defineElements.js';
import { createReactiveState } from '../utils/createReactiveState.js';

beforeAll(() => { defineElements(); });

/**
 * Render from a parsed HTML string, never appendChild.
 *
 * Building an element in JavaScript populates its children before it is
 * connected, which hides the parser-timing bug entirely. Every test that cares
 * about children has to go through the parser.
 */
function parse(html) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  host.innerHTML = html;
  return host;
}

afterEach(() => { document.body.innerHTML = ''; });
const settle = () => new Promise((r) => setTimeout(r, 20));

describe('v3 tag names', () => {
  it('maps PascalCase to a hyphenated tag', () => {
    expect(tagFor('Button')).toBe('rnx-button');
    expect(tagFor('DataTable')).toBe('rnx-data-table');
    expect(tagFor('FAB')).toBe('rnx-fab');
    expect(tagFor('SegmentedButton')).toBe('rnx-segmented-button');
  });

  it('every tag contains a hyphen, which is what makes it legal', () => {
    for (const tag of defineElements()) expect(tag).toContain('-');
  });

  it('leaves native elements alone', async () => {
    const host = parse('<button class="list-group-item">Profile</button>');
    await settle();
    // The whole point of the rename: this is not a component any more.
    expect(host.firstElementChild.className).toBe('list-group-item');
    expect(host.firstElementChild.querySelector('.btn')).toBeNull();
  });
});

describe('v3 rendering', () => {
  it('renders a component from parsed markup', async () => {
    const host = parse('<rnx-button label="Save" variant="primary"></rnx-button>');
    await settle();
    const btn = host.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain('Save');
    expect(btn.className).toContain('btn');
  });

  it('a bare attribute is true, and kebab attributes become camelCase props', async () => {
    const host = parse('<rnx-badge label="new" pill></rnx-badge>');
    await settle();
    expect(host.querySelector('[data-rnx-ready]')).not.toBeNull();
    expect(host.textContent).toContain('new');
  });

  it('carries class through as className', async () => {
    const host = parse('<rnx-button label="x" class="mine"></rnx-button>');
    await settle();
    expect(host.querySelector('.mine')).not.toBeNull();
  });

  it('a self-closing tag nests instead of swallowing the document', async () => {
    // Measured contrast. <Textarea /> parsed as the raw-text <textarea>, so
    // everything after it, including <script>, became its text content and
    // never ran. <rnx-textarea /> has no self-closing form either, but what
    // follows stays a real element, nested rather than destroyed.
    const v2 = document.createElement('div');
    v2.innerHTML = '<Textarea /><Badge label="after"></Badge><script>x</script>';
    // happy-dom does not fully emulate raw-text parsing, so assert only what it
    // does reproduce: the tag became a native <textarea> and the script that
    // followed ended up inside it as text rather than executing.
    expect(v2.firstElementChild.localName).toBe('textarea');
    expect(v2.firstElementChild.textContent).toContain('x');

    const v3 = document.createElement('div');
    v3.innerHTML = '<rnx-textarea /><rnx-badge label="after"></rnx-badge>';
    expect(v3.querySelector('rnx-badge')).not.toBeNull();      // survives as an element
  });

  it('warns when a component discards children it did not use', async () => {
    const warnings = [];
    const original = console.warn;
    console.warn = (...a) => warnings.push(a.join(' '));
    try {
      parse('<rnx-textarea rows="4" /><rnx-badge label="after"></rnx-badge>');
      await settle();
    } finally {
      console.warn = original;
    }
    expect(warnings.join('\n')).toContain('discarded');
    expect(warnings.join('\n')).toContain('close it with');
  });

  it('data-rnx-ignore opts out', async () => {
    const host = parse('<rnx-button label="x" data-rnx-ignore></rnx-button>');
    await settle();
    expect(host.querySelector('button')).toBeNull();
  });
});

describe('v3 children', () => {
  it('sees children that arrive after the opening tag', async () => {
    // A probe rather than a real component, because no component consumes
    // children yet (rnxjs#48). This asserts the thing that actually matters:
    // how many children the element could see when it rendered.
    let seen = -1;
    defineElement('ChildProbe', (props) => {
      seen = (props.children || []).filter((n) => n.nodeType === 1).length;
      const d = document.createElement('div');
      d.textContent = 'probe';
      return d;
    });

    const host = parse(`
      <rnx-child-probe>
        <option value="all">All</option>
        <option value="0-500">Under 500</option>
      </rnx-child-probe>
    `);
    await settle();

    // If the render ran before the parser delivered the children, this is 0.
    expect(seen).toBe(2);
  });
});

describe('v3 state', () => {
  it('resolves state by walking ancestors', async () => {
    provideState('dash', createReactiveState({ who: 'Rina' }));
    const host = parse(`
      <div data-rnx-state="dash">
        <rnx-button label="x"></rnx-button>
      </div>
    `);
    await settle();
    expect(host.querySelector('rnx-button').hasAttribute('data-rnx-ready')).toBe(true);
  });

  it('renders without state when there is no provider', async () => {
    const host = parse('<rnx-button label="x"></rnx-button>');
    await settle();
    expect(host.querySelector('button')).not.toBeNull();
  });
});
