# Theming: design tokens and slots

Status: design agreed, P1 ready to implement
Date: 2026-08-24

## The goal

A user should be able to restyle rnxJS from their own stylesheet, without
JavaScript, without a build step, and without forking the source:

```css
:root {
  --rnx-primary: #7c3aed;
  --rnx-border-radius: 12px;
}
```

And a user should be able to change what a component renders from the template
they are already writing, rather than from JavaScript:

```html
<DataTable sortable>
  <template slot="cell" data-column="status">
    <span class="badge bg-success">{{ value }}</span>
  </template>
</DataTable>
```

These are the two halves of "customizable" that rnxJS does not have today.

## Current state

There are two theme systems in the repository and the wrong one is wired up.

| System | Files | Status |
|---|---|---|
| Class-name maps | `utils/ThemeProvider.js`, `themes/bootstrap/`, `themes/tailwind/` | Live. All 46 components use it. Exported from `index.js`. |
| CSS custom properties | `css/themes/base.css` (85 `--rnx-*` tokens), `utils/theme.js` | Orphaned. No component reads it. Not exported. |

`docs/COMPONENTS.md:1182` already tells readers to consult `base.css` for the
list of CSS custom properties. A reader who follows that and sets `--rnx-primary`
gets no effect, because nothing consumes the token.

Issue #15 proposes deleting `utils/theme.ts`. That is correct for the JavaScript
half, whose API conflicts with `ThemeProvider`. It must not take `css/themes/base.css`
with it. See "Amendment to #15" below.

## The constraint that shapes everything

rnxJS does not own its CSS. Components render Bootstrap class names such as
`btn btn-primary`, and Bootstrap's own stylesheet colours them. An `--rnx-primary`
token therefore cannot affect anything unless a bridge re-points Bootstrap's
variables at it.

Bootstrap 5.3 exposes two different kinds of custom property, and they behave
differently. This was measured against `bootstrap@5.3.3`:

| Variable | Times consumed via `var()` | Overridable at runtime |
|---|---|---|
| `--bs-border-radius` | 46 | Yes |
| `--bs-body-bg` | 22 | Yes |
| `--bs-border-color` | 22 | Yes |
| `--bs-body-color` | 21 | Yes |
| `--bs-body-font-family` | 1 | Yes |
| **`--bs-primary`** | **0** | **No** |

`--bs-primary` exists in `:root` but nothing reads it. Colour is compiled into
each variant class as a literal:

```css
.btn-primary {
  --bs-btn-bg: #0d6efd;        /* a hex, not var(--bs-primary) */
  --bs-btn-border-color: #0d6efd;
}
```

The `.btn` rule then consumes `var(--bs-btn-*)` in 12 places. So colour is
overridable, but only by re-pointing the component-level variables on the
variant class, not by setting a global.

**A naive `:root { --bs-primary: var(--rnx-primary) }` bridge would make radius
and typography work while colour silently did nothing.** That failure would
present as a theming bug rather than a design error, which is why the bridge has
two tiers.

## P1: the Bootstrap bridge

Ship `css/themes/bootstrap-tokens.css`, mapping the existing `--rnx-*` tokens
onto Bootstrap's runtime variables.

### Tier A, globals

Direct mapping in `:root`. Covers radius, typography, surfaces and borders.

```css
:root {
  --bs-border-radius:    var(--rnx-border-radius);
  --bs-border-radius-sm: var(--rnx-border-radius-sm);
  --bs-border-radius-lg: var(--rnx-border-radius-lg);
  --bs-border-color:     var(--rnx-border-color);
  --bs-body-bg:          var(--rnx-background);
  --bs-body-color:       var(--rnx-text);
  --bs-body-font-family: var(--rnx-font-family);
  --bs-body-font-size:   var(--rnx-font-size-base);
}
```

### Tier B, per-component colour

Re-point each component family's variables. Bootstrap 5.3 exposes these families,
ordered by how many `var()` consumers each has:

`btn` (25), `table` (32), `card` (27), `list` (26), `form` (21), `accordion` (19),
`pagination` (18), `dropdown` (14), `nav` (14), `navbar` (12), `modal` (11),
`offcanvas` (36), `popover` (15), `link` (14).

```css
.btn-primary {
  --bs-btn-bg:                var(--rnx-primary);
  --bs-btn-border-color:      var(--rnx-primary);
  --bs-btn-hover-bg:          var(--rnx-primary-hover);
  --bs-btn-hover-border-color:var(--rnx-primary-hover);
  --bs-btn-active-bg:         var(--rnx-primary-active);
}
```

Repeated per variant (`primary`, `secondary`, `success`, `danger`, `warning`,
`info`) and per family. Mechanical, and every line is verifiable by changing one
token and observing the component.

### Scope of P1

- Add `css/themes/bootstrap-tokens.css`
- Add an `exports` entry so it is reachable as
  `@arnelirobles/rnxjs/css/themes/bootstrap-tokens.css`
- Document loading it, and document the token list
- Amend #15 so `css/themes/base.css` survives
- Tests, see below

Explicitly **not** in P1: any change to `ThemeProvider.js`, any change to
component source, any change to the Tailwind theme. P1 is additive CSS plus
packaging. Nothing that exists today changes behaviour.

### Testing

The failure mode here is a rule that looks right and does nothing, so a test
asserting the CSS file contains a string is worthless. Tests must set a token
and read back a resolved value:

```js
document.documentElement.style.setProperty('--rnx-primary', 'rgb(124, 58, 237)');
const btn = Button({ variant: 'primary', label: 'x' });
document.body.appendChild(btn);
expect(getComputedStyle(btn).backgroundColor).toBe('rgb(124, 58, 237)');
```

This requires real Bootstrap CSS loaded in the jsdom environment. If that is not
practical, the test must be skipped loudly rather than replaced with a string
assertion. A green test that never exercised the cascade is worse than no test.

One test per token tier at minimum: one global (radius), one per-component
colour (button background).

## P2: Tailwind token awareness

Tailwind compiles colour into utility classes, so `bg-indigo-600` cannot be
re-pointed by a variable. Making the Tailwind theme token-aware means rewriting
its class map to arbitrary values:

```js
button: { variants: { primary: 'bg-[var(--rnx-primary)] text-white' } }
```

This works without a Tailwind config change, and without a build step for CDN
users. It touches every entry in `themes/tailwind/index.js`.

Depends on P1 only for the final token names. Tracked as its own issue.

Note: the Tailwind theme has separate open problems (#8, #9, #11, #4). P2 should
not be attempted while those are outstanding, or two unrelated causes will be in
play at once.

## P3: Slots

### The requirement

rnxJS users write server-side templates, not JavaScript. They use components as
markup:

```html
<DataTable sortable></DataTable>
```

They never call the constructor, so a JavaScript-only render-prop API is
unreachable for them. **Slots must be expressible in markup**, or the feature
will be built and still miss the audience.

### Existing precedent

`VirtualList` already ships a pair with different safety contracts:

- `renderItem(item)` returns raw HTML. Not escaped. Powerful and dangerous.
- `renderItemSafe(item)` returns `{ title, subtitle, content }`, all auto-escaped.

`Autocomplete` has `renderItem` with a text-returning default. The slot design
should generalize this pair rather than introduce a third mechanism.

### Proposed shape

Two front ends, one resolver.

```html
<DataTable sortable>
  <template slot="cell" data-column="status">
    <span class="badge bg-success">{{ value }}</span>
  </template>
</DataTable>
```

```js
DataTable({ slots: { cell: (ctx) => `<span>${ctx.value}</span>` } })
```

Markup slots are the documented path. The escaping contract needs deciding:
a `<template slot>` containing `{{ value }}` should interpolate escaped by
default, with an explicit opt-out for raw HTML, mirroring
`renderItem` / `renderItemSafe`.

### Scope

Not all 46 components. The components people actually customize:
`DataTable` (cell, header, empty), `Dropdown` (item), `List` (item),
`Card` (header, footer), `EmptyState` (action).

Changes component signatures, so it needs its own design pass before
implementation. Tracked as its own issue.

## Amendment to #15

#15 is currently labelled `good first issue` and says to remove the orphaned
theme system. Acting on it as written would delete `css/themes/base.css`, which
P1 depends on.

The issue must be narrowed to: delete `utils/theme.js` and `utils/theme.ts`
only; keep `css/themes/base.css`; keep the `--rnx-*` naming. Until that is done,
the `good first issue` label should be removed so nobody picks it up.

## Order

P1 first, because it is small, additive, and pins the token names the other two
depend on. P2 and P3 are independent of each other and can proceed in either
order once P1 lands. Both are suitable contributor projects at that point.
