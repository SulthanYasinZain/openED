import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Skeleton className="h-4 w-48" />

      <div className="mt-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="border-border overflow-hidden rounded-lg border">
          {["row-1", "row-2", "row-3", "row-4", "row-5"].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="hidden h-4 w-20 sm:block" />
              <Skeleton className="hidden h-4 w-32 md:block" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
