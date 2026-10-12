"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { AssignTeacherAction } from "@/app/actions/classTeacher";
import { EnrollStudentAction } from "@/app/actions/studentPlacement";
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
  const memberIds = new Set(members.map((member) => member.id));
  const available: PersonOption[] = options
    .filter((person) => !memberIds.has(person.id))
    .map((person) => ({
      id: person.id,
      label: person.name ?? person.email,
    }));

  const singular = kind === "teacher" ? "teacher" : "student";
  const plural = kind === "teacher" ? "teachers" : "students";

  function handleSubmit() {
    const formBase = new FormData();
    formBase.set("classId", String(classId));
    const action =
      kind === "teacher" ? AssignTeacherAction : EnrollStudentAction;
    const field = kind === "teacher" ? "teacherId" : "studentId";
    startTransition(async () => {
      for (const person of selected) {
        const formData = new FormData();
        formData.set("classId", String(classId));
        formData.set(field, String(person.id));
        const result = await action({ error: "" }, formData);
        if (result.error) {
          setError(`${person.label}: ${result.error}`);
          return;
        }
      }
      setError("");
      setSelected([]);
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {members.length > 0 ? (
        <AvatarGroup>
          {visible.map((member) => (
            <Avatar
              key={member.id}
              size="sm"
              title={member.name ?? member.email}
            >
              <AvatarFallback>
                {initials(member.name, member.email)}
              </AvatarFallback>
            </Avatar>
          ))}
          {overflow > 0 && (
            <AvatarGroupCount title={`${overflow} more ${plural}`}>
              +{overflow}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
      ) : (
        <span className="text-muted-foreground text-xs">No {singular}</span>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (value) {
            setError("");
            setSelected([]);
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Add ${singular}`}
              title={`Add ${singular}`}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {plural} to {className}
            </DialogTitle>
            <DialogDescription>
              Search and pick one or more {plural} to add to this class.
            </DialogDescription>
          </DialogHeader>
          <Combobox
            multiple
            items={available}
            itemToStringValue={(person) => person.label}
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
                {available.length === 0
                  ? "Everyone is already added."
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
              disabled={selected.length === 0 || isPending}
              onClick={handleSubmit}
            >
              {isPending
                ? "Adding..."
                : `Add ${selected.length > 0 ? `${selected.length} ` : ""}${selected.length === 1 ? singular : plural}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
