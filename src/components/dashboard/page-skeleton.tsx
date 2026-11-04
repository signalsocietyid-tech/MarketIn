import { Card, Skeleton } from "@/components/ui/primitives";

/** Generic loading skeleton for dashboard list pages (header, optional stat row, list). */
export function PageSkeleton({ stats = 4, rows = 6, variant = "list" }: { stats?: number; rows?: number; variant?: "list" | "grid" }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      {stats > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-3 h-7 w-16" />
              <Skeleton className="mt-3 h-3 w-32" />
            </Card>
          ))}
        </div>
      )}
      <Skeleton className="mb-4 h-10 w-80 max-w-full" />
      {variant === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }, (_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="mt-4 h-10 w-full" />
              <Skeleton className="mt-4 h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-line">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-3 w-72 max-w-full" />
                </div>
                <Skeleton className="hidden h-6 w-20 sm:block" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
