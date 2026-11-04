import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Eye, MapPin, Megaphone, Scale, ShieldCheck, Store } from "lucide-react";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CtaBand } from "@/components/marketing/cta-band";
import { SEGMENT_CONTENT } from "@/content/segments";

export const metadata: Metadata = {
  title: "About MarketIn",
  description:
    "MarketIn is a business growth and partnership marketplace connecting Indonesian businesses with sales partners, creators, affiliates and agencies.",
};

const SEGMENTS = [
  { key: "business", icon: Store, title: "Businesses", text: "Brands, manufacturers and service companies looking for new channels, regions and partners." },
  { key: "sales", icon: Briefcase, title: "Sales Partners", text: "Independent sales representatives, sales agents and distributors with networks to offer." },
  { key: "creator", icon: Megaphone, title: "Creators & Affiliates", text: "KOLs, UGC creators, product reviewers and affiliate marketers with audiences that trust them." },
  { key: "agency", icon: Building2, title: "Agencies", text: "Influencer, digital, KOL management, sales outsourcing and affiliate management agencies." },
] as const;

const VALUES = [
  { icon: Eye, title: "Transparency", text: "Compensation, requirements and deadlines belong on the listing, not hidden behind a chat." },
  { icon: Scale, title: "Fair access", text: "Independent sellers and smaller creators should be able to compete on their work and their network." },
  { icon: ShieldCheck, title: "Accountability", text: "Verification, reviews and reporting help both sides keep their word." },
  { icon: MapPin, title: "Built for Indonesia", text: "Local cities, channels and pricing in rupiah, designed around how partnerships work here." },
];

export default function AboutPage() {
  return (
    <>
      <InfoPage
        eyebrow="About"
        title="Where businesses meet growth opportunities"
        intro="MarketIn is a business growth and partnership marketplace. We help companies find the sales partners, distributors, creators, affiliates and agencies that can take them further, and help those partners find work worth doing."
      >
        <InfoSection id="mission" title="Our mission">
          <p>
            Growing a business in Indonesia often depends on who you know: a distributor in the next province, a sales agent
            with the right retail contacts, a creator whose audience trusts their recommendations. Finding these people is
            still largely done through referrals, group chats and spreadsheets.
          </p>
          <p>
            Our mission is to make those connections open and structured, so that any business can find the right growth
            partner, and any capable partner can be found, with clear terms on both sides.
          </p>
        </InfoSection>

        <InfoSection id="who" title="Who MarketIn is for" bare>
          <p className="text-[15px] leading-relaxed text-ink">MarketIn brings four groups together in one marketplace, each with its own account type and tools.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SEGMENTS.map(({ key, icon: Icon, title, text }) => (
              <Link
                key={key}
                href={SEGMENT_CONTENT[key].path}
                className="group rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy-200"
              >
                <Icon className="size-5 text-brand-600" />
                <p className="mt-3 flex items-center gap-1.5 text-[15px] font-semibold text-navy-900">
                  {title}
                  <ArrowRight className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-sm text-subtle">{text}</p>
              </Link>
            ))}
          </div>
        </InfoSection>

        <InfoSection id="values" title="What we value" bare>
          <ul>
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
                <Icon className="mt-0.5 size-5 shrink-0 text-navy-700" />
                <div>
                  <p className="font-semibold text-navy-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-subtle">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </InfoSection>

        <InfoSection id="today" title="Where we are today">
          <p>
            MarketIn is an early-stage platform and we are building it in the open with our first users. Some things are
            still manual: Pro plans are activated by our team rather than through online checkout, and social account
            verification is reviewed by hand. MarketIn does not hold or transfer payments between partners; those are
            agreed directly between the parties.
          </p>
          <p>
            If you have feedback or want to work with us, we would like to hear from you on our{" "}
            <Link href="/contact">contact page</Link> or through <Link href="/partnership">platform partnerships</Link>.
          </p>
        </InfoSection>
      </InfoPage>

      <CtaBand
        title="Find your next growth partner."
        description="Create a free account or see how MarketIn works for your business."
        primary={{ label: "Get started free", href: "/register" }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
        className="pt-0 sm:pt-0"
      />
    </>
  );
}
