import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardHeader, Progress } from "@/components/ui/primitives";
import type { ProfileView } from "@/lib/data/queries";

/** Checklist of profile fields that make an account more credible to partners. */
export function profileChecklist(p: ProfileView) {
  const items: { label: string; done: boolean }[] = [{ label: "Account verified", done: p.verified }];
  if (p.business) {
    items.push(
      { label: "Company description", done: p.business.description.length >= 60 },
      { label: "Logo uploaded", done: !!p.business.logoUrl },
      { label: "Website added", done: !!p.business.website },
    );
  }
  if (p.sales) {
    items.push(
      { label: "Portfolio / track record", done: p.sales.portfolio.length > 20 },
      { label: "Short bio", done: p.sales.bio.length > 20 },
      { label: "Sales specialization", done: p.sales.specializations.length > 0 },
      { label: "At least 2 coverage areas", done: p.sales.areas.length >= 2 },
    );
  }
  if (p.creator) {
    items.push(
      { label: "Two or more social channels", done: p.creator.socials.length >= 2 },
      { label: "Engagement rate", done: p.creator.engagementRate !== undefined },
      { label: "Portfolio", done: p.creator.portfolio.length > 20 },
      { label: "Short bio", done: p.creator.bio.length > 20 },
    );
  }
  if (p.agency) {
    items.push(
      { label: "Portfolio / case work", done: p.agency.portfolio.length > 20 },
      { label: "Website added", done: !!p.agency.website },
      { label: "Three or more services", done: p.agency.services.length >= 3 },
    );
  }
  return items;
}

export function ProfileStrength({ profile }: { profile: ProfileView }) {
  const items = profileChecklist(profile);
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <Card>
      <CardHeader
        title="Profile strength"
        description={pct === 100 ? "Your profile is complete." : "Complete profiles get more responses."}
        action={
          <Link href="/profile" className="text-[13px] font-semibold text-brand-700 hover:underline">
            Edit
          </Link>
        }
      />
      <div className="p-5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-subtle">{done} of {items.length} complete</span>
          <span className="font-semibold text-ink">{pct}%</span>
        </div>
        <Progress value={pct} className="mt-2" />
        <ul className="mt-4 space-y-2.5">
          {items.map((i) => (
            <li key={i.label} className="flex items-center gap-2 text-[13px]">
              {i.done ? <CheckCircle2 className="size-4 text-success-600" /> : <Circle className="size-4 text-line-strong" />}
              <span className={i.done ? "text-subtle line-through decoration-line-strong" : "text-ink"}>{i.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
