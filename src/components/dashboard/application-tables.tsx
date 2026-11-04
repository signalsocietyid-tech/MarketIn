import Link from "next/link";
import { Avatar, Table, THead, Th, Td, Tr } from "@/components/ui/primitives";
import { ApplicationStatusBadge, VerifiedMark } from "@/components/shared/status-badge";
import type { ApplicationView } from "@/lib/data/queries";
import { timeAgo } from "@/lib/utils";

/** Applications a business received. */
export function ReceivedApplicationsTable({ applications }: { applications: ApplicationView[] }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>Applicant</Th>
          <Th>Opportunity</Th>
          <Th>Status</Th>
          <Th className="text-right">Received</Th>
        </tr>
      </THead>
      <tbody>
        {applications.map((a) => (
          <Tr key={a.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={a.applicant?.name ?? "?"} size={32} />
                <div className="min-w-0">
                  <Link href={`/profiles/${a.applicantId}`} className="flex items-center gap-1 font-medium text-ink hover:text-brand-700">
                    <span className="truncate">{a.applicant?.name}</span>
                    {a.applicant?.verified && <VerifiedMark className="size-3.5" />}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {a.talentName ? `On behalf of ${a.talentName}` : a.applicant?.roleLabel}
                  </p>
                </div>
              </div>
            </Td>
            <Td>
              <Link href={`/dashboard/opportunities/${a.opportunityId}`} className="line-clamp-1 text-subtle hover:text-ink">
                {a.opportunity.title}
              </Link>
            </Td>
            <Td>
              <ApplicationStatusBadge status={a.status} />
            </Td>
            <Td className="whitespace-nowrap text-right text-subtle">{timeAgo(a.createdAt)}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

/** Applications a partner/agency submitted. */
export function SubmittedApplicationsTable({ applications }: { applications: ApplicationView[] }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>Opportunity</Th>
          <Th>Company</Th>
          <Th>Status</Th>
          <Th className="text-right">Updated</Th>
        </tr>
      </THead>
      <tbody>
        {applications.map((a) => (
          <Tr key={a.id}>
            <Td>
              <Link href={`/opportunities/${a.opportunityId}`} className="line-clamp-1 font-medium text-ink hover:text-brand-700">
                {a.opportunity.title}
              </Link>
              {a.talentName && <p className="text-xs text-muted">For {a.talentName}</p>}
            </Td>
            <Td className="text-subtle">{a.opportunity.companyName}</Td>
            <Td>
              <ApplicationStatusBadge status={a.status} />
            </Td>
            <Td className="whitespace-nowrap text-right text-subtle">{timeAgo(a.updatedAt)}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
