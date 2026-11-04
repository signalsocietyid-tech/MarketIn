import { PageHeader } from "@/components/layout/page-header";
import { CategoryList } from "@/components/admin/category-manager";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { flatParams, oneOf } from "@/components/admin/search-params";
import { getAdminCategories } from "@/lib/data/admin-queries";
import type { CategoryKind } from "@/lib/types";

export const metadata = { title: "Categories" };

const KINDS: CategoryKind[] = ["industry", "niche", "location"];
const KIND_LABEL: Record<CategoryKind, string> = { industry: "Industry", niche: "Niche", location: "Location" };
const KIND_HINT: Record<CategoryKind, string> = {
  industry: "Used for business profiles, sales partner industries and opportunity filters.",
  niche: "Used for creator and affiliate niches in profiles and partner search.",
  location: "Used for profile locations, sales coverage areas and opportunity filters.",
};

export default async function AdminCategoriesPage(props: PageProps<"/admin/categories">) {
  const sp = await props.searchParams;
  const kind = oneOf(sp, "kind", KINDS) ?? "industry";
  const params = flatParams(sp);
  const { rows, counts } = await getAdminCategories(kind);

  return (
    <>
      <PageHeader title="Categories" description="Manage the taxonomies used across marketplace filters and profile forms." />

      <FilterTabs
        className="mb-2"
        pathname="/admin/categories"
        param="kind"
        current={kind === "industry" ? undefined : kind}
        params={params}
        tabs={KINDS.map((k) => ({ value: k === "industry" ? undefined : k, label: `${KIND_LABEL[k]}`, count: counts[k] }))}
      />
      <p className="mb-4 text-[13px] text-subtle">{KIND_HINT[kind]}</p>

      <CategoryList key={kind} kind={kind} kindLabel={KIND_LABEL[kind]} rows={rows} />
    </>
  );
}
