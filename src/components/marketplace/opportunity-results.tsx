import type { OpportunityView } from "@/lib/data/queries";
import { OpportunityCard } from "./opportunity-card";
import { NoResults, ResultsHeader } from "./results-layout";
import { OPPORTUNITY_SORTS } from "./filter-params";
import { maskLocked } from "./mask";

type ResultItem = OpportunityView & { locked: boolean };

export function OpportunityResults({
  items,
  savedIds,
  signedIn,
  clearHref,
}: {
  items: ResultItem[];
  savedIds: Set<string>;
  signedIn: boolean;
  clearHref: string;
}) {
  return (
    <section aria-label="Opportunities">
      <ResultsHeader count={items.length} noun={["opportunity", "opportunities"]} sortOptions={OPPORTUNITY_SORTS} />
      {items.length === 0 ? (
        <NoResults
          clearHref={clearHref}
          title="No opportunities match your filters"
          description="Try a different keyword or remove a few filters to see more listings."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((o) => (
            <OpportunityCard
              key={o.id}
              opportunity={maskLocked(o, o.locked)}
              locked={o.locked}
              saved={savedIds.has(`opportunity:${o.id}`)}
              signedIn={signedIn}
            />
          ))}
        </div>
      )}
    </section>
  );
}
