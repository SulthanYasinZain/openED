"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { checkSession } from "@/lib/session";
type PreviousState = {
  error?: string;
};

export async function generateUniqueClassCode(length = 6) {
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
  await checkSession();

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

    await prisma.class.create({
      data: {
        name: name.trim(),
        code,
        imageUrl: imageUrl?.trim() || null,
      },
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
