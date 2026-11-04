import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/marketing/legal-document";
import { COOKIES } from "@/content/legal";

export const metadata: Metadata = {
  title: COOKIES.title,
  description: COOKIES.description,
};

export default function CookiesPage() {
  return <LegalDocumentPage doc={COOKIES} />;
}
