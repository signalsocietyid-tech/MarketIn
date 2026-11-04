import { Skeleton } from "@/components/ui/primitives";

export default function OpportunityLoading() {
  return (
    <div aria-busy="true" aria-label="Loading opportunity">
      <div className="border-b border-line bg-white">
        <div className="container-page py-8 sm:py-10">
          <Skeleton className="h-3 w-48" />
          <div className="mt-5 flex items-start gap-4">
            <Skeleton className="size-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-full max-w-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="space-y-6 lg:order-2">
          <div className="space-y-3 rounded-xl border border-line bg-white p-5 shadow-card">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-4 rounded-xl border border-line bg-white p-5 shadow-card">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-6 lg:order-1">
          {[5, 4, 3].map((lines, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-5 shadow-card">
              <Skeleton className="h-4 w-40" />
              <div className="mt-5 space-y-2.5">
                {Array.from({ length: lines }).map((_, j) => (
                  <Skeleton key={j} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
