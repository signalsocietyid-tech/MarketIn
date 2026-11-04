import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Briefcase, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { ProfileCard } from "@/components/marketplace/profile-card";
import { requireRole } from "@/lib/auth/session";
import { getOpportunity, getProfileView, getSaved, type OpportunityView, type ProfileView } from "@/lib/data/queries";
import { getUsage, hasFeature } from "@/lib/permissions";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await requireRole(["business", "sales", "creator", "agency"], "/dashboard/saved");
  const [saved, includePremium, usage] = await Promise.all([
    getSaved(user.id),
    hasFeature(user, "premium_opportunities"),
    getUsage(user),
  ]);
  const newestFirst = [...saved].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const opportunities = (
    await Promise.all(newestFirst.filter((s) => s.targetType === "opportunity").map((s) => getOpportunity(s.targetId)))
  ).filter((o): o is OpportunityView => !!o && !o.flagged);
  const profiles = (
    await Promise.all(newestFirst.filter((s) => s.targetType === "profile").map((s) => getProfileView(s.targetId)))
  ).filter((p): p is ProfileView => !!p && p.status !== "suspended");

  const isBusiness = user.role === "business";
  const meter = usage.find((m) => m.key === "savedItems");
  // Businesses mostly save partners, so open on profiles when they have any.
  const defaultTab = isBusiness && profiles.length ? "profiles" : opportunities.length || !profiles.length ? "opportunities" : "profiles";

  return (
    <div>
      <PageHeader
        title={isBusiness ? "Saved partners" : "Saved"}
        description={
          <>
            Opportunities and profiles you bookmarked across the marketplace.
            {meter && (
              <span className="ml-1 text-muted">
                {meter.used} / {meter.limit} saved items used.
              </span>
            )}
          </>
        }
        actions={
          <Button asChild variant="secondary">
            <Link href="/marketplace">Browse marketplace</Link>
          </Button>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="opportunities">
            <Briefcase /> Opportunities <span className="tabular-nums text-muted">{opportunities.length}</span>
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <UsersRound /> Profiles <span className="tabular-nums text-muted">{profiles.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          {opportunities.length === 0 ? (
            <Card>
              <EmptyState
                icon={Bookmark}
                title="No saved opportunities"
                description="Tap the bookmark on any opportunity to keep it here for later."
                action={
                  <Button asChild>
                    <Link href="/marketplace">Explore opportunities</Link>
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {opportunities.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} saved signedIn locked={o.premium && !includePremium} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profiles">
          {profiles.length === 0 ? (
            <Card>
              <EmptyState
                icon={Bookmark}
                title={isBusiness ? "No saved partners yet" : "No saved profiles"}
                description="Save sales partners, creators and agencies you'd like to work with to compare them later."
                action={
                  <Button asChild>
                    <Link href="/marketplace/sales?view=partners">Find partners</Link>
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((p) => (
                <ProfileCard key={p.id} profile={p} saved signedIn />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
