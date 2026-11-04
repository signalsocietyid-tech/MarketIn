import { Card, Skeleton } from "@/components/ui/primitives";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3.5 w-24" />
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex gap-2 border-b border-line px-5 py-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
