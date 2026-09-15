# Component Composition

How Create UI components fit together. Compose primitives - never reroll a `<select>`, a custom callout, or a hand-styled loading button when a component already exists. Every component name below is in the `@createui` registry; add any of them with `npx @create-ui/cli add <name>`.

## Contents

- Items always inside their Group component
- Callouts use InlineAlert
- Toasts use the Toast component
- Choosing between overlay components
- Tables, cards, and other absent primitives
- Button has a `loading` prop - never hand-build a spinner button
- Tabbed navigation uses TabMenu
- Avatar composition (AvatarText, not AvatarFallback)
- Use existing components instead of custom markup
- Sizing across adjacent components
- The client boundary: what can cross it

---

## Items always inside their Group component

Never render menu/list items directly inside the content container - always wrap them in the matching `*Group`.

**Incorrect:**

```tsx
<SelectContent>
  <SelectItem value="apple">Apple</SelectItem>
  <SelectItem value="banana">Banana</SelectItem>
</SelectContent>
```

**Correct:**

```tsx
<SelectContent>
  <SelectGroup>
    <SelectLabel>Fruit</SelectLabel>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectGroup>
</SelectContent>
```

This applies to every group-based component:

| Item | Group | Requirement |
|------|-------|-------------|
| `SelectItem`, `SelectLabel` | `SelectGroup` | Structural - always wrap |
| `CommandItem` | `CommandGroup` | Structural - always wrap |
| `Dropdown.Item` | `Dropdown.Menu` | Structural - always wrap (inside `Dropdown.Popover`). `Dropdown.Section` (Pro) adds optional semantic grouping with `Dropdown.Header` / `Dropdown.Separator` |

---

## Callouts use InlineAlert

Use `InlineAlert` for callouts. Don't hand-roll a styled `<div>` - and don't look for a shadcn-style generic alert (or a page-banner) component; `InlineAlert` is the callout primitive.

**Incorrect:**

```tsx
<div className="rounded-lg border bg-error-weak p-4">
  <p className="font-medium">Payment failed</p>
  <p>Update your card to continue.</p>
</div>
```

**Correct:**

```tsx
import { RiErrorWarningFill } from "@create-ui/assets/icons"
import { Button } from "@/components/ui/button"
import {
  InlineAlert,
  InlineAlertActions,
  InlineAlertContent,
  InlineAlertDescription,
  InlineAlertHeading,
  InlineAlertIcon,
  InlineAlertTitle,
} from "@/components/ui/inline-alert"

<InlineAlert variant="danger">
  <InlineAlertIcon>
    <RiErrorWarningFill />
  </InlineAlertIcon>
  <InlineAlertContent>
    <InlineAlertHeading>
      <InlineAlertTitle>Payment failed</InlineAlertTitle>
      <InlineAlertDescription>Update your card to continue.</InlineAlertDescription>
    </InlineAlertHeading>
    <InlineAlertActions>
      <Button variant="danger" size="md">Update card</Button>
    </InlineAlertActions>
  </InlineAlertContent>
</InlineAlert>
```

`InlineAlert` takes `variant` (`primary` | `neutral` | `danger` | `success` | `warning` | `info` | `away`) and `appearance` (`default` | `solid` | `soft` | `outline`). For a dismissible callout, add `<InlineAlertClose />` as a direct child and handle `onDismiss` on the root. For a full-width page banner, place an `InlineAlert` in a full-width container - there is no separate banner component.

---

## Toasts use the Toast component

Toasts are the registry's own `toast` component - **not `sonner`**. There is no `toast()` function to import; compose the `Toast` parts and render it from your notification state.

**Incorrect:**

```tsx
import { toast } from "sonner"

toast.success("Draft saved.")
```

**Correct:**

```tsx
import { RiCheckboxCircleFill } from "@create-ui/assets/icons"
import {
  Toast,
  ToastAction,
  ToastBody,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastTitle,
} from "@/components/ui/toast"

<Toast variant="success" appearance="solid">
  <ToastBody>
    <ToastIcon>
      <RiCheckboxCircleFill />
    </ToastIcon>
    <ToastContent>
      <ToastTitle>Draft saved</ToastTitle>
      <ToastDescription>Your changes are synced to the cloud.</ToastDescription>
    </ToastContent>
  </ToastBody>
  <ToastAction>Undo</ToastAction>
</Toast>
```

`Toast` takes `variant` (`primary` | `neutral` | `danger` | `success` | `warning` | `info` | `away`) and `appearance` (`solid` | `soft` | `outline` | `default`), plus an `onDismiss` callback. Add `<ToastClose />` for an explicit close affordance and `<ToastProgress />` for an auto-dismiss countdown bar.

There is no provider, queue, or stacking system - you own the notification state and placement: keep an array in state and `.map()` it into a fixed container (`<div className="fixed right-4 bottom-4 flex flex-col gap-2">`), each `Toast` wiring `onDismiss` to drop its id from the array.

---

## Choosing between overlay components

Pick the overlay that matches the interaction - these are the overlays that exist.

| Use case | Component |
|----------|-----------|
| Short hint on hover | `Tooltip` |
| "What is this?" helper next to a label | `InfoTooltip` |
| Action menu on a trigger | `DropdownMenu` |
| Blocking dialog / modal / focused task | `Modal` *(Pro - needs a developer seat)* |
| Anchored floating panel on a trigger | `Popover` *(Pro - needs a developer seat)* |

At the **free tier** there is no dialog, modal, popover, sheet, drawer, alert-dialog, command-palette, or hover-card component. **`Modal` and `Popover` exist only as Pro components** (a developer seat is required; `add modal` returns 401 without one), so confirm their API with `get_component_reference('modal')` / `('popover')` first. `Modal` is Create UI's equivalent of a shadcn `Dialog` / `AlertDialog` - a blocking, focus-trapping overlay (a dialog surface, **not** a command palette). When a seat isn't available, don't invent a lookalike from raw markup - surface the flow inline (an expanding section, a dedicated route, or an `InlineAlert` confirmation) or ask the user before hand-rolling an overlay.

---

## Tables, cards, and other absent primitives

`Card`, `Table`, `Skeleton`, `Sheet`, and `Drawer` have **no primitive at any tier**. Don't fake them with styled-`<div>` soup - build from a semantic surface (`bg-static` / `bg-weak`, `border-light`, an elevation shadow, type tokens) and put primitives in the content (`Badge` for status, `Button` / `DropdownMenu` for actions). Raw palette colors and hex never appear.

A **sidebar** and an **alert banner** do ship - `sidebar` and `alert-banner` are Pro components (a developer seat). Reach for those instead of hand-rolling; check them with `get_component_reference('sidebar')` / `('alert-banner')`.

- **Card** = a surface: `<div className="bg-static border-light shadow-neutral-sm rounded-xl border p-6">` with `text-heading-*` / `text-body-*` inside.
- **Skeleton** = reuse the loaded layout with token-sized `bg-weak` bars per line (see [styling.md](./styling.md) "Loading placeholders"), never a `Spinner` in a fixed-height box.
- **Empty state** = the same surface, centered, `text-placeholder` copy + one primary `Button` - not a bare "No data" string.

**Table** - a real semantic `<table>`: a `bg-weak` header with caption-scale labels, `border-light` row separators, and primitives in the cells:

```tsx
<div className="border-light overflow-hidden rounded-lg border">
  <table className="w-full border-collapse text-left">
    <thead className="bg-weak">
      <tr>
        <th className="text-ui-caption-md text-placeholder px-4 py-2 font-medium">Name</th>
        <th className="text-ui-caption-md text-placeholder px-4 py-2 font-medium">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-light border-t">
        <td className="text-body-sm text-body px-4 py-3">Ada Lovelace</td>
        <td className="px-4 py-3"><Badge variant="success" appearance="soft" size="sm">Active</Badge></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Button has a `loading` prop - never hand-build a spinner button

`Button` ships a real `loading` prop. It renders the `Spinner` and disables interaction for you - do not compose a `Spinner` + `disabled` button by hand.

**Incorrect:**

```tsx
<Button disabled>
  <Spinner />
  Saving…
</Button>
```

**Correct:**

```tsx
<Button loading>Saving…</Button>
```

For icon composition (`Button` takes no `leading` / `trailing` - compose as children with `ButtonLabel`) see [SKILL.md "Icons"](../SKILL.md#icons) and [icons.md](./icons.md).

For icons, compose them as children and wrap the text in `<ButtonLabel>` (`Button` takes no `leading` / `trailing`); use `iconOnly` for an icon-only button. Don't add sizing classes to the icon - the component sizes it per `size`.

```tsx
import { RiSearchLine } from "@create-ui/assets/icons"

<Button>
  <RiSearchLine />
  <ButtonLabel>Search</ButtonLabel>
</Button>
<Button iconOnly aria-label="Search">
  <RiSearchLine />
</Button>
```

Remember the Button API: `variant` is `primary | neutral-solid | neutral-light | danger | success | inverse-solid | inverse-light`, and the outlined/ghost looks come from `appearance` (`solid | outline | ghost | soft`). There is no outline or destructive `variant` value - use `appearance="outline"` for the outlined look and `variant="danger"` for destructive actions. See `rules/styling.md` for the full variant/appearance reference.

---

## Tabs vs TabMenu

Two separate components, picked by whether an option swaps a panel **in place**:

- **`Tabs`** (content panels in place) - real ARIA tabs built on the Radix primitive: `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`. The panel lives in `TabsContent` (paired to its trigger by `value`); the active one renders in place. Reach for it for settings forms, a detail card with sub-views, an editor with modes.
- **`TabMenu`** (the bar only / routed nav) - renders the tab list and nothing else: no content component. Use it when the options navigate (routes or in-page sections) or when you want to render the panel yourself keyed by the active value. Supports `asChild` link tabs.

### Tabs (content panels)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="billing" leading={<RiBankCardLine />}>Billing</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview"><OverviewPanel /></TabsContent>
  <TabsContent value="billing"><BillingPanel /></TabsContent>
  <TabsContent value="settings"><SettingsPanel /></TabsContent>
</Tabs>
```

`Tabs` owns the `size` context (`sm` | `md` | `lg`) and selection (`defaultValue`, or controlled `value` / `onValueChange`). At the free tier the only layout is `horizontal-line` with the sliding bottom line; the Pro tier adds `variant` (`vertical-button`, `vertical-line`, `horizontal-button`) and `indicator` (`left`, `top`, `bottom`). `TabsTrigger` takes the label as children plus `leading` / `trailing` and `disabled`.

### TabMenu (bar only / routed nav)

`TabMenu` wraps `TabMenuItem`s and owns the selection; it renders the menu only - render the active panel yourself from the value, or use `asChild` for link tabs.

```tsx
import { TabMenu, TabMenuItem } from "@/components/ui/tab-menu"

const [tab, setTab] = React.useState("overview")

<TabMenu variant="horizontal-line" indicator="bottom" value={tab} onValueChange={setTab}>
  <TabMenuItem value="overview" label="Overview" />
  <TabMenuItem value="billing" label="Billing" />
  <TabMenuItem value="settings" label="Settings" />
</TabMenu>
{tab === "overview" && <OverviewPanel />}
```

At the free tier `variant` is `horizontal-line` - the default and only free value; the Pro tier adds `vertical-button`, `vertical-line`, and `horizontal-button`. `size` is `sm` | `md` | `lg`. `TabMenuItem` takes `label`, `leading` / `trailing`, `disabled`, and `asChild` for link tabs.

---

## Avatar composition (AvatarText, not AvatarFallback)

**`AvatarFallback` does not exist in Create UI** - the fallback/initials slot is `AvatarText`. It renders only while the sibling `AvatarImage` has not loaded (or when there is no image), so an image avatar should always carry one:

```tsx
import { Avatar, AvatarImage, AvatarText } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarText>JD</AvatarText>
</Avatar>
```

Initials-only avatars pick a real color `variant`; presence comes from `AvatarBadge` + `AvatarBadgeStatus`; stacks are `AvatarGroup` (+ `AvatarGroupAction` for the "+5" affordance):

```tsx
<Avatar variant="weak-blue"><AvatarText>YT</AvatarText></Avatar>

<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarText>JD</AvatarText>
  <AvatarBadge><AvatarBadgeStatus variant="online" /></AvatarBadge>
</Avatar>
```

See `get_component_reference('avatar')` for the full prop tables (`size` `2xs`–`2xl`, `shape`, 55 color variants, `AvatarIcon`, `AvatarRing`).

---

## Use existing components instead of custom markup

If a primitive already covers the job, use it - don't reach for raw elements or utility-class fakes.

| Instead of | Use |
|---|---|
| `<hr>` or `<div className="border-t">` | `<Separator />` |
| `<span className="rounded-full bg-green-100 …">` | `<Badge variant="success">Active</Badge>` |
| A status dot built from a styled `<span>` | `<StatusBadge variant="success" />` (it renders the dot only - put the label next to it). `variant`: `primary`, `danger`, `success`, `warning`, `info`, `highlighted`, `away`, `verified`, `cyan`, `lime`, `neutral`, `white` - note `danger`, not `error` |
| A removable tag built from `<span>` + `<button>` | `<Chip onClose={…}>…</Chip>` |
| A hand-rolled `animate-spin` loading indicator | `<Spinner />` |

---

## Sizing across adjacent components

Each component owns its own `size` scale and **the names are not pixel-equal** - `Avatar md` ≠ `Button md` ≠ `Badge md` in height. So never harmonize a row by matching size *prop names*; match by **optical height**:

- **Prefer a size-owning container** - `Field` (its `Input` / `Select` / `Textarea` / labels inherit size), `InputGroup` (its control / button inherit), `Chip` (first-child icon or `Avatar` auto-sized), and icons inside `Button` / `Badge` / `TabMenuItem` (auto-sized). Inside one of these the sizes already match; only free-standing clusters need manual work.
- **Anchor on the text scale and move the cluster together.** Pick the body token first (`text-body-sm`), size the neighbors to it, and when you go denser or larger shift the *whole* set (avatar + text token + link size) - never one side.
- **Align, then space:** `flex items-center` + a gap from the spacing scale, not margins. Confirm exact heights with `get_component_reference`.

```tsx
<div className="flex items-center gap-3">
  <Avatar size="lg">
    <AvatarImage src="/me.png" alt="Jane Doe" />
    <AvatarText>JD</AvatarText>
  </Avatar>
  <div className="flex flex-col gap-1">
    <span className="text-body-sm text-strongest font-medium">Profile photo</span>
    <TextLink variant="primary" size="sm">Change</TextLink>
  </div>
</div>
```

---

## The client boundary: what can cross it

Most Create UI primitives are client components. Rendering one from a Server Component is fine - what is **not** fine is handing it something that can't be serialized. In an App Router project this is the most common way a page 500s at runtime:

- **A function prop cannot cross.** `onClick`, `onValueChange`, `onCheckedChange`, `onSelectionChange`, `onAction`, `formatTooltip`, `getPageHref` - any callback defined in a Server Component and passed into a client component throws *"Functions cannot be passed directly to Client Components"*.
- **`createContext` / hooks cannot run in a server file** - a provider you author must live in a `"use client"` file.
- **Plain data crosses fine** - strings, numbers, arrays, plain objects, and JSX children.

So the "keep the boundary tight" rule (SKILL.md) has a corollary: isolating the interactive leaf is right, but **the file that supplies the handler must itself be the client component**. Put `"use client"` on the piece that owns both the handler and the control, and keep the server parent to data and layout:

```tsx
// app/settings/page.tsx - Server Component: data only, no handlers
import { NotificationToggle } from "./notification-toggle"

export default async function Page() {
  const prefs = await getPrefs()
  return <NotificationToggle defaultEnabled={prefs.notifications} />
}
```

```tsx
// app/settings/notification-toggle.tsx
"use client"

import * as React from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export function NotificationToggle({ defaultEnabled }: { defaultEnabled: boolean }) {
  const [enabled, setEnabled] = React.useState(defaultEnabled)
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="notifications">Email notifications</FieldLabel>
      <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
    </Field>
  )
}
```

A page that is one big interactive gallery/showcase is simply a client component - mark the whole file `"use client"` rather than threading handlers across the boundary.

Rough pairing by text anchor (not pixel-identical - verify): `text-body-xs` → size `xs`, `text-body-sm` → `sm`, `text-body-md` → `md`. For a form control plus its trimmings, don't hand-tune at all - wrap it in `Field` / `InputGroup` (see [forms.md](./forms.md)).
