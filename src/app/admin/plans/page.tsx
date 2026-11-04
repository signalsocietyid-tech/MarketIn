import Link from "next/link";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlanEditor } from "@/components/admin/plan-editor";
import { PLAN_CHANGES_NOTE } from "@/components/admin/copy";
import { getPlans } from "@/lib/data/queries";
import { SEGMENT_LABEL, SEGMENTS } from "@/lib/constants";
import type { SubscriptionPlan } from "@/lib/types";

export const metadata = { title: "Plans & pricing" };

/** Remount an editor whenever its stored plan changes (e.g. "recommended" moved to another plan). */
function versionKey(p: SubscriptionPlan) {
  const s = JSON.stringify(p);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${p.id}:${h.toString(36)}`;
}

export default async function AdminPlansPage() {
  const groups = await Promise.all(SEGMENTS.map(async (segment) => ({ segment, plans: await getPlans(segment, true) })));

  return (
    <>
      <PageHeader
        title="Plans & pricing"
        description="Configure prices, membership benefits, feature entitlements and usage limits per segment."
        actions={
          <Link href="/pricing" className="text-[13px] font-semibold text-brand-700 hover:underline">
            View pricing page
          </Link>
        }
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="text-[13px] font-medium leading-relaxed">{PLAN_CHANGES_NOTE}</p>
      </div>

      <nav aria-label="Segments" className="mb-6 flex flex-wrap gap-2">
        {SEGMENTS.map((s) => (
          <a
            key={s}
            href={`#segment-${s}`}
            className="rounded-full border border-line-strong bg-white px-3 py-1.5 text-[13px] font-medium text-subtle hover:border-navy-200 hover:text-ink"
          >
            {SEGMENT_LABEL[s]}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        {groups.map(({ segment, plans }) => (
          <section key={segment} id={`segment-${segment}`} aria-labelledby={`h-${segment}`} className="scroll-mt-24">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id={`h-${segment}`} className="text-lg font-semibold text-navy-900">
                {SEGMENT_LABEL[segment]}
              </h2>
              <p className="text-xs text-subtle">
                {plans.length} {plans.length === 1 ? "plan" : "plans"}
              </p>
            </div>
            {plans.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong bg-white px-5 py-8 text-center text-sm text-subtle">
                No plans configured for this segment.
              </p>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {plans.map((p) => (
                  <PlanEditor key={versionKey(p)} plan={p} segmentLabel={SEGMENT_LABEL[segment]} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
