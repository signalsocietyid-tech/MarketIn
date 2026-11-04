// Declarative filter definitions consumed by <SearchFilters />.

import {
  AGENCY_CATEGORIES,
  AGENCY_SERVICES,
  AUDIENCE_SIZES,
  BUDGET_RANGES,
  COMPENSATION_LABEL,
  CREATOR_TYPES,
  EXPERIENCE_LEVELS,
  OPPORTUNITY_TYPE_CATEGORY,
  OPPORTUNITY_TYPE_LABEL,
  PLATFORMS,
  PLATFORM_LABEL,
  SALES_PARTNERSHIP_TYPES,
  SALES_SPECIALIZATIONS,
} from "@/lib/constants";
import type { CompensationModel, MarketCategory, OpportunityType } from "@/lib/types";
import { ENGAGEMENT_OPTIONS, type PartnerKind } from "./filter-params";

export type Option = { value: string; label: string };

export type FilterField =
  | { key: string; label: string; control: "select"; options: Option[]; emptyLabel: string; advanced: boolean }
  | { key: string; label: string; control: "toggle"; advanced: boolean };

export type Taxonomies = { industries: string[]; niches: string[]; locations: string[] };

const toOptions = (list: readonly string[]): Option[] => list.map((v) => ({ value: v, label: v }));

const platformOptions = PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABEL[p] }));
const experienceOptions = EXPERIENCE_LEVELS.filter((e) => e.value !== "any").map((e) => ({ value: e.value, label: e.label }));

function select(key: string, label: string, options: Option[], emptyLabel: string, advanced = false): FilterField {
  return { key, label, control: "select", options, emptyLabel, advanced };
}

function toggle(key: string, label: string): FilterField {
  return { key, label, control: "toggle", advanced: true };
}

export function opportunityFields(category: MarketCategory | undefined, t: Taxonomies): FilterField[] {
  const types = (Object.keys(OPPORTUNITY_TYPE_LABEL) as OpportunityType[]).filter(
    (type) => !category || OPPORTUNITY_TYPE_CATEGORY[type] === category,
  );
  const fields: FilterField[] = [];
  if (types.length > 1) {
    fields.push(select("type", "Opportunity type", types.map((v) => ({ value: v, label: OPPORTUNITY_TYPE_LABEL[v] })), "All types"));
  }
  fields.push(
    select("industry", "Industry", toOptions(t.industries), "All industries"),
    select("location", "Location", toOptions(t.locations), "All locations"),
    select(
      "compensation",
      "Compensation",
      (Object.keys(COMPENSATION_LABEL) as CompensationModel[]).map((v) => ({ value: v, label: COMPENSATION_LABEL[v] })),
      "Any model",
    ),
  );
  if (!category || category === "kol" || category === "affiliate") {
    fields.push(select("platform", "Platform", platformOptions, "Any platform"));
  }
  fields.push(
    select("budget", "Budget", BUDGET_RANGES.map((b) => ({ value: b.value, label: b.label })), "Any budget", true),
    select("experience", "Experience", experienceOptions, "Any experience", true),
    toggle("verified", "Verified businesses only"),
    toggle("remote", "Remote-friendly only"),
  );
  return fields;
}

export function partnerFields(kind: PartnerKind, t: Taxonomies): FilterField[] {
  if (kind === "sales") {
    return [
      select("industry", "Industry", toOptions(t.industries), "All industries"),
      select("location", "Location / coverage", toOptions(t.locations), "All areas"),
      select("experience", "Experience", experienceOptions, "Any experience", true),
      select("specialization", "Specialization", toOptions(SALES_SPECIALIZATIONS), "Any specialization", true),
      select("partnershipType", "Partnership type", toOptions(SALES_PARTNERSHIP_TYPES), "Any partnership type", true),
      toggle("verified", "Verified partners only"),
    ];
  }
  if (kind === "creator") {
    return [
      select("platform", "Platform", platformOptions, "Any platform"),
      select("niche", "Content niche", toOptions(t.niches), "All niches"),
      select("location", "Location", toOptions(t.locations), "All locations"),
      select("audience", "Audience size", AUDIENCE_SIZES.map((a) => ({ value: a.value, label: a.label })), "Any audience size", true),
      select("engagement", "Minimum engagement", ENGAGEMENT_OPTIONS.map((e) => ({ ...e })), "Any engagement", true),
      select("creatorType", "Creator type", toOptions(CREATOR_TYPES), "Any creator type", true),
      toggle("verified", "Verified creators only"),
    ];
  }
  return [
    select("agencyCategory", "Agency category", toOptions(AGENCY_CATEGORIES), "All categories"),
    select("location", "Location", toOptions(t.locations), "All locations"),
    select("service", "Service", toOptions(AGENCY_SERVICES), "Any service", true),
    toggle("verified", "Verified agencies only"),
  ];
}
