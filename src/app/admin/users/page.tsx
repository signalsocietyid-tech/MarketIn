import Link from "next/link";
import { Crown, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, Badge, Card, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { AccountStatusBadge, VerificationBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/admin/filter-bar";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { UserActions } from "@/components/admin/user-actions";
import { flatParams, oneOf, param } from "@/components/admin/search-params";
import { getAdminUsers } from "@/lib/data/admin-queries";
import { SEGMENT_LABEL, SEGMENTS } from "@/lib/constants";
import type { AccountStatus, VerificationStatus } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "Users & verification" };

const STATUSES: AccountStatus[] = ["active", "flagged", "suspended"];
const VERIFICATIONS: VerificationStatus[] = ["pending", "verified", "unverified", "rejected"];
const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  pending: "Pending review",
  verified: "Verified",
  unverified: "Unverified",
  rejected: "Rejected",
};

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  const sp = await props.searchParams;
  const filters = {
    q: param(sp, "q"),
    role: oneOf(sp, "role", SEGMENTS),
    status: oneOf(sp, "status", STATUSES),
    verification: oneOf(sp, "verification", VERIFICATIONS),
  };
  const params = flatParams(sp);
  const { rows, counts } = await getAdminUsers(filters);
  const pendingCount = rows.filter((r) => r.verification === "pending").length;

  return (
    <>
      <PageHeader
        title="Users & verification"
        description="Manage businesses, sales partners, creators and agencies: account status, verification and plan."
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          pathname="/admin/users"
          param="role"
          current={filters.role}
          params={params}
          tabs={[{ label: "All", count: counts.all }, ...SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s], count: counts[s] }))]}
        />
        <FilterBar
          values={params}
          searchPlaceholder="Search name or email"
          resetKeys={["q", "status", "verification"]}
          selects={[
            { name: "status", label: "Status", options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
            { name: "verification", label: "Verification", options: VERIFICATIONS.map((v) => ({ value: v, label: VERIFICATION_LABEL[v] })) },
          ]}
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 text-[13px] text-subtle">
          <span>
            Showing <span className="font-semibold text-ink">{rows.length}</span> {rows.length === 1 ? "user" : "users"}
          </span>
          {pendingCount > 0 && filters.verification !== "pending" && (
            <Link href="/admin/users?verification=pending" className="font-semibold text-brand-700 hover:underline">
              {pendingCount} awaiting verification
            </Link>
          )}
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No users match these filters" description="Try a different search or clear the filters." />
        ) : (
          <Table className="min-w-[1040px]">
            <THead>
              <tr>
                <Th>User</Th>
                <Th>Segment</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Verification</Th>
                <Th>Plan</Th>
                <Th>Joined</Th>
                <Th>Last active</Th>
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatarUrl} size={32} square={u.role === "business" || u.role === "agency"} />
                      <div className="min-w-0">
                        <Link href={`/profiles/${u.id}`} className="block max-w-56 truncate font-medium hover:underline">
                          {u.name}
                        </Link>
                        {u.contactName !== u.name && <p className="max-w-56 truncate text-xs text-subtle">{u.contactName}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">{SEGMENT_LABEL[u.role]}</Td>
                  <Td>
                    <a href={`mailto:${u.email}`} className="text-subtle hover:text-ink hover:underline">
                      {u.email}
                    </a>
                  </Td>
                  <Td>
                    <AccountStatusBadge status={u.status} />
                  </Td>
                  <Td>
                    <VerificationBadge status={u.verification} />
                  </Td>
                  <Td>
                    <div className="flex flex-col items-start gap-1">
                      {u.planTier === "pro" ? (
                        <Badge tone="brand">
                          <Crown /> {u.planName}
                        </Badge>
                      ) : (
                        <Badge tone="outline">{u.planName}</Badge>
                      )}
                      {u.pendingPayment && (
                        <Link href="/admin/subscriptions?status=pending_payment" className="text-[11px] font-medium text-warning-700 hover:underline">
                          Upgrade awaiting payment
                        </Link>
                      )}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-subtle">{formatDate(u.createdAt)}</Td>
                  <Td className="whitespace-nowrap text-subtle">{timeAgo(u.lastActiveAt)}</Td>
                  <Td>
                    <UserActions user={{ id: u.id, name: u.name, status: u.status, verification: u.verification }} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
