import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Lock, MapPin, Sparkles, Users } from "lucide-react";
import { Avatar, Badge, Card, CardHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { OpportunityStatusBadge, VerifiedMark } from "@/components/shared/status-badge";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { ApplyPanel } from "@/components/marketplace/apply-panel";
import { OpportunityKeyFacts } from "@/components/marketplace/opportunity-key-facts";
import { CompanyCard } from "@/components/marketplace/company-card";
import { maskLocked } from "@/components/marketplace/mask";
import { CATEGORY_META } from "@/lib/constants";
import { getOpportunity, getProfileView, getTalents, searchOpportunities } from "@/lib/data/queries";
import {
  getApplicationsForOpportunityByApplicant,
  getViewerContext,
  isOwnerSuspended,
} from "@/lib/data/marketplace-queries";
import { getUsage, roleCan } from "@/lib/permissions";
import { pluralize, timeAgo } from "@/lib/utils";

/** Loads the listing and applies visibility rules (flagged / suspended owner → hidden unless owner or admin). */
async function loadVisible(id: string) {
  const [o, viewer] = await Promise.all([getOpportunity(id), getViewerContext()]);
  if (!o) return null;
  const privileged = viewer.user?.id === o.businessId || viewer.user?.role === "admin";
  if (!privileged && (o.flagged || (await isOwnerSuspended(o.businessId)))) return null;
  return { o, viewer };
}

export async function generateMetadata(props: PageProps<"/opportunities/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const res = await loadVisible(id);
  if (!res) return { title: "Opportunity not found" };
  return {
    title: `${res.o.title} · ${res.o.companyName}`,
    description: res.o.description.slice(0, 160),
  };
}

export default async function OpportunityPage(props: PageProps<"/opportunities/[id]">) {
  const { id } = await props.params;
  const res = await loadVisible(id);
  if (!res) notFound();
  const { o, viewer } = res;
  const user = viewer.user;
  const locked = o.premium && !viewer.premium;
  const isApplicant = !!user && roleCan(user.role, "applyToOpportunity");

  const [company, similar, applications, talents, usage] = await Promise.all([
    getProfileView(o.businessId),
    searchOpportunities({ category: o.category }, { includePremium: viewer.premium }),
    user ? getApplicationsForOpportunityByApplicant(o.id, user.id) : Promise.resolve([]),
    user?.role === "agency" ? getTalents(user.id) : Promise.resolve([]),
    isApplicant && user ? getUsage(user) : Promise.resolve([]),
  ]);
  const monthly = usage.find((m) => m.key === "monthlyApplications");
  const similarItems = similar.filter((s) => s.id !== o.id).slice(0, 3);
  const meta = CATEGORY_META[o.category];

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-subtle">
            <Link href="/marketplace" className="hover:text-ink">
              Marketplace
            </Link>
            <ChevronRight className="size-3.5 text-muted" />
            <Link href={meta.href} className="hover:text-ink">
              {meta.label}
            </Link>
          </nav>

          {o.flagged && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-warning-50 px-4 py-3 text-[13px] text-warning-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              This listing has been flagged for review and is hidden from the marketplace.
            </div>
          )}

          <div className="mt-5 flex items-start gap-4">
            <Avatar name={o.companyName} src={o.businessLogo} size={56} square />
            <div className="min-w-0">
              <Link
                href={`/profiles/${o.businessId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle hover:text-ink"
              >
                {o.companyName}
                {o.businessVerified && <VerifiedMark className="size-4" />}
              </Link>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-navy-900 sm:text-[30px]">{o.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone="neutral">{o.typeLabel}</Badge>
                {o.status !== "open" && <OpportunityStatusBadge status={o.status} />}
                {o.featured && (
                  <Badge tone="brand">
                    <Sparkles /> Featured
                  </Badge>
                )}
                {o.premium && (
                  <Badge tone="navy">
                    <Lock /> Premium
                  </Badge>
                )}
                {o.remote && <Badge tone="outline">Remote-friendly</Badge>}
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-subtle">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted" /> {o.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 text-muted" /> {pluralize(o.applicants, "applicant")}
                </span>
                <span>Posted {timeAgo(o.createdAt)}</span>
                <span>{o.industry}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        {/* Apply panel first on mobile so the primary action is visible early. */}
        <div className="space-y-6 lg:order-2">
          <ApplyPanel
            opportunity={o}
            viewer={user ? { id: user.id, role: user.role } : null}
            locked={locked}
            applications={applications}
            talents={talents}
            usage={monthly ? { used: monthly.used, limit: monthly.limit } : undefined}
            saved={viewer.saved.has(`opportunity:${o.id}`)}
          />
          <OpportunityKeyFacts opportunity={o} locked={locked} />
        </div>

        <div className="min-w-0 space-y-6 lg:order-1">
          <Card>
            <CardHeader title="About this opportunity" />
            <div className="whitespace-pre-line px-5 py-4 text-[15px] leading-relaxed text-ink">{o.description}</div>
          </Card>

          <ListCard title="Requirements" items={o.requirements} empty="No specific requirements listed." />
          <ListCard title="Expected deliverables" items={o.deliverables} empty="Deliverables will be agreed with the business." />

          {company && <CompanyCard profile={company} />}
        </div>
      </div>

      {similarItems.length > 0 && (
        <section className="border-t border-line bg-white" aria-labelledby="similar-heading">
          <div className="container-page py-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 id="similar-heading" className="text-xl font-bold text-navy-900">
                  Similar opportunities
                </h2>
                <p className="mt-1 text-sm text-subtle">More listings in {meta.label}.</p>
              </div>
              <Button asChild variant="link">
                <Link href={meta.href}>
                  View all <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarItems.map((s) => (
                <OpportunityCard
                  key={s.id}
                  opportunity={maskLocked(s, s.locked)}
                  locked={s.locked}
                  saved={viewer.saved.has(`opportunity:${s.id}`)}
                  signedIn={!!user}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ListCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="px-5 py-4">
        {items.length === 0 ? (
          <p className="text-sm text-subtle">{empty}</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
