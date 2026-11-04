import type { Metadata } from "next";
import Link from "next/link";
import { Info, Lock, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";
import { LimitMeter } from "@/components/dashboard/limit-meter";
import { TeamList } from "@/components/dashboard/team-list";
import { StatCard } from "@/components/dashboard/widgets";
import { requireRole } from "@/lib/auth/session";
import { getTeamMembers } from "@/lib/data/queries";
import { getUsage } from "@/lib/permissions";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

const ROLE_ORDER = { owner: 0, manager: 1, member: 2 } as const;

export default async function TeamPage() {
  const user = await requireRole(["agency"], "/dashboard/team");
  const [stored, usage] = await Promise.all([getTeamMembers(user.id), getUsage(user)]);
  const meter = usage.find((m) => m.key === "teamMembers") ?? { used: stored.length, limit: 1 };
  const multiSeat = meter.limit > 1;
  const atLimit = meter.used >= meter.limit;

  // Agencies created before team records existed have no owner row; show the account holder as owner.
  const members: TeamMember[] = stored.some((m) => m.role === "owner")
    ? stored
    : [{ id: "self", agencyId: user.id, name: user.name, email: user.email, role: "owner", status: "active", invitedAt: user.createdAt }, ...stored];
  members.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.invitedAt.localeCompare(b.invitedAt));

  const active = members.filter((m) => m.status === "active").length;
  const invited = members.filter((m) => m.status === "invited").length;

  return (
    <div>
      <PageHeader
        title="Team"
        description="Invite colleagues to manage your roster, proposals and partnerships together."
        actions={multiSeat ? <InviteMemberDialog disabled={atLimit} /> : undefined}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LimitMeter
          label="Team seats"
          used={meter.used}
          limit={meter.limit}
          unit="seats"
          atLimitHint={multiSeat ? "All team seats are in use." : "Your plan includes a single seat."}
        />
        <StatCard label="Active members" value={active} icon={Users} tone="success" />
        <StatCard label="Pending invites" value={invited} hint={invited ? "Waiting for them to join" : "No open invitations"} icon={Users} tone="brand" />
      </div>

      {!multiSeat && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
              <Lock className="size-4 text-brand-700" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">Work as a team with Agency Pro</p>
              <p className="mt-1 text-sm text-subtle">
                Your current plan includes one seat. Agency Pro supports multiple team members with manager and member roles, a larger talent roster and more monthly proposals.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/billing">See Pro plans</Link>
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Members"
          description={`${members.length} ${members.length === 1 ? "person" : "people"} in your agency workspace`}
        />
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite a colleague to collaborate on proposals."
            action={multiSeat ? <InviteMemberDialog disabled={atLimit} /> : undefined}
          />
        ) : (
          <TeamList members={members} currentEmail={user.email} />
        )}
        <div className="flex gap-2 border-t border-line px-5 py-3 text-xs text-muted">
          <Info className="size-3.5 shrink-0 translate-y-px" />
          Invitation emails aren&apos;t sent yet because no mail provider is configured. Invites are recorded here so you can share access with your colleagues directly.
        </div>
      </Card>
    </div>
  );
}
