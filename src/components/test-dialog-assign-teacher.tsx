'use client';

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from '@hugeicons/react';
import { MentorIcon } from '@hugeicons/core-free-icons';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type TeacherData = {
  id: number;
  name: string | null;
  email: string;
};

export default function AssignTeacherButton({teacherList} : TeacherData[]){
    const teacherItems = teacherList.map((teacher) => ({
  value: teacher.id.toString(),
  label: teacher.name ?? teacher.email,
}));

    return(
        <Dialog modal={false}>
      <form>
         <DialogTrigger render={<Button variant="ghost"><HugeiconsIcon icon={MentorIcon}  strokeWidth={2} /> Add Teacher</Button>} />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Teacher To Class</DialogTitle>
            <DialogDescription>
              Add Teacher Here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
            <Field>
              <Label htmlFor="teacher">Teacher</Label>
              <Combobox items={teacherItems}>
  <ComboboxInput placeholder="Select teachers" />

  <ComboboxContent>
    <ComboboxEmpty>No items found.</ComboboxEmpty>

    <ComboboxList>
      {(item) => (
        <ComboboxItem
          key={item.value}
          value={item}
        >
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
            </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
        
    );
}