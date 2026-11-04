import type { Metadata } from "next";
import { countOpportunitiesByCategory, searchOpportunities } from "@/lib/data/queries";
import { getTaxonomies, getViewerContext } from "@/lib/data/marketplace-queries";
import { CategoryTiles, FindPartnersStrip } from "@/components/marketplace/category-tiles";
import { KeywordSearch, SearchFilters } from "@/components/marketplace/search-filters";
import { OpportunityResults } from "@/components/marketplace/opportunity-results";
import { parseOpportunityFilters } from "@/components/marketplace/filter-params";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse sales, affiliate, KOL and agency partnership opportunities from businesses across Indonesia, and find partners to grow with.",
};

export default async function MarketplacePage(props: PageProps<"/marketplace">) {
  const sp = await props.searchParams;
  const [viewer, taxonomies, counts] = await Promise.all([getViewerContext(), getTaxonomies(), countOpportunitiesByCategory()]);
  const filters = parseOpportunityFilters(sp, { advanced: viewer.advanced });
  const items = await searchOpportunities(filters, { includePremium: viewer.premium });

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">Marketplace</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
              Find your next growth partnership
            </h1>
            <p className="mt-3 text-base leading-relaxed text-subtle sm:text-[17px]">
              Sales, distribution, affiliate, creator and agency opportunities from businesses across Indonesia.
            </p>
          </div>
          <KeywordSearch id="marketplace-q" size="lg" className="mt-6 max-w-2xl" />
        </div>
      </section>

      <div className="container-page space-y-12 py-10">
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-4 text-lg font-semibold text-navy-900">
            Browse by category
          </h2>
          <CategoryTiles counts={counts} />
        </section>

        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-4 text-lg font-semibold text-navy-900">
            All opportunities
          </h2>
          <div className="grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8">
            <SearchFilters mode="opportunity" taxonomies={taxonomies} advancedUnlocked={viewer.advanced} showSearch={false} />
            <div className="min-w-0">
              <OpportunityResults items={items} savedIds={viewer.saved} signedIn={!!viewer.user} clearHref="/marketplace" />
            </div>
          </div>
        </section>

        <FindPartnersStrip />
      </div>
    </>
  );
}
