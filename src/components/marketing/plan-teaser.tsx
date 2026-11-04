import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, SectionHeading } from "@/components/ui/primitives";
import { getPlans } from "@/lib/data/queries";
import type { Segment, SubscriptionPlan } from "@/lib/types";
import { cn, formatIDR } from "@/lib/utils";

/**
 * Free vs Pro teaser for a segment. Plans are admin-configurable, so names,
 * prices and benefits are always read from the data layer.
 */
export async function PlanTeaser({
  segment,
  title,
  description,
}: {
  segment: Segment;
  title: string;
  description: string;
}) {
  const plans = await getPlans(segment);
  const free = plans.find((p) => p.tier === "free");
  const pro = plans.find((p) => p.tier === "pro");
  const shown = [free, pro].filter((p): p is SubscriptionPlan => !!p);
  const pricingHref = `/pricing?segment=${segment}`;

  return (
    <section className="border-y border-line bg-white py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div>
          <SectionHeading align="left" eyebrow="Pricing" title={title} description={description} />
          <Button asChild variant="secondary" className="mt-6">
            <Link href={pricingHref}>
              Compare plans in detail
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {shown.length === 0 ? (
          <Card className="p-6 text-sm text-subtle">
            Plan details are being updated.{" "}
            <Link href={pricingHref} className="font-medium text-brand-700 hover:underline">
              See the pricing page
            </Link>{" "}
            for the latest information.
          </Card>
        ) : (
          <div className={cn("grid gap-4", shown.length > 1 && "sm:grid-cols-2")}>
            {shown.map((plan) => (
              <PlanCard key={plan.id} plan={plan} href={pricingHref} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PlanCard({ plan, href }: { plan: SubscriptionPlan; href: string }) {
  const isPro = plan.tier === "pro";
  return (
    <Card className={cn("flex flex-col p-6", isPro && "border-navy-200 ring-1 ring-navy-100")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-navy-900">{plan.name}</h3>
        {plan.recommended && <Badge tone="brand">Recommended</Badge>}
      </div>
      {plan.tagline && <p className="mt-1 text-sm text-subtle">{plan.tagline}</p>}
      <p className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-[28px] font-bold tracking-tight text-navy-900">
          {plan.priceMonthly === 0 ? "Free" : formatIDR(plan.priceMonthly)}
        </span>
        {plan.priceMonthly > 0 && <span className="text-sm text-subtle">/ month</span>}
      </p>
      <ul className="mt-5 space-y-2.5 text-sm text-ink">
        {plan.benefits.slice(0, 4).map((b) => (
          <li key={b} className="flex gap-2.5">
            <Check className={cn("mt-0.5 size-4 shrink-0", isPro ? "text-brand-600" : "text-navy-600")} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Button asChild variant={isPro ? "primary" : "secondary"} className="w-full">
          <Link href={href}>{isPro ? `See ${plan.name}` : `About ${plan.name}`}</Link>
        </Button>
      </div>
    </Card>
  );
}
