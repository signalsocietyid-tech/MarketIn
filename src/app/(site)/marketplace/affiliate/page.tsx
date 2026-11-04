import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export const metadata: Metadata = {
  title: "Affiliate Marketing",
  description: "Discover affiliate programs and collaborate with brands through performance-based marketing.",
};

export default async function Page(props: PageProps<"/marketplace/affiliate">) {
  return <CategoryPage category="affiliate" searchParams={await props.searchParams} />;
}
