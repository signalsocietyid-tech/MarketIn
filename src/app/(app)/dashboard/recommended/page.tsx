import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { requireRole } from "@/lib/auth/session";
import { getRecommendations } from "@/lib/data/insights";
import { getSaved } from "@/lib/data/queries";
import { hasFeature } from "@/lib/permissions";

export const metadata: Metadata = { title: "Recommended" };

export default async function RecommendedPage() {
  const user = await requireRole(["sales", "creator", "agency"], "/dashboard/recommended");
  const premium = await hasFeature(user, "premium_opportunities");
  const [recs, saved] = await Promise.all([getRecommendations(user, 24, premium), getSaved(user.id)]);
  const savedIds = new Set(saved.filter((s) => s.targetType === "opportunity").map((s) => s.targetId));
  const isCreator = user.role === "creator";

  return (
    <>
      <PageHeader
        title={isCreator ? "Recommended campaigns" : "Recommended opportunities"}
        description="Matched to your profile — industries, coverage areas, channels and niches. Opportunities you've applied to are hidden."
        actions={
          <Button asChild variant="secondary">
            <Link href="/profile">Improve matches</Link>
          </Button>
        }
      />
      {recs.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {recs.map((r) => (
            <div key={r.opportunity.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {r.reasons.map((reason) => (
                  <Badge key={reason} tone="brand">
                    {reason}
                  </Badge>
                ))}
              </div>
              <div className="flex-1">
                <OpportunityCard opportunity={r.opportunity} signedIn saved={savedIds.has(r.opportunity.id)} locked={r.opportunity.locked} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="No recommendations right now"
            description="Add industries, areas of operation, social channels or niches to your profile to get better matches."
            action={
              <Button asChild size="sm">
                <Link href="/marketplace">Browse all opportunities</Link>
              </Button>
            }
          />
        </Card>
      )}
      {!premium && (
        <p className="mt-6 text-[13px] text-subtle">
          Premium listings are shown with limited details on your plan.{" "}
          <Link href="/dashboard/billing" className="font-medium text-brand-700 hover:underline">
            Upgrade to apply to premium opportunities
          </Link>
          .
        </p>
      )}
    </>
  );
}
