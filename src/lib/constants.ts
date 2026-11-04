import type {
  ApplicationStatus,
  FeatureKey,
  CompensationModel,
  MarketCategory,
  OpportunityType,
  Role,
  Segment,
  SocialPlatform,
} from "./types";

export const SEGMENT_LABEL: Record<Role, string> = {
  business: "Business",
  sales: "Sales Partner",
  creator: "Creator & Affiliate",
  agency: "Agency",
  admin: "Administrator",
};

export const SEGMENTS: Segment[] = ["business", "sales", "creator", "agency"];

export const CATEGORY_META: Record<MarketCategory, { label: string; short: string; href: string }> = {
  sales: { label: "Sales & Distribution", short: "Sales", href: "/marketplace/sales" },
  affiliate: { label: "Affiliate Marketing", short: "Affiliate", href: "/marketplace/affiliate" },
  kol: { label: "KOL & Creator Collaboration", short: "KOL & Creator", href: "/marketplace/kol" },
  agency: { label: "Agency Partnerships", short: "Agency", href: "/marketplace/agencies" },
};

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  sales_representative: "Sales Representative",
  distributor_partnership: "Distributor Partnership",
  sales_agent: "Sales Agent",
  b2b_sales_outsourcing: "B2B Sales Outsourcing",
  affiliate_campaign: "Affiliate Campaign",
  reseller_partnership: "Reseller Partnership",
  kol_campaign: "KOL Campaign",
  ugc_collaboration: "UGC Collaboration",
  product_review: "Product Review",
  agency_partnership: "Agency Partnership",
};

export const OPPORTUNITY_TYPE_CATEGORY: Record<OpportunityType, MarketCategory> = {
  sales_representative: "sales",
  distributor_partnership: "sales",
  sales_agent: "sales",
  b2b_sales_outsourcing: "sales",
  affiliate_campaign: "affiliate",
  reseller_partnership: "affiliate",
  kol_campaign: "kol",
  ugc_collaboration: "kol",
  product_review: "kol",
  agency_partnership: "agency",
};

export const COMPENSATION_LABEL: Record<CompensationModel, string> = {
  fixed_fee: "Fixed fee",
  commission: "Commission-based",
  fixed_plus_commission: "Fixed fee + commission",
  revenue_sharing: "Revenue sharing",
  negotiable: "Negotiable",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "pending",
  "under_review",
  "shortlisted",
  "accepted",
  "rejected",
  "completed",
];

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

export const PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "youtube", "x", "linkedin", "facebook"];

export const INDUSTRIES = [
  "Food & Beverage",
  "Beauty & Personal Care",
  "Fashion & Apparel",
  "Consumer Electronics",
  "FMCG",
  "Agriculture",
  "Health & Wellness",
  "Home & Living",
  "Software & SaaS",
  "Financial Services",
  "Logistics",
  "Education",
  "Manufacturing",
  "Automotive",
  "Property",
];

export const NICHES = [
  "Beauty",
  "Fashion",
  "Food & Culinary",
  "Tech & Gadgets",
  "Parenting",
  "Fitness",
  "Travel",
  "Lifestyle",
  "Finance",
  "Gaming",
  "Education",
  "Home & Decor",
  "Automotive",
  "Health",
];

export const LOCATIONS = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Semarang",
  "Makassar",
  "Yogyakarta",
  "Denpasar",
  "Palembang",
  "Balikpapan",
  "Malang",
  "Pekanbaru",
];

export const SALES_PARTNERSHIP_TYPES = [
  "Independent sales representative",
  "Regional distributor",
  "Sales agent",
  "B2B sales outsourcing",
  "Reseller",
];

export const SALES_SPECIALIZATIONS = [
  "B2B / corporate",
  "Retail & modern trade",
  "General trade",
  "Horeca",
  "E-commerce",
  "Key accounts",
];

export const CREATOR_TYPES = [
  "Affiliate Marketer",
  "Influencer / KOL",
  "Micro-KOL",
  "Nano-KOL",
  "UGC Creator",
  "Product Reviewer",
  "Social Media Publisher",
];

export const COLLABORATION_TYPES = [
  "Paid post",
  "Affiliate commission",
  "UGC production",
  "Product review",
  "Live selling",
  "Brand ambassador",
];

export const AGENCY_CATEGORIES = [
  "Influencer Marketing Agency",
  "Digital Marketing Agency",
  "KOL Management Agency",
  "Sales Outsourcing Agency",
  "Business Development Agency",
  "Affiliate Management Agency",
];

export const AGENCY_SERVICES = [
  "KOL sourcing & management",
  "Campaign strategy",
  "Content production",
  "Sales force outsourcing",
  "Distributor network development",
  "Affiliate program management",
  "Performance marketing",
  "Market expansion research",
];

export const TEAM_SIZES = ["1–5", "6–15", "16–50", "51–200", "200+"];

export const AUDIENCE_SIZES = [
  { value: "nano", label: "Nano (1K–10K)", min: 1_000, max: 10_000 },
  { value: "micro", label: "Micro (10K–100K)", min: 10_000, max: 100_000 },
  { value: "mid", label: "Mid-tier (100K–500K)", min: 100_000, max: 500_000 },
  { value: "macro", label: "Macro (500K+)", min: 500_000, max: Number.MAX_SAFE_INTEGER },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "any", label: "Any experience" },
  { value: "junior", label: "0–2 years" },
  { value: "mid", label: "3–5 years" },
  { value: "senior", label: "6+ years" },
] as const;

export const BUDGET_RANGES = [
  { value: "lt5", label: "Under Rp5 jt", min: 0, max: 5_000_000 },
  { value: "5to20", label: "Rp5–20 jt", min: 5_000_000, max: 20_000_000 },
  { value: "20to50", label: "Rp20–50 jt", min: 20_000_000, max: 50_000_000 },
  { value: "gt50", label: "Above Rp50 jt", min: 50_000_000, max: Number.MAX_SAFE_INTEGER },
] as const;


export const FEATURE_LABEL: Record<FeatureKey, string> = {
  advanced_search: "Advanced partner search",
  advanced_filters: "Advanced filters",
  priority_visibility: "Priority visibility",
  partnership_dashboard: "Partnership dashboard",
  analytics: "Performance analytics",
  premium_opportunities: "Premium opportunities",
  verified_badge: "Verified / premium badge eligibility",
  team_members: "Multiple team members",
  priority_access: "Priority opportunity access",
};
