import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { FieldValues } from "react-hook-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProfileEditor } from "@/components/onboarding/profile-editor";
import { ProfileStrength } from "@/components/dashboard/profile-strength";
import { VerificationCard } from "@/components/dashboard/verification-card";
import { requireUser } from "@/lib/auth/session";
import { getAgency, getBusiness, getCategoryNames, getCreator, getProfileView, getSalesPartner } from "@/lib/data/queries";
import type { Segment } from "@/lib/types";

export const metadata: Metadata = { title: "My profile" };

async function loadDefaults(role: Segment, userId: string): Promise<FieldValues | null> {
  if (role === "business") {
    const b = await getBusiness(userId);
    return b && { companyName: b.companyName, businessEmail: b.businessEmail, industry: b.industry, category: b.category, location: b.location, website: b.website ?? "", description: b.description, logoUrl: b.logoUrl ?? "" };
  }
  if (role === "sales") {
    const s = await getSalesPartner(userId);
    return s && { fullName: s.fullName, title: s.title, location: s.location, industries: s.industries, experienceYears: s.experienceYears, partnershipTypes: s.partnershipTypes, areas: s.areas, specializations: s.specializations, portfolio: s.portfolio, bio: s.bio };
  }
  if (role === "creator") {
    const c = await getCreator(userId);
    return c && { fullName: c.fullName, creatorTypes: c.creatorTypes, socials: c.socials, engagementRate: c.engagementRate ?? "", niches: c.niches, location: c.location, portfolio: c.portfolio, collaborationTypes: c.collaborationTypes, bio: c.bio };
  }
  const a = await getAgency(userId);
  return a && { agencyName: a.agencyName, category: a.category, website: a.website ?? "", location: a.location, description: a.description, services: a.services, teamSize: a.teamSize, portfolio: a.portfolio };
}

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  if (user.role === "admin") redirect("/settings");
  const role = user.role as Segment;

  const [defaults, view, industries, niches, locations] = await Promise.all([
    loadDefaults(role, user.id),
    getProfileView(user.id),
    getCategoryNames("industry"),
    getCategoryNames("niche"),
    getCategoryNames("location"),
  ]);
  if (!defaults || !view) redirect("/dashboard");

  // Keep values that an admin may since have disabled as selectable options.
  const keep = (list: string[], extra: unknown) => Array.from(new Set([...list, ...(Array.isArray(extra) ? extra : extra ? [extra] : [])].filter(Boolean) as string[]));
  const taxonomies = {
    industries: keep(industries, defaults.industries ?? defaults.industry),
    niches: keep(niches, defaults.niches),
    locations: keep(locations, [defaults.location, ...((defaults.areas as string[]) ?? [])]),
  };

  return (
    <>
      <PageHeader
        title="My profile"
        description="This is what businesses and partners see on your public profile."
        actions={
          <Button asChild variant="secondary">
            <Link href={`/profiles/${user.id}`}>
              <ExternalLink /> View public profile
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <ProfileEditor role={role} defaults={defaults} taxonomies={taxonomies} />
        </div>
        <div className="space-y-6">
          <VerificationCard status={user.verification} />
          <ProfileStrength profile={view} />
        </div>
      </div>
    </>
  );
}
