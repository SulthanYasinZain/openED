"use client";

import { MentorIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { AssignTeacherAction } from "@/app/actions/classTeacher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type AssignableTeacher = {
  id: number;
  name: string | null;
  email: string;
};

export default function AssignTeacherDialog({
  classId,
  className,
  teacherList,
}: {
  classId: number;
  className: string;
  teacherList: AssignableTeacher[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(AssignTeacherAction, {
    error: "",
  });
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !isPending && !state.error) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [isPending, state.error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Assign teacher"
          >
            <HugeiconsIcon icon={MentorIcon} strokeWidth={2} />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign teacher</DialogTitle>
          <DialogDescription>
            Choose a mentor for {className}.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <input type="hidden" name="classId" value={classId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor={`teacher-${classId}`}>Teacher</Label>
            <select
              id={`teacher-${classId}`}
              name="teacherId"
              required
              defaultValue=""
              className="border-border rounded-lg border bg-transparent px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select a teacher...
              </option>
              {teacherList.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name ?? teacher.email}
                </option>
              ))}
            </select>
          </div>
          {state.error && (
            <p className="mt-3 text-sm text-red-500">{state.error}</p>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
