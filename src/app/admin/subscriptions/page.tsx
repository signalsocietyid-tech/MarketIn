import Link from "next/link";
import { AlertTriangle, CreditCard, History } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, type BadgeTone, Card, CardHeader, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { SubscriptionStatusBadge } from "@/components/shared/status-badge";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { SubscriptionActions } from "@/components/admin/subscription-actions";
import { MANUAL_ACTIVATION_WARNING } from "@/components/admin/copy";
import { flatParams, oneOf } from "@/components/admin/search-params";
import { getAdminSubscriptions, getSubscriptionEventLog } from "@/lib/data/admin-queries";
import { SEGMENT_LABEL } from "@/lib/constants";
import type { SubscriptionEvent, SubscriptionStatus } from "@/lib/types";
import { daysUntil, formatDate, formatIDR, timeAgo } from "@/lib/utils";

export const metadata = { title: "Subscriptions" };

const STATUSES: SubscriptionStatus[] = ["pending_payment", "active", "canceled", "expired"];
const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  pending_payment: "Awaiting payment",
  active: "Active",
  canceled: "Canceled",
  expired: "Expired",
};
const EVENT_TONE: Record<SubscriptionEvent["action"], BadgeTone> = {
  started: "neutral",
  upgrade_requested: "warning",
  activated: "success",
  downgraded: "outline",
  canceled: "danger",
  resumed: "blue",
};
const EVENT_LABEL: Record<SubscriptionEvent["action"], string> = {
  started: "Started",
  upgrade_requested: "Upgrade requested",
  activated: "Activated",
  downgraded: "Downgraded",
  canceled: "Canceled",
  resumed: "Resumed",
};

export default async function AdminSubscriptionsPage(props: PageProps<"/admin/subscriptions">) {
  const sp = await props.searchParams;
  const status = oneOf(sp, "status", STATUSES);
  const params = flatParams(sp);
  const [{ rows, counts }, events] = await Promise.all([getAdminSubscriptions({ status }), getSubscriptionEventLog(60)]);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Every member subscription. Online payments are not integrated yet, so upgrades wait here until an admin activates them."
      />

      <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-warning-50 px-4 py-3 text-warning-700">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p className="text-[13px] font-medium leading-relaxed">{MANUAL_ACTIVATION_WARNING}</p>
      </div>

      <FilterTabs
        className="mb-4"
        pathname="/admin/subscriptions"
        param="status"
        current={status}
        params={params}
        tabs={[{ label: "All", count: counts.all }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s], count: counts[s] }))]}
      />

      <Card className="mb-6">
        {rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No subscriptions here" description="Subscriptions matching this filter will appear here." />
        ) : (
          <Table className="min-w-[1080px]">
            <THead>
              <tr>
                <Th>Member</Th>
                <Th>Plan</Th>
                <Th>Cycle</Th>
                <Th>Status</Th>
                <Th>Period end</Th>
                <Th>Renewal</Th>
                <Th>Payment reference</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((s) => {
                const remaining = daysUntil(s.currentPeriodEnd);
                return (
                  <Tr key={s.id} className={s.status === "pending_payment" ? "bg-warning-50/50" : undefined}>
                    <Td>
                      <Link href={`/profiles/${s.user.id}`} className="block max-w-56 truncate font-medium hover:underline">
                        {s.user.name}
                      </Link>
                      <p className="max-w-56 truncate text-xs text-subtle">{s.user.email}</p>
                    </Td>
                    <Td>
                      {s.plan ? (
                        <>
                          <p className="font-medium">{s.plan.name}</p>
                          <p className="text-xs text-subtle">
                            {SEGMENT_LABEL[s.plan.segment]} · {formatIDR(s.plan.price)}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted">Unknown plan ({s.planId})</span>
                      )}
                    </Td>
                    <Td className="capitalize">{s.billingCycle}</Td>
                    <Td>
                      <div className="flex flex-col items-start gap-1">
                        <SubscriptionStatusBadge status={s.status} />
                        {s.status === "active" && !s.live && <span className="text-[11px] font-medium text-warning-700">Period ended</span>}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-subtle">
                      {s.status === "pending_payment" ? (
                        <span className="text-muted">Starts on activation</span>
                      ) : (
                        <>
                          {formatDate(s.currentPeriodEnd)}
                          {s.status === "active" && remaining >= 0 && <span className="block text-xs">{remaining} days left</span>}
                        </>
                      )}
                    </Td>
                    <Td>
                      {s.status !== "active" ? (
                        <span className="text-xs text-muted">—</span>
                      ) : s.cancelAtPeriodEnd ? (
                        <Badge tone="warning">Cancels at period end</Badge>
                      ) : (
                        <Badge tone="outline">Renews</Badge>
                      )}
                    </Td>
                    <Td>
                      {s.paymentReference ? (
                        <span className="font-mono text-xs text-ink">{s.paymentReference}</span>
                      ) : (
                        <span className="text-xs text-muted">None</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <SubscriptionActions
                        subscription={{
                          id: s.id,
                          status: s.status,
                          billingCycle: s.billingCycle,
                          userName: s.user.name,
                          planName: s.plan?.name ?? s.planId,
                          amount: s.plan?.price ?? 0,
                          paymentReference: s.paymentReference,
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Subscription events" description="Audit log of plan changes, newest first (latest 60)." />
        {events.length === 0 ? (
          <EmptyState icon={History} title="No events yet" />
        ) : (
          <Table className="min-w-[860px]">
            <THead>
              <tr>
                <Th>When</Th>
                <Th>Member</Th>
                <Th>Event</Th>
                <Th>Plan</Th>
                <Th className="text-right">Amount</Th>
                <Th>Note</Th>
              </tr>
            </THead>
            <tbody>
              {events.map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-subtle" title={formatDate(e.createdAt)}>
                    {timeAgo(e.createdAt)}
                  </Td>
                  <Td>
                    <Link href={`/profiles/${e.userId}`} className="hover:underline">
                      {e.userName}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={EVENT_TONE[e.action]}>{EVENT_LABEL[e.action]}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {e.planName} <span className="text-xs text-subtle">· {e.billingCycle}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-right tabular-nums">{e.amount ? formatIDR(e.amount) : "—"}</Td>
                  <Td className="max-w-80 text-[13px] text-subtle">{e.note ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
