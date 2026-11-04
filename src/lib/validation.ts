import { z } from "zod";

// Shared Zod schemas used by React Hook Form on the client and re-validated in server actions.

const url = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Enter a full URL starting with https://")
  .optional();

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const businessOnboardingSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  businessEmail: z.string().trim().email("Enter a valid business email"),
  industry: z.string().min(1, "Select an industry"),
  category: z.string().min(1, "Select a business category"),
  location: z.string().min(1, "Select a location"),
  website: url,
  description: z.string().trim().min(20, "Tell partners a bit more (at least 20 characters)").max(1000),
  logoUrl: z.string().optional(),
});

export const salesOnboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  title: z.string().trim().min(2, "Professional title is required"),
  location: z.string().min(1, "Select a location"),
  industries: z.array(z.string()).min(1, "Pick at least one industry"),
  experienceYears: z.coerce.number<number>().int().min(0, "Must be 0 or more").max(50),
  partnershipTypes: z.array(z.string()).min(1, "Pick at least one partnership type"),
  areas: z.array(z.string()).min(1, "Pick at least one area of operation"),
  specializations: z.array(z.string()).default([]),
  portfolio: z.string().trim().max(1500).default(""),
  bio: z.string().trim().max(500).default(""),
});

export const socialAccountSchema = z.object({
  platform: z.enum(["instagram", "tiktok", "youtube", "x", "linkedin", "facebook"]),
  handle: z.string().trim().min(1, "Handle is required"),
  url: z.string().trim().url("Enter the full profile URL"),
  followers: z.coerce.number<number>().int().min(0, "Must be 0 or more"),
});

export const creatorOnboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  creatorTypes: z.array(z.string()).min(1, "Pick at least one creator category"),
  socials: z.array(socialAccountSchema).min(1, "Add at least one social media account"),
  engagementRate: z
    .union([z.literal(""), z.coerce.number<number>().min(0).max(100)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  niches: z.array(z.string()).min(1, "Pick at least one content niche"),
  location: z.string().min(1, "Select a location"),
  portfolio: z.string().trim().max(1500).default(""),
  collaborationTypes: z.array(z.string()).min(1, "Pick at least one collaboration type"),
  bio: z.string().trim().max(500).default(""),
});

export const agencyOnboardingSchema = z.object({
  agencyName: z.string().trim().min(2, "Agency name is required"),
  category: z.string().min(1, "Select an agency category"),
  website: url,
  location: z.string().min(1, "Select a location"),
  description: z.string().trim().min(20, "Describe your agency (at least 20 characters)").max(1000),
  services: z.array(z.string()).min(1, "Pick at least one service"),
  teamSize: z.string().min(1, "Select your team size"),
  portfolio: z.string().trim().max(1500).default(""),
});

export const registerSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("business"), account: credentialsSchema, profile: businessOnboardingSchema }),
  z.object({ role: z.literal("sales"), account: credentialsSchema, profile: salesOnboardingSchema }),
  z.object({ role: z.literal("creator"), account: credentialsSchema, profile: creatorOnboardingSchema }),
  z.object({ role: z.literal("agency"), account: credentialsSchema, profile: agencyOnboardingSchema }),
]);

export type RegisterInput = z.input<typeof registerSchema>;

export const opportunitySchema = z
  .object({
    title: z.string().trim().min(6, "Give the opportunity a clear title").max(120),
    type: z.enum([
      "sales_representative",
      "distributor_partnership",
      "sales_agent",
      "b2b_sales_outsourcing",
      "affiliate_campaign",
      "reseller_partnership",
      "kol_campaign",
      "ugc_collaboration",
      "product_review",
      "agency_partnership",
    ]),
    industry: z.string().min(1, "Select an industry"),
    location: z.string().min(1, "Select a location"),
    remote: z.boolean().default(false),
    description: z.string().trim().min(40, "Describe the opportunity (at least 40 characters)").max(3000),
    requirements: z.string().trim().min(1, "List at least one requirement"),
    deliverables: z.string().trim().min(1, "List at least one expected deliverable"),
    compensationModel: z.enum(["fixed_fee", "commission", "fixed_plus_commission", "revenue_sharing", "negotiable"]),
    compensationDetail: z.string().trim().min(2, "Describe the commission or budget"),
    budgetMin: z.union([z.literal(""), z.coerce.number<number>().min(0)]).optional(),
    budgetMax: z.union([z.literal(""), z.coerce.number<number>().min(0)]).optional(),
    experienceLevel: z.enum(["any", "junior", "mid", "senior"]),
    platforms: z.array(z.enum(["instagram", "tiktok", "youtube", "x", "linkedin", "facebook"])).default([]),
    deadline: z.string().min(1, "Set an application deadline"),
    duration: z.string().trim().min(1, "Set the partnership duration"),
    premium: z.boolean().default(false),
  })
  .refine((v) => new Date(v.deadline).getTime() > Date.now() - 86_400_000, {
    path: ["deadline"],
    message: "Deadline must be in the future",
  })
  .refine((v) => !(typeof v.budgetMin === "number" && typeof v.budgetMax === "number" && v.budgetMax < v.budgetMin), {
    path: ["budgetMax"],
    message: "Maximum must be greater than minimum",
  });

export type OpportunityInput = z.input<typeof opportunitySchema>;

export const applicationSchema = z.object({
  opportunityId: z.string().min(1),
  message: z.string().trim().min(20, "Write a short pitch (at least 20 characters)").max(1500),
  proposedRate: z.string().trim().max(120).optional(),
  talentId: z.string().optional(),
});

export const talentSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  type: z.enum(["sales", "creator", "affiliate"]),
  specialty: z.string().trim().min(2, "Specialty is required"),
  location: z.string().min(1, "Select a location"),
  followers: z.union([z.literal(""), z.coerce.number<number>().int().min(0)]).optional(),
});

export const teamInviteSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["manager", "member"]),
});

export const reviewSchema = z.object({
  partnershipId: z.string().min(1),
  rating: z.coerce.number<number>().int().min(1).max(5),
  comment: z.string().trim().min(10, "Share a bit more detail (at least 10 characters)").max(800),
});

export const reportSchema = z.object({
  targetType: z.enum(["user", "opportunity"]),
  targetId: z.string().min(1),
  reason: z.string().min(1, "Choose a reason"),
  details: z.string().trim().max(800).optional(),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const planUpdateSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2),
  tagline: z.string().trim().max(160),
  priceMonthly: z.coerce.number<number>().int().min(0),
  priceYearly: z.coerce.number<number>().int().min(0),
  benefits: z.array(z.string().trim().min(1)).min(1),
  entitlements: z.array(z.string()),
  limits: z.object({
    activeOpportunities: z.coerce.number<number>().int().min(0),
    monthlyApplications: z.coerce.number<number>().int().min(0),
    talentRoster: z.coerce.number<number>().int().min(0),
    teamMembers: z.coerce.number<number>().int().min(0),
    savedItems: z.coerce.number<number>().int().min(0),
  }),
  recommended: z.boolean(),
  active: z.boolean(),
});

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
