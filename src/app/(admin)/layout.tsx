import { UploadProvider } from "@/context/uploadContext";
import UploadDialog from "@/components/UploadDialog";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadProvider>
      {children}
      <UploadDialog />
    </UploadProvider>
  );
}
