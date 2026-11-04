import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/info-page";
import { PlannedTopics } from "@/components/marketing/planned-topics";

export const metadata: Metadata = {
  title: "Business Insights",
  description: "MarketIn Business Insights is coming soon: perspectives on regional expansion, partner channels and the creator economy in Indonesia.",
};

const TOPICS = [
  {
    title: "Expanding into new regions through distributors",
    description: "What to plan for when you enter a new city or province with local partners.",
  },
  {
    title: "Indirect sales channels for SMEs",
    description: "How independent sales agents and resellers can complement an in-house team.",
  },
  {
    title: "Affiliate programmes beyond e-commerce",
    description: "Structuring commission-based partnerships for services, B2B products and offline retail.",
  },
  {
    title: "Working with micro and nano KOLs",
    description: "Briefing, measuring and scaling campaigns with smaller creators.",
  },
  {
    title: "When to bring in an agency",
    description: "Comparing agency partnerships with managing partners directly.",
  },
  {
    title: "Measuring partnership performance",
    description: "Choosing the leads, conversions, reach and revenue metrics that matter for each channel.",
  },
];

export default function InsightsPage() {
  return (
    <InfoPage
      eyebrow="Business Insights"
      title="Business Insights"
      intro="Perspectives on partner-led growth in Indonesia, from regional distribution to the creator economy."
    >
      <PlannedTopics
        note="Business Insights is coming soon. Nothing has been published yet; we will share our first pieces here."
        topics={TOPICS}
      />
    </InfoPage>
  );
}
