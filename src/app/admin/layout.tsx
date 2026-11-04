import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole, toSessionUser } from "@/lib/auth/session";
import { getAdminUnreadCount } from "@/lib/data/admin-queries";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · MarketIn" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRole(["admin"], "/admin");
  const unread = await getAdminUnreadCount(user.id);
  return (
    <AppShell user={toSessionUser(user)} unread={unread} planLabel="Platform administrator">
      {children}
    </AppShell>
  );
}
