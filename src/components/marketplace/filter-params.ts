// Shared (client + server) definitions for marketplace search params.
// The server uses the parse helpers to strip plan-gated params before querying,
// so advanced filtering can't be unlocked by editing the URL.

import type { MarketCategory } from "@/lib/types";
import type { OpportunityFilters, PartnerFilters } from "@/lib/data/queries";

export type PartnerKind = "sales" | "creator" | "agency";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Params that require the `advanced_filters` entitlement. */
export const ADVANCED_OPPORTUNITY_KEYS = ["budget", "experience", "verified", "remote"] as const;
export const ADVANCED_PARTNER_KEYS = [
  "experience",
  "verified",
  "engagement",
  "audience",
  "specialization",
  "partnershipType",
  "creatorType",
  "service",
] as const;

export const OPPORTUNITY_KEYS = [
  "q",
  "type",
  "industry",
  "location",
  "compensation",
  "platform",
  "sort",
  ...ADVANCED_OPPORTUNITY_KEYS,
] as const;

export const PARTNER_KEYS_BY_KIND: Record<PartnerKind, readonly (keyof PartnerFilters)[]> = {
  sales: ["q", "industry", "location", "experience", "specialization", "partnershipType", "verified", "sort"],
  creator: ["q", "platform", "niche", "audience", "location", "engagement", "creatorType", "verified", "sort"],
  agency: ["q", "agencyCategory", "service", "location", "verified", "sort"],
};

/** Value meaning "no filter" for params that have a page-level default (e.g. creatorType on /marketplace/affiliate). */
export const ANY_VALUE = "all";

export const OPPORTUNITY_SORTS = [
  { value: "", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "deadline", label: "Deadline soonest" },
  { value: "budget", label: "Highest budget" },
] as const;

export const PARTNER_SORTS = [
  { value: "", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest members" },
] as const;

export const ENGAGEMENT_OPTIONS = [
  { value: "2", label: "2%+" },
  { value: "3", label: "3%+" },
  { value: "5", label: "5%+" },
  { value: "7", label: "7%+" },
] as const;

export function firstParam(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  const trimmed = s?.trim();
  return trimmed ? trimmed.slice(0, 120) : undefined;
}

export function parseOpportunityFilters(
  sp: RawSearchParams,
  opts: { advanced: boolean; category?: MarketCategory },
): OpportunityFilters {
  const out: OpportunityFilters = {};
  for (const key of OPPORTUNITY_KEYS) {
    if (!opts.advanced && (ADVANCED_OPPORTUNITY_KEYS as readonly string[]).includes(key)) continue;
    const v = firstParam(sp[key]);
    if (v) out[key] = v;
  }
  if (opts.category) out.category = opts.category;
  return out;
}

export function parsePartnerFilters(
  sp: RawSearchParams,
  opts: { advanced: boolean; kind: PartnerKind; defaults?: Partial<PartnerFilters> },
): PartnerFilters {
  const out: PartnerFilters = {};
  for (const key of PARTNER_KEYS_BY_KIND[opts.kind]) {
    const gated = (ADVANCED_PARTNER_KEYS as readonly string[]).includes(key);
    const v = !gated || opts.advanced ? firstParam(sp[key]) : undefined;
    const value = v ?? opts.defaults?.[key];
    if (value && value !== ANY_VALUE) out[key] = value;
  }
  return out;
}

/** Number of user-applied filters (ignores sort, view and page defaults). */
export function countActive(params: URLSearchParams, keys: readonly string[]) {
  return keys.filter((k) => k !== "sort" && k !== "q" && params.get(k)).length;
}
