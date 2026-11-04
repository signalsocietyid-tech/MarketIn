import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { OpportunityForm } from "@/components/dashboard/opportunity-form";
import { requireRole } from "@/lib/auth/session";
import { getCategoryNames, getOpportunity } from "@/lib/data/queries";
import { hasFeature } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit opportunity" };

export default async function EditOpportunityPage(props: PageProps<"/dashboard/opportunities/[id]/edit">) {
  const { id } = await props.params;
  const user = await requireRole(["business"], `/dashboard/opportunities/${id}/edit`);
  const o = await getOpportunity(id);
  if (!o || o.businessId !== user.id) notFound();
  const [industries, locations, canPremium] = await Promise.all([
    getCategoryNames("industry"),
    getCategoryNames("location"),
    hasFeature(user, "priority_visibility"),
  ]);

  return (
    <>
      <PageHeader title="Edit opportunity" description={o.title} />
      <OpportunityForm
        id={o.id}
        industries={Array.from(new Set([...industries, o.industry]))}
        locations={Array.from(new Set([...locations, o.location]))}
        canPremium={canPremium || o.premium}
        defaults={{
          title: o.title,
          type: o.type,
          industry: o.industry,
          location: o.location,
          remote: o.remote,
          description: o.description,
          requirements: o.requirements.join("\n"),
          deliverables: o.deliverables.join("\n"),
          compensationModel: o.compensationModel,
          compensationDetail: o.compensationDetail,
          budgetMin: o.budgetMin ?? "",
          budgetMax: o.budgetMax ?? "",
          experienceLevel: o.experienceLevel,
          platforms: o.platforms ?? [],
          deadline: o.deadline.slice(0, 10),
          duration: o.duration,
          premium: o.premium,
        }}
      />
    </>
  );
}
