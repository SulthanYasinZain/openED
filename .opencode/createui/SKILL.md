---
name: createui
description: Create UI component library and design system. Use whenever writing or editing ANY React/JSX UI - pages, views, components, layouts, styling - in a project that uses Create UI (has a components.json, the @createui registry, or @create-ui/* packages), and for createui CLI or MCP operations (init/add/create/diff/view/search/migrate/mcp). Provides per-component API references (via the MCP `get_component_reference` tool), composition rules, semantic tokens, and design recipes.
user-invocable: true
allowed-tools: Bash(npx @create-ui/cli *), Bash(pnpm dlx @create-ui/cli *)
---

# Create UI

Create UI is a design code system: **one unified styling system + many themes**. Components are added as source code into the user's project via the `createui` CLI and styled with Create UI's own semantic tokens. It is its own system - its own CLI (`npx @create-ui/cli`), its own registry (`@createui` - the only registry, never configure another), and its own component APIs. **Do not assume shadcn/ui conventions: the APIs differ.**

## Non-negotiable workflow

1. **Get project context** - `npx @create-ui/cli info` (prints components.json: aliases, `rsc`, `tailwind.css` path, `iconLibrary`). Use the real aliases in imports.
2. **Check installed components** - list the `ui` alias directory (e.g. `components/ui/`). Never import a component that hasn't been added; never re-add installed ones.
3. **Before the FIRST use of any component, fetch its API authority** - call MCP `get_component_reference('<component>')` (props, variants, defaults, icon usage, a canonical example, and gotchas; auth-aware - free or pro). A keyword works too (`'tabs'`, `'removable tag'`), and an empty query lists every component. Offline fallback: `npx @create-ui/cli view <name>` or MCP `get_item_examples_from_registries` with `"<name>-demo"`.
4. **Add what's missing** - `npx @create-ui/cli add <name>`.
5. **Compose per the invariants below.** Never hand-roll a pattern listed in "Never hand-roll".
6. **Exercise the component API - never ship bare defaults.** Pick `variant` / `appearance` / `size` / `state` / `orientation` to fit each element's role on every build (see "Use the full component API" below). For any rich or polished UI, also read [`rules/design.md`](./rules/design.md) first (composition patterns, spacing rhythm, richness checklist, anti-patterns). Build only what the user asked for, to their brand - never volunteer extra landing/showcase/gallery sections, and never clone the Create UI site.

## Component inventory

Every **free** item ships below. At no tier is there a **card, table, sheet, drawer, or skeleton component** - build those from semantic-token markup and these primitives (see the table/card recipe in [`rules/composition.md`](./rules/composition.md)), never invent lookalikes.

<!-- BEGIN GENERATED:PRO-ONLY -->

**Pro-only components** (a developer seat is required; `add <name>` returns 401 without one): `alert-banner`, `command`, `fab-button`, `file-format`, `file-upload`, `info-tooltip`, `input-tag`, `modal`, `navbar`, `password-strength`, `popover`, `rating`, `sidebar`.

<!-- END GENERATED:PRO-ONLY -->

Inspect any Pro component with `get_component_reference('<name>')` before use. Some patterns live under a different name: a **dialog / modal / alert-dialog** is `Modal`; a **command palette / command menu / ⌘K / cmdk** is `Command`; a **popover / hover-card** is `Popover` - all three are **Pro** (a developer seat; `add <name>` returns 401 without one). So when a request mentions a "dialog", reach for `Modal`; when it mentions a "command menu" or "command", reach for `Command`. There is **no *free* dialog / command / popover / overlay primitive**: at the free tier, surface a blocking flow inline, on its own route, or with an `InlineAlert` confirmation - never hand-roll an overlay (see [`rules/composition.md`](./rules/composition.md)).

<!-- BEGIN GENERATED:INVENTORY -->

| Item | Exports | Key props (defaults starred) |
| --- | --- | --- |
| accordion | Accordion, AccordionItem, AccordionTrigger, AccordionContent | appearance: ghost-default*\|ghost-underline\|ghost-rounded\|outline-rounded\|outline-sharp\|filled-rounded |
| app-store-badge | AppStoreBadge | variant: black*\|white · appearance: filled*\|outline · iconOnly · brand (required) |
| aspect-ratio | AspectRatio |  |
| avatar | Avatar, AvatarImage, AvatarText, AvatarIcon, AvatarRing, AvatarBadge, +8 more | variant: {gradient\|strong\|base\|weak\|alpha}-{inverse\|neutral\|red\|green\|orange\|blue\|sky\|indigo\|fuchsia\|yellow\|stable} (55 values) · size: 2xs\|xs\|sm\|md*\|lg\|xl\|2xl · shape: circle*\|rounded · background · stroke |
| badge | Badge | variant: primary*\|neutral\|neutral-static\|danger\|success\|warning\|info\|verified\|highlighted\|away\|inverse\|inverse-static · appearance: solid\|outline\|soft*\|ghost · size: xs\|sm*\|md · shape: rounded*\|pill · leading/trailing · iconOnly · numberOnly · disabled |
| breadcrumb | Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbSeparator | variant: primary\|neutral · appearance: solid\|outline\|ghost · size: xs\|sm\|md · shape: rounded\|pill · separator: chevron\|slash\|dot · **Pro** unlocks more options |
| button | Button, ButtonLabel | variant: primary*\|neutral-solid\|neutral-light\|danger\|success\|inverse-solid\|inverse-light · appearance: solid*\|outline\|ghost\|soft · size: xs\|sm\|md\|lg*\|xl · shape: rounded*\|pill\|square · iconOnly · loading |
| button-group | ButtonGroup, ButtonGroupItem | variant: primary*\|neutral\|soft · size: xs\|sm\|md*\|lg\|xl · shape: rounded*\|pill\|square · orientation: horizontal* · **Pro** adds orientation: vertical |
| checkbox | Checkbox | variant: primary*\|neutral\|inverse\|danger\|success\|info · size: xs\|sm*\|md · shape: rounded*\|pill\|square |
| checkbox-group | CheckboxGroup | variant: primary*\|danger · size: xs\|sm*\|md · placement: left*\|right |
| chip | Chip | variant: neutral*\|info\|danger\|success · appearance: outline*\|soft · size: xs\|sm\|md\|lg*\|xl · shape: pill\|rounded* · selected · disabled · dragging · closable |
| close-button | CloseButton | variant: neutral*\|inverse · appearance: solid\|outline\|ghost\|soft* · size: xs\|sm\|md*\|lg\|xl\|2xl · shape: rounded\|pill*\|square |
| combobox | Combobox, ComboboxProvider, ComboboxInput, ComboboxContent, ComboboxGroup, ComboboxLabel, +2 more | variant: default*\|compact · size: xs\|sm\|md · loading |
| context-menu | ContextMenu, ContextMenuTrigger, ContextMenuPopover, ContextMenuMenu |  |
| country-flag | CountryFlag, CurrencyFlag, FlagFallback | code (required) |
| credit-card-input | CreditCardInput | size: xs\|sm\|md · leading · invalid · disabled · loading · showLeadingIcon · showBadge · showValidationIcon |
| date-input | DateInput | size: xs\|sm\|md · leading · invalid · disabled · loading · showLeadingIcon |
| dropdown-menu | Dropdown, DropdownPopover, DropdownMenu, DropdownSection, DropdownHeader, DropdownMisc, +10 more | DropdownItemBody: leading/trailing · showIndicator |
| dropzone | Dropzone, DropzoneIcon, DropzoneTitle, DropzoneDescription, DropzoneHeader, DropzoneHeading, +2 more | size: sm\|md\|lg* · maxSize · multiple · disabled · error |
| field | Field, FieldLabel, FieldTitle, FieldContent, FieldDescription, FieldError, +6 more | size: xs\|sm*\|md · orientation: vertical*\|horizontal\|responsive · invalid · disabled · loading |
| inline-alert | InlineAlert, InlineAlertIcon, InlineAlertContent, InlineAlertHeading, InlineAlertTitle, InlineAlertDescription, +2 more | variant: primary*\|neutral\|danger\|success\|warning\|info\|away · appearance: solid\|soft\|outline\|default* · layout: horizontal*\|vertical |
| input | Input, InputAffix, InputProvider, InputShell | size: xs\|sm*\|md |
| input-group | InputGroup, InputGroupProvider, InputGroupShell, InputGroupSlot, InputGroupAffix, InputGroupControl, +10 more | invalid · disabled · loading · multiline |
| input-otp | InputOTP | variant: outline*\|filled · size: lg*\|md\|sm · shape: rounded*\|pill\|square\|underline · invalid |
| input-stepper | InputStepper | variant: split\|detached · size: xs\|sm\|md · value/onValueChange · defaultValue · min · max · step · invalid · disabled · **Pro** adds variant: end-controls\|vertical-stepper · prefix |
| label | Label, LabelBlock, LabelMain, LabelIcon, LabelRequired, LabelOptional, +4 more | size: xs\|sm\|md |
| pagination | Pagination, PaginationContent, PaginationLink, PaginationFirst, PaginationPrevious, PaginationNext, +2 more | variant: compact\|compact-grouped* · shape: rounded*\|pill · totalPages · page · defaultPage · minPage · siblingCount · boundaryCount · **Pro** adds variant: full\|split\|data-table\|grouped\|full-pager\|compact-pager · pageSize · defaultPageSize · onPageSizeChange · pageSizeOptions |
| phone-input | PhoneInput | size: xs\|sm\|md · invalid · disabled · loading · showHelperIcon |
| progress | Progress | variant: primary*\|info\|success\|warning\|danger\|away\|neutral\|neutral-static\|neutral-soft\|inverse\|inverse-static\|inverse-soft · appearance: solid*\|gradient · size: xs\|sm\|md*\|lg · shape: sharp\|round\|pill* · type: line*\|circle · value · max · duration |
| radio | Radio | variant: primary*\|neutral\|danger\|success\|inverse · size: xs\|sm*\|md |
| radio-group | RadioGroup | variant: primary*\|neutral\|danger · size: xs\|sm*\|md · placement: left*\|right · disabled · invalid |
| scroll-area | ScrollArea, ScrollBar | appearance: filled*\|ghost · size: sm\|md*\|lg · orientation: vertical*\|horizontal\|both · fade |
| segmented-control | SegmentedControl, SegmentedControlItem | variant: primary*\|neutral · appearance: flat*\|grouped · size: xs\|sm\|md*\|lg\|xl · shape: rounded*\|pill · value/onValueChange |
| select | Select, SelectProvider, SelectShell, SelectContent, SelectGroup, SelectItem, +5 more | variant: default*\|compact · size: xs\|sm\|md · loading |
| separator | Separator | variant: solid* · direction: horizontal*\|vertical · align: start\|center*\|end · **Pro** adds variant: dashed |
| slider | Slider | variant: primary*\|neutral · size: md*\|sm\|xs · **Pro** adds shape: rounded\|pill · track: rail\|bar · thumbType: short\|long · marks · tooltip: top\|bottom · formatTooltip |
| social-login-button | SocialLoginButton | appearance: colorful\|black\|white · size: lg*\|md · shape: rounded*\|pill\|square · iconOnly · brand (required) · config (required) |
| spinner | Spinner | variant: primary*\|info\|success\|warning\|danger\|away\|neutral\|neutral-static\|neutral-soft\|inverse\|inverse-static\|inverse-soft · appearance: solid\|gradient* · size: xs\|sm*\|md\|lg · cap: sharp\|rounded* · line: short\|long* · animation: spin\|pulse*\|tick |
| status-badge | StatusBadge | variant: primary*\|danger\|success\|warning\|info\|highlighted\|away\|verified\|cyan\|lime\|neutral\|white · size: xs\|sm\|md* |
| stepper | Stepper, StepperTrigger, StepperDot, StepperDots, StepperHeading, StepperTitle, +1 more | size: sm*\|md · orientation: horizontal\|vertical* · layout: default*\|compact\|badge · **Pro** unlocks more options |
| switch | Switch | variant: primary*\|info\|neutral\|inverse\|semantic · size: md\|sm*\|xs · shape: pill*\|rounded · thumbType: short*\|long · ioTrigger · thumbIcon |
| switch-group | SwitchGroup | size: xs\|sm*\|md · ioTrigger · placement: left*\|right |
| tab-menu | TabMenu, TabMenuItem | variant: horizontal-line* · size: sm\|md*\|lg · value/onValueChange · indicator: bottom* · **Pro** adds variant: vertical-button\|vertical-line\|horizontal-button · indicator: left\|top |
| tabs | Tabs, TabsList, TabsTrigger, TabsContent | size: sm\|md*\|lg · **Pro** adds variant: vertical-button\|vertical-line\|horizontal-line\|horizontal-button · indicator: left\|top\|bottom |
| text-link | TextLink | variant: primary*\|neutral\|inverse\|danger\|success\|info · size: xs*\|sm\|md\|lg · leading/trailing · visited · disabled · underline |
| textarea | Textarea | size: xs\|sm*\|md · resizable: x\|y\|both · loading |
| toast | Toast, ToastBody, ToastIcon, ToastContent, ToastTitle, ToastDescription, +3 more | variant: primary*\|neutral\|danger\|success\|warning\|info\|away · appearance: solid*\|soft\|outline\|default |
| tooltip | Tooltip, TooltipContent, TooltipProvider, TooltipTrigger | TooltipContent: variant: primary*\|neutral\|inverse\|danger\|info · showArrow · side: top\|bottom*\|left\|right · sideOffset |

<!-- END GENERATED:INVENTORY -->

> The registry also ships **hooks** (`use-mobile`, `use-credit-card-input`, `use-date-input`, `use-phone-input`) and **lib utilities** (`utils`, `country-flags`, `currency-flags`) - installed automatically as dependencies of the components that need them.

## Icons

**For components with `leading` / `trailing` props, icons go through those props, never as children next to text.** The component sizes the icon per its `size` - never add `size-4` / `w-4 h-4` to an icon inside a component. Import UI icons from `@create-ui/assets/icons` (Remix `Ri*`, e.g. `RiSearchLine`) - **never `lucide-react`**. Brand / flag / payment / social marks come from `@create-ui/assets/{social,flags,payments,brands,badges,banks,crypto}`.

```tsx
// Correct - icon props
<Badge variant="success" leading={<RiCheckLine />}>Verified</Badge>
<TextLink trailing={<RiArrowRightLine />}>Docs</TextLink>

// Incorrect - NEVER put the icon in children next to text
<Badge variant="success"><RiCheckLine /> Verified</Badge>
```

**`Button` is the exception** - it takes no `leading` / `trailing`. Compose icons as children and wrap the text in `<ButtonLabel>` (exported alongside `Button`); the icon sits outside the label's optical padding as a sibling. Plain text needs no `ButtonLabel` - it auto-wraps.

```tsx
// Button composes icons as children
<Button>
  <RiAddLine />
  <ButtonLabel>Add item</ButtonLabel>
</Button>

<Button>Save</Button> // plain text auto-wraps - no ButtonLabel needed
```

<!-- BEGIN GENERATED:ICON-MATRIX -->

| Component | leading | trailing | iconOnly |
| --- | --- | --- | --- |
| AppStoreBadge | - | - | yes |
| Badge | yes | yes | yes |
| BreadcrumbItem | yes | yes | - |
| Button | - | - | yes |
| ButtonGroupItem | yes | yes | yes |
| ComboboxItem | yes | yes | - |
| CreditCardInput | yes | - | - |
| DateInput | yes | - | - |
| DropdownItem | yes | yes | - |
| DropdownItemBody | yes | yes | - |
| SegmentedControlItem | yes | yes | yes |
| SelectItem | yes | yes | - |
| SocialLoginButton | - | - | yes |
| TabMenuItem | yes | yes | - |
| TabsTrigger | yes | yes | - |
| TextLink | yes | yes | - |

Components NOT in this table take no leading/trailing props:

- `Chip` takes its icon or `Avatar` as the FIRST CHILD (auto-slotted into the lead slot). No icon props.
- `InlineAlert` and `Toast` use dedicated icon subcomponents (`InlineAlertIcon`, `ToastIcon`); `FieldHelper` and `AccordionTrigger` take an `icon` prop; `InputGroupKbd` inherits Badge's icon props.
- Everything else: icons are not part of the component's API - put the icon next to it in your own markup.

<!-- END GENERATED:ICON-MATRIX -->

## Design tokens

The styling vocabulary - semantic colors, spacing, radius, typography, shadow, and the project themes. These back the "semantic tokens only" invariant below. For the on-demand version (or from an MCP client), call `get_component_reference('tokens')` (or `'colors'` / `'spacing'` / `'typography'`).

<!-- BEGIN GENERATED:DESIGN-TOKENS -->

Use semantic tokens, never the raw palette (`bg-blue-500`) or hex. Token values differ between light and dark - reference the token, never hardcode a color.

### Colors -> `bg-`/`text-`/`border-`/`outline-<token>`

- **Surfaces & borders** (low -> high contrast, for `bg-` / `border-`): `static`, `weakest`, `weak`, `light`, `medium`, `heavy`, `strong`, `strongest`.
- **Text** (foreground, for `text-`): `text-body` (default copy), `text-strongest` (headings / emphasis), `text-placeholder` (hints / secondary), `text-disabled`. Do NOT use surface-ramp names (`text-weak` / `text-light` / `text-medium` / `text-heavy`) as text colors - they render near-invisible on light backgrounds.
- **Intent** (each x `weakest|weak|base|strong|strongest`): `primary`, `error`, `success`, `warning`, `info`, `away`, `verified`, `feature`, `highlighted`, `stable` - e.g. `bg-primary-base`, `text-error-strong`, `border-success-weak`.
- **Interaction & overlay**: `hover`, `active`, `hover-inverted`, `active-inverted`, `scrim`, `scrim-strong`.
- **Static (non-theming, fixed light/dark)**: `static-white`, `static-black`, `static-{white,black}-alpha-{0,8,16,24,32,48,64,80}`.

Gotchas: `variant="danger"` but the color token family is **`error-*`** (there is no `danger-*`); the neutral intent color is **`stable-*`**; `neutral-*` exists only as a component `variant`, not a color token. Never `bg-blue-500`, never hex.

### Spacing -> `gap-`/`p-`/`m-`/`px-`/`py-<token>`

`component-lg`, `component-md`, `component-none`, `component-sm`, `component-xl`, `component-xs`, `layout-lg`, `layout-md`, `layout-none`, `layout-sm`, `layout-xl`, `layout-xs`, `section-lg`, `section-md`, `section-none`, `section-sm`, `section-xl`, `section-xs`.

`component-*` = tight component-internal padding/gaps · `layout-*` = section padding/gaps · `section-*` = page-section rhythm. **Only use a semantic spacing class when a Figma design references that token**; for a plain value use standard Tailwind (`gap-4`, `p-6`).

### Radius -> `rounded-<token>`

`2xl`, `3xl`, `4xl`, `5xl`, `component-2xl`, `component-3xl`, `component-4xl`, `component-5xl`, `component-full`, `component-lg`, `component-md`, `component-none`, `component-sm`, `component-xl`, `full`, `lg`, `md`, `none`, `sm`, `xl`, `xs`.

`component-*` radii rescale responsively (prefer them on new components); the bare scale (`sm`, `lg`, `xl`, ...) stays static.

### Typography -> `text-<token>` (the class IS the token)

- **heading**: `heading-h1`, `heading-h2`, `heading-h3`, `heading-h4`, `heading-h5`, `heading-h6`.
- **display**: `display-lg`, `display-xl`.
- **paragraph**: `paragraph-lg`, `paragraph-md`, `paragraph-sm`, `paragraph-xl`, `paragraph-xs`.
- **body**: `body-lg`, `body-md`, `body-sm`, `body-xl`, `body-xs`.
- **ui-control**: `ui-control-lg`, `ui-control-md`, `ui-control-sm`, `ui-control-xl`, `ui-control-xs`.
- **ui-caption**: `ui-caption-md`, `ui-caption-xs`.
- **ui-overline**: `ui-overline-md`, `ui-overline-sm`, `ui-overline-xs`.
- **code**: `code-lg`, `code-md`, `code-sm`, `code-xs`.
- **numeric**: `numeric-lg`, `numeric-md`, `numeric-sm`, `numeric-xl`, `numeric-xs`.
- **Fonts**: `font-body`, `font-display`, `font-numeric`.

**Muted / secondary text**: pair a caption size with the muted color - `text-ui-caption-xs text-placeholder` for footnotes and helper copy, `text-ui-caption-md text-placeholder` when it sits beside body copy. There is no `text-muted-foreground`, `bg-muted`, or `border-input` here (those are shadcn names and render as dead classes) - the muted foreground is `text-placeholder`.

### Shadow -> `shadow-<token>`

`component-error-default`, `component-error-focused`, `component-error-hover`, `component-icon-wrapper`, `component-info-default`, `component-info-focused`, `component-info-hover`, `component-inverted-default`, `component-inverted-focused`, `component-inverted-hover`, `component-neutral-default`, `component-neutral-focused`, `component-neutral-hover`, `component-primary-default`, `component-primary-focused`, `component-primary-hover`, `component-success-default`, `component-success-focused`, `component-success-hover`, `neutral-2xl`, `neutral-2xs`, `neutral-3xl`, `neutral-lg`, `neutral-md`, `neutral-sm`, `neutral-xl`, `neutral-xs`.

### Themes (chosen at `init` - never ask or re-pick)

- **Primary** (accent; use `primary-*` color tokens, do not invent a color): `indigo*`, `neutral`, `lime`, `green`, `red`, `orange`, `yellow`, `cyan`, `blue`.
- **Neutral**: `zinc*`, `gray`, `slate`, `base`, `stone`.

(`*` = default.) Switch the whole project only via `npx @create-ui/cli init --theme <name>` / `--neutral <name>`, and only when the user explicitly asks.

<!-- END GENERATED:DESIGN-TOKENS -->

## Cross-cutting invariants

- **Prop taxonomy** (common vocabulary, _not_ universal - `get_component_reference` is authoritative per component): the recurring axes are `variant` = color intent (`primary`, `danger`, `success`, `neutral-*`, ...) · `appearance` = fill weight (`solid` / `outline` / `soft` / `ghost`) · `size` · `shape`. Many components omit `appearance`/`shape` or repurpose an axis (`variant` = layout on `tabs`/`tab-menu`/`pagination`, width on `select`; `variant` = `outline`|`filled` on `input-otp`; a different `appearance` enum on `progress`/`toast`/`segmented-control`) - never assume an axis exists without checking. For the Button/Badge color intents, **there is no `variant="outline"`, `variant="secondary"`, or `variant="destructive"`** - an outline style is `appearance="outline"`, a destructive action is `variant="danger"`.
- **`Field` owns size; children inherit it.** Set `size` (`xs` | `sm` | `md`) once on `Field`; `Input`, `Select`, `Textarea`, labels and helpers read it via context. Never re-set or downgrade size on a child.
- **Adjacent components don't share a size scale** - `Avatar md` ≠ `Button md` in height. Harmonize a row by optical height: prefer a size-owning container (`Field` / `InputGroup` / `Chip`) when one exists, otherwise anchor on the text scale and move the whole cluster's sizes together, aligned with `flex items-center` + a gap. Never match size prop names across different components (see rules/composition.md "Sizing across adjacent components").
- **Validation**: `data-invalid` on `Field`, `aria-invalid` on the control. Disabled: `data-disabled` on `Field`, `disabled` on the control.
- **`Button` has a real `loading` prop** - `<Button loading>Saving...</Button>`. Don't compose spinners into buttons.
- **Use `asChild` for custom triggers/links** - `<Button asChild><Link href="/x">Docs</Link></Button>`.
- **Items live inside their Group**: `SelectItem` → `SelectGroup`, `CommandItem` → `CommandGroup`, and `Dropdown.Item` → `Dropdown.Menu` (inside `Dropdown.Popover`) are structural - always wrap. `Dropdown.Section` (Pro) is optional semantic grouping on top of that; there is no `DropdownMenuGroup` / `DropdownMenuContent`.
- **Semantic tokens only, never raw palette or hex** - use the surface / text / border / intent tokens from the Design tokens block above (`bg-static`, `text-strongest`, `border-light`, `bg-primary-base`, `{error,success,…}-{base,weak}`). Never `bg-blue-500`, never hex.
- **The theme is already chosen** - primary + neutral were picked at `init` and live as tokens. Use `bg-primary-base` / `text-primary-base` / `border-primary-*` for any accent; never ask for a color, invent one, or hand-edit the theme token hex. Re-theming is `init --theme <name>` / `--neutral <name>`, only on explicit request (see [customization.md](./customization.md)).
- **The font variant is already chosen too** - `--font-display` / `--font-body` / `--font-numeric` were picked at `init`. Typography tokens (`text-heading-*`, `text-display-*`, `text-body-*`, `text-paragraph-*`, `text-ui-*`, `text-numeric-*`, `text-code-*`) already apply the right family automatically - add a standalone `font-display` / `font-body` / `font-numeric` class only for text that isn't already wearing one of those tokens (e.g. inside `ButtonLabel`, a raw `<span>`). Never use `font-sans`, `font-serif`, `font-mono`, or any other invented font utility - they don't exist in this system. Re-theming the font is `init --font-variant <name>`, only on explicit request (see [customization.md](./customization.md)).
- **Focus is `outline-*`, never `ring-*`.**
- **Spacing**: vertical stacks are `flex flex-col gap-*` (never `space-y-*`); `size-10` not `w-10 h-10`; semantic spacing classes (`gap-component-sm`) only when a Figma design references a token - otherwise standard Tailwind (`gap-4`).
- **`className` is for layout, not restyling** - don't override a component's colors or typography; reach for `variant`/`appearance` first.

## Use the full component API

Props encode an element's _role_; a default is right only when it happens to match that role. **This holds for all UI - plain app screens as much as polished pages** - and one size + one variant everywhere reads as a wireframe. Fetch the prop table with `get_component_reference('<component>')` and set whichever axes the component actually exposes deliberately (not every component has `appearance` or `shape`): `variant` = intent, `appearance` = hierarchy (one `solid` primary per group, the rest `soft` / `outline` / `ghost`), `size` = density, plus state props (`loading` / `invalid` + `aria-invalid` / `disabled` / `selected`) and any component-specific axis (`shape`, `orientation`, `layout`, `placement`). Map role → props (Button/Badge, the highest-traffic axes):

| Element's role                                    | Props                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| The one primary action in a view / form / section | `variant="primary" appearance="solid"`                                                                 |
| A secondary action beside it                      | `appearance="outline"` / `"soft"` (often `variant="neutral-light"`)                                    |
| Tertiary / dismiss / toolbar action               | `appearance="ghost"`                                                                                   |
| Destructive / positive action                     | `variant="danger"` / `variant="success"`                                                               |
| Any action on a dark / colored panel              | `variant="inverse-solid"`                                                                              |
| Status / tag (Badge)                              | `soft` workhorse · `outline` quiet eyebrow/version · `solid` high-priority count · `variant` = meaning |
| `size` by context                                 | dense / toolbar `xs`–`sm` · standard `md` · primary CTA / hero `lg`–`xl`                               |

**Default monoculture is a bug**: if every Button/Badge shares one default size+variant, the primary action isn't standing out - you skipped this. Each component's `get_component_reference` example already spans its axes; mirror that range. `rules/design.md` has the per-component richness checklist and anti-patterns.

## Never hand-roll

| You need                                 | Use (never raw markup)                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tabbed panels (content swaps in place)   | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` (real ARIA tabs; the panel lives in `TabsContent`)                    |
| Tab nav / routed nav (no in-place panel) | `TabMenu` + `TabMenuItem` (`asChild` for link tabs; render any panel yourself keyed by value)                             |
| Toggle between 2-7 options               | `SegmentedControl` + `SegmentedControlItem` (`value`/`onValueChange`) - never a row of `Button`s with manual active state |
| Tag / label                              | `Badge` (icons via `leading`/`trailing`)                                                                                  |
| Removable / interactive tag              | `Chip` (icon or `Avatar` as FIRST CHILD, `closable`/`onClose`)                                                            |
| Status dot                               | `StatusBadge` (dot only - label goes next to it)                                                                          |
| Callout / inline banner                  | `InlineAlert` (+`InlineAlertIcon`/`Title`/`Description`)                                                                  |
| Notification                             | `Toast` (+`ToastIcon`/`ToastTitle`/`ToastAction`)                                                                         |
| Avatar initials                          | `Avatar` + `AvatarText` (**`AvatarFallback` does not exist**)                                                             |
| Loading state                            | `Spinner`, or `Button loading`                                                                                            |
| Divider                                  | `Separator` (`direction="horizontal"` or `"vertical"`; a developer seat adds the `dashed` variant)                       |
| Menu                                     | `DropdownMenu` family                                                                                                     |

## Recipes

Copy-ready patterns live in the on-demand rules - fetch the one you need instead of inlining:

- **Tabs** (`Tabs` for in-place content panels; `TabMenu` for the bar only / routed nav) and **table / card / empty state** (no such primitives - build from semantic markup) → [composition.md](./rules/composition.md).
- **Forms, billing/pricing toggle (grouped `SegmentedControl`), fully-exercised `Switch`** → [forms.md](./rules/forms.md).
- **Rich section patterns (hero, dark panel, footer, pricing), spacing rhythm, richness checklist** → [design.md](./rules/design.md).

## components.json keys

- **`aliases`** - import prefixes (`ui`, `components`, `utils`, `lib`, `hooks`). Use the project's actual aliases, never hardcode.
- **`rsc`** - when `true`, components using state/effects/events need `"use client"`. Keep the boundary tight: isolate the interactive piece in its own file rather than hoisting the directive over a whole static section.
- **`tailwind.css`** - the global CSS file where tokens live. Edit it; never create a new one. Never rewrite the primary/neutral theme token values here to change the brand color - that is an `init` choice (see invariants above).
- **`iconLibrary`** - `createui` (`@create-ui/assets`). Never swap registry imports to another icon package.
- **`menuColor`** (`default` | `inverted`) / **`menuAccent`** (`subtle` | `bold`) - menu surface treatment.

## CLI quick reference

```bash
npx @create-ui/cli init                       # existing project (writes components.json)
npx @create-ui/cli create my-app --template next   # new project (next | start | vite)
npx @create-ui/cli add button select          # add components (bare names)
npx @create-ui/cli search @createui -q "toast"
npx @create-ui/cli view button                # item metadata + files
npx @create-ui/cli diff button                # upstream changes for installed items
npx @create-ui/cli mcp init --client claude   # set up the MCP server
```

`add --overwrite` replaces files - only with the user's explicit approval. To update, prefer `diff` and merge upstream changes while preserving local edits. Primary themes: indigo (default), blue, lime, green, red, orange, yellow, cyan. Neutrals: zinc (default), gray, slate, base, stone.

## Detailed references

- **Per-component API / gotchas**: MCP `get_component_reference('<name>')` - generated from source, auth-aware (free or pro). Empty query lists every component; offline fallback `npx @create-ui/cli view <name>`.
- [rules/design.md](./rules/design.md) - design taste: rich section patterns (hero/panel/footer/pricing), richness checklist, anti-patterns.
- [rules/icons.md](./rules/icons.md) - icon props per component, sizing, assets packages.
- [rules/composition.md](./rules/composition.md) - groups, overlays, Tabs, TabMenu, Avatar, InlineAlert, Toast.
- [rules/forms.md](./rules/forms.md) - FieldGroup/Field, size cascade, InputGroup, SegmentedControl, validation.
- [rules/styling.md](./rules/styling.md) - semantic tokens, className scope, spacing, focus.
- [rules/a11y.md](./rules/a11y.md) - accessible names, labelling, validation/state wiring, overlay a11y, reduced motion.
- [cli.md](./cli.md) - every command and flag. [mcp.md](./mcp.md) - MCP tools and workflow. [customization.md](./customization.md) - theming and tokens.

## Resources

- Home: https://createui.co
- Docs: https://createui.co/docs
- Registry: https://createui.co/r
