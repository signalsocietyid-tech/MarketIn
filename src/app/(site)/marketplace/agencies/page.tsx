import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export const metadata: Metadata = {
  title: "Agency Partnerships",
  description: "Partner with agencies that run campaigns, manage creator rosters and supply sales teams.",
};

export default async function Page(props: PageProps<"/marketplace/agencies">) {
  return <CategoryPage category="agency" searchParams={await props.searchParams} />;
}
