import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/components/dashboard/notification-list";
import { requireRole } from "@/lib/auth/session";
import { getNotifications } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireRole(["business", "sales", "creator", "agency"], "/dashboard/notifications");
  const notifications = await getNotifications(user.id);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Activity on your applications, partnerships, reviews and subscription." />
      <NotificationList notifications={notifications} />
    </div>
  );
}
