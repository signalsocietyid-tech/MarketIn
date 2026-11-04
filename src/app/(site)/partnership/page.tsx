import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, GraduationCap, Landmark, Lightbulb, Mail, Plug, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CONTACT_EMAILS, mailto } from "@/content/contact";

export const metadata: Metadata = {
  title: "Platform Partnerships",
  description:
    "Partner with MarketIn as an industry association, incubator, payment, logistics, education or technology provider.",
};

const PARTNER_TYPES = [
  {
    icon: Landmark,
    title: "Industry associations & chambers",
    text: "Help your members find sales partners, distributors and creators, and share programmes with them.",
  },
  {
    icon: Lightbulb,
    title: "Incubators & accelerators",
    text: "Give the startups and SMEs in your cohorts a structured way to build their first partner channels.",
  },
  {
    icon: CreditCard,
    title: "Payment & financial services",
    text: "Explore how commissions, fees and subscriptions could be handled safely as MarketIn adds online payments.",
  },
  {
    icon: Truck,
    title: "Logistics & fulfilment",
    text: "Support distributors and resellers who need warehousing, delivery or stock management in new regions.",
  },
  {
    icon: GraduationCap,
    title: "Education & training",
    text: "Offer sales, marketing or creator training to the partners who use MarketIn.",
  },
  {
    icon: Plug,
    title: "Technology & integrations",
    text: "Connect CRM, social, affiliate tracking or e-commerce tools that our users already rely on.",
  },
];

export default function PartnershipPage() {
  return (
    <InfoPage
      eyebrow="Partnership"
      title="Grow the ecosystem with us"
      intro="We work with organisations that support Indonesian businesses and the people who help them grow. If your organisation could make partnerships easier, faster or safer for our users, let's talk."
    >
      <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-4 text-sm leading-relaxed text-navy-800">
        This page is about strategic partnerships with MarketIn itself. If you are a business looking for sales partners,
        creators or agencies, start on{" "}
        <Link href="/for-business" className="font-medium text-brand-700 hover:underline">
          MarketIn for Business
        </Link>{" "}
        instead.
      </div>

      <InfoSection id="types" title="Who we partner with" bare className="mt-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {PARTNER_TYPES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-line bg-white p-5 shadow-card">
              <Icon className="size-5 text-brand-600" />
              <p className="mt-3 text-[15px] font-semibold text-navy-900">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-subtle">{text}</p>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection
        id="how"
        title="How to start a conversation"
        actions={
          <Button asChild>
            <a href={mailto("partnership", "Platform partnership")}>
              <Mail />
              Email the partnerships team
            </a>
          </Button>
        }
      >
        <p>
          Email <a href={mailto("partnership", "Platform partnership")}>{CONTACT_EMAILS.partnership}</a> with:
        </p>
        <ul>
          <li>your organisation’s name, website and the people or businesses you serve;</li>
          <li>the kind of partnership you have in mind and what it would mean for MarketIn users;</li>
          <li>a contact person and the best way to reach them.</li>
        </ul>
        <p>We review every proposal and will reply if there is a good fit to explore further.</p>
      </InfoSection>
    </InfoPage>
  );
}
