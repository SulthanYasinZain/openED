import { Skeleton } from "@/components/ui/skeleton";

export default function LogsLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Skeleton className="h-4 w-48" />

      <div className="mt-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-9 w-32" />
        </div>
        {["log-1", "log-2", "log-3", "log-4", "log-5"].map((log) => (
          <div
            key={log}
            className="flex flex-col gap-2 rounded-xl border border-border bg-white px-4 py-3"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </main>
  );
}
