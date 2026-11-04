import Link from "next/link";
import { ArrowRight, Check, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { ProfileCard } from "@/components/marketplace/profile-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PlanTeaser } from "@/components/marketing/plan-teaser";
import { StepFlow } from "@/components/marketing/step-flow";
import { AGENCY_ACCOUNT_MODEL, SEGMENT_CONTENT, type SegmentContent } from "@/content/segments";
import { FAQ_GROUPS } from "@/content/faq";
import { getCurrentUser } from "@/lib/auth/session";
import { getSaved, searchOpportunities, searchPartners, type ProfileView } from "@/lib/data/queries";
import type { Segment } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Landing page for one audience segment. Content lives in src/content/segments.ts. */
export async function SegmentLanding({ segment }: { segment: Segment }) {
  const content = SEGMENT_CONTENT[segment];
  const isAgency = content.layout === "agency";

  return (
    <>
      {isAgency ? <AgencyHero content={content} /> : <StandardHero content={content} />}
      {isAgency && <AccountModel />}
      <NeedsSection content={content} />
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title={content.steps.title} description={content.steps.description} />
          <StepFlow steps={content.steps.items} className="mt-12" />
        </div>
      </section>
      <LivePreview content={content} />
      <PlanTeaser segment={segment} title={content.plans.title} description={content.plans.description} />
      <FaqSection content={content} />
      <CtaBand
        title={content.closing.title}
        description={content.closing.description}
        primary={content.primaryCta}
        secondary={content.closing.secondary}
      />
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium",
        dark ? "border-white/15 bg-white/5 text-navy-100" : "border-line bg-white text-navy-800 shadow-xs",
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
      {children}
    </p>
  );
}

function TrustPoints({ points, dark }: { points: string[]; dark?: boolean }) {
  return (
    <ul className="mt-8 flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:flex-wrap">
      {points.map((p) => (
        <li key={p} className={cn("flex items-center gap-2 text-sm", dark ? "text-navy-100" : "text-subtle")}>
          <Check className={cn("size-4 shrink-0", dark ? "text-brand-400" : "text-brand-600")} />
          {p}
        </li>
      ))}
    </ul>
  );
}

function HeroPanel({ content }: { content: SegmentContent }) {
  const { heroPanel } = content;
  return (
    <Card className="overflow-hidden shadow-lift">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[15px] font-semibold text-navy-900">{heroPanel.title}</p>
        <p className="mt-0.5 text-[13px] text-subtle">{heroPanel.description}</p>
      </div>
      <ul className="divide-y divide-line">
        {heroPanel.items.map(({ icon: Icon, label, detail }) => (
          <li key={label} className="flex items-start gap-3 px-5 py-3.5">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{label}</p>
              <p className="text-[13px] text-subtle">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StandardHero({ content }: { content: SegmentContent }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="container-page relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h1 className="mt-5 text-[34px] font-bold leading-[1.1] text-navy-900 sm:text-[44px] lg:text-[50px]">
            {content.headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-subtle sm:text-lg">{content.subheadline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={content.primaryCta.href}>
                {content.primaryCta.label}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>
          <TrustPoints points={content.trustPoints} />
        </div>
        <HeroPanel content={content} />
      </div>
    </section>
  );
}

function AgencyHero({ content }: { content: SegmentContent }) {
  const [root, ...branches] = content.heroPanel.items;
  const RootIcon = root.icon;
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:linear-gradient(to_left,black,transparent_75%)]" />
      <div className="container-page relative grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div>
          <Eyebrow dark>{content.eyebrow}</Eyebrow>
          <h1 className="mt-5 text-[34px] font-bold leading-[1.1] text-white sm:text-[44px] lg:text-[48px]">{content.headline}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">{content.subheadline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={content.primaryCta.href}>
                {content.primaryCta.label}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>
          <TrustPoints points={content.trustPoints} dark />
        </div>

        {/* Account structure schematic: the agency at the root, everything it manages beneath. */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <p className="px-1 text-[13px] font-medium text-navy-200">{content.heroPanel.title}</p>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lift">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <RootIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">{root.label}</p>
              <p className="text-[13px] text-subtle">{root.detail}</p>
            </div>
          </div>
          <ul className="relative ml-5 mt-2 space-y-2 border-l border-white/15 pl-5 pt-2">
            {branches.map(({ icon: Icon, label, detail }) => (
              <li key={label} className="relative">
                <span aria-hidden className="absolute -left-5 top-1/2 h-px w-5 bg-white/15" />
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-navy-800/60 px-3.5 py-3">
                  <Icon className="size-4 shrink-0 text-brand-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-[13px] text-navy-200">{detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Account model ------------------------------ */

function AccountModel() {
  const m = AGENCY_ACCOUNT_MODEL;
  return (
    <section className="border-b border-line bg-white py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <SectionHeading align="left" eyebrow="Account type" title={m.title} description={m.description} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { ...m.individual, highlight: false },
            { ...m.agency, highlight: true },
          ].map((col) => (
            <div
              key={col.label}
              className={cn(
                "rounded-xl border p-5",
                col.highlight ? "border-navy-200 bg-navy-50/60" : "border-line bg-canvas/60",
              )}
            >
              <p className="text-[15px] font-semibold text-navy-900">{col.label}</p>
              <p className="text-[13px] text-subtle">{col.caption}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink">
                {col.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <Check className={cn("mt-0.5 size-4 shrink-0", col.highlight ? "text-brand-600" : "text-muted")} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Needs ---------------------------------- */

function NeedsSection({ content }: { content: SegmentContent }) {
  const { needs } = content;
  const agency = content.layout === "agency";
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          align={agency ? "left" : "center"}
          eyebrow={needs.eyebrow}
          title={needs.title}
          description={needs.description}
        />
        {agency ? (
          // Agency: a divided feature matrix instead of individual cards.
          <div className="mt-12 grid overflow-hidden rounded-xl border border-line bg-line shadow-card gap-px sm:grid-cols-2 lg:grid-cols-3">
            {needs.items.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white p-6">
                <Icon className="size-5 text-brand-600" />
                <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "mt-12 grid gap-4 sm:grid-cols-2",
              needs.items.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            {needs.items.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-[18px]" />
                </span>
                <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------- Live preview ------------------------------ */

type PreviewOpportunity = Awaited<ReturnType<typeof searchOpportunities>>[number];
type PreviewData = { opportunities: PreviewOpportunity[]; profiles: ProfileView[] };

async function loadPreview(segment: Segment): Promise<PreviewData> {
  switch (segment) {
    case "business": {
      const [sales, creators, agencies] = await Promise.all([
        searchPartners("sales", {}),
        searchPartners("creator", {}),
        searchPartners("agency", {}),
      ]);
      // One of each partner type first, then fill up to three from what remains.
      const firsts = [sales[0], creators[0], agencies[0]].filter((p): p is ProfileView => !!p);
      const rest = [...sales.slice(1), ...creators.slice(1), ...agencies.slice(1)];
      return { opportunities: [], profiles: [...firsts, ...rest].slice(0, 3) };
    }
    case "sales": {
      const opportunities = await searchOpportunities({ category: "sales" });
      return { opportunities: opportunities.slice(0, 3), profiles: [] };
    }
    case "creator": {
      const [affiliate, kol] = await Promise.all([
        searchOpportunities({ category: "affiliate" }),
        searchOpportunities({ category: "kol" }),
      ]);
      // Interleave the two categories so both are represented.
      const mixed: PreviewOpportunity[] = [];
      for (let i = 0; i < Math.max(affiliate.length, kol.length) && mixed.length < 3; i++) {
        if (affiliate[i]) mixed.push(affiliate[i]);
        if (kol[i] && mixed.length < 3) mixed.push(kol[i]);
      }
      return { opportunities: mixed, profiles: [] };
    }
    case "agency": {
      const [opportunities, profiles] = await Promise.all([
        searchOpportunities({ category: "agency" }),
        searchPartners("agency", {}),
      ]);
      return { opportunities: opportunities.slice(0, 3), profiles: profiles.slice(0, 3) };
    }
  }
}

async function LivePreview({ content }: { content: SegmentContent }) {
  const [data, user] = await Promise.all([loadPreview(content.segment), getCurrentUser()]);
  const saved = user ? await getSaved(user.id) : [];
  const savedOpps = new Set(saved.filter((s) => s.targetType === "opportunity").map((s) => s.targetId));
  const savedProfiles = new Set(saved.filter((s) => s.targetType === "profile").map((s) => s.targetId));
  const signedIn = !!user;
  const { preview } = content;
  const isEmpty = data.opportunities.length === 0 && data.profiles.length === 0;
  const splitGroups = data.opportunities.length > 0 && data.profiles.length > 0;

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading align="left" eyebrow={preview.eyebrow} title={preview.title} description={preview.description} />
          <div className="flex flex-wrap gap-2">
            {preview.links.map((l) => (
              <Button key={l.href} asChild variant="secondary" size="sm">
                <Link href={l.href}>
                  {l.label}
                  <ArrowRight />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {isEmpty ? (
          <Card className="mt-10">
            <EmptyState
              icon={SearchX}
              title="Nothing to preview yet"
              description="New listings and profiles appear here as soon as they are published."
              action={
                <Button asChild variant="secondary" size="sm">
                  <Link href="/marketplace">Explore the marketplace</Link>
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="mt-10 space-y-10">
            {data.opportunities.length > 0 && (
              <div>
                {splitGroups && <h3 className="mb-4 font-sans text-sm font-semibold tracking-normal text-subtle">Open opportunities</h3>}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.opportunities.map((o) => (
                    <OpportunityCard key={o.id} opportunity={o} signedIn={signedIn} saved={savedOpps.has(o.id)} locked={o.locked} />
                  ))}
                </div>
              </div>
            )}
            {data.profiles.length > 0 && (
              <div>
                {splitGroups && <h3 className="mb-4 font-sans text-sm font-semibold tracking-normal text-subtle">Agencies on MarketIn</h3>}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.profiles.map((p) => (
                    <ProfileCard key={p.id} profile={p} signedIn={signedIn} saved={savedProfiles.has(p.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

function FaqSection({ content }: { content: SegmentContent }) {
  const group = FAQ_GROUPS.find((g) => g.id === content.faqGroupId);
  if (!group) return null;
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <SectionHeading align="left" eyebrow="FAQ" title="Common questions" description={`Answers for ${group.label.replace(/^For /, "").toLowerCase()}.`} />
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <Link href={`/faq#${group.id}`} className="text-brand-700 hover:underline">
              All FAQs
            </Link>
            <Link href="/help" className="text-brand-700 hover:underline">
              Help Center
            </Link>
            <Link href="/contact" className="text-brand-700 hover:underline">
              Contact us
            </Link>
          </div>
        </div>
        <FaqAccordion group={group} />
      </div>
    </section>
  );
}
