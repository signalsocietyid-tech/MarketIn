import { ExternalLink } from "lucide-react";
import { Badge, Card, CardHeader } from "@/components/ui/primitives";
import { SocialIcon } from "@/components/brand/social-icons";
import { PLATFORM_LABEL } from "@/lib/constants";
import type { AgencyProfile, BusinessProfile, CreatorProfile, SalesProfile, Talent } from "@/lib/types";
import { formatCompact, pluralize } from "@/lib/utils";
import { displayUrl, safeUrl } from "./safe-url";

/* --------------------------------- Shared ---------------------------------- */

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="px-5 py-4">{children}</div>
    </Card>
  );
}

export function TagList({ items, empty = "Not specified", tone = "neutral" }: { items: string[]; empty?: string; tone?: "neutral" | "brand" | "blue" }) {
  if (!items.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <Badge key={t} tone={tone} className="px-2.5 py-1 text-[13px]">
          {t}
        </Badge>
      ))}
    </div>
  );
}

function Prose({ text, empty }: { text?: string; empty: string }) {
  if (!text?.trim()) return <p className="text-sm text-muted">{empty}</p>;
  return <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{text}</p>;
}

function DetailList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs text-subtle">{i.label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AboutSection({ about }: { about: string }) {
  return (
    <Section title="About">
      <Prose text={about} empty="No description provided yet." />
    </Section>
  );
}

/* --------------------------------- Sales ----------------------------------- */

export function SalesSections({ sales: s }: { sales: SalesProfile }) {
  return (
    <>
      <Section title="Experience & focus">
        <DetailList
          items={[
            { label: "Professional title", value: s.title },
            { label: "Experience", value: pluralize(s.experienceYears, "year") },
            { label: "Based in", value: s.location },
            { label: "Coverage", value: pluralize(s.areas.length, "city", "cities") },
          ]}
        />
      </Section>
      <Section title="Industries">
        <TagList items={s.industries} />
      </Section>
      <Section title="Areas of operation">
        <TagList items={s.areas} tone="blue" />
      </Section>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Specializations">
          <TagList items={s.specializations} />
        </Section>
        <Section title="Partnership types">
          <TagList items={s.partnershipTypes} tone="brand" />
        </Section>
      </div>
      <Section title="Portfolio & track record">
        <Prose text={s.portfolio} empty="No portfolio shared yet." />
      </Section>
    </>
  );
}

/* -------------------------------- Creator ---------------------------------- */

export function CreatorSections({ creator: c }: { creator: CreatorProfile }) {
  const total = c.socials.reduce((sum, s) => sum + s.followers, 0);
  return (
    <>
      <Section title="Social accounts" description={`${formatCompact(total)} total followers`}>
        {c.socials.length === 0 ? (
          <p className="text-sm text-muted">No social accounts connected.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.socials.map((s) => {
              const href = safeUrl(s.url);
              const inner = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas ring-1 ring-line">
                    <SocialIcon platform={s.platform} className="size-4 text-navy-800" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{s.handle}</span>
                    <span className="block text-xs text-subtle">
                      {PLATFORM_LABEL[s.platform]} · {formatCompact(s.followers)} followers
                    </span>
                  </span>
                  {href && <ExternalLink className="size-3.5 shrink-0 text-muted" />}
                </>
              );
              return (
                <li key={`${s.platform}-${s.handle}`}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-navy-100 hover:bg-canvas"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
      <Section title="Audience & engagement">
        <DetailList
          items={[
            { label: "Total audience", value: formatCompact(total) },
            { label: "Engagement rate", value: c.engagementRate ? `${c.engagementRate}%` : "Not shared" },
            { label: "Creator type", value: c.creatorTypes.join(", ") || "Not specified" },
            { label: "Based in", value: c.location },
          ]}
        />
      </Section>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Content niches">
          <TagList items={c.niches} />
        </Section>
        <Section title="Collaboration types">
          <TagList items={c.collaborationTypes} tone="brand" />
        </Section>
      </div>
      <Section title="Portfolio">
        <Prose text={c.portfolio} empty="No portfolio shared yet." />
      </Section>
    </>
  );
}

/* --------------------------------- Agency ---------------------------------- */

const TALENT_TYPES: { type: Talent["type"]; label: string }[] = [
  { type: "creator", label: "Creators & KOLs" },
  { type: "affiliate", label: "Affiliates" },
  { type: "sales", label: "Sales talent" },
];

export function AgencySections({ agency: a, talents }: { agency: AgencyProfile; talents: Talent[] }) {
  const active = talents.filter((t) => t.status !== "inactive");
  const available = talents.filter((t) => t.status === "available").length;
  const website = safeUrl(a.website);
  return (
    <>
      <Section title="Agency details">
        <DetailList
          items={[
            { label: "Category", value: a.category },
            { label: "Team size", value: `${a.teamSize} people` },
            { label: "Headquarters", value: a.location },
            {
              label: "Website",
              value: website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                  {displayUrl(website)}
                </a>
              ) : (
                "Not provided"
              ),
            },
          ]}
        />
      </Section>
      <Section title="Services">
        <TagList items={a.services} tone="brand" />
      </Section>
      <Section title="Talent roster" description={`${pluralize(active.length, "active talent")} · ${available} available now`}>
        <ul className="grid gap-3 sm:grid-cols-3">
          {TALENT_TYPES.map((t) => (
            <li key={t.type} className="rounded-lg border border-line bg-canvas/60 px-4 py-3">
              <p className="text-xl font-semibold text-navy-900">{active.filter((x) => x.type === t.type).length}</p>
              <p className="text-xs text-subtle">{t.label}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Portfolio">
        <Prose text={a.portfolio} empty="No portfolio shared yet." />
      </Section>
    </>
  );
}

/* -------------------------------- Business --------------------------------- */

export function BusinessSections({ business: b }: { business: BusinessProfile }) {
  const website = safeUrl(b.website);
  return (
    <Section title="Company details">
      <DetailList
        items={[
          { label: "Industry", value: b.industry },
          { label: "Business category", value: b.category },
          { label: "Headquarters", value: b.location },
          { label: "Company size", value: b.companySize ?? "Not specified" },
          {
            label: "Website",
            value: website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                {displayUrl(website)}
              </a>
            ) : (
              "Not provided"
            ),
          },
        ]}
      />
    </Section>
  );
}
