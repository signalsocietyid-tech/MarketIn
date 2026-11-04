import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { AgencyOverview, BusinessOverview, PartnerOverview } from "@/components/dashboard/overviews";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const welcome = (await props.searchParams).welcome === "1";

  if (user.role === "admin") redirect("/admin");
  switch (user.role) {
    case "business":
      return <BusinessOverview user={user} welcome={welcome} />;
    case "agency":
      return <AgencyOverview user={user} welcome={welcome} />;
    default:
      return <PartnerOverview user={user} welcome={welcome} />;
  }
}
