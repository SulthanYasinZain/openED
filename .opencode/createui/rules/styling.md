# Styling & tokens

Create UI ships one unified styling system driven by semantic design tokens. Style with those tokens and each component's built-in props - never reach for raw Tailwind colors or hand-rolled class overrides.

See [customization.md](../customization.md) for theming, CSS variables, and adding custom colors.

## Contents

- Semantic color tokens
- Status & state colors
- Built-in props first
- className for layout only
- Typography tokens
- Semantic spacing tokens
- No space-x-* / space-y-*
- Prefer size-* over w-* h-* when equal
- Loading placeholders reuse the loaded layout
- Prefer truncate shorthand
- No manual dark: color overrides
- Use cn() for conditional classes
- Focus uses outline-*, never ring-*
- No manual z-index on overlay components

---

## Semantic color tokens

Create UI's tokens are HEX-backed CSS variables that swap automatically between light and dark via the `.dark` class. Use the semantic token names - never raw palette colors and never invented utility names.

- Surfaces (weak → strong): `bg-weakest`, `bg-weak`, `bg-light`, `bg-medium`, `bg-heavy`, `bg-strong`, `bg-strongest`. Theme-swapping page/card surface: `bg-static`.
- Text: `text-body` (primary), `text-placeholder` (hints/secondary), `text-disabled`, `text-strongest` (high-contrast). **`text-static` / `text-static-white` are theme-RELATIVE and flip to black under `.dark`** - they are NOT "always white" (see "static tokens are theme-relative" below). The only never-swap text is the raw `text-white` / `text-black` palette.
- Borders: `border-weakest` … `border-strongest` (commonly `border-light` / `border-medium`).
- Primary (brand) - use the **semantic, theme-swapping** tokens `bg-primary-base` / `text-primary-base` / `bg-primary-weak` / `border-primary-strong`; each resolves to a different ramp step in dark vs light (`primary-base` is `primary-500` in light, `primary-400` in dark), so it stays legible in both. The raw numeric ramp (`bg-primary-500`) and `primary-alpha-*` are **fixed** - they don't swap, so treat `bg-primary-500` like `bg-blue-500` and keep it out of your markup. **`primary` IS the project's brand color**, chosen once at `init` (indigo / blue / lime / green / red / orange / yellow / cyan) and baked into these tokens: just use them; never ask for a brand color, invent one, or hand-edit the token hex to re-theme. A different theme is `createui init --theme <name>`, not a CSS edit.

**Incorrect:**

```tsx
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Secondary text</p>
</div>
```

**Correct:**

```tsx
<div className="bg-static text-body">
  <p className="text-placeholder">Secondary text</p>
</div>
```

Quick translation from generic utility names to Create UI tokens:

| Generic intent | Create UI token |
| --- | --- |
| page / card surface | `bg-static` (or `bg-weakest` for subtle surfaces) |
| primary text | `text-body` |
| secondary / muted text | `text-placeholder` |
| primary accent fill | `bg-primary-base` (swaps dark/light; not raw `bg-primary-500`) |
| text on a solid primary fill | `text-white` |
| default border | `border-light` or `border-medium` |
| subtle / muted fill | `bg-weak` |
| accent tint background | `bg-primary-alpha-16` |

### The page root must carry a theme surface

Set a theme-swapping surface + text on `<body>` (or the top-level page wrapper): **`bg-static text-body`**. Without it, text tokens still flip light under `.dark` while the background stays white, so every screen with no explicit surface goes light-text-on-white = invisible. This is the most common "dark mode is broken" cause. Build light-first if you like, but pick swapping tokens so dark degrades gracefully — don't bolt it on later.

```tsx
// Incorrect - no surface on the root; text flips light under .dark but bg stays white
<body className="min-h-full flex flex-col">{children}</body>

// Correct
<body className="min-h-full flex flex-col bg-static text-body">{children}</body>
```

Reserve fixed colors (`bg-[#…]` + raw `text-white` + `bg-white/x`) ONLY for intentionally-always-dark panels (a premium hero/CTA island inside a light page); every other surface uses semantic tokens so it swaps.

### Text color is its own ramp — don't use surface-ramp names as `text-*`

The ramp names `weakest` · `weak` · `light` · `medium` · `heavy` · `strong` are **surface/border tokens** (`bg-*` / `border-*`). The generated token list in SKILL.md shows the whole scale under one "Surfaces & text" line, but that does **not** make `text-medium` / `text-weak` / `text-light` valid copy colors — as `text-*` they render as washed-out mid-grays that look too pale on light surfaces. Readable text uses the dedicated **text ramp**, only:

| Role | Token |
| --- | --- |
| Body / paragraph / list / benefit copy | `text-body` |
| Headings & high-contrast emphasis | `text-strongest` |
| Hints, captions, secondary | `text-placeholder` |
| Disabled | `text-disabled` |

`strongest` is the one ramp name that doubles as a sanctioned text token; `body` / `placeholder` / `disabled` are text-only. **Default for any sentence the user reads is `text-body`** — never reach for `text-medium`/`text-weak`/`text-light`/`text-heavy` to make copy "a bit lighter."

**Incorrect:**

```tsx
<li className="text-body-md text-medium">Rol bazlı erişim (RBAC)</li>
```

**Correct:**

```tsx
<li className="text-body-md text-body">Rol bazlı erişim (RBAC)</li>
```

---

## Status & state colors

Each status family (`error`, `success`, `warning`, `info`, `away`) exposes `-weakest` … `-strongest` plus `-base`. Prefer these semantic tokens - or a `StatusBadge` - for positive, negative, and informational indicators.

**Incorrect:**

```tsx
<span className="text-emerald-600">Active</span>
<span className="text-red-700">Payment failed</span>
```

**Correct:**

```tsx
<span className="text-success-base">Active</span>
<span className="text-error-base">Payment failed</span>
```

Create UI's own `Button` implements its `danger` / `success` variants with the raw red/green scales (`bg-red-600`, `bg-green-600`, `bg-red-alpha-16`), so those scales are acceptable for status work - but prefer the semantic token (`text-error-base`, `bg-success-base`) unless you are intentionally matching that variant's exact look. For full status affordances, reach for `StatusBadge` rather than styling a raw `<span>`.

---

## Built-in props first

Every primitive exposes its full visual range through typed props. Drive appearance through those props, not through manual `border` / `bg` / `hover:` class overrides.

`Button` has four styling axes (verify any other component's props from its installed source under the project's `ui` alias - e.g. `components/ui/<name>.tsx` - or with `npx @create-ui/cli view <name>`):

- `variant`: `primary` (default), `neutral-solid`, `neutral-light`, `danger`, `success`, `inverse-solid`, `inverse-light`
- `appearance`: `solid` (default), `outline`, `ghost`, `soft`
- `size`: `xs`, `sm`, `md`, `lg` (default), `xl`
- `shape`: `rounded` (default), `pill`, `square`

For `Button` and the other color-intent components (Badge, Chip, ...) there is no `variant="outline"` / `variant="destructive"` / `variant="secondary"`: an outline style is `appearance="outline"`, a destructive button is `variant="danger"`, a ghost button is `appearance="ghost"`. A few components do repurpose `variant` (e.g. `input-otp` uses `variant="outline"|"filled"`; `tabs` / `tab-menu` use it for layout), so always confirm the axis from the component's own reference.

**Incorrect:**

```tsx
<Button className="border border-medium bg-transparent hover:bg-weak">
  Click me
</Button>
```

**Correct:**

```tsx
<Button appearance="outline">Click me</Button>
```

`Button` also has a real `loading` prop - it renders a `Spinner` and blocks interaction automatically. Don't hand-compose a spinner.

**Incorrect:**

```tsx
<Button disabled>
  <Spinner /> Saving…
</Button>
```

**Correct:**

```tsx
<Button loading>Saving…</Button>
```

---

## className for layout only

Use `className` for layout (e.g. `max-w-md`, `mx-auto`, `mt-4`), **not** for overriding component colors or typography. To change appearance, prefer these in order:

1. **Built-in props** - `appearance="outline"`, `variant="danger"`, `size="sm"`, etc.
2. **Semantic tokens** - `bg-static`, `text-placeholder`, `bg-primary-base`.
3. **CSS variables** - define or override `--color-*` in the project's global CSS file (see [customization.md](../customization.md)).

**Incorrect:**

```tsx
<Input className="bg-sky-100 text-sky-900 font-bold" placeholder="Search…" />
```

**Correct:**

```tsx
<Input className="mx-auto max-w-md" placeholder="Search…" />
```

---

## Typography tokens

Free-standing text uses the Create UI type scale, not Tailwind's default sizes. Each token sets size, line-height, letter-spacing, and weight together:

- Headings: `text-heading-h1` … `text-heading-h6` (pair with a color token like `text-strongest` and adjust `font-*` only when the design calls for it).
- Body and captions: `text-body-xs` … `text-body-xl`.
- Long-form prose: `text-paragraph-*` (same size steps).
- Oversized display text: `text-display-lg` / `text-display-xl`.
- Control-adjacent text (inside components): `text-ui-*` - components set these themselves; don't add them manually. The one sanctioned free-standing use is the marketing overline / micro-caption pattern (`text-ui-overline-xs uppercase`, see rules/design.md).

**Incorrect:** `<h2 className="text-2xl font-bold">` · **Correct:** `<h2 className="text-heading-h4 text-strongest font-semibold">`

These tokens auto-scale across breakpoints like the spacing tokens - never add `md:` / `xl:` prefixes to them.

### Font family is automatic - never `font-sans`

Typography tokens already carry the right font family: `text-heading-*` / `text-display-*` → `font-display`, `text-body-*` / `text-paragraph-*` / `text-ui-*` → `font-body`, `text-numeric-*` / `text-code-*` → `font-numeric`. The only font-family utilities in this system are `font-display`, `font-body`, `font-numeric` - reach for one directly only when styling text that isn't already wearing a typography token (e.g. a `ButtonLabel`, a raw `<span>`). There is no `font-sans`, `font-serif`, or generic `font-mono` here - those are shadcn/Tailwind defaults this system doesn't use, and the actual families were chosen once at `init --font-variant <name>`.

**Incorrect:**

```tsx
<h2 className="text-heading-h4 font-sans font-bold">Title</h2>
```

**Correct:**

```tsx
<h2 className="text-heading-h4 text-strongest font-semibold">Title</h2>
```

---

## Semantic spacing tokens

Create UI mirrors Figma's spacing variables as Tailwind utilities: `gap-component-sm` (8px), `p-component-md` (12px), `gap-component-lg` (16px), `gap-layout-md` (64px), `p-layout-sm` (48px), and so on.

Use a semantic spacing class **only when Figma references that semantic token** (e.g. `var(--component/sm,8px)` → `gap-component-sm`). When Figma shows a static value (e.g. `space-space-4`), use the standard Tailwind class (`gap-4`). These tokens rescale across themes/breakpoints, so don't apply them where a fixed gap is intended, and never add `md:` / `xl:` prefixes to them - they auto-scale.

Prefer `px-component-none` over `px-0` when it is an intentional "no horizontal padding" override of a token, to keep the intent explicit.

---

## No space-x-* / space-y-*

Use `gap-*` instead. `space-y-4` → `flex flex-col gap-4`; `space-x-2` → `flex gap-2`.

```tsx
<div className="flex flex-col gap-4">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

---

## Prefer size-* over w-* h-* when equal

`size-10` not `w-10 h-10`. Applies to icons, avatars, skeletons, etc.

---

## Loading placeholders reuse the loaded layout

A loading/pending state must render the same shell as the loaded content: same padding and gaps, with one token-sized stand-in per line (e.g. a `bg-weak h-5 w-24 rounded` bar where `text-body-sm` text will go) - never a hard-coded pixel height like `min-h-[140px]` around a centered `Spinner`. Typography and spacing tokens auto-scale at the 1279px/767px breakpoints (`--text-heading-h3` is 36 → 32 → 24px), so any fixed px approximation is wrong at some breakpoint and the layout jumps when data arrives.

---

## Prefer truncate shorthand

`truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`.

---

## No manual dark: color overrides

Semantic tokens already swap with the `.dark` class - don't write parallel `dark:` color utilities.

**Incorrect:**

```tsx
<div className="bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-50">
```

**Correct:**

```tsx
<div className="bg-static text-body">
```

**`static` tokens are theme-relative, not absolute.** `bg-static` / `text-static` / `static-white` / `static-black` (and their `-alpha` variants) all FLIP under `.dark`: `static-white` is white in light but **black in dark**, `static` white → black, `static-black` the inverse. They are surface anchors, NOT "always white/black." Practical rule:

- Text or icon that must stay **white on a colored surface** (a `bg-primary-base` tile, a gradient, a brand mark) → raw `text-white` (the only never-swap white).
- Light primary text inside an always-`dark` island (a panel with the `dark` class) → `text-strongest` / `text-body` / `text-placeholder`; these resolve light under `.dark`. **Never** `text-static` / `text-static-white` there - they go black.

```tsx
// Incorrect - black text under .dark (dark island or colored tile)
<div className="dark ..."><h2 className="text-static-white">Title</h2></div>
<span className="bg-primary-base text-static-white">CU</span>

// Correct
<div className="dark ..."><h2 className="text-strongest">Title</h2></div>
<span className="bg-primary-base text-white">CU</span>
```

---

## Use cn() for conditional classes

Use `cn()` for conditional or merged class names instead of template-string ternaries. Import it from `@/lib/utils` (the project's `utils` alias).

**Incorrect:**

```tsx
<div className={`flex items-center ${isActive ? "bg-primary-alpha-16 text-primary-base" : "bg-weak"}`}>
```

**Correct:**

```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center", isActive ? "bg-primary-alpha-16 text-primary-base" : "bg-weak")}>
```

---

## Focus uses outline-*, never ring-*

Create UI focus styling is built on `outline`, not `ring`. The base is `outline-2 outline-transparent`, and the visible focus state is an `outline` color.

**Incorrect:**

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-primary-500">
```

**Correct:**

```tsx
<button className="outline-2 outline-transparent focus-visible:outline-primary-700">
```

Use `outline-primary-700` (or `outline-primary-500`) for primary controls and `outline-strong` / `outline-strongest` for neutral ones. Primitives already wire this up - you rarely need to set it yourself.

---

## No manual z-index on overlay components

`DropdownMenu`, `Tooltip`, `InfoTooltip` (and Pro `Modal` / `Popover`) manage their own stacking. Never add `z-50` or `z-[999]`.
