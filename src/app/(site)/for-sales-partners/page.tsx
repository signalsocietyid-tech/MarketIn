import type { Metadata } from "next";
import { SegmentLanding } from "@/components/marketing/segment-landing";
import { SEGMENT_CONTENT } from "@/content/segments";

const content = SEGMENT_CONTENT.sales;

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export default function ForSalesPartnersPage() {
  return <SegmentLanding segment="sales" />;
}
