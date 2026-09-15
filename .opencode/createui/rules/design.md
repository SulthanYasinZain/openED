# Design Quality

How to make any page built with Create UI look premium and intentional, not just API-correct - the taste layer for rich UI.

**Build only what the user asked for, to their brand.** The patterns below are worked examples of the underlying principles (which token belongs on which surface, how to keep a footer neutral, how to avoid bare-default poverty) - they are illustrative, not a closed list and not a layout to reproduce. Lift the *principle*, supply your own colors, copy, spacing, and layout. The universal rules - spacing rhythm, the richness checklist, the anti-patterns, the dark-panel token rule - apply to every project regardless of brand. Never volunteer extra landing / showcase / gallery sections the user didn't ask for.

---

## Surface & color patterns

### Hero

Heading is `text-heading-h1` (it auto-scales down at smaller breakpoints - no `md:`/`xl:` prefixes) with `text-strongest font-semibold`; the lede is `text-body-lg text-body`. The CTA pair is one solid button plus one soft button, both `size="xl" shape="rounded"`, in a `gap-component-sm` row:

```tsx
<div className="gap-component-xl flex max-w-3xl flex-col">
  <h1 className="text-heading-h1 text-strongest font-semibold">Your headline.</h1>
  <p className="text-body-lg text-body">A one-line description of the product.</p>
  <div className="gap-component-sm flex flex-wrap">
    <Button variant="primary" appearance="solid" size="xl" shape="rounded">
      <RiArrowRightLine />
      <ButtonLabel>Primary action</ButtonLabel>
    </Button>
    <Button variant="neutral-light" appearance="soft" size="xl" shape="rounded">Secondary action</Button>
  </div>
</div>
```

**One solid action per section.** The secondary action is always a softer appearance (`soft`, `ghost`, or `outline`), never a second solid button.

### Dark CTA / premium panel

A premium dark panel is a dark surface with light text and inverse buttons. Two correct ways to get the colors right:

- **Theme-aware (preferred):** put `className="dark"` on the panel and use the normal tokens - a dark surface token (`bg-weakest`, or `bg-static` for black), a `text-strongest` heading, `text-body` / `text-placeholder` copy. Under `.dark` these resolve to a dark panel with light text, on both the light and dark page.
- **Fixed dark surface:** if you instead hardcode a dark color or gradient (a value that must stay dark in BOTH themes), the text must be raw `text-white` / `text-white/70`, **never `text-static`** (it flips to black under `.dark`).

On top of it: an eyebrow `Badge variant="primary" appearance="outline" size="md"`; a `text-heading-h2 font-medium` heading; a `text-body-lg` lede; and buttons switched to `variant="inverse-solid"` (`appearance="solid"` primary, `appearance="soft"` secondary, both `size="xl"`).

```tsx
<section className="dark bg-weakest px-layout-sm py-layout-lg gap-component-md flex flex-col items-start">
  <Badge variant="primary" appearance="outline" size="md">YOUR EYEBROW</Badge>
  <h2 className="text-heading-h2 text-strongest font-medium">Your headline.</h2>
  <p className="text-body-lg text-body">A one-line supporting message.</p>
  <div className="gap-component-sm flex flex-col xl:flex-row">
    <Button variant="inverse-solid" appearance="solid" size="xl">
      <RiArrowRightLine />
      <ButtonLabel>Primary action</ButtonLabel>
    </Button>
    <Button variant="inverse-solid" appearance="soft" size="xl">
      <ButtonLabel>Secondary action</ButtonLabel>
      <RiArrowRightSLine />
    </Button>
  </div>
</section>
```

> **Why raw `text-white`, not `text-static`, on a *fixed* dark surface:** a hardcoded dark color/gradient is not a theme token, so its text must be light in BOTH themes. `text-static` is theme-relative - white in light, **black under `.dark`** - so on a dark-mode page the heading would turn black-on-dark. Rule: on a `className="dark"` panel use the normal `text-strongest` / `text-body` tokens; on a hardcoded fixed-color surface use raw `text-white`.

### Footer

**Footers are neutral surfaces. Never use random saturated colors in a footer.** The shell is `bg-static`, every divider is `border-light`, the bottom bar is `bg-weak`. The only color moment is the accent panel below.

- Shell: `<footer className="bg-static">`, inner wrapper `px-layout-sm py-layout-lg`, top-level blocks stacked with `gap-layout-sm`, content capped at a `max-w-*`.
- Column dividers: `<Separator />` between stacked blocks; for VERTICAL dividers between side-by-side columns use `<span aria-hidden className="border-light border-t md:border-t-0 md:border-l" />` inside the grid (the free `Separator` is **horizontal-only**; a Pro seat unlocks `<Separator direction="vertical" />`, which fills its container's height, plus a `dashed` variant).
- Brand row: logo plus a version chip `Badge variant="neutral" appearance="outline" size="xs"`; tagline `text-body-md text-body`.
- Social links: icon-only ghost buttons in a `gap-component-xs` row, never raw `<a>` tags with an svg: `<Button size="md" iconOnly variant="neutral-solid" appearance="ghost" aria-label="GitHub" asChild>` wrapping an `<a target="_blank" rel="noreferrer">` with an `Ri*` icon.
- Bottom bar: `bg-weak px-layout-sm py-section-md`; copyright `text-body-md text-body`; policy links `TextLink variant="neutral" size="sm"`.

Link columns: title `text-body-md text-strongest font-semibold`, then a `gap-component-sm` stack of neutral TextLinks; "soon" / "new" markers are pill badges next to the link, never recolored links:

```tsx
<div className="gap-component-lg flex flex-col">
  <h3 className="text-body-md text-strongest font-semibold">Product</h3>
  <div className="gap-component-sm flex flex-col items-start">
    <TextLink href="/docs" variant="neutral" size="sm" leading={<RiArrowRightSFill />}>
      Documentation
    </TextLink>
    <div className="gap-component-xs flex items-center">
      <TextLink href="/changelog" variant="neutral" size="sm">Changelog</TextLink>
      <Badge variant="primary" appearance="soft" size="sm" shape="pill">Soon</Badge>
    </div>
  </div>
</div>
```

### Accent panel (e.g. newsletter / signup)

A single intentional color block: a primary panel with an inverse-outline eyebrow, `text-white` title, `text-white/70` description. (Same rule as the dark CTA - the panel is a fixed primary color, so its text is raw `text-white`, never `text-static`, which would flip to black under `.dark`.) Use a flat `bg-primary-base` or a primary gradient (tune the stops to taste); the `p-section-*` padding and `rounded-*` are up to the design.

```tsx
<div className="p-section-xl bg-primary-base gap-component-md flex flex-col items-start rounded-xl">
  <Badge variant="inverse" appearance="outline" size="md">YOUR EYEBROW</Badge>
  <h2 className="text-heading-h4 text-white">Your panel headline</h2>
  <p className="text-body-lg text-white/70">A short supporting line.</p>
</div>
```

A signup form is a `Field` (with `invalid` / `loading` bound to submit state) wrapping an `InputGroup` with a leading icon, plus a solid primary submit:

```tsx
<Field size="md" invalid={status === "error"} loading={status === "submitting"}>
  <InputGroup>
    <InputGroupLeadingIcon><RiMailOpenLine /></InputGroupLeadingIcon>
    <InputGroupSlot>
      <InputGroupControl type="email" placeholder="you@example.com" aria-label="Email address" />
    </InputGroupSlot>
  </InputGroup>
</Field>
<Button type="submit" variant="primary" appearance="solid" size="xl">Submit</Button>
```

Keep submit feedback inline and the form mounted: on success render a `FieldDescription` under the input (give it `className="text-white"` on a colored panel - not `text-static`), on error render `FieldError`. Never unmount the form to swap in a success badge or alert.

If the form is the only interactive piece of an otherwise static section, isolate it in its own `"use client"` file and import it; keep the surrounding shell a Server Component. Never hoist `"use client"` over a whole static section for one interactive form.

### Pricing

The billing toggle is a grouped `SegmentedControl` (animated sliding indicator), never a pair of hand-styled buttons. A common setup is `variant="neutral"` at `size="xl"` (`lg` on mobile), controlled:

```tsx
<SegmentedControl appearance="grouped" variant="neutral" size="xl" value={billing} onValueChange={setBilling}>
  <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
  <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
</SegmentedControl>
```

A discount badge rides INSIDE the item as a plain extra child (the item's content slot is already a gapped inline-flex row; no wrapper span, no manual gap classes):

```tsx
<SegmentedControlItem value="yearly">
  Yearly
  <Badge variant="success" appearance="soft" size="sm" shape="pill">-20%</Badge>
</SegmentedControlItem>
```

- Section eyebrow: `Badge variant="primary" appearance="soft" size="md"` above a `text-heading-h2 text-strongest font-medium` heading and a `text-body-lg text-body` lede.
- Section background: a subtle surface gradient (e.g. between two light neutral tokens), not a flat gray.
- Cards: `bg-static` with `shadow-neutral-md`; the highlighted plan gets `shadow-neutral-lg` plus an accent frame (e.g. a primary gradient border).
- Discount treatment: struck-through anchor price next to a soft badge, then the real price large:

```tsx
<div className="gap-component-sm flex items-center">
  <span className="text-heading-h5 text-placeholder font-medium line-through">$XX</span>
  <Badge variant="warning" appearance="soft" size="md">XX% OFF</Badge>
</div>
<span className="text-heading-h2 text-strongest font-semibold">$YY</span>
```

- Feature-list group breaks ride on a Separator with an outline badge (`<Separator align="start"><Badge variant="neutral" appearance="outline" size="sm">SECTION LABEL</Badge></Separator>`); feature rows pair the label with a small soft badge (`appearance="soft" size="sm"`, tones `success` / `verified` / `primary`, optionally `trailing={<RiCheckLine />}`).

---

## Spacing rhythm

Three semantic tiers. They auto-scale across breakpoints, so never prefix them with `md:` / `xl:` (see [styling.md](./styling.md)).

| Tier | Tokens | Scale (px) | Used for |
| --- | --- | --- | --- |
| Component | `gap-component-xs..xl`, `p-component-*` | 4 / 8 / 12 / 16 / 24 | inside one block: CTA button rows (`gap-component-sm`), heading-to-lede stacks (`gap-component-md`, `gap-component-xl`), card internals (`p-component-xl`), footer link lists (`gap-component-sm`) |
| Section | `gap-section-xs..xl`, `p-section-*` | 12 / 16 / 24 / 32 / 48 | between clusters in one section: header cluster to toggle (`gap-section-lg`), plan-card row (`gap-section-sm`), newsletter panel padding (`p-section-xl`), footer grid columns (`gap-section-md`) |
| Layout | `gap-layout-xs..xl`, `p-layout-*` | 32 / 48 / 64 / 96 / 128 | page level: section outer padding (`px-layout-sm py-layout-lg`), gaps between a page's top-level blocks (`gap-layout-sm`) |

Rule of thumb: a rich section is `px-layout-sm py-layout-lg` outside, `gap-section-*` between its clusters, `gap-component-*` inside each cluster. If a Figma spec hands you a static value (e.g. `space-space-4`), use the plain Tailwind class (`gap-4`) instead; semantic spacing is for token-specified spacing.

---

## Richness checklist

No UI should ship bare defaults - exercise each component's axes per SKILL.md "Use the full component API". This applies to all UI; before calling a section done:

- **Switch**: never a bare `<Switch />`. Pick a `variant` (`primary` | `info` | `neutral` | `inverse` | `semantic`) and exercise at least one extra axis: `ioTrigger` (I/O glyphs in the track), `thumbIcon` (check / cross on the thumb), `thumbType="long"`, or `shape="rounded"`.
- **Badge**: choose `appearance` deliberately. `soft` is the workhorse tint (feature tags, discounts), `outline` is the quiet chip (version numbers, eyebrows on dark, COMING SOON), `solid` is for high-priority counts and statuses. Vary `variant` to match meaning and use `shape="pill"` for tag-like chips. **Badges hold a short tag/count/status only (≈1–3 words).** A sentence, footnote, disclaimer, or legal micro-copy is NOT a badge — wrapping it in a pill stretches into an ugly elongated bar and misreads as a control. Render that as muted caption text: `<p className="text-ui-caption-xs text-placeholder">…</p>`.
- **SegmentedControl**: billing / pricing toggles use `appearance="grouped"`; `flat` is for dense app toolbars.
- **Avatar**: use a real color variant (`variant="gradient-blue"`, `"weak-green"`, `"base-indigo"`; pattern `{gradient|strong|base|weak|alpha}-{color}`) with `AvatarText` initials, or an `AvatarImage` plus `AvatarBadge` with `AvatarBadgeStatus variant="online"`. Never an empty gray circle.
- **Button**: exactly one `appearance="solid"` action per section; secondary actions are `soft`, `ghost`, or `outline`. On dark panels both use `variant="inverse-solid"`. `Button` takes no `leading` / `trailing` - compose icons as children and wrap the text in `<ButtonLabel>` (`iconOnly` buttons just take the icon as the child).
- **Links**: inline and footer links are `TextLink` (e.g. `variant="neutral" size="sm"`), not styled `<a>` tags.

---

## Anti-patterns

### Icon as a child inside Badge

**Incorrect:**

```tsx
<Badge variant="success"><RiCheckLine className="size-3" /> Ready</Badge>
```

**Correct:**

```tsx
<Badge variant="success" appearance="soft" size="sm" trailing={<RiCheckLine />}>Ready</Badge>
```

### Hand-rolled tab buttons

**Incorrect:**

```tsx
<div className="flex gap-2 border-b">
  <button className="border-b-2 border-primary-500 px-3 py-2">Preview</button>
  <button className="px-3 py-2">Code</button>
</div>
```

**Correct** (panels swap in place → `Tabs`):

```tsx
<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="code" leading={<RiCodeFill />}>Code</TabsTrigger>
  </TabsList>
  <TabsContent value="preview"><PreviewPanel /></TabsContent>
  <TabsContent value="code"><CodePanel /></TabsContent>
</Tabs>
```

If the tabs instead navigate (routes / in-page sections, no in-place panel), use `TabMenu` + `TabMenuItem` (`asChild` for links) and render the panel yourself keyed by the active value.

### Flat pricing toggle

**Incorrect:**

```tsx
<div className="flex rounded-lg border">
  <button className="bg-primary-500 px-4 py-2 text-white">Monthly</button>
  <button className="px-4 py-2">Yearly</button>
</div>
```

**Correct:**

```tsx
<SegmentedControl appearance="grouped" variant="neutral" size="xl" value={billing} onValueChange={setBilling}>
  <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
  <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
</SegmentedControl>
```

### Bare Switch

**Incorrect:**

```tsx
<Switch />
```

**Correct:**

```tsx
<Switch variant="primary" size="md" ioTrigger defaultChecked />
<Switch variant="neutral" size="md" shape="rounded" thumbIcon />
```

### Badge for a sentence or disclaimer

A Badge is a short tag — a status, count, or 1–3-word label. A full sentence stretches the pill into an ugly elongated bar and reads like a broken control. Footnotes, disclaimers, "results are illustrative" notes, and legal micro-copy are muted caption text (the sanctioned free-standing `text-ui-*` use), not a chip.

**Incorrect:**

```tsx
<Badge variant="neutral" appearance="outline" size="sm" shape="pill">
  Testimonials are illustrative · Verified, consented references shared at launch.
</Badge>
```

**Correct:**

```tsx
<p className="text-ui-caption-xs text-placeholder">
  Testimonials are illustrative · Verified, consented references shared at launch.
</p>
```

### Raw palette colors in the footer

**Incorrect:**

```tsx
<footer className="bg-slate-900">
  <h3 className="text-indigo-400">Products</h3>
  <a className="text-blue-500 hover:text-blue-400" href="/docs">Docs</a>
</footer>
```

**Correct:**

```tsx
<footer className="bg-static">
  <h3 className="text-body-md text-strongest font-semibold">Products</h3>
  <TextLink href="/docs" variant="neutral" size="sm">Docs</TextLink>
</footer>
```

When unsure, adapt a pattern from this file as a starting point (to the user's brand), or fetch a real implementation to study: `get_item_examples_from_registries` over MCP, or `npx @create-ui/cli view <name>`.
