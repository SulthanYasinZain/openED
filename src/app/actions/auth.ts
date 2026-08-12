"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAccessToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const saltRounds = 10;

type previousState = {
  error?: string;
};

export async function loginAction(
  _previousState: previousState,
  formData: FormData,
): Promise<previousState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Type must be String" };
  }

  if (!email.trim() || !password) {
    return { error: "All fields must be filled" };
  }

  if (password.lenght < 8) {
    return { error: "Password must be 8 characters long" };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) {
    return { error: "Invalid email or password" };
  }

  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };

  const token = await createAccessToken(tokenPayload);

  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  switch (user.role) {
    case "ADMIN":
      return redirect("/dashboard");
    case "TEACHER":
      return redirect("/course");
    case "STUDENT":
      return redirect("/class");
    default:
      return redirect("/login");
  }
}

export async function registerAction(
  _previousState: previousState,
  formData: FormData,
): Promise<previousState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Type must be String" };
  }

  if (!email.trim() || !password) {
    return { error: "All fields must be filled" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (existingUser) {
    return { error: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    },
  });

  redirect("/login");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}
