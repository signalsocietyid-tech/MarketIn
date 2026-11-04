import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CreditCard, Crown, Info, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardHeader, EmptyState, Table, THead, Th, Td, Tr } from "@/components/ui/primitives";
import { SubscriptionStatusBadge } from "@/components/shared/status-badge";
import { UsageCard } from "@/components/dashboard/widgets";
import { CancelPendingButton, DowngradeButton, ResumeButton } from "@/components/dashboard/billing-actions";
import { PricingTable } from "@/components/pricing/pricing-table";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveSubscription,
  getEffectivePlan,
  getPendingSubscription,
  getPlan,
  getPlans,
  getSubscriptionHistory,
} from "@/lib/data/queries";
import { getPricingViewer } from "@/lib/data/viewer";
import { getUsage } from "@/lib/permissions";
import { getPaymentProvider } from "@/lib/payments";
import type { Segment } from "@/lib/types";
import { formatDate, formatIDR } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscription" };

const ACTION_LABEL = {
  started: "Started",
  upgrade_requested: "Upgrade requested",
  activated: "Activated",
  downgraded: "Downgrade scheduled",
  canceled: "Canceled",
  resumed: "Resumed",
} as const;

export default async function BillingPage(props: PageProps<"/dashboard/billing">) {
  const user = await requireUser("/dashboard/billing");
  if (user.role === "admin") redirect("/admin/subscriptions");
  const sp = await props.searchParams;

  const [plan, active, pending, history, usage, plans, viewer] = await Promise.all([
    getEffectivePlan(user),
    getActiveSubscription(user.id),
    getPendingSubscription(user.id),
    getSubscriptionHistory(user.id),
    getUsage(user),
    getPlans(user.role as Segment),
    getPricingViewer(),
  ]);
  const pendingPlan = pending ? await getPlan(pending.planId) : null;
  const plansById = new Map((await getPlans(undefined, true)).map((p) => [p.id, p]));
  const provider = getPaymentProvider();

  return (
    <>
      <PageHeader title="Subscription" description="Your plan, usage limits and billing history." />

      {sp.checkout === "pending" && pending && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-warning-50 px-5 py-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-warning-600" />
          <div className="text-sm">
            <p className="font-semibold text-warning-700">Upgrade request received</p>
            <p className="mt-1 text-warning-700">
              Online payment isn&apos;t available yet, so no charge has been made. Our team will contact you at {user.email} to confirm
              payment, then activate {pendingPlan?.name}. Your current plan stays active in the meantime.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Current plan" />
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-navy-50">
                  {plan?.tier === "pro" ? <Crown className="size-5 text-brand-600" /> : <CreditCard className="size-5 text-navy-700" />}
                </span>
                <div>
                  <p className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
                    {plan?.name ?? "Free"} {active && <SubscriptionStatusBadge status={active.status} />}
                  </p>
                  <p className="text-sm text-subtle">
                    {active
                      ? `${formatIDR(active.billingCycle === "yearly" ? (plansById.get(active.planId)?.priceYearly ?? 0) : (plansById.get(active.planId)?.priceMonthly ?? 0))} / ${active.billingCycle === "yearly" ? "year" : "month"} · ${
                          active.cancelAtPeriodEnd ? `switches to Free on ${formatDate(active.currentPeriodEnd)}` : `renews ${formatDate(active.currentPeriodEnd)}`
                        }`
                      : "Free plan — no billing."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {active && !active.cancelAtPeriodEnd && <DowngradeButton periodEnd={formatDate(active.currentPeriodEnd)} />}
                {active?.cancelAtPeriodEnd && <ResumeButton />}
                {!active && !pending && (
                  <Button asChild size="sm">
                    <Link href="#plans">Compare Pro plans</Link>
                  </Button>
                )}
              </div>
            </div>
            {pending && pendingPlan && (
              <div className="flex flex-col gap-3 border-t border-line bg-warning-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-warning-700">
                  <Clock className="size-4" />
                  {pendingPlan.name} ({pending.billingCycle}) — awaiting payment confirmation since {formatDate(pending.createdAt)}.
                </p>
                <CancelPendingButton />
              </div>
            )}
          </Card>

          <section id="plans" className="scroll-mt-24">
            <h2 className="mb-4 font-sans text-[15px] font-semibold tracking-normal text-ink">Plans for your account</h2>
            <PricingTable plans={plans} viewer={viewer} initialSegment={user.role as Segment} />
          </section>

          <Card>
            <CardHeader title="Subscription history" />
            {history.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Event</Th>
                    <Th>Plan</Th>
                    <Th className="text-right">Amount</Th>
                    <Th>Note</Th>
                  </tr>
                </THead>
                <tbody>
                  {history.map((e) => (
                    <Tr key={e.id}>
                      <Td className="whitespace-nowrap text-subtle">{formatDate(e.createdAt)}</Td>
                      <Td>
                        <Badge tone={e.action === "activated" ? "success" : e.action === "upgrade_requested" ? "warning" : "outline"}>{ACTION_LABEL[e.action]}</Badge>
                      </Td>
                      <Td>{plansById.get(e.planId)?.name ?? e.planId}</Td>
                      <Td className="whitespace-nowrap text-right">{e.amount ? formatIDR(e.amount) : "—"}</Td>
                      <Td className="max-w-64 text-xs text-muted">{e.note}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState icon={Receipt} title="No billing activity yet" description="Upgrades, renewals and plan changes will appear here." />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <UsageCard meters={usage} />
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Info className="size-4 text-blue-600" /> Payments
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-subtle">
              {provider.connected
                ? `Payments are processed by ${provider.name}.`
                : "Online payments are not connected yet. Upgrade requests are confirmed manually by the MarketIn team; integration with an Indonesian payment provider (Midtrans or Xendit) is planned."}
            </p>
            <p className="mt-3 text-xs text-muted">Prices are introductory and may change before general availability.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
