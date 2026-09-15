# Forms & Inputs

## Contents

- Forms use FieldGroup + Field
- Choosing the right form control
- InputGroup requires InputGroupControl/InputGroupTextarea
- Buttons inside inputs use InputGroup + InputGroupButton
- Option sets (2–7 choices) use SegmentedControl
- Switches are richer than the bare default
- Dropdowns use Select
- FieldSet + FieldLegend for grouping related fields
- Field validation and disabled states

---

## Forms use FieldGroup + Field

Always lay out a form with `FieldGroup` + `Field` - never a raw `div` with `space-y-*`. `Field` owns the size, invalid, disabled and loading state for everything inside it, and the nested control reads that state automatically.

**Incorrect:**

```tsx
<div className="space-y-4">
  <div className="flex flex-col gap-2">
    <label htmlFor="email">Email</label>
    <input id="email" type="email" />
  </div>
</div>
```

**Correct:**

```tsx
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
    <FieldDescription>We'll never share your address.</FieldDescription>
  </Field>
  <Field>
    <FieldLabel htmlFor="password">Password</FieldLabel>
    <Input id="password" type="password" />
  </Field>
</FieldGroup>
```

`Field` accepts `size` (`"xs" | "sm" | "md"`, default `"sm"`) and `orientation` (`"vertical" | "horizontal" | "responsive"`, default `"vertical"`). Size cascades top-down: set it once on `Field` and the control, label, and description inherit it - never re-set the size on each child.

```tsx
// Horizontal layout for settings rows (apply-immediately rows use SwitchGroup instead;
// Field size does not cascade to Switch, so pair the sizes explicitly).
<Field size="md" orientation="horizontal">
  <FieldLabel htmlFor="notifications">Email notifications</FieldLabel>
  <Switch id="notifications" />
</Field>
```

Use `FieldLabel className="sr-only"` for a visually hidden but accessible label.

Beyond the parts above, `field.tsx` also ships `FieldTitle` (a label for non-labelable controls, connect via `aria-labelledby`), `FieldContent` (wraps the control + description in horizontal layouts), `FieldFooter` (a footer row, e.g. helper + counter), `FieldHelper` (small helper text), and `FieldSeparator` (a divider between fields).

---

## Choosing the right form control

Every control below exists in the registry. Pick by intent:

| Need | Use |
|---|---|
| Single-line text | `Input` |
| Multi-line text | `Textarea` |
| Dropdown of predefined options | `Select` |
| Bare boolean toggle (no label row) | `Switch` |
| Labelled apply-immediately settings row | `SwitchGroup` (one labelled row per switch) |
| Boolean in a form | `Checkbox` |
| One choice from a few options | `RadioGroup` |
| One choice across 2–7 visible options | `SegmentedControl` |
| Star / emoji / numeric rating (a review score) | `Rating` *(Pro - needs a developer seat)* |
| Several related on/off options | one labelled row per option - stack `CheckboxGroup` rows (submit-to-save) / `SwitchGroup` rows (apply-immediately) |
| Verification / OTP code | `InputOTP` |
| Numeric value with step controls | `InputStepper` |
| Date | `DateInput` |
| Phone number | `PhoneInput` |
| Card details | `CreditCardInput` |
| Password | `Input type="password"` (add a show/hide toggle with `InputGroup` + `InputGroupButton`; there is no strength-meter primitive) |

---

## InputGroup requires InputGroupControl/InputGroupTextarea

Never put a raw `Input` or `Textarea` inside an `InputGroup`. The group manages size and state through its own context, so use `InputGroupControl` (single-line) or `InputGroupTextarea` (multi-line).

**Incorrect:**

```tsx
<InputGroup>
  <Input placeholder="Search…" />
</InputGroup>
```

**Correct:**

```tsx
import { InputGroup, InputGroupControl } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupControl placeholder="Search…" />
</InputGroup>
```

For multi-line input inside a group, use the `multiline` prop with `InputGroupTextarea`:

```tsx
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"

<InputGroup multiline>
  <InputGroupTextarea placeholder="Leave a comment…" rows={4} />
</InputGroup>
```

---

## Buttons inside inputs use InputGroup + InputGroupButton

Never absolutely-position a `Button` over an `Input`. Compose `InputGroup` + `InputGroupButton` (or `InputGroupAddon` for non-interactive affordances). `InputGroupButton` inherits the group's size and state, so you don't set `size` on it. Like `Button`, it takes no `leading` / `trailing`: compose the icon as a child and wrap the text in `<ButtonLabel>`; for an icon-only button set `iconOnly` and pass the icon as the child - never a `data-icon` attribute.

**Incorrect:**

```tsx
<div className="relative">
  <Input placeholder="Search…" className="pr-10" />
  <Button className="absolute right-0 top-0" iconOnly aria-label="Search">
    <RiSearchLine />
  </Button>
</div>
```

**Correct:**

```tsx
import { InputGroup, InputGroupControl, InputGroupButton } from "@/components/ui/input-group"
import { RiSearchLine } from "@create-ui/assets/icons"

<InputGroup>
  <InputGroupControl placeholder="Search…" />
  <InputGroupButton iconOnly aria-label="Search">
    <RiSearchLine />
  </InputGroupButton>
</InputGroup>
```

For a static prefix/suffix (currency, unit, helper text) use `InputGroupAddon` instead of a button:

```tsx
import { InputGroup, InputGroupControl, InputGroupAddon } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupAddon>$</InputGroupAddon>
  <InputGroupControl placeholder="0.00" inputMode="decimal" />
  <InputGroupAddon>USD</InputGroupAddon>
</InputGroup>
```

---

## Option sets (2–7 choices) use SegmentedControl

For a small set of mutually-exclusive choices, use `SegmentedControl` + `SegmentedControlItem`. Don't hand-roll a row of `Button`s with manual active state.

**Incorrect:**

```tsx
const [selected, setSelected] = useState("daily")

<div className="flex gap-2">
  {["daily", "weekly", "monthly"].map((option) => (
    <Button
      key={option}
      appearance={selected === option ? "solid" : "outline"}
      onClick={() => setSelected(option)}
    >
      {option}
    </Button>
  ))}
</div>
```

**Correct:**

```tsx
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

<SegmentedControl defaultValue="daily">
  <SegmentedControlItem value="daily">Daily</SegmentedControlItem>
  <SegmentedControlItem value="weekly">Weekly</SegmentedControlItem>
  <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
</SegmentedControl>
```

`SegmentedControl` is single-select: the value props are `value` / `defaultValue` / `onValueChange` (a string - there is no `type="multiple"`). Style it with `variant` (`primary` | `neutral`) and `appearance` (`flat` | `grouped` - `grouped` wraps the items in a padded `bg-weak` container, the classic pricing-toggle look; the active pill slides with an animated indicator in **both** appearances). Items take `leading` / `trailing` / `iconOnly`. When more than one option can be active at once, that's not a segmented control - stack `CheckboxGroup` (or `SwitchGroup`) rows instead.

Wrap a labelled segmented control in a `Field` and connect them with `aria-labelledby`:

```tsx
import { Field, FieldTitle } from "@/components/ui/field"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

<Field orientation="horizontal">
  <FieldTitle id="theme-label">Theme</FieldTitle>
  <SegmentedControl defaultValue="system" aria-labelledby="theme-label">
    <SegmentedControlItem value="light">Light</SegmentedControlItem>
    <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
    <SegmentedControlItem value="system">System</SegmentedControlItem>
  </SegmentedControl>
</Field>
```

The `Field` here must be `orientation="horizontal"` (or wrap the control in a plain `div`): a vertical Field applies `[&>*]:w-full` to every direct child, so an intrinsic-width control like `SegmentedControl` gets stretched to the full field width - `self-start` does not prevent it.

---

## Switches are richer than the bare default

`Switch` is a Radix switch (`checked` / `onCheckedChange` / `defaultChecked`) with a much richer API than `<Switch />`: `variant` (`primary` | `info` | `neutral` | `inverse` | `semantic` - semantic is red when off, green when on), `size` (`xs` | `sm` | `md`), `shape` (`pill` | `rounded`), `thumbType` (`short` | `long`), and the `ioTrigger` / `thumbIcon` booleans for I/O glyphs and check/close icons. Bare defaults are for dense forms; settings pages and showcases should pick deliberate options:

```tsx
<Field size="md" orientation="horizontal">
  <FieldLabel htmlFor="2fa">Enforce two-factor auth</FieldLabel>
  <Switch id="2fa" thumbIcon defaultChecked />
</Field>

<Switch variant="semantic" thumbType="long" ioTrigger aria-label="Accept" />
```

`Field` size does not cascade to `Switch` (it reads only `SwitchContext`). The bare defaults already line up - `Switch` and `Field` are both `sm` - so you only pair explicitly when you move off `sm`: a `<Field size="md">` row needs `<Switch size="md">` on the control too, or the switch stays `sm` and mismatches its label. `SwitchGroup` pairs the two automatically.

Apply-immediately settings rows use `SwitchGroup` - one labelled row per switch; there is no `SwitchGroupItem` (compose `Switch` + `FieldContent` + `LabelMain` per `get_component_reference('switch-group')`). Inside a submit-to-save form prefer `Checkbox` / `CheckboxGroup`: a switch implies the setting takes effect the moment it flips. If a task explicitly demands toggles plus a Save button, keep the toggles deliberately - but don't present that as the default form pattern.

---

## Dropdowns use Select

`Select` is React Aria Components (not Radix), composed from `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem`. There is no `items` prop - render `SelectItem` children. Inside a `Field`, the trigger inherits the field's size, invalid, and disabled state automatically, so set them on `Field`, not on each part.

```tsx
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Field>
  <FieldLabel htmlFor="role">Role</FieldLabel>
  <Select>
    <SelectTrigger id="role">
      <SelectValue placeholder="Select a role" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</Field>
```

`Select` accepts `size` (`"xs" | "sm" | "md"`), `invalid`, `disabled`, and `loading`. When it's not inside a `Field`, set these on the `Select` itself; inside a `Field` they cascade automatically - don't re-set them. Inside an `InputGroup`, also pass `variant="compact"` yourself - only the dedicated `InputGroupSelect` applies compact automatically.

---

## FieldSet + FieldLegend for grouping related fields

Use `FieldSet` + `FieldLegend` to group related checkboxes, radios, or switches - not a `div` with a heading. `FieldLegend` takes `variant="legend"` (default, section-sized) or `variant="label"` (form-control-sized).

```tsx
import {
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"

<FieldSet>
  <FieldLegend variant="label">Notifications</FieldLegend>
  <FieldDescription>Choose what you want to hear about.</FieldDescription>
  <FieldGroup>
    <Field orientation="horizontal">
      <Checkbox id="product" />
      <FieldLabel htmlFor="product">Product updates</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <Checkbox id="security" />
      <FieldLabel htmlFor="security">Security alerts</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

For a single-choice group, swap the checkboxes for a `RadioGroup` inside the same `FieldSet`. When the group is one logical control, reach for the grouped-control primitives directly: `CheckboxGroup`, `SwitchGroup`, and `RadioGroup`.

---

## Field validation and disabled states

`Field` exposes the state two ways: the boolean props `invalid` / `disabled` / `loading`, or the matching `data-invalid` / `data-disabled` / `data-loading` attributes. Either form drives the field styling (label, description, error). The control itself still needs `aria-invalid` / `disabled` so its own visuals and assistive tech reflect the state. Use `FieldError` to render the message.

```tsx
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// Invalid.
<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" aria-invalid />
  <FieldError>Enter a valid email address.</FieldError>
</Field>

// Disabled.
<Field disabled>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" disabled />
</Field>
```

This pattern works for every control: `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, and `InputOTP`.
