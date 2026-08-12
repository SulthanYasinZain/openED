import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import JoinClassForm from "@/components/join-class-form";
interface PageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function JoinPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  if (!code || code.length !== 6) {
    return <InvalidPage />;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return redirect("/login");
  }

  let payload;

  try {
    payload = await verifyAccessToken(token);
  } catch {
    redirect("/login");
  }

  if (payload.role !== "STUDENT") {
    return redirect("/");
  }

  const classData = await prisma.class.findUnique({
    where: {
      code,
    },
  });

  if (!classData) {
    return <InvalidPage />;
  }

  return (
    <JoinClassForm classId={classData.id}/>
  );
}

function InvalidPage() {
  return <p>the class code is invalid make sure you add the correct one </p>;
}
