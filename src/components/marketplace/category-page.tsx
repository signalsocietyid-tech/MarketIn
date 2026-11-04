import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/lib/constants";
import type { MarketCategory } from "@/lib/types";
import { countOpportunitiesByCategory, searchOpportunities, searchPartners } from "@/lib/data/queries";
import { getTaxonomies, getViewerContext } from "@/lib/data/marketplace-queries";
import { roleCan } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "./category-config";
import { firstParam, parseOpportunityFilters, parsePartnerFilters, type RawSearchParams } from "./filter-params";
import { SearchFilters } from "./search-filters";
import { OpportunityResults } from "./opportunity-results";
import { PartnerResults } from "./partner-results";

/** Shared server component behind /marketplace/{sales,affiliate,kol,agencies}. */
export async function CategoryPage({ category, searchParams }: { category: MarketCategory; searchParams: RawSearchParams }) {
  const meta = CATEGORY_META[category];
  const cfg = CATEGORY_CONFIG[category];
  const Icon = cfg.icon;
  const view = firstParam(searchParams.view) === "partners" ? "partners" : "opportunities";

  const [viewer, taxonomies, counts] = await Promise.all([getViewerContext(), getTaxonomies(), countOpportunitiesByCategory()]);
  const { user } = viewer;
  const signedIn = !!user;

  const tabs = [
    { key: "opportunities", label: "Opportunities", href: meta.href, count: counts[category] ?? 0 },
    { key: "partners", label: "Partners", href: `${meta.href}?view=partners` },
  ] as const;

  let results: React.ReactNode;
  if (view === "partners") {
    const filters = parsePartnerFilters(searchParams, {
      advanced: viewer.advanced,
      kind: cfg.partnerKind,
      defaults: cfg.partnerDefaults,
    });
    const partners = await searchPartners(cfg.partnerKind, filters);
    results = (
      <PartnerResults
        items={partners}
        savedIds={viewer.saved}
        signedIn={signedIn}
        showSave={!user || roleCan(user.role, "savePartners")}
        clearHref={`${meta.href}?view=partners`}
        noun={cfg.partnerNoun}
      />
    );
  } else {
    const filters = parseOpportunityFilters(searchParams, { advanced: viewer.advanced, category });
    const items = await searchOpportunities(filters, { includePremium: viewer.premium });
    results = <OpportunityResults items={items} savedIds={viewer.saved} signedIn={signedIn} clearHref={meta.href} />;
  }

  return (
    <>
      <section className="border-b border-white/70 bg-white/40 backdrop-blur-xl">
        <div className="container-page pt-8 sm:pt-10">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1 text-[13px] text-subtle">
            <Link href="/marketplace" className="hover:text-ink">
              Marketplace
            </Link>
            <ChevronRight className="size-3.5 text-muted" />
            <span className="text-ink">{meta.label}</span>
          </nav>

          <div className="mt-6 flex flex-col items-center gap-5 text-center">
            <div className="flex max-w-2xl flex-col items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_12px_24px_-10px_rgb(244_119_53/0.8)]">
                <Icon className="size-6" />
              </span>
              <div>
                <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[44px]">{meta.label}</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-subtle">{cfg.description}</p>
              </div>
            </div>
            <HeaderCta role={user?.role} />
          </div>

          <nav aria-label="Marketplace view" className="-mb-px mt-8 flex justify-center gap-6">
            {tabs.map((t) => {
              const active = t.key === view;
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors",
                    active ? "border-brand-500 text-navy-900" : "border-transparent text-subtle hover:text-ink",
                  )}
                >
                  {t.key === "partners" ? cfg.partnerLabel : t.label}
                  {"count" in t && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px text-[11px]",
                        active ? "bg-brand-50 text-brand-800" : "bg-canvas text-subtle",
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8">
        <SearchFilters
          key={view}
          mode={view === "partners" ? "partner" : "opportunity"}
          kind={cfg.partnerKind}
          category={category}
          taxonomies={taxonomies}
          advancedUnlocked={viewer.advanced}
          defaults={view === "partners" ? cfg.partnerDefaults : undefined}
        />
        <div className="min-w-0">{results}</div>
      </div>
    </>
  );
}

function HeaderCta({ role }: { role?: string }) {
  if (role === "business") {
    return (
      <Button asChild variant="primary" className="self-start md:self-auto">
        <Link href="/dashboard/opportunities/new">
          Post an opportunity <ArrowRight />
        </Link>
      </Button>
    );
  }
  if (!role) {
    return (
      <Button asChild variant="secondary" className="self-start md:self-auto">
        <Link href="/register">
          Create free account <ArrowRight />
        </Link>
      </Button>
    );
  }
  return null;
}
