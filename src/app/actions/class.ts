"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
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
  const imageUrl = formData.get("imageUrl");

  if (typeof name !== "string" || !name.trim()) {
    return {
      error: "Class name must be filled",
    };
  }

  if (imageUrl !== null && typeof imageUrl !== "string") {
    return {
      error: "Invalid image URL",
    };
  }

  try {
    const code = await generateUniqueClassCode();

    const school = await prisma.school.findFirst({
      where: { isDeleted: false },
      orderBy: { id: "asc" },
      select: { id: true },
    });

    if (!school) {
      return {
        error: "No school found",
      };
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        code,
        schoolId: school.id,
        imageUrl: imageUrl?.trim() || null,
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
