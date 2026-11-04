import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser, toSessionUser } from "@/lib/auth/session";
import { getEffectivePlan, getNotifications, getPendingSubscription } from "@/lib/data/queries";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · MarketIn" }, robots: { index: false } };

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const [notifications, plan, pending] = await Promise.all([
    getNotifications(user.id),
    getEffectivePlan(user),
    getPendingSubscription(user.id),
  ]);
  const planLabel = user.role === "admin" ? "Platform administrator" : `${plan?.name ?? "Free"}${pending ? " · upgrade pending" : ""}`;

  return (
    <AppShell user={toSessionUser(user)} unread={notifications.filter((n) => !n.read).length} planLabel={planLabel}>
      {children}
    </AppShell>
  );
}
