import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { SaveButton } from "@/components/marketplace/save-button";
import { ReportDialog } from "@/components/marketplace/report-dialog";
import { ProfileHeader } from "@/components/marketplace/profile-header";
import { ProfileReviews } from "@/components/marketplace/profile-reviews";
import {
  AboutSection,
  AgencySections,
  BusinessSections,
  CreatorSections,
  SalesSections,
  Section,
} from "@/components/marketplace/profile-sections";
import { maskLocked } from "@/components/marketplace/mask";
import { getOpportunitiesByBusiness, getProfileView, getReviewsFor, getTalents } from "@/lib/data/queries";
import { getViewerContext } from "@/lib/data/marketplace-queries";
import { roleCan } from "@/lib/permissions";

async function loadProfile(id: string) {
  const profile = await getProfileView(id);
  if (!profile || profile.status === "suspended") return null;
  return profile;
}

export async function generateMetadata(props: PageProps<"/profiles/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const p = await loadProfile(id);
  if (!p) return { title: "Profile not found" };
  return { title: `${p.name} · ${p.roleLabel}`, description: (p.about || p.headline).slice(0, 160) };
}

export default async function ProfilePage(props: PageProps<"/profiles/[id]">) {
  const { id } = await props.params;
  const profile = await loadProfile(id);
  if (!profile) notFound();

  const viewer = await getViewerContext();
  const user = viewer.user;
  const isOwn = user?.id === profile.id;
  const profileHref = `/profiles/${profile.id}`;

  const [reviews, opportunities, talents] = await Promise.all([
    getReviewsFor(profile.id),
    profile.role === "business" ? getOpportunitiesByBusiness(profile.id) : Promise.resolve([]),
    profile.role === "agency" ? getTalents(profile.id) : Promise.resolve([]),
  ]);
  const openOpportunities = opportunities.filter((o) => o.status === "open" && !o.flagged);

  const canSave = !!user && !isOwn && roleCan(user.role, "savePartners");
  const actions = (
    <>
      {canSave && (
        <SaveButton
          targetType="profile"
          targetId={profile.id}
          initialSaved={viewer.saved.has(`profile:${profile.id}`)}
          signedIn
          variant="full"
        />
      )}
      <ReportDialog
        targetType="user"
        targetId={profile.id}
        signedIn={!!user}
        loginHref={`/login?next=${encodeURIComponent(profileHref)}`}
        subject={profile.name}
      />
    </>
  );

  return (
    <>
      <ProfileHeader profile={profile} isOwn={isOwn} actions={actions} />

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <AboutSection about={profile.about} />

          {profile.sales && <SalesSections sales={profile.sales} />}
          {profile.creator && <CreatorSections creator={profile.creator} />}
          {profile.agency && <AgencySections agency={profile.agency} talents={talents} />}
          {profile.business && (
            <>
              <BusinessSections business={profile.business} />
              <Section
                title="Open opportunities"
                description={openOpportunities.length ? `Currently accepting applications at ${profile.name}` : undefined}
              >
                {openOpportunities.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No open opportunities right now"
                    description="Save this company to keep an eye on future listings, or browse the marketplace."
                    className="py-8"
                    action={
                      <Button asChild variant="secondary">
                        <Link href="/marketplace">Browse marketplace</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {openOpportunities.map((o) => {
                      const locked = o.premium && !viewer.premium && !isOwn;
                      return (
                        <OpportunityCard
                          key={o.id}
                          opportunity={maskLocked(o, locked)}
                          locked={locked}
                          saved={viewer.saved.has(`opportunity:${o.id}`)}
                          signedIn={!!user}
                        />
                      );
                    })}
                  </div>
                )}
              </Section>
            </>
          )}

        </div>
        <aside className="min-w-0">
          <ProfileReviews reviews={reviews} name={profile.name} />
        </aside>
      </div>
    </>
  );
}
