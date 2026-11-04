import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/marketing/legal-document";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: TERMS.title,
  description: TERMS.description,
};

export default function TermsPage() {
  return <LegalDocumentPage doc={TERMS} />;
}
