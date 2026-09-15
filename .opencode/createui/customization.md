# Customization & Theming

Create UI is **one styling system with many themes**. Components reference semantic CSS variable tokens; change the tokens (or swap the theme) and every component follows. Values are **HEX**, never OKLCH.

## Contents

- How it works (CSS variables → Tailwind utilities → components)
- Token families (surfaces, text, primary scale, status, shadows, focus, radius)
- Token name map (for migrants from other libraries)
- Semantic spacing & typography tokens
- Theming (primary themes, neutral themes, font variants)
- Dark mode setup
- Adding a custom color / changing radius
- Customizing components (props, className, variants, wrappers)
- Checking for updates

---

## How It Works

1. CSS variables are defined in `:root` (light) and overridden under `.dark` (dark mode), as **HEX** values.
2. Tailwind v4 auto-generates utilities from those `--color-*` / `--spacing-*` / `--radius-*` variables (`bg-weakest`, `text-body`, `gap-component-sm`, …).
3. Components consume those utilities - change a variable, or swap the active theme, and every component that references it updates.

There is no OKLCH, no `--primary`/`--muted` convention, and no parallel style/base stack. One system, layered themes.

---

## Token Families

Create UI uses **semantic** token names. Backgrounds, borders, and text share a weak→strong scale; status colors and the primary scale have their own families.

### Surfaces

| Utility | Purpose |
| --- | --- |
| `bg-weakest` … `bg-strongest` | Neutral surface scale (`weakest`, `weak`, `light`, `medium`, `heavy`, `strong`, `strongest`) |
| `bg-static` | Page/card surface that swaps with theme (white in light, black in dark) |
| `bg-static-white` / `bg-static-black` | Theme-relative anchors that SWAP: `static-white` = white (light) / black (dark), `static-black` the inverse. For a surface that never swaps, use raw `bg-white` / `bg-black`. |
| `border-weakest` … `border-strongest` | Border scale (use `border-light` / `border-medium` for inputs and dividers) |

### Text

| Utility | Purpose |
| --- | --- |
| `text-body` | Default body text |
| `text-placeholder` | Hints, secondary, muted text |
| `text-disabled` | Disabled text |
| `text-strongest` | High-contrast headings |
| `text-static` / `text-static-white` | Theme-relative text anchors that SWAP (white in light, black in dark). For always-white text on a colored surface use raw `text-white`; for light text in a `dark` island use `text-strongest` / `text-body`. |

### Primary scale

The **semantic primary tokens swap with the theme** like everything else - `primary-weakest` / `weak` / `base` / `strong` / `strongest` (`bg-primary-base`, `text-primary-base`, `border-primary-strong`). Use these: each resolves to a *different* ramp step in dark vs light (`primary-base` = `primary-500` in light but `primary-400` in dark), so it stays legible in both modes. The raw numeric ramp `primary-50` … `primary-950` is the **fixed brand palette** those tokens point at - it does not swap, so don't apply it directly (`bg-primary-500` is a raw color, like `bg-blue-500`). For tints prefer the swapping `primary-weakest` / `weak` over raw `primary-alpha-*`; `outline-primary-500/700` focus is a fixed-ramp helper primitives already wire up.

### Status families

Each of `error`, `success`, `warning`, `info`, and `away` has a `-base` plus a `-weakest` … `-strongest` scale, e.g. `bg-error-base`, `text-error-base`, `outline-error-strongest`, `bg-success-base`, `bg-info-base`, `bg-away-base` (`away` backs the `variant="away"` of `Toast` / `InlineAlert` / `StatusBadge`). **Prefer the semantic status tokens** in your own code. The shipped Button implements its danger/success variants with the raw `red-*` / `green-*` scales (e.g. `bg-red-600`, `bg-red-alpha-16`) - that is the implementation detail, not a pattern you need to copy.

### Shadows

Neutral elevation: `shadow-neutral-{2xs,xs,sm,md,lg,…}`. Component state shadows: `shadow-component-{primary,neutral,error,success,info,inverted}-{default,hover,focused}`. Text shadows: `text-shadow-{2xs,xs,…}`.

### Focus

Focus is an **outline**, never a ring. The pattern is a transparent base outline that becomes visible on focus:

```tsx
"outline-2 outline-transparent focus-visible:outline-primary-700"
```

Use `outline-primary-700` (or `outline-strongest` / `outline-strong`) for focus. Never use `ring-*`.

### Radius

`--radius-none/xs/sm/md/lg/xl/2xl/3xl/4xl/5xl/full` back the `rounded-sm`/`rounded-md`/`rounded-lg`/`rounded-xl`/`rounded-2xl` utilities. Radius is set per component (e.g. Button maps each size to a radius via compound variants).

---

## Token Name Map

If you are porting markup written against common component-library token names, translate them:

| Common token | Create UI |
| --- | --- |
| `bg-background` | `bg-static` |
| `bg-card` | `bg-static` (or `bg-weakest` for subtle surfaces) |
| `text-foreground` | `text-body` |
| `text-muted-foreground` | `text-placeholder` |
| `bg-primary` | `bg-primary-base` (swaps; not `bg-primary-500`, which is fixed) |
| `text-primary-foreground` | `text-white` (on solid primary) |
| `border-border` / `border-input` | `border-light` or `border-medium` |
| `bg-muted` | `bg-weak` |
| `bg-destructive` | `bg-error-base` |
| `text-destructive` | `text-error-base` |
| `bg-accent` | `bg-primary-weakest` (swaps; the raw `primary-alpha-16` does not) |
| `ring-ring` (focus) | `outline-primary-700` (primary) / `outline-strong` (neutral) |

---

## Semantic Spacing & Typography Tokens

Tailwind v4 also auto-generates spacing and typography utilities from `--spacing-*` and the typography tokens. These **mirror Figma's semantic variables**.

### Spacing

| Family | Utilities |
| --- | --- |
| component | `gap-component-none`, `gap-component-xs`, `gap-component-sm`, `p-component-md`, `gap-component-lg`, `p-component-xl`, `px-component-none` |
| section | `gap-section-xs` … `gap-section-xl`, `p-section-*` (between clusters inside one section) |
| layout | `gap-layout-xs`, `p-layout-sm`, `gap-layout-md`, `p-layout-lg`, `p-layout-xl` |

**Figma-token rule:** use a semantic spacing class **only when Figma references a semantic token** (e.g. `var(--component/sm,8px)` → `gap-component-sm`). When Figma shows a static value (`space-space-4`), use the standard Tailwind class (`gap-4`). Prefer `px-component-none` over `px-0` when it is an intentional "no padding" override of a token.

### Typography

`text-display-{lg,xl}`, `text-heading-h1` … `text-heading-h6`, `text-body-{xs,sm,md,lg,xl}`, `text-paragraph-{xs…xl}`, `text-ui-{xs,sm,md,lg,xl}`, `text-ui-overline-*`, `text-ui-caption-*`, `text-numeric-{xs…xl}`.

Spacing and typography tokens **auto-scale across breakpoints** - never add `md:` / `xl:` prefixes to `gap-component-sm`, `text-heading-h2`, and the like.

---

## Theming

One system, many themes. A theme is a swappable **token set** (a `registry:theme` item carrying a `primary` 50…950 palette), layered on the single foundation - it is not a style/base split and not a preset color.

- **Primary themes (8):** `indigo` (default), `blue`, `lime`, `green`, `red`, `orange`, `yellow`, `cyan`
- **Neutral themes (5):** `zinc` (default), `gray`, `slate`, `base`, `stone`
- **Font variants (5):** `v1` (default; Geist + Geist Mono), `v2` (Inter + IBM Plex Mono), `v3` (Poppins + DM Mono), `v4` (Space Grotesk + Noto Sans + JetBrains Mono), `v5` (Sora + Source Sans 3 + Roboto Mono)

Pick a theme at init, interactively or via flags:

```bash
npx @create-ui/cli init --theme blue --neutral slate --font-variant v1
```

`init` applies the choice by adding the matching registry items (`theme-<primary>`, `neutral-<neutral>`, `font-variant-<v>`). There is **no `apply` command** and **no preset codes** - to change theme later, re-run `init` with new flags (or, for an advanced hand-tweak, edit the token variables in your global CSS).

> **Behavioral rule for agents:** the theme is ALREADY chosen by the time you build UI. Do **not** treat the brand color as an open design question: never ask the user "what theme/color", never offer a color palette, never invent a color (the 8 names above are the whole set - there is no `violet`/`purple`/etc.), and never rewrite the `--color-primary-*` token values to "apply" a look. Just use `bg-primary-base` / `text-primary-base` / `border-primary-*` and the chosen theme renders automatically. Only touch the theme when the user **explicitly** asks to change the whole project's theme - and then prefer re-running `init --theme <name>` over hand-editing hex.
>
> The same applies to the font: never ask the user which font to use, never import a different Google Font, and never fall back to generic Tailwind utilities like `font-sans` / `font-serif` / `font-mono` - they aren't part of this token system. Typography tokens already carry the right family automatically; reach for `font-display` / `font-body` / `font-numeric` directly only for text that isn't already using one. Only touch the font variant when the user **explicitly** asks - then prefer re-running `init --font-variant <name>` over hand-editing font imports.

---

## Dark Mode

Toggle the `.dark` class on the root element; tokens swap automatically. In Next.js, use `next-themes`:

```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

Because every color is a token that already has a `.dark` override, **never write manual `dark:` color overrides** on components - let the tokens do the work.

> **`static` is theme-relative, not absolute.** `static` / `static-white` / `static-black` (and their `-alpha` variants) FLIP under `.dark` - e.g. `text-static-white` is white in light but **black in dark**; `static-black` is the inverse. They are surface anchors, not "always white/black." For a color that is fixed across themes (white text on a primary/colored surface, a brand mark) use the raw `white` / `black` palette. For light text inside an always-`dark` island, use `text-strongest` / `text-body` / `text-placeholder` (which resolve light under `.dark`), never `text-static` / `text-static-white`.

---

## Adding a Custom Color / Changing Radius

Edit the project's global CSS file - the `tailwind.css` path reported by `createui info` (typically `app/globals.css`). **Never create a new CSS file** for this.

Match how the system works: **a color is a semantic token with both a light and a dark value**, so it swaps with the theme like every built-in token. Define the pair in `:root` and `.dark`, then use the semantic name - not a raw step that only exists in one mode:

```css
/* app/globals.css */
:root {
  --color-brand-base: #2f7bff; /* light */
  --color-brand-weak: #eef6ff;
  --radius-lg: 0.75rem; /* radius is a single value - no theme swap needed */
}

.dark {
  --color-brand-base: #5a96ff; /* dark - keeps contrast */
  --color-brand-weak: #16243a;
}
```

Tailwind v4 auto-generates `bg-brand-base`, `text-brand-base`, `bg-brand-weak`, … and they swap under `.dark` automatically:

```tsx
<div className="bg-brand-weak text-brand-base">Brand surface</div>
```

A single `:root` scale with no `.dark` pair is only for a color that must stay fixed across themes (e.g. a logo color) - it will NOT dark-adapt, so never use it for surfaces or text that appear in both modes.

To restyle existing components, prefer **overriding the semantic token families** - redefine the light *and* dark values of `primary-*` or a status family - over adding new colors; every component already references them. (No build step - editing the CSS is the whole change.)

---

## Customizing Components

See also: [rules/styling.md](./rules/styling.md) for Incorrect/Correct examples.

Prefer these approaches, in order.

### 1. Built-in props

Reach for the component's own API first. For example, `Button` exposes `variant`, `appearance`, `size`, `shape`, `loading`, `iconOnly`, and `asChild` (icons compose as children with `ButtonLabel`):

```tsx
import { Button } from "@/components/ui/button"

<Button appearance="outline" size="sm">Save</Button>
<Button variant="danger">Delete</Button>
<Button loading>Saving…</Button>
```

### 2. Tailwind classes via `className`

Use `className` for layout and spacing, not for re-coloring the variant:

```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

<Button className={cn("w-full")}>Continue</Button>
```

### 3. Add a CVA variant in the source

If you need a new look, add it to the component's `cva` config in the source, using real Create UI tokens:

```tsx
// components/ui/button.tsx - add to the buttonVariants config
warning: "bg-warning-base text-white hover:bg-warning-strong",
```

### 4. Wrapper components

Compose Create UI primitives into higher-level components. Verify each primitive's props (`Button` has `variant="danger"`, not `variant="destructive"`):

```tsx
"use client"

import { RiLogoutBoxLine, RiSettingsLine, RiUserLine } from "@create-ui/assets/icons"
import { Avatar, AvatarImage, AvatarText } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/ui/dropdown-menu"

export function UserMenu({ name, avatarSrc, onSignOut, children }) {
  return (
    <Dropdown>
      {/* The trigger is simply the first non-Popover child - no asChild. */}
      <Button
        appearance="ghost"
        variant="neutral-solid"
        shape="pill"
        iconOnly
        aria-label="Open account menu"
      >
        <Avatar>
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarText>{name.slice(0, 2)}</AvatarText>
        </Avatar>
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label="Account"
          onAction={(key) => {
            if (key === "sign-out") onSignOut()
          }}
        >
          <Dropdown.Item id="profile" leading={<RiUserLine />}>
            Profile
          </Dropdown.Item>
          <Dropdown.Item id="settings" leading={<RiSettingsLine />}>
            Settings
          </Dropdown.Item>
          {children}
          <Dropdown.Separator />
          <Dropdown.Item id="sign-out" leading={<RiLogoutBoxLine />}>
            Sign out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
```

`Dropdown` is React Aria Components: the trigger is the first non-`Popover` child (there is no `DropdownMenuTrigger` / `asChild`), item media goes through `leading` (never as a child beside the text), rows are keyed by `id` and handled with `onAction` on `Dropdown.Menu`, and placement is `placement="bottom end"` (not `align`).

---

## Checking for Updates

To see which installed components differ from the registry, use the `diff` command:

```bash
# List components that have updates available.
npx @create-ui/cli diff

# Show what changed upstream for one component.
npx @create-ui/cli diff button
```

When you re-add a component, pass `--overwrite` to replace local files:

```bash
npx @create-ui/cli add button --overwrite
```

See the update workflow under [CLI quick reference in SKILL.md](./SKILL.md#cli-quick-reference) (prefer `diff`, and `add --overwrite` only with explicit approval).
