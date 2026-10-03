"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

const createSchoolSchema = z.object({
  name: z.string().trim().min(1, "Name must be filled").max(100),
  address: z.string().trim().max(255).optional(),
});

type PreviousState = {
  error?: string;
};

export async function createSchoolAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const parsed = createSchoolSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const school = await prisma.school.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address || null,
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "School",
      entityId: school.id,
      description: `Created organization "${parsed.data.name}"`,
    });

    revalidatePath("/dashboard/organizations");

    return { error: "" };
  } catch (error) {
    console.error("Create organization error:", error);

    return { error: "Failed to create organization" };
  }
}

export async function deleteSchoolAction(
  schoolId: number,
  _formData: FormData,
) {
  await checkSession("ADMIN");

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return { error: "Invalid organization ID" };
  }

  const activeClasses = await prisma.class.count({
    where: { schoolId, isDeleted: false },
  });

  if (activeClasses > 0) {
    return {
      error: `Cannot delete organization with ${activeClasses} active ${activeClasses === 1 ? "class" : "classes"}`,
    };
  }

  const remaining = await prisma.school.count({
    where: { isDeleted: false },
  });

  if (remaining <= 1) {
    return { error: "Cannot delete the last organization" };
  }

  try {
    const target = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    });

    await prisma.school.update({
      where: { id: schoolId },
      data: { isDeleted: true },
    });

    await logAudit({
      action: "DELETE",
      entityType: "School",
      entityId: schoolId,
      description: `Deactivated organization "${target?.name ?? `#${schoolId}`}"`,
    });

    revalidatePath("/dashboard/organizations");

    return { error: "" };
  } catch (error) {
    console.error("Delete organization error:", error);

    return { error: "Failed to delete organization" };
  }
}
