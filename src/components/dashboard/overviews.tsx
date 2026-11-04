import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CircleDot,
  Eye,
  Handshake,
  Inbox,
  ListChecks,
  Plus,
  Search,
  Sparkles,
  Star,
  Target,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Badge, Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { SocialIcon } from "@/components/brand/social-icons";
import { StatCard, SubscriptionCard, UsageCard, WelcomeBanner } from "./widgets";
import { DonutChart, TrendChart } from "./charts";
import { ReceivedApplicationsTable, SubmittedApplicationsTable } from "./application-tables";
import { ProfileStrength } from "./profile-strength";
import {
  getActiveSubscription,
  getApplicationsByApplicant,
  getApplicationsForBusiness,
  getEffectivePlan,
  getPendingSubscription,
  getPlan,
  getProfileView,
  getSaved,
  getTalents,
  getTeamMembers,
} from "@/lib/data/queries";
import { getBusinessInsights, getPartnerInsights, getRecommendations } from "@/lib/data/insights";
import { getUsage, hasFeature } from "@/lib/permissions";
import type { User } from "@/lib/types";
import { formatCompact, formatIDRShort, timeAgo } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Good morning" : h < 15 ? "Good afternoon" : h < 19 ? "Good evening" : "Welcome back";
}

async function loadSubscription(user: User) {
  const [plan, subscription, pending, usage] = await Promise.all([
    getEffectivePlan(user),
    getActiveSubscription(user.id),
    getPendingSubscription(user.id),
    getUsage(user),
  ]);
  const pendingPlan = pending ? await getPlan(pending.planId) : null;
  return { plan, subscription, pending, pendingPlan, usage };
}

function SideColumn({ sub, profile }: { sub: Awaited<ReturnType<typeof loadSubscription>>; profile: Awaited<ReturnType<typeof getProfileView>> }) {
  return (
    <div className="space-y-6">
      <SubscriptionCard plan={sub.plan} subscription={sub.subscription} pending={sub.pending} pendingPlan={sub.pendingPlan} />
      <UsageCard meters={sub.usage} />
      {profile && <ProfileStrength profile={profile} />}
    </div>
  );
}

/* -------------------------------- Business -------------------------------- */

export async function BusinessOverview({ user, welcome }: { user: User; welcome: boolean }) {
  const [insights, received, sub, profile, saved] = await Promise.all([
    getBusinessInsights(user.id),
    getApplicationsForBusiness(user.id),
    loadSubscription(user),
    getProfileView(user.id),
    getSaved(user.id),
  ]);
  const limit = sub.usage.find((m) => m.key === "activeOpportunities")?.limit ?? 0;
  const savedProfiles = (await Promise.all(saved.filter((s) => s.targetType === "profile").slice(0, 4).map((s) => getProfileView(s.targetId)))).filter(Boolean);

  return (
    <>
      <WelcomeBanner name={user.name} show={welcome} />
      <PageHeader
        title={`${greeting()}, ${user.name}`}
        description="Here's what's happening with your opportunities and partners."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/marketplace/sales?view=partners">
                <Search /> Find partners
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/opportunities/new">
                <Plus /> New opportunity
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active opportunities" value={`${insights.openCount} / ${limit}`} hint="Listings accepting applications" icon={Briefcase} href="/dashboard/opportunities" />
        <StatCard label="Applications received" value={insights.applications.length} hint={`${insights.pendingReview} awaiting review`} icon={ListChecks} tone="brand" href="/dashboard/applications" />
        <StatCard label="Active partnerships" value={insights.activePartnerships} hint={`${insights.partnerships.length} total`} icon={Handshake} tone="success" href="/dashboard/partnerships" />
        <StatCard label="Listing views" value={formatCompact(insights.views)} hint={`${insights.conversionRate.toFixed(1)}% view-to-application`} icon={Eye} tone="blue" href="/dashboard/analytics" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader title="Applications received" description="Last 8 weeks" />
              <div className="p-4">
                <TrendChart data={insights.weekly} dataKey="value" name="Applications" />
              </div>
            </Card>
            <Card>
              <CardHeader title="Application status" description="Across all your listings" />
              <div className="p-5">
                {insights.breakdown.length ? <DonutChart data={insights.breakdown} height={150} /> : <EmptyState title="No applications yet" className="py-8" />}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Recent applications"
              action={
                <Link href="/dashboard/applications" className="text-[13px] font-semibold text-brand-700 hover:underline">
                  View all
                </Link>
              }
            />
            {received.length ? (
              <ReceivedApplicationsTable applications={received.slice(0, 6)} />
            ) : (
              <EmptyState icon={ListChecks} title="No applications yet" description="Publish an opportunity to start receiving applications from partners." action={<Button asChild size="sm"><Link href="/dashboard/opportunities/new">Publish opportunity</Link></Button>} />
            )}
          </Card>

          <Card>
            <CardHeader
              title="Your opportunities"
              action={
                <Link href="/dashboard/opportunities" className="text-[13px] font-semibold text-brand-700 hover:underline">
                  Manage
                </Link>
              }
            />
            {insights.opportunities.length ? (
              <ul className="divide-y divide-line">
                {insights.opportunities.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <Link href={`/dashboard/opportunities/${o.id}`} className="block truncate text-sm font-medium text-ink hover:text-brand-700">
                        {o.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {insights.applications.filter((a) => a.opportunityId === o.id).length} applicants · {o.views} views · posted {timeAgo(o.createdAt)}
                      </p>
                    </div>
                    <OpportunityStatusBadge status={o.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Briefcase} title="No opportunities yet" description="Describe the partner you need and let the right people apply." />
            )}
          </Card>

          <Card>
            <CardHeader title="Saved partners" action={<Link href="/dashboard/saved" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
            {savedProfiles.length ? (
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {savedProfiles.map((p) => (
                  <li key={p!.id} className="bg-white">
                    <Link href={`/profiles/${p!.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-canvas/60">
                      <Avatar name={p!.name} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{p!.name}</p>
                        <p className="truncate text-xs text-muted">{p!.headline}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={UsersRound} title="No saved partners" description="Save sales partners, creators and agencies while you browse." action={<Button asChild size="sm" variant="secondary"><Link href="/marketplace/kol?view=partners">Browse partners</Link></Button>} />
            )}
          </Card>
        </div>
        <SideColumn sub={sub} profile={profile} />
      </div>
    </>
  );
}

/* --------------------------- Sales & Creator ----------------------------- */

export async function PartnerOverview({ user, welcome }: { user: User; welcome: boolean }) {
  const isCreator = user.role === "creator";
  const premium = await hasFeature(user, "premium_opportunities");
  const [insights, apps, sub, profile, recs] = await Promise.all([
    getPartnerInsights(user.id),
    getApplicationsByApplicant(user.id),
    loadSubscription(user),
    getProfileView(user.id),
    getRecommendations(user, 3, premium),
  ]);

  return (
    <>
      <WelcomeBanner name={user.name} show={welcome} />
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={isCreator ? "Campaigns, collaborations and how your content is performing." : "Opportunities, applications and partnerships at a glance."}
        actions={
          <Button asChild>
            <Link href={isCreator ? "/marketplace/kol" : "/marketplace/sales"}>
              <Search /> {isCreator ? "Find campaigns" : "Find opportunities"}
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active applications" value={insights.activeApplications} hint={`${insights.applications.length} submitted in total`} icon={ListChecks} href="/dashboard/applications" />
        <StatCard label="Shortlisted" value={insights.shortlisted} hint="Businesses interested in you" icon={Star} tone="brand" href="/dashboard/applications" />
        <StatCard label={isCreator ? "Active collaborations" : "Active partnerships"} value={insights.activePartnerships} icon={Handshake} tone="success" href="/dashboard/partnerships" />
        <StatCard
          label={isCreator ? "Reported reach" : "Reported revenue"}
          value={isCreator ? formatCompact(insights.totals.reach) : formatIDRShort(insights.totals.revenue)}
          hint={`${insights.successRate.toFixed(0)}% application success rate`}
          icon={Target}
          tone="blue"
          href="/dashboard/analytics"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-sans text-[15px] font-semibold tracking-normal text-ink">
                <Sparkles className="size-4 text-brand-600" /> {isCreator ? "Recommended campaigns" : "Recommended opportunities"}
              </h2>
              <Link href="/dashboard/recommended" className="text-[13px] font-semibold text-brand-700 hover:underline">
                See all
              </Link>
            </div>
            {recs.length ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {recs.map((r) => (
                  <OpportunityCard key={r.opportunity.id} opportunity={r.opportunity} signedIn locked={r.opportunity.locked} />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState icon={Sparkles} title="No new matches right now" description="Add more industries, areas or channels to your profile to improve recommendations." action={<Button asChild size="sm" variant="secondary"><Link href="/profile">Update profile</Link></Button>} />
              </Card>
            )}
          </div>

          <Card>
            <CardHeader title="My applications" action={<Link href="/dashboard/applications" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
            {apps.length ? (
              <SubmittedApplicationsTable applications={apps.slice(0, 6)} />
            ) : (
              <EmptyState icon={ListChecks} title="You haven't applied yet" description="Browse the marketplace and send your first application." />
            )}
          </Card>

          {isCreator && profile?.creator && (
            <Card>
              <CardHeader title="Portfolio channels" description="What brands see on your profile" action={<Link href="/profile" className="text-[13px] font-semibold text-brand-700 hover:underline">Edit</Link>} />
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {profile.creator.socials.map((s) => (
                  <li key={s.platform} className="flex items-center justify-between bg-white px-5 py-4">
                    <span className="flex items-center gap-2.5 text-sm text-ink">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-canvas">
                        <SocialIcon platform={s.platform} />
                      </span>
                      {s.handle}
                    </span>
                    <span className="text-sm font-semibold text-navy-900">{formatCompact(s.followers)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        <SideColumn sub={sub} profile={profile} />
      </div>
    </>
  );
}

/* --------------------------------- Agency --------------------------------- */

export async function AgencyOverview({ user, welcome }: { user: User; welcome: boolean }) {
  const premium = await hasFeature(user, "premium_opportunities");
  const [insights, apps, sub, profile, talents, team, inbox] = await Promise.all([
    getPartnerInsights(user.id),
    getApplicationsByApplicant(user.id),
    loadSubscription(user),
    getProfileView(user.id),
    getTalents(user.id),
    getTeamMembers(user.id),
    getRecommendations(user, 4, premium),
  ]);
  const available = talents.filter((t) => t.status === "available").length;
  const statusTone = { available: "success", on_project: "brand", inactive: "outline" } as const;
  const statusLabel = { available: "Available", on_project: "On project", inactive: "Inactive" };

  return (
    <>
      <WelcomeBanner name={user.name} show={welcome} />
      <PageHeader
        title={`${greeting()}, ${user.name}`}
        description="Your talent network, client opportunities and partnerships."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/talents">
                <UsersRound /> Manage talents
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/inbox">
                <Inbox /> Opportunity inbox
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Talents" value={talents.length} hint={`${available} available now`} icon={UsersRound} href="/dashboard/talents" />
        <StatCard label="Inbox matches" value={inbox.length} hint="Open briefs that fit your services" icon={Inbox} tone="brand" href="/dashboard/inbox" />
        <StatCard label="Active partnerships" value={insights.activePartnerships} hint={`${insights.partnerships.length} total`} icon={Handshake} tone="success" href="/dashboard/partnerships" />
        <StatCard label="Proposals in progress" value={insights.activeApplications} hint={`${team.length} team member${team.length === 1 ? "" : "s"}`} icon={CircleDot} tone="blue" href="/dashboard/applications" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Talent snapshot" action={<Link href="/dashboard/talents" className="text-[13px] font-semibold text-brand-700 hover:underline">Roster</Link>} />
              {talents.length ? (
                <ul className="divide-y divide-line">
                  {talents.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={t.name} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                          <p className="truncate text-xs text-muted">{t.specialty}</p>
                        </div>
                      </div>
                      <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={UsersRound} title="No talents yet" description="Add creators, affiliates and sales reps you manage." action={<Button asChild size="sm"><Link href="/dashboard/talents">Add talent</Link></Button>} />
              )}
            </Card>
            <Card>
              <CardHeader title="Opportunity inbox" action={<Link href="/dashboard/inbox" className="text-[13px] font-semibold text-brand-700 hover:underline">Open inbox</Link>} />
              {inbox.length ? (
                <ul className="divide-y divide-line">
                  {inbox.map((r) => (
                    <li key={r.opportunity.id} className="px-5 py-3">
                      <Link href={`/opportunities/${r.opportunity.id}`} className="block truncate text-sm font-medium text-ink hover:text-brand-700">
                        {r.opportunity.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {r.opportunity.companyName} · {r.reasons[0] ?? r.typeLabel}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Inbox} title="Inbox is clear" description="New agency briefs will appear here." />
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="Proposals" action={<Link href="/dashboard/applications" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
            {apps.length ? (
              <SubmittedApplicationsTable applications={apps.slice(0, 6)} />
            ) : (
              <EmptyState icon={ListChecks} title="No proposals yet" description="Submit proposals for your agency or on behalf of your talents." />
            )}
          </Card>

          <Card>
            <CardHeader title="Proposal activity" description="Last 8 weeks" />
            <div className="p-4">
              <TrendChart data={insights.weekly} dataKey="value" name="Proposals" color="#17365D" />
            </div>
          </Card>
        </div>
        <SideColumn sub={sub} profile={profile} />
      </div>
      <p className="mt-8 flex items-center gap-1.5 text-xs text-muted">
        <ArrowRight className="size-3" /> Partnership metrics are figures reported on each partnership; automated tracking integrations are planned.
      </p>
    </>
  );
}
