import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FAQ_GROUPS } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions from businesses, sales partners, creators, affiliates and agencies using MarketIn.",
};

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro={
        <>
          Quick answers for every account type. For step-by-step guides, visit the{" "}
          <Link href="/help" className="font-medium text-brand-700 hover:underline">
            Help Center
          </Link>
          .
        </>
      }
      toc={FAQ_GROUPS.map((g) => ({ id: g.id, label: g.label }))}
    >
      {FAQ_GROUPS.map((group) => (
        <InfoSection key={group.id} id={group.id} title={group.label} bare>
          <FaqAccordion group={group} />
        </InfoSection>
      ))}
      <p className="mt-8 text-sm text-subtle">
        Didn’t find your answer?{" "}
        <Link href="/contact" className="font-medium text-brand-700 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </InfoPage>
  );
}
