import { UploadProvider } from "@/context/upload-context";
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