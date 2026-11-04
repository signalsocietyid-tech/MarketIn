import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export const metadata: Metadata = {
  title: "Sales & Distribution",
  description: "Connect with businesses looking for sales representatives, agents, and distributors across different regions.",
};

export default async function Page(props: PageProps<"/marketplace/sales">) {
  return <CategoryPage category="sales" searchParams={await props.searchParams} />;
}
