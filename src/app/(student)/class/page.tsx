import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { checkSession } from "@/lib/session";
export default async function ClassPage() {
  const sessionData = await checkSession("STUDENT");
  return <p>adasd</p>;
}
