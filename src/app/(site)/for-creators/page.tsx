import type { Metadata } from "next";
import { SegmentLanding } from "@/components/marketing/segment-landing";
import { SEGMENT_CONTENT } from "@/content/segments";

const content = SEGMENT_CONTENT.creator;

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export default function ForCreatorsPage() {
  return <SegmentLanding segment="creator" />;
}
