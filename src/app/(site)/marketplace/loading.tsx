import { Skeleton } from "@/components/ui/primitives";

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-5 h-9 w-full rounded-lg" />
    </div>
  );
}

export default function MarketplaceLoading() {
  return (
    <div aria-busy="true" aria-label="Loading marketplace">
      <div className="border-b border-line bg-white">
        <div className="container-page py-10 sm:py-14">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-full max-w-md" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg" />
          <Skeleton className="mt-6 h-12 w-full max-w-2xl rounded-lg" />
        </div>
      </div>
      <div className="container-page grid gap-6 py-10 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8">
        <div className="hidden space-y-4 rounded-xl border border-line bg-white p-5 shadow-card lg:block">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full lg:hidden" />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
