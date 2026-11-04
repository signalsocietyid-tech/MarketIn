import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/info-page";
import { PlannedTopics } from "@/components/marketing/planned-topics";

export const metadata: Metadata = {
  title: "Blog",
  description: "The MarketIn blog is coming soon, with practical guides on sales partnerships, distribution and creator collaborations.",
};

const TOPICS = [
  {
    title: "Writing an opportunity that attracts the right partners",
    description: "How to describe requirements, deliverables and compensation so qualified people apply.",
  },
  {
    title: "Choosing between commission, fixed fee and revenue sharing",
    description: "When each compensation model makes sense for businesses and for partners.",
  },
  {
    title: "Building a sales partner profile that gets shortlisted",
    description: "What businesses look for in an independent sales representative or distributor.",
  },
  {
    title: "A creator's guide to pitching brands",
    description: "Presenting your audience, niche and past work clearly and professionally.",
  },
  {
    title: "Running an agency roster on MarketIn",
    description: "Practical tips for agencies that manage talent and several client campaigns.",
  },
  {
    title: "Product updates",
    description: "Notes on new MarketIn features as they ship.",
  },
];

export default function BlogPage() {
  return (
    <InfoPage
      eyebrow="Blog"
      title="The MarketIn blog"
      intro="Practical guides for businesses, sales partners, creators and agencies who want partnerships that work."
    >
      <PlannedTopics
        note="We have not published any articles yet. The blog is coming soon; this page will list posts as they go live."
        topics={TOPICS}
      />
    </InfoPage>
  );
}
