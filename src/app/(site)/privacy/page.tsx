import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/marketing/legal-document";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: PRIVACY.description,
};

export default function PrivacyPage() {
  return <LegalDocumentPage doc={PRIVACY} />;
}
