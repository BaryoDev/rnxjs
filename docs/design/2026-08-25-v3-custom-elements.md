# v3: custom elements

Status: proposed
Date: 2026-08-25

## The problem, stated once

rnxJS uses a capitalised tag name to mean "this is a component", and reads it
back from the DOM. The DOM does not keep case for HTML elements, so the marker
is gone by the time the loader looks for it.

Measured:

```js
d.innerHTML = '<Button label="x"></Button><button class="mine">y</button>';
[...d.children].map(e => e.tagName + ' | ' + e.constructor.name);
// ['BUTTON | HTMLButtonElement', 'BUTTON | HTMLButtonElement']
```

Both are the same element. The loader cannot distinguish a component the author
wrote from a native element the author styled.

Four issues filed on 2026-08-24 and 2026-08-25 are all this one decision:

| | |
|---|---|
| #47 | `<Textarea />` parses as the raw-text `<textarea>`, swallowing the rest of the document |
| #48 | `<Select>` discards its `<option>` children |
| #49 | Every plain `<button>` on the page is claimed and restyled |
| #50 | `<Column class="col-md-6">` lost its class |

#50 is fixed and #48 is fixable in isolation. #47 and #49 are not: they follow
from the premise.

## What changes

Component tags become hyphenated, which is what the HTML spec reserves for
custom elements precisely so they cannot collide with native ones.

```html
<!-- v2 -->
<DataTable sortable filterable></DataTable>
<Textarea rows="4" />
<Button variant="primary" label="Save"></Button>

<!-- v3 -->
<rnx-data-table sortable filterable></rnx-data-table>
<rnx-textarea rows="4"></rnx-textarea>
<rnx-button variant="primary" label="Save"></rnx-button>
```

Mapping is mechanical: `DataTable` becomes `rnx-data-table`, PascalCase to
kebab-case with an `rnx-` prefix.

What this buys, directly:

- **#47 disappears.** `rnx-textarea` is not a raw-text element, so a stray
  self-closing tag cannot eat the document.
- **#49 disappears.** A native `<button>` is never a component. Authors can
  style their own buttons again.
- Case stops mattering, so the premise no longer has to hold.

## Register them as real custom elements

The tag change alone would be worth doing. Registering with
`customElements.define()` is the part that changes how the library is used.

```js
customElements.define('rnx-data-table', class extends HTMLElement {
  static observedAttributes = ['sortable', 'filterable', 'page-size'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
});
```

### No more loadComponents()

Today a page must call `rnx.autoRegisterComponents()` and
`rnx.loadComponents(document.body, state)`, and if it forgets, or calls it
before the markup exists, or adds markup afterwards, nothing renders and
nothing says so. That is the failure mode behind #47 in practice: the page
looked fine and the init call had simply never run.

The browser upgrades a custom element the moment it is parsed and defined.
Markup rendered by the server works with no init call at all, which is the
actual pitch of this library:

```django
{% load rnx %}
<rnx-data-table sortable data-bind="users"></rnx-data-table>
```

Content added later, by a fragment swap or a template loop, upgrades on
insertion. No re-scan, no second call.

### Light DOM only, no shadow root

This is a deliberate constraint, not an omission. Shadow DOM would isolate
components from the page's stylesheet, and rnxJS's whole proposition is that
Bootstrap, or Tailwind, or the app's own CSS, styles the components. A shadow
root would break `css/rnx.css`, break theming, and break every existing
`className` escape hatch.

Rendering into light DOM keeps all of that working.

### Children become usable

Because children are real DOM children of a defined element, `#48` resolves
naturally:

```html
<rnx-select name="range">
  <option value="all">All prices</option>
  <option value="0-500">Under 500</option>
</rnx-select>
```

The element reads its own `<option>` children on `connectedCallback`. The
`options` prop stays for people constructing in JavaScript.

## Things that will bite

**Upgrade flash.** Elements upgrade when their definition runs. If the script
tag is at the end of `<body>`, undefined elements are briefly visible as
unstyled content. Mitigate in `css/rnx.css`:

```css
rnx-data-table:not(:defined),
rnx-modal:not(:defined) { visibility: hidden; }
```

**Do not use customized built-ins.** `<button is="rnx-button">` is the other
way to extend HTML, and Safari has declined to implement it. Autonomous custom
elements only.

**Attribute values are strings.** Same as today, but `attributeChangedCallback`
makes it more visible. Parse in one place rather than per component.

**`observedAttributes` is static.** A component that takes arbitrary props
needs its attribute list generated at definition time from its documented
props.

## Migration

There are no known production users, which makes this the cheapest this change
will ever be. That is the main argument for doing it now rather than later.

Even so, one release of overlap costs little:

1. **3.0.0** defines the hyphenated elements. `loadComponents()` still exists
   and still registers the old capitalised names, but warns once per tag:
   `[rnxJS] <DataTable> is deprecated, use <rnx-data-table>`.
2. **3.1.0** removes the old path and `loadComponents()` becomes a no-op that
   warns.
3. **4.0.0** deletes it.

A codemod is a one-line regex per component name; worth shipping in the repo
as `scripts/migrate-v3.mjs` rather than asking people to write it.

## What does not change

The reactive core, `createReactiveState`, `data-bind`, the theme system, the
46 components' own implementations, and `css/rnx.css`. This is a change to how
a component is found in the document, not to what it does once found.

## Sequencing

The suite is green, CI is required, and the playground is deployed. Ship the
current work as **2.1.0** first so today's fixes reach people independently of
a breaking change, then start 3.0.0 against a stable baseline.
