import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/components/dashboard/notification-list";
import { requireRole } from "@/lib/auth/session";
import { getNotifications } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const user = await requireRole(["admin"], "/admin/notifications");
  const notifications = await getNotifications(user.id);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Verification requests, reports and other platform activity." />
      <NotificationList notifications={notifications} />
    </div>
  );
}
