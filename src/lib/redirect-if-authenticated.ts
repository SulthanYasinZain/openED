import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";

const ROLE_HOME = {
  ADMIN: "/dashboard",
  TEACHER: "/course",
  STUDENT: "/class",
} as const;

export async function redirectIfAuthenticated(): Promise<void> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return;
  }

  try {
    const session = await verifyAccessToken(token);
    redirect(ROLE_HOME[session.role] ?? "/login");
  } catch {
    return;
  }
}
