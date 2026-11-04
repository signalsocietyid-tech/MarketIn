// Core domain types for MarketIn. These mirror the Postgres schema in
// supabase/migrations/20261104103217_init.sql (and later migrations).

export type Segment = "business" | "sales" | "creator" | "agency";
export type Role = Segment | "admin";

export type AccountStatus = "active" | "suspended" | "flagged";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  status: AccountStatus;
  verification: VerificationStatus;
  createdAt: string;
  lastActiveAt: string;
}

export interface BusinessProfile {
  userId: string;
  companyName: string;
  businessEmail: string;
  industry: string;
  category: string;
  location: string;
  website?: string;
  description: string;
  logoUrl?: string;
  companySize?: string;
}

export interface SalesProfile {
  userId: string;
  fullName: string;
  title: string;
  location: string;
  industries: string[];
  experienceYears: number;
  partnershipTypes: string[];
  areas: string[];
  specializations: string[];
  portfolio: string;
  bio: string;
}

export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "x" | "linkedin" | "facebook";

export interface SocialAccount {
  platform: SocialPlatform;
  handle: string;
  url: string;
  followers: number;
}

export interface CreatorProfile {
  userId: string;
  fullName: string;
  creatorTypes: string[]; // e.g. Affiliate Marketer, KOL, UGC Creator
  socials: SocialAccount[];
  engagementRate?: number;
  niches: string[];
  location: string;
  portfolio: string;
  collaborationTypes: string[];
  bio: string;
}

export interface AgencyProfile {
  userId: string;
  agencyName: string;
  category: string;
  website?: string;
  location: string;
  description: string;
  services: string[];
  teamSize: string;
  portfolio: string;
}

export type TalentType = "sales" | "creator" | "affiliate";

export interface Talent {
  id: string;
  agencyId: string;
  name: string;
  type: TalentType;
  specialty: string;
  location: string;
  followers?: number;
  status: "available" | "on_project" | "inactive";
  addedAt: string;
}

export interface TeamMember {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "member";
  invitedAt: string;
  status: "active" | "invited";
}

export type MarketCategory = "sales" | "affiliate" | "kol" | "agency";

export type OpportunityType =
  | "sales_representative"
  | "distributor_partnership"
  | "sales_agent"
  | "b2b_sales_outsourcing"
  | "affiliate_campaign"
  | "reseller_partnership"
  | "kol_campaign"
  | "ugc_collaboration"
  | "product_review"
  | "agency_partnership";

export type CompensationModel =
  | "fixed_fee"
  | "commission"
  | "fixed_plus_commission"
  | "revenue_sharing"
  | "negotiable";

export type OpportunityStatus = "open" | "paused" | "closed";

export interface Opportunity {
  id: string;
  businessId: string;
  title: string;
  companyName: string;
  type: OpportunityType;
  category: MarketCategory;
  industry: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string[];
  deliverables: string[];
  compensationModel: CompensationModel;
  compensationDetail: string; // human readable, e.g. "8–12% per closed deal"
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel: "any" | "junior" | "mid" | "senior";
  platforms?: SocialPlatform[];
  deadline: string;
  duration: string;
  status: OpportunityStatus;
  premium: boolean;
  featured: boolean;
  flagged: boolean;
  views: number;
  createdAt: string;
}

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "completed";

export interface Application {
  id: string;
  opportunityId: string;
  applicantId: string;
  talentId?: string; // when an agency applies on behalf of a talent
  message: string;
  proposedRate?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipMetrics {
  leads: number;
  conversions: number;
  revenue: number;
  contentPieces: number;
  reach: number;
}

export interface Partnership {
  id: string;
  opportunityId: string;
  applicationId: string;
  businessId: string;
  partnerId: string;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  metrics: PartnershipMetrics;
}

export type FeatureKey =
  | "advanced_search"
  | "advanced_filters"
  | "priority_visibility"
  | "partnership_dashboard"
  | "analytics"
  | "premium_opportunities"
  | "verified_badge"
  | "team_members"
  | "priority_access";

export interface PlanLimits {
  activeOpportunities: number; // business
  monthlyApplications: number; // sales, creator, agency
  talentRoster: number; // agency
  teamMembers: number; // agency
  savedItems: number;
}

export interface SubscriptionPlan {
  id: string;
  segment: Segment;
  tier: "free" | "pro";
  name: string;
  tagline: string;
  priceMonthly: number; // IDR
  priceYearly: number; // IDR, total per year
  benefits: string[];
  entitlements: FeatureKey[];
  limits: PlanLimits;
  recommended: boolean;
  active: boolean;
  sortOrder: number;
}

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "pending_payment" | "canceled" | "expired";

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentReference?: string;
  createdAt: string;
}

export interface SubscriptionEvent {
  id: string;
  userId: string;
  planId: string;
  action: "started" | "upgrade_requested" | "activated" | "downgraded" | "canceled" | "resumed";
  billingCycle: BillingCycle;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  partnershipId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "user" | "opportunity";
  targetId: string;
  reason: string;
  details?: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
}

export type CategoryKind = "industry" | "niche" | "location";

export interface Category {
  id: string;
  kind: CategoryKind;
  name: string;
  active: boolean;
}

export interface SavedItem {
  userId: string;
  targetType: "opportunity" | "profile";
  targetId: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  businesses: BusinessProfile[];
  salesPartners: SalesProfile[];
  creators: CreatorProfile[];
  agencies: AgencyProfile[];
  talents: Talent[];
  teamMembers: TeamMember[];
  opportunities: Opportunity[];
  applications: Application[];
  partnerships: Partnership[];
  plans: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  subscriptionEvents: SubscriptionEvent[];
  reviews: Review[];
  notifications: Notification[];
  reports: Report[];
  categories: Category[];
  saved: SavedItem[];
}
