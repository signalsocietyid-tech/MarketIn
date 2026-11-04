import "server-only";
import type { ApplicationStatus, MarketCategory, Opportunity } from "@/lib/types";
import { db } from "@/lib/data/store";
import { toOpportunityView, type OpportunityView } from "@/lib/data/queries";

// Extra read helpers for the agency / partner dashboard pages.

/** Number of proposals (applications) submitted on behalf of each talent in an agency's roster. */
export async function getProposalCountsByTalent(agencyId: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const a of db().applications) {
    if (a.applicantId === agencyId && a.talentId) counts[a.talentId] = (counts[a.talentId] ?? 0) + 1;
  }
  return counts;
}

/** Maps a free-text agency service to the marketplace category it sources partners for. */
export function serviceCategory(service: string): Exclude<MarketCategory, "agency"> | null {
  const s = service.toLowerCase();
  if (/(kol|campaign|content|influencer|ugc)/.test(s)) return "kol";
  if (/(affiliate|performance)/.test(s)) return "affiliate";
  if (/(sales|distributor|reseller)/.test(s)) return "sales";
  return null;
}

export type InboxProposal = { status: ApplicationStatus; count: number; lastAt: string };

export type InboxItem = {
  opportunity: OpportunityView;
  section: "agency" | "services" | "other";
  reason: string;
  locked: boolean;
  proposal: InboxProposal | null;
};

const STATUS_RANK: Record<ApplicationStatus, number> = {
  completed: 6,
  accepted: 5,
  shortlisted: 4,
  under_review: 3,
  pending: 2,
  rejected: 1,
};

/**
 * Opportunity inbox for an agency: open agency-partnership listings first, then
 * KOL / affiliate / sales listings that match the agency's services, plus every
 * listing the agency has already proposed to (whatever its current status).
 */
export async function getAgencyInbox(agencyId: string, opts: { includePremium: boolean }): Promise<InboxItem[]> {
  const d = db();
  const agency = d.agencies.find((a) => a.userId === agencyId);
  const services = agency?.services ?? [];

  const servicesByCategory = new Map<MarketCategory, string[]>();
  for (const s of services) {
    const c = serviceCategory(s);
    if (c) servicesByCategory.set(c, [...(servicesByCategory.get(c) ?? []), s]);
  }

  // Aggregate this agency's proposals per opportunity (it may propose several talents).
  const proposals = new Map<string, InboxProposal>();
  for (const a of d.applications) {
    if (a.applicantId !== agencyId) continue;
    const prev = proposals.get(a.opportunityId);
    if (!prev) {
      proposals.set(a.opportunityId, { status: a.status, count: 1, lastAt: a.createdAt });
    } else {
      proposals.set(a.opportunityId, {
        status: STATUS_RANK[a.status] > STATUS_RANK[prev.status] ? a.status : prev.status,
        count: prev.count + 1,
        lastAt: a.createdAt > prev.lastAt ? a.createdAt : prev.lastAt,
      });
    }
  }

  const visible = (o: Opportunity) => {
    if (o.flagged) return false;
    const owner = d.users.find((u) => u.id === o.businessId);
    return !!owner && owner.status !== "suspended";
  };

  const items: InboxItem[] = [];
  for (const o of d.opportunities) {
    if (!visible(o)) continue;
    const proposal = proposals.get(o.id) ?? null;
    const isOpen = o.status === "open";
    let section: InboxItem["section"] | null = null;
    let reason = "";
    if (o.category === "agency") {
      section = "agency";
      reason = "Agency partnership";
    } else if (servicesByCategory.has(o.category)) {
      section = "services";
      reason = `Matches: ${servicesByCategory.get(o.category)!.join(", ")}`;
    } else if (proposal) {
      section = "other";
      reason = "You proposed to this listing";
    }
    // Closed or paused listings only stay visible when the agency already proposed.
    if (!section || (!isOpen && !proposal)) continue;
    items.push({
      opportunity: toOpportunityView(o),
      section,
      reason,
      locked: o.premium && !opts.includePremium,
      proposal,
    });
  }

  const sectionRank = { agency: 0, services: 1, other: 2 } as const;
  items.sort(
    (a, b) =>
      sectionRank[a.section] - sectionRank[b.section] ||
      Number(b.opportunity.featured) - Number(a.opportunity.featured) ||
      b.opportunity.createdAt.localeCompare(a.opportunity.createdAt),
  );
  return items;
}
