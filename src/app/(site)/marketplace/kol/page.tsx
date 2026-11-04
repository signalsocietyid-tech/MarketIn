import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export const metadata: Metadata = {
  title: "KOL & Creator Collaboration",
  description: "Find brands, paid campaigns, and content collaboration opportunities.",
};

export default async function Page(props: PageProps<"/marketplace/kol">) {
  return <CategoryPage category="kol" searchParams={await props.searchParams} />;
}
