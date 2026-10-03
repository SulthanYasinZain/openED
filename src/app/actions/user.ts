"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

const saltRounds = 10;

const roleSchema = z.enum(["ADMIN", "MENTOR", "STUDENT", "SCHOOL"]);

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name must be filled").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: roleSchema,
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name must be filled").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  role: roleSchema,
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
});

type PreviousState = {
  error?: string;
};

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
  };
}

export async function createUserAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const parsed = createUserSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, isDeleted: true },
  });

  if (existing && !existing.isDeleted) {
    return { error: "Email already registered" };
  }

  try {
    const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
          role: parsed.data.role,
          isDeleted: false,
        },
      });

      await logAudit({
        action: "RESTORE",
        entityType: "User",
        entityId: existing.id,
        description: `Restored ${parsed.data.role} account ${parsed.data.email}`,
      });
    } else {
      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
          role: parsed.data.role,
        },
      });

      await logAudit({
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        description: `Created ${parsed.data.role} account ${parsed.data.email}`,
      });
    }

    revalidatePath("/dashboard/users");

    return { error: "" };
  } catch (error) {
    console.error("Create user error:", error);

    return { error: "Failed to create user" };
  }
}

export async function updateUserAction(
  userId: number,
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  const session = await checkSession("ADMIN");

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Invalid user ID" };
  }

  const parsed = updateUserSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (userId === session.userId && parsed.data.role) {
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (current && current.role !== parsed.data.role) {
      return { error: "You cannot change your own role" };
    }
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, isDeleted: true },
  });

  if (emailTaken && emailTaken.id !== userId && !emailTaken.isDeleted) {
    return { error: "Email already registered" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        ...(parsed.data.password
          ? { password: await bcrypt.hash(parsed.data.password, saltRounds) }
          : {}),
      },
    });

    revalidatePath("/dashboard/users");

    await logAudit({
      action: "UPDATE",
      entityType: "User",
      entityId: userId,
      description: `Updated account ${parsed.data.email}`,
    });

    return { error: "" };
  } catch (error) {
    console.error("Update user error:", error);

    return { error: "Failed to update user" };
  }
}

export async function deleteUserAction(userId: number, _formData: FormData) {
  const session = await checkSession("ADMIN");

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Invalid user ID" };
  }

  if (userId === session.userId) {
    return { error: "You cannot delete your own account" };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    await logAudit({
      action: "DELETE",
      entityType: "User",
      entityId: userId,
      description: `Deactivated account ${target?.email ?? `#${userId}`}`,
    });

    revalidatePath("/dashboard/users");

    return { error: "" };
  } catch (error) {
    console.error("Delete user error:", error);

    return { error: "Failed to delete user" };
  }
}
