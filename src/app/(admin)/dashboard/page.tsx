import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return redirect("/login");
  }

  try {
    const payload = await verifyAccessToken(token);

    if (payload.role !== "ADMIN") {
      redirect("/");
    }

    return <div>Dashboard</div>;
  } catch {
    redirect("/login");
  }

  return <>adasd</>;
}
