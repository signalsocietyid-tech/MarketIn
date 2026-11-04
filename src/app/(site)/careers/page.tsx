import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CONTACT_EMAILS, mailto } from "@/content/contact";

export const metadata: Metadata = {
  title: "Careers",
  description: "MarketIn has no public openings right now. Learn how to send an open application to the team.",
};

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      title="Work on MarketIn"
      intro="We are a small team building a marketplace for business growth in Indonesia. We do not have any public openings at the moment, but we are always glad to hear from people who care about the problem."
    >
      <InfoSection id="openings" title="Current openings" bare>
        <div className="rounded-xl border border-dashed border-line-strong bg-white p-6 text-center">
          <p className="text-[15px] font-semibold text-navy-900">No open positions right now</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-subtle">
            When we open a role, it will be listed on this page first. In the meantime you are welcome to send an open
            application.
          </p>
        </div>
      </InfoSection>

      <InfoSection id="open-application" title="Sending an open application">
        <p>
          Email <a href={mailto("general", "Open application")}>{CONTACT_EMAILS.general}</a> with the subject line
          “Open application — [the area you work in]” and include:
        </p>
        <ul>
          <li>a short introduction and the kind of work you would like to do;</li>
          <li>a CV or LinkedIn profile, plus links to work you are proud of;</li>
          <li>what interests you about partnerships, sales distribution or the creator economy;</li>
          <li>where you are based and whether you prefer remote or on-site work.</li>
        </ul>
        <p>
          We read every application. We keep your details only as long as needed to consider you for a role, as
          described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoSection>

      <InfoSection
        id="how-we-work"
        title="How we like to work"
        actions={
          <Button asChild>
            <a href={mailto("general", "Open application")}>
              <Mail />
              Send an open application
            </a>
          </Button>
        }
      >
        <ul>
          <li><strong>Close to users.</strong> We talk to businesses, sales partners, creators and agencies regularly and build from what we hear.</li>
          <li><strong>Honest by default.</strong> We would rather say a feature is manual or not ready than overpromise.</li>
          <li><strong>Small and accountable.</strong> Everyone owns outcomes, not just tasks.</li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
