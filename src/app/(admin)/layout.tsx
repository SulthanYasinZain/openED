import AdminSidebar from "@/components/admin-sidebar";
import AiChatSheet from "@/components/ai-chat-sheet";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { checkSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkSession("ADMIN");

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>{children}</SidebarInset>
      <AiChatSheet />
    </SidebarProvider>
  );
}
