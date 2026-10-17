"use client";

import { Building02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { updateClassAction } from "@/app/actions/class";
import type { SchoolOption } from "@/components/create-class-dialog";
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "./class-member-cell";
import type { ClassRow } from "./classes-data-table";

type PersonOption = {
  id: number;
  label: string;
};

function toOption(member: Member): PersonOption {
  return { id: member.id, label: member.name ?? member.email };
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: PersonOption[];
  value: PersonOption[];
  onChange: (value: PersonOption[]) => void;
  placeholder: string;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      items={options}
      itemToStringValue={(person) => person.label}
      isItemEqualToValue={(itemValue, current) => itemValue.id === current.id}
      value={value}
      onValueChange={onChange}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: PersonOption[]) => (
            <>
              {values.map((person) => (
                <ComboboxChip key={person.id}>{person.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(person) => (
            <ComboboxItem key={person.id} value={person}>
              {person.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function EditClassDialog({
  classItem,
  schools,
  teachers,
  students,
  open,
  onOpenChange,
}: {
  classItem: ClassRow;
  schools: SchoolOption[];
  teachers: Member[];
  students: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const teacherOptions = teachers.map(toOption);
  const studentOptions = students.map(toOption);

  const [name, setName] = useState(classItem.name);
  const [schoolId, setSchoolId] = useState(String(classItem.schoolId));
  const [selectedTeachers, setSelectedTeachers] = useState<PersonOption[]>(() =>
    classItem.teachers.map(toOption),
  );
  const [selectedStudents, setSelectedStudents] = useState<PersonOption[]>(() =>
    classItem.students.map(toOption),
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(value: boolean) {
    onOpenChange(value);
    if (value) {
      setName(classItem.name);
      setSchoolId(String(classItem.schoolId));
      setSelectedTeachers(classItem.teachers.map(toOption));
      setSelectedStudents(classItem.students.map(toOption));
      setError("");
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Class name must be filled");
      return;
    }

    if (!schoolId) {
      setError("Organization must be selected");
      return;
    }

    startTransition(async () => {
      const result = await updateClassAction(classItem.id, {
        name,
        schoolId: Number(schoolId),
        teacherIds: selectedTeachers.map((person) => person.id),
        studentIds: selectedStudents.map((person) => person.id),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setError("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit class</DialogTitle>
          <DialogDescription>
            Update the class details, teachers, and students.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-class-name">Class name</Label>
              <Input
                id="edit-class-name"
                value={name}
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-class-school">Organization</Label>
              <Select
                value={schoolId}
                onValueChange={(value) => setSchoolId(value ?? "")}
              >
                <SelectTrigger id="edit-class-school" className="w-full">
                  <HugeiconsIcon
                    icon={Building02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  <SelectValue placeholder="Select organization..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {schools.map((school) => (
                      <SelectItem
                        key={school.id}
                        value={String(school.id)}
                        className="px-3 py-2"
                      >
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Teachers</Label>
              <MultiSelect
                options={teacherOptions}
                value={selectedTeachers}
                onChange={setSelectedTeachers}
                placeholder="Search teachers..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Students</Label>
              <MultiSelect
                options={studentOptions}
                value={selectedStudents}
                onChange={setSelectedStudents}
                placeholder="Search students..."
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
