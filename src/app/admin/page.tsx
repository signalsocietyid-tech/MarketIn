import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CircleDollarSign,
  CreditCard,
  Flag,
  Handshake,
  Hourglass,
  ListChecks,
  Megaphone,
  ShieldAlert,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, Badge, Card, CardHeader, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { AccountStatusBadge, VerificationBadge } from "@/components/shared/status-badge";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import { KpiCard } from "@/components/admin/kpi-card";
import { ResetDemoButton } from "@/components/admin/reset-demo-button";
import { MRR_LABEL } from "@/components/admin/copy";
import { getMarketplaceStats } from "@/lib/data/queries";
import { getAdminOverview } from "@/lib/data/admin-queries";
import { APPLICATION_STATUS_LABEL, CATEGORY_META, SEGMENT_LABEL, SEGMENTS } from "@/lib/constants";
import { formatDate, formatIDR, formatIDRShort, timeAgo } from "@/lib/utils";

export const metadata = { title: "Overview" };

const SEGMENT_ICON = { business: Building2, sales: TrendingUp, creator: Megaphone, agency: UsersRound } as const;

export default async function AdminOverviewPage() {
  const [stats, overview] = await Promise.all([getMarketplaceStats(), getAdminOverview()]);
  const isMock = (process.env.DATA_PROVIDER ?? "mock") === "mock";

  const usersBySegment = SEGMENTS.map((s) => ({ label: SEGMENT_LABEL[s], value: stats.byRole[s], href: `/admin/users?role=${s}` }));
  const appsByStatus = overview.applicationsByStatus.map((a) => ({
    label: APPLICATION_STATUS_LABEL[a.key],
    value: a.value,
    href: `/admin/applications?status=${a.key}`,
  }));
  const oppsByCategory = overview.opportunitiesByCategory.map((o) => ({
    label: CATEGORY_META[o.key].short,
    value: o.value,
    href: `/admin/opportunities?category=${o.key}`,
  }));

  const attentionCount = overview.pendingVerifications.length + overview.openReports.length + overview.pendingPayments.length;

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Marketplace health, moderation queues and monetization at a glance."
        actions={isMock ? <ResetDemoButton /> : undefined}
      />

      <section aria-labelledby="kpi-users" className="mb-6">
        <h2 id="kpi-users" className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Members
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard href="/admin/users" label="Total users" value={stats.users} hint="All segments, excluding admins" icon={Users} />
          {SEGMENTS.map((s) => (
            <KpiCard
              key={s}
              href={`/admin/users?role=${s}`}
              label={SEGMENT_LABEL[s]}
              value={stats.byRole[s]}
              hint={`${stats.users ? Math.round((stats.byRole[s] / stats.users) * 100) : 0}% of users`}
              icon={SEGMENT_ICON[s]}
            />
          ))}
        </div>
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="kpi-activity">
          <h2 id="kpi-activity" className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Marketplace activity
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiCard
              href="/admin/opportunities?status=open"
              label="Open opportunities"
              value={stats.openOpportunities}
              hint={`${stats.totalOpportunities} total listings`}
              icon={Briefcase}
            />
            <KpiCard href="/admin/applications" label="Applications" value={stats.applications} hint="All time" icon={ListChecks} />
            <KpiCard
              href="/admin/applications?status=accepted"
              label="Partnerships"
              value={stats.partnerships}
              hint="From accepted applications"
              icon={Handshake}
            />
          </div>
        </section>
        <section aria-labelledby="kpi-trust">
          <h2 id="kpi-trust" className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Trust &amp; safety
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiCard
              href="/admin/users?verification=pending"
              label="Pending verifications"
              value={stats.pendingVerifications}
              hint="Awaiting review"
              icon={BadgeCheck}
              attention={stats.pendingVerifications > 0}
            />
            <KpiCard
              href="/admin/reports?status=open"
              label="Open reports"
              value={stats.openReports}
              hint="Users and listings"
              icon={Flag}
              attention={stats.openReports > 0}
            />
            <KpiCard
              href="/admin/users?status=flagged"
              label="Flagged accounts"
              value={stats.flaggedAccounts}
              hint="Under review"
              icon={ShieldAlert}
              attention={stats.flaggedAccounts > 0}
            />
          </div>
        </section>
      </div>

      <section aria-labelledby="kpi-money" className="mb-6">
        <h2 id="kpi-money" className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Monetization
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <KpiCard
            href="/admin/subscriptions?status=active"
            label="Active subscriptions"
            value={stats.activeSubscriptions}
            hint="Within current billing period"
            icon={CreditCard}
          />
          <KpiCard
            href="/admin/subscriptions?status=pending_payment"
            label="Pending payments"
            value={stats.pendingSubscriptions}
            hint="Upgrade requests awaiting manual activation"
            icon={Hourglass}
            attention={stats.pendingSubscriptions > 0}
          />
          <KpiCard
            href="/admin/subscriptions?status=active"
            label="Projected MRR"
            value={formatIDRShort(Math.round(stats.mrr))}
            hint={MRR_LABEL}
            icon={CircleDollarSign}
          />
        </div>
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Users by segment" description="Click a bar to open the list" />
          <div className="px-3 py-4">
            <AdminBarChart data={usersBySegment} unit="users" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Applications by status" description="All applications, all time" />
          <div className="px-3 py-4">
            <AdminBarChart data={appsByStatus} unit="applications" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Opportunities by category" description="All listings, any status" />
          <div className="px-3 py-4">
            <AdminBarChart data={oppsByCategory} unit="opportunities" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader
            title="Needs attention"
            description={attentionCount ? `${attentionCount} items waiting on an admin` : "All queues are clear"}
          />
          {attentionCount === 0 ? (
            <EmptyState icon={BadgeCheck} title="Nothing to review" description="New verifications, reports and payments will appear here." />
          ) : (
            <div className="divide-y divide-line">
              <AttentionGroup
                title="Pending verifications"
                href="/admin/users?verification=pending"
                total={overview.pendingVerifications.length}
                items={overview.pendingVerifications.slice(0, 4).map((u) => ({
                  key: u.id,
                  href: `/admin/users?verification=pending&q=${encodeURIComponent(u.email)}`,
                  primary: u.name,
                  secondary: `${SEGMENT_LABEL[u.role]} · joined ${timeAgo(u.createdAt)}`,
                }))}
              />
              <AttentionGroup
                title="Open reports"
                href="/admin/reports?status=open"
                total={overview.openReports.length}
                items={overview.openReports.slice(0, 4).map((r) => ({
                  key: r.id,
                  href: "/admin/reports?status=open",
                  primary: r.reason,
                  secondary: `${r.targetType === "user" ? "User" : "Listing"}: ${r.targetName} · ${timeAgo(r.createdAt)}`,
                }))}
              />
              <AttentionGroup
                title="Pending payments"
                href="/admin/subscriptions?status=pending_payment"
                total={overview.pendingPayments.length}
                items={overview.pendingPayments.slice(0, 4).map((p) => ({
                  key: p.id,
                  href: "/admin/subscriptions?status=pending_payment",
                  primary: `${p.userName} · ${p.planName}`,
                  secondary: `${formatIDR(p.amount)} / ${p.billingCycle === "yearly" ? "year" : "month"} · requested ${timeAgo(p.createdAt)}`,
                }))}
              />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent sign-ups"
            action={
              <Link href="/admin/users" className="text-[13px] font-semibold text-brand-700 hover:underline">
                View all users
              </Link>
            }
          />
          {overview.recentSignups.length === 0 ? (
            <EmptyState icon={UserRound} title="No users yet" />
          ) : (
            <Table className="min-w-[560px]">
              <THead>
                <tr>
                  <Th>User</Th>
                  <Th>Segment</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                </tr>
              </THead>
              <tbody>
                {overview.recentSignups.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <Link href={`/profiles/${u.id}`} className="flex items-center gap-2.5 hover:underline">
                        <Avatar name={u.name} src={u.avatarUrl} size={28} square={u.role === "business" || u.role === "agency"} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{u.name}</span>
                          <span className="block truncate text-xs text-subtle">{u.email}</span>
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Badge tone="outline">{SEGMENT_LABEL[u.role]}</Badge>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <AccountStatusBadge status={u.status} />
                        <VerificationBadge status={u.verification} />
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-subtle">{formatDate(u.createdAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

function AttentionGroup({
  title,
  href,
  total,
  items,
}: {
  title: string;
  href: string;
  total: number;
  items: { key: string; href: string; primary: string; secondary: string }[];
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          {title}
          <Badge tone={total ? "brand" : "neutral"}>{total}</Badge>
        </p>
        <Link href={href} className="text-xs font-semibold text-brand-700 hover:underline">
          Open queue
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-subtle">Nothing pending.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className="-mx-2 block rounded-md px-2 py-1.5 hover:bg-canvas">
                <span className="block truncate text-[13px] font-medium text-ink">{i.primary}</span>
                <span className="block truncate text-xs text-subtle">{i.secondary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
