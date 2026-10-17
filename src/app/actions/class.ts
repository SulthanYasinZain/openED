"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import type { ClassStatus } from "@/generated/prisma/client";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

type PreviousState = {
  error?: string;
};

async function generateUniqueClassCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const generateCode = () => {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    return Array.from(values, (value) => {
      return characters[value % characters.length];
    }).join("");
  };

  let code = generateCode();

  while (
    await prisma.class.findUnique({
      where: { code },
    })
  ) {
    code = generateCode();
  }

  return code;
}

export async function createClassAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const name = formData.get("name");
  const schoolId = Number(formData.get("schoolId"));

  if (typeof name !== "string" || !name.trim()) {
    return {
      error: "Class name must be filled",
    };
  }

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return {
      error: "Organization must be selected",
    };
  }

  try {
    const code = await generateUniqueClassCode();

    const school = await prisma.school.findUnique({
      where: { id: schoolId, isDeleted: false },
      select: { id: true },
    });

    if (!school) {
      return {
        error: "Selected organization not found",
      };
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        code,
        schoolId: school.id,
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "Class",
      entityId: newClass.id,
      description: `Created class "${name.trim()}" (${code})`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Create class error:", error);

    return {
      error: "Failed to create class",
    };
  }
}

export async function duplicateClassAction(
  classId: number,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const name = formData.get("name");

  if (!Number.isInteger(classId) || classId <= 0) {
    return { error: "Invalid class ID" };
  }

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Class name must be filled" };
  }

  try {
    const source = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        schoolId: true,
        imageUrl: true,
        isDeleted: true,
        meetings: {
          where: { isDeleted: false },
          select: {
            topic: true,
            description: true,
            scheduledAt: true,
            status: true,
            materials: {
              where: { isDeleted: false },
              select: {
                title: true,
                description: true,
                type: true,
                fileUrl: true,
                fileHash: true,
              },
            },
          },
        },
      },
    });

    if (!source || source.isDeleted) {
      return { error: "Class not found" };
    }

    const code = await generateUniqueClassCode();

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        code,
        schoolId: source.schoolId,
        imageUrl: source.imageUrl,
        meetings: {
          create: source.meetings.map((meeting) => ({
            topic: meeting.topic,
            description: meeting.description,
            scheduledAt: meeting.scheduledAt,
            status: meeting.status,
            materials: {
              create: meeting.materials.map((material) => ({
                title: material.title,
                description: material.description,
                type: material.type,
                fileUrl: material.fileUrl,
                fileHash: material.fileHash,
              })),
            },
          })),
        },
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "Class",
      entityId: newClass.id,
      description: `Duplicated class #${classId} as "${name.trim()}" (${code})`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Duplicate class error:", error);

    return {
      error: "Failed to duplicate class",
    };
  }
}

export async function updateClassAction(
  classId: number,
  input: {
    name: string;
    schoolId: number;
    teacherIds: number[];
    studentIds: number[];
  },
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const schoolId = Number(input.schoolId);
  const teacherIds = [...new Set((input.teacherIds ?? []).map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0,
  );
  const studentIds = [...new Set((input.studentIds ?? []).map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0,
  );

  if (!Number.isInteger(classId) || classId <= 0) {
    return { error: "Invalid class ID" };
  }

  if (!name) {
    return { error: "Class name must be filled" };
  }

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return { error: "Organization must be selected" };
  }

  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId, isDeleted: false },
      select: { id: true },
    });

    if (!school) {
      return { error: "Selected organization not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.class.update({
        where: { id: classId },
        data: { name, schoolId },
      });

      const currentTeachers = await tx.classTeacher.findMany({
        where: { classId },
        select: { id: true, teacherId: true, isDeleted: true },
      });
      const activeTeacherIds = new Set(
        currentTeachers
          .filter((item) => !item.isDeleted)
          .map((item) => item.teacherId),
      );

      for (const teacherId of teacherIds) {
        if (activeTeacherIds.has(teacherId)) {
          continue;
        }
        const existing = currentTeachers.find(
          (item) => item.teacherId === teacherId,
        );
        if (existing) {
          await tx.classTeacher.update({
            where: { id: existing.id },
            data: { isDeleted: false },
          });
        } else {
          await tx.classTeacher.create({ data: { classId, teacherId } });
        }
      }

      for (const item of currentTeachers) {
        if (!item.isDeleted && !teacherIds.includes(item.teacherId)) {
          await tx.classTeacher.update({
            where: { id: item.id },
            data: { isDeleted: true },
          });
        }
      }

      const currentStudents = await tx.studentEnrollment.findMany({
        where: { classId },
        select: { id: true, studentId: true, isDeleted: true },
      });
      const activeStudentIds = new Set(
        currentStudents
          .filter((item) => !item.isDeleted)
          .map((item) => item.studentId),
      );

      for (const studentId of studentIds) {
        if (activeStudentIds.has(studentId)) {
          continue;
        }
        const existing = currentStudents.find(
          (item) => item.studentId === studentId,
        );
        if (existing) {
          await tx.studentEnrollment.update({
            where: { id: existing.id },
            data: { isDeleted: false },
          });
        } else {
          await tx.studentEnrollment.create({ data: { classId, studentId } });
        }
      }

      for (const item of currentStudents) {
        if (!item.isDeleted && !studentIds.includes(item.studentId)) {
          await tx.studentEnrollment.update({
            where: { id: item.id },
            data: { isDeleted: true },
          });
        }
      }
    });

    await logAudit({
      action: "UPDATE",
      entityType: "Class",
      entityId: classId,
      description: `Updated class "${name}" details, teachers, and students`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Update class error:", error);

    return {
      error: "Failed to update class",
    };
  }
}

export async function updateClassStatusAction(
  classId: number,
  status: ClassStatus,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  if (
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)
  ) {
    return { error: "Invalid class or status" };
  }

  try {
    const target = await prisma.class.update({
      where: { id: classId },
      data: { status },
      select: { name: true },
    });

    await logAudit({
      action: "UPDATE",
      entityType: "Class",
      entityId: classId,
      description: `Set class "${target.name}" status to ${status}`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Update class status error:", error);

    return {
      error: "Failed to update status",
    };
  }
}

export async function bulkUpdateClassStatusAction(
  classIds: number[],
  status: ClassStatus,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const ids = [...new Set(classIds)].filter(
    (id) => Number.isInteger(id) && id > 0,
  );

  if (ids.length === 0) {
    return { error: "No classes selected" };
  }

  if (!["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
    return { error: "Invalid status" };
  }

  try {
    const targets = await prisma.class.findMany({
      where: { id: { in: ids }, isDeleted: false },
      select: { id: true, name: true },
    });

    await prisma.class.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    for (const target of targets) {
      await logAudit({
        action: "UPDATE",
        entityType: "Class",
        entityId: target.id,
        description: `Set class "${target.name}" status to ${status}`,
      });
    }

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Bulk update class status error:", error);

    return {
      error: "Failed to update status",
    };
  }
}

export async function bulkDeleteClassesAction(classIds: number[]) {
  await checkSession("ADMIN");

  const ids = [...new Set(classIds)].filter(
    (id) => Number.isInteger(id) && id > 0,
  );

  if (ids.length === 0) {
    return { error: "No classes selected" };
  }

  try {
    const targets = await prisma.class.findMany({
      where: { id: { in: ids }, isDeleted: false },
      select: { id: true, name: true },
    });

    await prisma.class.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    });

    for (const target of targets) {
      await logAudit({
        action: "DELETE",
        entityType: "Class",
        entityId: target.id,
        description: `Deactivated class "${target.name}"`,
      });
    }

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Bulk delete classes error:", error);

    return {
      error: "Failed to delete classes",
    };
  }
}

export async function deleteClassAction(classId: number, _formData: FormData) {
  await checkSession("ADMIN");

  try {
    const target = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true, code: true },
    });

    await prisma.class.update({
      where: {
        id: classId,
      },
      data: {
        isDeleted: true,
      },
    });

    await logAudit({
      action: "DELETE",
      entityType: "Class",
      entityId: classId,
      description: `Deactivated class "${target?.name ?? `#${classId}`}"${target ? ` (${target.code})` : ""}`,
    });

    revalidatePath("/dashboard");
    return { error: "" };
  } catch (error) {
    console.error("delete class error:", error);

    return {
      error: "Failed to delete class",
    };
  }
}
