"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import {
  AssignTeacherAction,
  RemoveTeacherAction,
} from "@/app/actions/classTeacher";
import {
  EnrollStudentAction,
  RemoveStudentAction,
} from "@/app/actions/studentPlacement";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { avatarColorClass } from "./avatar-color";

export type Member = {
  id: number;
  name: string | null;
  email: string;
};

type PersonOption = {
  id: number;
  label: string;
};

const MAX_VISIBLE = 3;

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase();
}

export default function ClassMemberCell({
  classId,
  className,
  kind,
  members,
  options,
}: {
  classId: number;
  className: string;
  kind: "teacher" | "student";
  members: Member[];
  options: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PersonOption[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const anchor = useComboboxAnchor();

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - visible.length;

  const singular = kind === "teacher" ? "teacher" : "student";
  const plural = kind === "teacher" ? "teachers" : "students";

  const memberIds = new Set(members.map((member) => member.id));
  const existingOptions: PersonOption[] = members.map((member) => ({
    id: member.id,
    label: member.name ?? member.email,
  }));
  const addableOptions: PersonOption[] = options
    .filter((person) => !memberIds.has(person.id))
    .map((person) => ({
      id: person.id,
      label: person.name ?? person.email,
    }));
  const allOptions = [...existingOptions, ...addableOptions];

  const selectedIds = new Set(selected.map((person) => person.id));
  const toAdd = selected.filter((person) => !memberIds.has(person.id));
  const toRemove = members.filter((member) => !selectedIds.has(member.id));
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  function handleSubmit() {
    const field = kind === "teacher" ? "teacherId" : "studentId";
    const addAction =
      kind === "teacher" ? AssignTeacherAction : EnrollStudentAction;
    const removeAction =
      kind === "teacher" ? RemoveTeacherAction : RemoveStudentAction;

    startTransition(async () => {
      for (const person of toAdd) {
        const formData = new FormData();
        formData.set("classId", String(classId));
        formData.set(field, String(person.id));
        const result = await addAction({ error: "" }, formData);
        if (result.error) {
          setError(`${person.label}: ${result.error}`);
          return;
        }
      }
      for (const member of toRemove) {
        const formData = new FormData();
        formData.set("classId", String(classId));
        formData.set(field, String(member.id));
        const result = await removeAction({ error: "" }, formData);
        if (result.error) {
          setError(`${member.name ?? member.email}: ${result.error}`);
          return;
        }
      }
      setError("");
      setSelected(existingOptions);
      setOpen(false);
    });
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (value) {
            setError("");
            setSelected(existingOptions);
          }
        }}
      >
        {members.length > 0 ? (
          <AvatarGroup>
            {visible.map((member) => (
              <Avatar
                key={member.id}
                size="sm"
                title={member.name ?? member.email}
              >
                <AvatarFallback
                  className={avatarColorClass(member.name ?? member.email)}
                >
                  {initials(member.name, member.email)}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflow > 0 && (
              <AvatarGroupCount title={`${overflow} more ${plural}`}>
                +{overflow}
              </AvatarGroupCount>
            )}
            <DialogTrigger
              render={
                <button
                  type="button"
                  aria-label={`Manage ${plural}`}
                  title={`Manage ${plural}`}
                  className="relative z-10 ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-stone-300 bg-white text-stone-500 ring-2 ring-background transition-colors hover:border-stone-500 hover:text-stone-900"
                >
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    size={12}
                    strokeWidth={2}
                  />
                </button>
              }
            />
          </AvatarGroup>
        ) : (
          <DialogTrigger
            render={
              <button
                type="button"
                aria-label={`Manage ${plural}`}
                title={`Manage ${plural}`}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-stone-300 bg-white text-stone-500 transition-colors hover:border-stone-500 hover:text-stone-900"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2} />
              </button>
            }
          />
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manage {plural} in {className}
            </DialogTitle>
            <DialogDescription>
              Remove an existing {singular} or search to add a new one.
            </DialogDescription>
          </DialogHeader>
          <Combobox
            multiple
            items={allOptions}
            itemToStringValue={(person) => person.label}
            isItemEqualToValue={(itemValue, value) => itemValue.id === value.id}
            value={selected}
            onValueChange={(value) => setSelected(value)}
          >
            <ComboboxChips ref={anchor}>
              <ComboboxValue>
                {(values: PersonOption[]) => (
                  <>
                    {values.map((value) => (
                      <ComboboxChip key={value.id}>{value.label}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      placeholder={`Search ${plural}...`}
                      aria-label={`Search ${plural}`}
                      disabled={isPending}
                    />
                  </>
                )}
              </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>
                {options.length === 0
                  ? `No ${plural} available.`
                  : `No ${singular} found.`}
              </ComboboxEmpty>
              <ComboboxList>
                {(person) => (
                  <ComboboxItem key={person.id} value={person}>
                    {person.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              disabled={!hasChanges || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
