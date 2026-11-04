import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { SortSelect } from "./search-filters";

/** Count + sort bar shown above a results grid. */
export function ResultsHeader({
  count,
  noun,
  sortOptions,
}: {
  count: number;
  noun: [singular: string, plural: string];
  sortOptions: readonly { value: string; label: string }[];
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-subtle" aria-live="polite">
        <span className="font-semibold text-ink">{count.toLocaleString("en")}</span> {count === 1 ? noun[0] : noun[1]}
      </p>
      <SortSelect options={sortOptions} />
    </div>
  );
}

export function NoResults({ clearHref, title, description }: { clearHref: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-white">
      <EmptyState
        icon={SearchX}
        title={title}
        description={description}
        action={
          <Button asChild variant="secondary">
            <Link href={clearHref} scroll={false}>
              Clear filters
            </Link>
          </Button>
        }
      />
    </div>
  );
}
