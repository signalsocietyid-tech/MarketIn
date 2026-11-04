import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Flag, Handshake, LifeBuoy, Mail } from "lucide-react";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CONTACT_EMAILS, mailto } from "@/content/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the MarketIn team for general enquiries, platform partnerships or account support.",
};

// Addresses come from src/content/contact.ts — they are placeholders to confirm before launch.
const CHANNELS = [
  {
    icon: Mail,
    title: "General enquiries",
    text: "Questions about MarketIn, press and feedback.",
    email: CONTACT_EMAILS.general,
    href: mailto("general", "General enquiry"),
  },
  {
    icon: Handshake,
    title: "Platform partnerships",
    text: "Associations, incubators, payment, logistics and technology partners.",
    email: CONTACT_EMAILS.partnership,
    href: mailto("partnership", "Partnership enquiry"),
  },
  {
    icon: LifeBuoy,
    title: "Account support",
    text: "Help with your account, subscription or a listing.",
    email: CONTACT_EMAILS.support,
    href: mailto("support", "Support request"),
  },
];

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Talk to the MarketIn team"
      intro="Choose the channel that fits your question and email us directly. Including your account email and account type helps us answer faster."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {CHANNELS.map(({ icon: Icon, title, text, email, href }) => (
          <a
            key={email}
            href={href}
            className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy-200"
          >
            <Icon className="size-5 text-brand-600" />
            <p className="mt-3 text-[15px] font-semibold text-navy-900">{title}</p>
            <p className="mt-1 text-sm text-subtle">{text}</p>
            <p className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-brand-700 group-hover:underline">
              <span className="truncate">{email}</span>
              <ArrowUpRight className="size-3.5 shrink-0" />
            </p>
          </a>
        ))}
      </div>

      <div className="mt-10">
        <InfoSection id="before" title="Before you write">
          <p>
            Many questions are already answered in the <Link href="/help">Help Center</Link> and the{" "}
            <Link href="/faq">FAQ</Link>. If you are looking for partners or work, the{" "}
            <Link href="/marketplace">marketplace</Link> is the quickest place to start.
          </p>
        </InfoSection>
        <InfoSection id="report" title="Reporting a listing or profile" bare>
          <div className="flex gap-3 rounded-xl border border-line bg-white p-4 text-[15px] leading-relaxed text-ink">
            <Flag className="mt-1 size-4 shrink-0 text-danger-500" />
            <p>
              If something on MarketIn looks misleading or unsafe, use the report option on the listing or profile while
              signed in, so our team receives the details directly. For urgent concerns you can also email{" "}
              <a href={mailto("support", "Urgent report")} className="font-medium text-brand-700 hover:underline">
                {CONTACT_EMAILS.support}
              </a>
              .
            </p>
          </div>
        </InfoSection>
      </div>
    </InfoPage>
  );
}
