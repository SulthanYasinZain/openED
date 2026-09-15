# Icons

## Contents

- [Icons and assets come from @create-ui/assets](#icons-and-assets-come-from-create-uiassets)
- [Picking a valid Ri* name](#picking-a-valid-ri-name)
- [Icon props across components](#icon-props-across-components)
- [Chip takes its icon as the first child](#chip-takes-its-icon-as-the-first-child)
- [InlineAlert and Toast use icon subcomponents](#inlinealert-and-toast-use-icon-subcomponents)
- [Icon-only buttons](#icon-only-buttons)
- [No sizing classes on icons inside components](#no-sizing-classes-on-icons-inside-components)
- [Pass icons as component values, not string keys](#pass-icons-as-component-values-not-string-keys)

---

## Icons and assets come from @create-ui/assets

**All icons and marks come from `@create-ui/assets`** - Create UI's own asset library. Registry components already import from it, and the CLI ships those imports as-is. Never reach for `lucide-react`, `@tabler/icons-react`, or any other icon package.

**General-purpose UI icons** → `@create-ui/assets/icons` (Remix Icon, `Ri*` names). This subpath re-exports [`@remixicon/react`](https://remixicon.com), so the full Remix set is available:

```tsx
import { RiArrowDownSLine, RiSearchLine, RiCheckLine } from "@create-ui/assets/icons"
```

**Brand, flag, payment, social, and badge marks** → category subpaths (PascalCase, 900+ typed SVG components):

```tsx
import { Github } from "@create-ui/assets/social"
import { Turkey } from "@create-ui/assets/flags"
import { VisaColor } from "@create-ui/assets/payments"
import { Docker } from "@create-ui/assets/brands"
```

Subpaths: `icons` (Remix UI icons), `social`, `flags`, `payments`, `brands`, `banks`, `badges`, `crypto` (Web3 Icons). Marks that ship multiple treatments carry a suffix - pick the variant: `VisaColor` / `VisaBlack` / `VisaWhite`.

**Sizing & color differ from UI icons.** Standalone marks have their source dimensions stripped, so set a size explicitly - and match the mark's aspect ratio: social/brand/crypto/badge marks are square 24×24 (`className="size-6"`), but payment marks are wide (most are 38×24; the `*Logotype` variants 58×24) and need paired classes like `className="h-5 w-8 shrink-0"`, never a square `size-*`. Brand colors are baked in - don't recolor; use the `Black` / `White` variant for contrast. This is the opposite of `Ri*` icons rendered *inside* Create UI components (`Button`, `Dropdown.Item`, …), which are auto-sized via CVA - see [No sizing classes on icons inside components](#no-sizing-classes-on-icons-inside-components).

---

## Picking a valid Ri* name

`@create-ui/assets/icons` re-exports the entire Remix set - **3,135 `Ri*` exports** - and there is no lookup tool, so a guessed name that doesn't exist is a hard `TS2724` build error. Two rules cover the whole set:

**1. Almost every icon ships both a `-Line` and a `-Fill` variant** (1,493 each - 95% of the set). Pick the treatment, don't invent a third: `RiSearchLine` / `RiSearchFill`, `RiUserLine` / `RiUserFill`. `-Line` is the default for UI chrome; `-Fill` is for emphasis and status glyphs.

**2. Exactly 149 icons have NO suffix** - use the bare name. Appending `-Line` to one of these is the single most common icon build failure: `RiAttachment2Line`, `RiListUnorderedLine`, and `RiKanbanViewLine` do **not** exist; the real names are `RiAttachment2`, `RiListUnordered`, `RiKanbanView`. They are almost all editor / text-formatting, table, view-mode, sort, and heading icons:

```
RiAB, RiAi, RiAiGenerate, RiAiGenerate2, RiAiGenerateText, RiAlignBottom
RiAlignCenter, RiAlignJustify, RiAlignLeft, RiAlignRight, RiAlignTop
RiAlignVertically, RiAsterisk, RiAttachment2, RiBold, RiBringForward
RiBringToFront, RiCalendarView, RiCarouselView, RiCodeBlock, RiCodeView
RiCustomSize, RiDeleteColumn, RiDeleteRow, RiDoubleQuotesL, RiDoubleQuotesR
RiDraggable, RiDropdownList, RiEmphasis, RiEmphasisCn, RiEnglishInput
RiFlowChart, RiFocusMode, RiFontColor, RiFontFamily, RiFontMono, RiFontSans
RiFontSansSerif, RiFontSize, RiFontSize2, RiFontSizeAi, RiFormatClear
RiFormula, RiFunctions, RiGalleryView, RiGalleryView2, RiH1, RiH2, RiH3
RiH4, RiH5, RiH6, RiHand, RiHashtag, RiHeading, RiIndentDecrease
RiIndentIncrease, RiInfoI, RiInputCursorMove, RiInputField
RiInsertColumnLeft, RiInsertColumnRight, RiInsertRowBottom, RiInsertRowTop
RiItalic, RiKanbanView, RiKanbanView2, RiLetterSpacing2, RiLineHeight
RiLineHeight2, RiLink, RiLinkM, RiLinkUnlink, RiLinkUnlinkM, RiListCheck
RiListCheck2, RiListCheck3, RiListIndefinite, RiListOrdered, RiListOrdered2
RiListRadio, RiListUnordered, RiListView, RiMergeCellsHorizontal
RiMergeCellsVertical, RiMindMap, RiNodeTree, RiNumber0, RiNumber1, RiNumber2
RiNumber3, RiNumber4, RiNumber5, RiNumber6, RiNumber7, RiNumber8, RiNumber9
RiOmega, RiOrganizationChart, RiOverline, RiPageSeparator, RiParagraph
RiPinyinInput, RiQuestionMark, RiQuoteText, RiRoundedCorner, RiSendBackward
RiSendToBack, RiSeparator, RiSingleQuotesL, RiSingleQuotesR, RiSketching
RiSlashCommands, RiSlashCommands2, RiSlideshowView, RiSortAlphabetAsc
RiSortAlphabetDesc, RiSortAsc, RiSortDesc, RiSortNumberAsc, RiSortNumberDesc
RiSpace, RiSplitCellsHorizontal, RiSplitCellsVertical, RiSquareRoot
RiStackedView, RiStrikethrough, RiStrikethrough2, RiSubscript, RiSubscript2
RiSuperscript, RiSuperscript2, RiTable2, RiTable3, RiTableView, RiText
RiTextBlock, RiTextDirectionL, RiTextDirectionR, RiTextSnippet
RiTextSpacing, RiTextWrap, RiTimelineView, RiTranslate, RiTranslate2
RiTranslateAi, RiTranslateAi2, RiUnderline, RiWubiInput
```

Note the suffix rule is per-family, not global: `RiAttachmentLine` / `RiAttachmentFill` exist, but `RiAttachment2` does not take a suffix. When unsure, prefer a name already used in the component's `get_component_reference` example, or list the real names from the installed package:

```bash
find node_modules -path '*@remixicon/react/index.d.ts' -exec grep -ho 'Ri[A-Za-z0-9]*' {} + | sort -u | grep -i kanban
```

---

## Icon props across components

**Most components that support inline icons take them through the `leading` / `trailing` props - never as children next to text.** This applies to `Badge`, `SegmentedControlItem`, `TabMenuItem`, `BreadcrumbItem`, `TextLink`, and `ButtonGroupItem` (the generated icon matrix in SKILL.md is the authoritative list). The component sizes the icon automatically per `size` (via its CVA `[&_svg]:size-N`), so the icon never needs a sizing class. There is no `data-icon` attribute in Create UI.

**`Button` is the exception** - it takes no `leading` / `trailing`. Compose the icon(s) as children and wrap the text label in `<ButtonLabel>` (exported alongside `Button`); the icon renders as a sibling outside the label's optical padding. Plain text auto-wraps, so a text-only button needs no `ButtonLabel`.

**Incorrect:**

```tsx
<Badge variant="primary" appearance="soft">
  <RiSparklingFill />
  Built with Create UI
</Badge>

<SegmentedControlItem value="grid">
  <RiLayoutGridFill /> Grid
</SegmentedControlItem>
```

**Correct:**

```tsx
<Badge variant="primary" appearance="soft" leading={<RiSparklingFill />}>
  Built with Create UI
</Badge>

<SegmentedControlItem value="grid" leading={<RiLayoutGridFill />}>
  Grid
</SegmentedControlItem>

<TabMenuItem value="billing" label="Billing" leading={<RiBankCardLine />} />

<TabsTrigger value="billing" leading={<RiBankCardLine />}>Billing</TabsTrigger>

// Button is the exception - icon as a child alongside <ButtonLabel>
<Button>
  <RiSearchLine />
  <ButtonLabel>Search</ButtonLabel>
</Button>
```

The icon-as-children cases are: every `Button` (the icon is a child next to `<ButtonLabel>`); `iconOnly` mode on `Badge`, `SegmentedControlItem`, and `ButtonGroupItem` (the icon IS the child there - their `leading` / `trailing` are ignored), so `<SegmentedControlItem iconOnly aria-label="Grid"><RiLayoutGridFill /></SegmentedControlItem>`; and menu-ish items like `DropdownMenuItem` / `CommandItem`, where a bare `<RiIcon />` child before the text is the convention. When in doubt, check `get_component_reference('<component>')`.

---

## Chip takes its icon as the first child

`Chip` has **no** `leading` / `trailing` props. Its first element child (an icon or an `Avatar`) is auto-slotted into the lead position and sized by the chip; the close affordance comes from `closable` / `onClose`.

```tsx
<Chip closable onClose={remove}><RiUserLine />Ayse Yilmaz</Chip>
<Chip><Avatar size="2xs"><AvatarText>AY</AvatarText></Avatar>Ayse</Chip>
```

---

## InlineAlert and Toast use icon subcomponents

`InlineAlert` and `Toast` take their icon through dedicated subcomponents, not props:

```tsx
<InlineAlert variant="danger" appearance="soft">
  <InlineAlertIcon><RiErrorWarningFill /></InlineAlertIcon>
  <InlineAlertContent>
    <InlineAlertTitle>Payment failed</InlineAlertTitle>
  </InlineAlertContent>
</InlineAlert>
```

`FieldHelper` is the exception that takes an `icon` prop.

---

## Icon-only buttons

For a button that shows only an icon, set `iconOnly`, pass the icon as the CHILD, and always supply an `aria-label`. There is no separate icon-button component. For a close affordance, use the `close-button` component instead.

**Incorrect:**

```tsx
<Button iconOnly>
  <RiSearchLine />
</Button>
```

**Correct:**

```tsx
<Button iconOnly aria-label="Search">
  <RiSearchLine />
</Button>

<Button iconOnly aria-label="More options" appearance="ghost">
  <RiMore2Line />
</Button>
```

---

## No sizing classes on icons inside components

Components handle icon sizing via CSS. Don't add `size-4`, `w-4 h-4`, or other sizing classes to icons rendered inside `Button`, `DropdownMenuItem`, `InlineAlert`, `Toast`, or other Create UI components - unless the user explicitly asks for a custom icon size.

**Incorrect:**

```tsx
<Button>
  <RiSearchLine className="size-4" />
  <ButtonLabel>Search</ButtonLabel>
</Button>

<DropdownMenuItem>
  <RiSettings3Line className="mr-2 size-4" />
  Settings
</DropdownMenuItem>
```

**Correct:**

```tsx
<Button>
  <RiSearchLine />
  <ButtonLabel>Search</ButtonLabel>
</Button>

<DropdownMenuItem>
  <RiSettings3Line />
  Settings
</DropdownMenuItem>
```

---

## Pass icons as component values, not string keys

Use `icon={RiCheckLine}`, not a string key into a lookup map.

**Incorrect:**

```tsx
const iconMap = {
  check: RiCheckLine,
  alert: RiAlertLine,
}

function StatusIcon({ icon }: { icon: string }) {
  const Icon = iconMap[icon]
  return <Icon />
}

<StatusIcon icon="check" />
```

**Correct:**

```tsx
import { RiCheckLine } from "@create-ui/assets/icons"

function StatusIcon({ icon: Icon }: { icon: React.ComponentType }) {
  return <Icon />
}

<StatusIcon icon={RiCheckLine} />
```
