import type { ProfileView } from "@/lib/data/queries";
import { ProfileCard } from "./profile-card";
import { NoResults, ResultsHeader } from "./results-layout";
import { PARTNER_SORTS } from "./filter-params";

export function PartnerResults({
  items,
  savedIds,
  signedIn,
  showSave,
  clearHref,
  noun,
}: {
  items: ProfileView[];
  savedIds: Set<string>;
  signedIn: boolean;
  showSave: boolean;
  clearHref: string;
  noun: [singular: string, plural: string];
}) {
  return (
    <section aria-label="Partners">
      <ResultsHeader count={items.length} noun={noun} sortOptions={PARTNER_SORTS} />
      {items.length === 0 ? (
        <NoResults
          clearHref={clearHref}
          title={`No ${noun[1]} match your filters`}
          description="Try a broader location or remove a few filters to see more profiles."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              saved={savedIds.has(`profile:${p.id}`)}
              signedIn={signedIn}
              showSave={showSave}
            />
          ))}
        </div>
      )}
    </section>
  );
}
