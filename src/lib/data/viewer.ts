import "server-only";
import type { PricingViewer } from "@/components/pricing/pricing-table";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveSubscription, getEffectivePlan, getPendingSubscription } from "./queries";

/** What the pricing table needs to know about the signed-in visitor. */
export async function getPricingViewer(): Promise<PricingViewer> {
  const user = await getCurrentUser();
  if (!user) return null;
  const [plan, active, pending] = await Promise.all([
    getEffectivePlan(user),
    getActiveSubscription(user.id),
    getPendingSubscription(user.id),
  ]);
  return { role: user.role, currentPlanId: active?.planId ?? plan?.id, pendingPlanId: pending?.planId };
}
