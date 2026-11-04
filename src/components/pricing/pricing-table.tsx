"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Check, Megaphone, Network, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import type { BillingCycle, Role, Segment, SubscriptionPlan } from "@/lib/types";
import { SEGMENT_LABEL } from "@/lib/constants";
import { cn, formatIDR } from "@/lib/utils";

const SEGMENT_TABS: { id: Segment; label: string; icon: typeof Building2 }[] = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "sales", label: "Sales Partner", icon: TrendingUp },
  { id: "creator", label: "Creator & Affiliate", icon: Megaphone },
  { id: "agency", label: "Agency", icon: Network },
];

export type PricingViewer = { role: Role; currentPlanId?: string; pendingPlanId?: string } | null;

export function PricingTable({
  plans,
  viewer,
  initialSegment,
}: {
  plans: SubscriptionPlan[];
  viewer: PricingViewer;
  initialSegment?: Segment;
}) {
  const defaultSegment =
    initialSegment ?? (viewer && viewer.role !== "admin" ? (viewer.role as Segment) : "business");
  const [segment, setSegment] = useState<Segment>(defaultSegment);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const segmentTabs = SEGMENT_TABS.filter((t) => plans.some((p) => p.segment === t.id));
  const visible = plans.filter((p) => p.segment === segment).sort((a, b) => a.sortOrder - b.sortOrder);
  const maxSaving = Math.max(0, ...plans.filter((p) => p.priceMonthly > 0).map((p) => Math.round((1 - p.priceYearly / (p.priceMonthly * 12)) * 100)));

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        {segmentTabs.length > 1 && (
        <div role="tablist" aria-label="Account type" className="glass flex w-full max-w-2xl gap-1 overflow-x-auto rounded-full p-1 scrollbar-none">
          {segmentTabs.map((t) => {
            const Icon = t.icon;
            const active = segment === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSegment(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-b from-brand-400 to-brand-500 text-white shadow-[0_6px_16px_-6px_rgb(244_119_53/0.7)]"
                    : "text-subtle hover:bg-white/60 hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <div className="glass inline-flex rounded-full p-1" role="group" aria-label="Billing cycle">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                aria-pressed={cycle === c}
                className={cn(
                  "rounded-full px-4 py-1.5 font-medium capitalize transition-colors",
                  cycle === c ? "bg-white text-brand-700 shadow-[0_2px_8px_-2px_rgb(244_119_53/0.35)]" : "text-subtle hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {maxSaving > 0 && <span className="rounded-full bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700">Save up to {maxSaving}% yearly</span>}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        {visible.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} viewer={viewer} />
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
        Prices in Indonesian Rupiah. Introductory pricing is subject to change before general availability. Online
        payment is not yet available — Pro upgrades are confirmed manually by our team.
      </p>
    </div>
  );
}

function PlanCard({ plan, cycle, viewer }: { plan: SubscriptionPlan; cycle: BillingCycle; viewer: PricingViewer }) {
  const free = plan.priceMonthly === 0;
  const perMonth = cycle === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
  const saving = plan.priceMonthly * 12 - plan.priceYearly;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[1.75rem] p-7 text-center sm:p-8",
        plan.recommended ? "glass-strong ring-2 ring-brand-300/70 shadow-[0_30px_60px_-24px_rgb(244_119_53/0.5)]" : "glass",
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
        {plan.recommended && (
          <Badge tone="brand">
            <Sparkles /> Recommended
          </Badge>
        )}
      </div>
      <p className="mt-2 min-h-10 text-sm text-subtle">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline justify-center gap-1.5">
        <span className="font-display text-[40px] font-semibold tracking-[-0.04em] text-ink">{free ? "Free" : formatIDR(perMonth)}</span>
        {!free && <span className="text-sm text-subtle">/ month</span>}
      </div>
      <p className="mt-1 h-5 text-[13px] text-subtle">
        {free
          ? "No credit card required"
          : cycle === "yearly"
            ? `Billed ${formatIDR(plan.priceYearly)} yearly${saving > 0 ? ` · save ${formatIDR(saving)}` : ""}`
            : "Billed monthly · cancel anytime"}
      </p>

      <div className="mt-6">
        <PlanCta plan={plan} cycle={cycle} viewer={viewer} />
      </div>

      <ul className="mx-auto mt-7 w-full max-w-xs space-y-3 border-t border-black/5 pt-7 text-left">
        {plan.benefits.map((b) => (
          <li key={b} className="flex gap-2.5 text-sm text-ink">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanCta({ plan, cycle, viewer }: { plan: SubscriptionPlan; cycle: BillingCycle; viewer: PricingViewer }) {
  const variant = plan.recommended ? "primary" : "secondary";
  if (!viewer) {
    return (
      <Button asChild variant={variant} className="w-full">
        <Link href={`/register?type=${plan.segment}${plan.tier === "pro" ? `&plan=${plan.id}&cycle=${cycle}` : ""}`}>
          {plan.tier === "free" ? "Start for free" : `Get ${plan.name}`}
        </Link>
      </Button>
    );
  }
  if (viewer.role !== plan.segment) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        For {SEGMENT_LABEL[plan.segment]} accounts
      </Button>
    );
  }
  const isCurrent = viewer.currentPlanId === plan.id;
  if (isCurrent) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Your current plan
      </Button>
    );
  }
  if (plan.tier === "free") {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href="/dashboard/billing">Manage plan</Link>
      </Button>
    );
  }
  if (viewer.pendingPlanId === plan.id) {
    return (
      <Button asChild variant="outline" className="w-full">
        <Link href="/dashboard/billing">Upgrade pending — view status</Link>
      </Button>
    );
  }
  return (
    <Button asChild variant={variant} className="w-full">
      <Link href={`/checkout?plan=${plan.id}&cycle=${cycle}`}>Upgrade to {plan.name}</Link>
    </Button>
  );
}
