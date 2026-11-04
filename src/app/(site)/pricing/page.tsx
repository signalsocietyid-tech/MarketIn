import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PricingTable } from "@/components/pricing/pricing-table";
import { FaqTabs } from "@/components/home/faq-tabs";
import { Button } from "@/components/ui/button";
import { SectionHeading, Table, THead, Th, Td, Tr } from "@/components/ui/primitives";
import { getPlans } from "@/lib/data/queries";
import { getPricingViewer } from "@/lib/data/viewer";
import { FEATURE_LABEL, SEGMENT_LABEL, SEGMENTS } from "@/lib/constants";
import type { FeatureKey, PlanLimits, Segment, SubscriptionPlan } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start for free. Unlock more opportunities as your business grows — plans for businesses, sales partners, creators and agencies.",
};

const LIMIT_ROWS: { key: keyof PlanLimits; label: string; segments: Segment[] }[] = [
  { key: "activeOpportunities", label: "Active opportunity listings", segments: ["business"] },
  { key: "monthlyApplications", label: "Applications per month", segments: ["sales", "creator", "agency"] },
  { key: "talentRoster", label: "Talent roster size", segments: ["agency"] },
  { key: "teamMembers", label: "Team members", segments: ["agency"] },
  { key: "savedItems", label: "Saved partners & opportunities", segments: ["business", "sales", "creator", "agency"] },
];

export default async function PricingPage(props: PageProps<"/pricing">) {
  const sp = await props.searchParams;
  const segment = SEGMENTS.includes(sp.segment as Segment) ? (sp.segment as Segment) : undefined;
  const [plans, viewer] = await Promise.all([getPlans(), getPricingViewer()]);

  return (
    <>
      <section className="border-b border-white/70 bg-white/40 backdrop-blur-xl py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Pricing"
            title="Choose Your Growth Plan."
            description="Start for free. Unlock more opportunities as your business grows."
          />
          <div className="mt-10">
            <PricingTable plans={plans} viewer={viewer} initialSegment={segment} />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading title="Compare plans" description="Every plan's limits and features, side by side." />
          <div className="mt-10 space-y-8">
            {SEGMENTS.map((s) => (
              <ComparisonTable key={s} segment={s} plans={plans.filter((p) => p.segment === s)} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/70 bg-white/40 backdrop-blur-xl py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading title="Billing questions" />
          <div className="mt-10">
            <FaqTabs defaultGroup={segment ?? "business"} />
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-subtle">Need a custom arrangement for a large team or association?</p>
            <Button asChild variant="link" className="mt-1">
              <Link href="/contact">Contact our partnerships team</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function ComparisonTable({ segment, plans }: { segment: Segment; plans: SubscriptionPlan[] }) {
  if (!plans.length) return null;
  const features = Array.from(new Set(plans.flatMap((p) => p.entitlements))) as FeatureKey[];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-sans text-base font-semibold tracking-normal text-navy-900">{SEGMENT_LABEL[segment]}</h3>
      </div>
      <Table>
        <THead>
          <tr>
            <Th className="w-1/2">Feature</Th>
            {plans.map((p) => (
              <Th key={p.id} className="text-center normal-case tracking-normal">
                <span className="block text-sm font-semibold text-ink">{p.name}</span>
                <span className="block text-xs font-normal">{p.priceMonthly ? `${formatIDR(p.priceMonthly)}/mo` : "Free"}</span>
              </Th>
            ))}
          </tr>
        </THead>
        <tbody>
          {LIMIT_ROWS.filter((r) => r.segments.includes(segment)).map((r) => (
            <Tr key={r.key}>
              <Td className="text-subtle">{r.label}</Td>
              {plans.map((p) => (
                <Td key={p.id} className="text-center font-medium">
                  {p.limits[r.key] || <Minus className="mx-auto size-4 text-muted" />}
                </Td>
              ))}
            </Tr>
          ))}
          {features.map((f) => (
            <Tr key={f}>
              <Td className="text-subtle">{FEATURE_LABEL[f]}</Td>
              {plans.map((p) => (
                <Td key={p.id} className="text-center">
                  {p.entitlements.includes(f) ? (
                    <Check className="mx-auto size-4 text-brand-600" aria-label="Included" />
                  ) : (
                    <Minus className="mx-auto size-4 text-muted" aria-label="Not included" />
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
