import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { AddTalentDialog } from "@/components/dashboard/add-talent-dialog";
import { LimitMeter } from "@/components/dashboard/limit-meter";
import { TalentTable } from "@/components/dashboard/talent-table";
import { StatCard } from "@/components/dashboard/widgets";
import { requireRole } from "@/lib/auth/session";
import { getCategoryNames, getTalents } from "@/lib/data/queries";
import { getProposalCountsByTalent } from "@/lib/data/dashboard-queries";
import { getUsage } from "@/lib/permissions";

export const metadata: Metadata = { title: "Talent management" };

export default async function TalentsPage() {
  const user = await requireRole(["agency"], "/dashboard/talents");
  const [talents, locations, usage, proposals] = await Promise.all([
    getTalents(user.id),
    getCategoryNames("location"),
    getUsage(user),
    getProposalCountsByTalent(user.id),
  ]);
  const meter = usage.find((m) => m.key === "talentRoster") ?? { used: talents.length, limit: 0 };
  const atLimit = meter.used >= meter.limit;
  const available = talents.filter((t) => t.status === "available").length;
  const onProject = talents.filter((t) => t.status === "on_project").length;
  const totalProposals = Object.values(proposals).reduce((s, n) => s + n, 0);

  return (
    <div>
      <PageHeader
        title="Talent management"
        description="The creators, affiliates and sales reps you represent. Propose them to opportunities from your inbox."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/inbox">Opportunity inbox</Link>
            </Button>
            <AddTalentDialog locations={locations} disabled={atLimit} />
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LimitMeter
          className="sm:col-span-2 lg:col-span-1"
          label="Talent roster"
          used={meter.used}
          limit={meter.limit}
          unit="talents"
          atLimitHint={meter.limit === 0 ? "Your plan doesn't include a talent roster." : "You've reached your roster limit."}
        />
        <StatCard label="Available" value={available} hint="Ready for new projects" icon={UsersRound} tone="success" />
        <StatCard label="On project" value={onProject} hint="Currently assigned" icon={UsersRound} tone="brand" />
        <StatCard label="Proposals sent" value={totalProposals} hint="On behalf of your talents" href="/dashboard/applications" tone="blue" />
      </div>

      {talents.length === 0 ? (
        <Card>
          <EmptyState
            icon={UserPlus}
            title="Your roster is empty"
            description="Add the talents you manage so you can propose them to brand campaigns and sales opportunities."
            action={atLimit ? (
              <Button asChild>
                <Link href="/dashboard/billing">Upgrade to add talents</Link>
              </Button>
            ) : (
              <AddTalentDialog locations={locations} />
            )}
          />
        </Card>
      ) : (
        <TalentTable talents={talents} proposals={proposals} />
      )}
    </div>
  );
}
