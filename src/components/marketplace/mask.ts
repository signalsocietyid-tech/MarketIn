import type { OpportunityView } from "@/lib/data/queries";

export const LOCKED_PLACEHOLDER = "Rp00 jt + 00% per deal";

/**
 * OpportunityCard only blurs the compensation text, so replace it before rendering
 * premium listings for viewers without access — the real terms never reach the HTML.
 */
export function maskLocked<T extends OpportunityView>(o: T, locked: boolean): T {
  if (!locked) return o;
  return { ...o, compensationDetail: LOCKED_PLACEHOLDER, budgetMin: undefined, budgetMax: undefined };
}
