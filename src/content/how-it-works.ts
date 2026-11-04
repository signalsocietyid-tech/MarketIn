import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Coins, FileText, Flag, Handshake, Percent, PieChart, Scale, Star, Wallet } from "lucide-react";
import type { ApplicationStatus, CompensationModel, Segment } from "@/lib/types";

export const PLATFORM_STEPS = [
  {
    title: "Create Your Profile",
    description: "Register as a business, sales partner, creator or agency and tell others what you offer and what you are looking for.",
  },
  {
    title: "Discover Opportunities",
    description: "Browse opportunities relevant to you, or search the directory to find partners that fit your goals.",
  },
  {
    title: "Connect & Collaborate",
    description: "Apply, review applications, communicate with the other side and negotiate terms that work for both.",
  },
  {
    title: "Grow Together",
    description: "Manage active partnerships and monitor their performance from your dashboard.",
  },
];

export type Journey = {
  segment: Segment;
  tab: string;
  summary: string;
  steps: string[];
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  learnMore: string;
};

export const SEGMENT_JOURNEYS: Journey[] = [
  {
    segment: "business",
    tab: "Businesses",
    summary: "Find and manage sales partners, distributors, affiliates, creators and agencies.",
    steps: [
      "Create a business account and complete your company profile.",
      "Publish an opportunity with requirements, compensation, deadline and duration, or search the partner directory.",
      "Review incoming applications, move promising candidates to Under Review and Shortlisted.",
      "Accept the right partner. An active partnership is opened automatically.",
      "Track partnership progress and performance, then mark it completed and leave a review.",
    ],
    primary: { label: "Create a business account", href: "/register?type=business" },
    secondary: { label: "Browse partners", href: "/marketplace/sales?view=partners" },
    learnMore: "/for-business",
  },
  {
    segment: "sales",
    tab: "Sales Partners",
    summary: "Find principals, distribution deals and commission-based work.",
    steps: [
      "Create a sales partner profile with your experience, industries, specializations and areas of operation.",
      "Browse the Sales & Distribution marketplace and filter by industry, location and compensation model.",
      "Apply with a short message describing your network and relevant results.",
      "Follow your application status from your dashboard and withdraw it while it is still pending or under review if plans change.",
      "Once accepted, agree terms in writing with the business and manage the partnership.",
    ],
    primary: { label: "Join as a sales partner", href: "/register?type=sales" },
    secondary: { label: "Browse sales opportunities", href: "/marketplace/sales" },
    learnMore: "/for-sales-partners",
  },
  {
    segment: "creator",
    tab: "Creators & Affiliates",
    summary: "Find paid collaborations and affiliate programs that fit your audience.",
    steps: [
      "Create a creator profile, choose your creator categories and niches.",
      "Add each social account with its handle, link and follower count, plus your portfolio.",
      "Browse affiliate programs and KOL campaigns, filtering by platform, industry and budget.",
      "Apply with a pitch that explains why your audience fits the brand.",
      "Deliver the collaboration and collect a review that strengthens your profile.",
    ],
    primary: { label: "Join as a creator", href: "/register?type=creator" },
    secondary: { label: "Browse campaigns", href: "/marketplace/kol" },
    learnMore: "/for-creators",
  },
  {
    segment: "agency",
    tab: "Agencies",
    summary: "Represent your roster and win client work as an organisation.",
    steps: [
      "Register an agency account with your category, services and team size.",
      "Build your talent roster of creators, affiliates and sales reps, and invite team members.",
      "Review agency opportunities and campaigns that match your services.",
      "Submit proposals as the agency or on behalf of a specific talent from your roster.",
      "Manage accepted partnerships across clients from your agency dashboard.",
    ],
    primary: { label: "Register your agency", href: "/register?type=agency" },
    secondary: { label: "Browse agency opportunities", href: "/marketplace/agencies" },
    learnMore: "/for-agencies",
  },
];

/** Descriptions for each real application status (labels come from APPLICATION_STATUS_LABEL). */
export const LIFECYCLE: { status: ApplicationStatus; description: string }[] = [
  { status: "pending", description: "The application has been sent and is waiting for the business to open it. The applicant can still withdraw." },
  { status: "under_review", description: "The business is assessing the application. Withdrawal is still possible at this stage." },
  { status: "shortlisted", description: "The applicant is on the business's shortlist and may be contacted to discuss terms." },
  { status: "accepted", description: "The business has chosen this partner. A partnership is opened and can be managed from the dashboard." },
  { status: "completed", description: "The partnership has ended successfully. Both sides can now leave a review." },
];

export const REJECTED_NOTE =
  "A business can decline an application at any point before it is accepted. The applicant is notified and can keep applying to other opportunities.";

export const COMPENSATION_MODELS: {
  model: CompensationModel;
  icon: LucideIcon;
  description: string;
  typical: string;
}[] = [
  {
    model: "fixed_fee",
    icon: Wallet,
    description: "A set amount agreed upfront for a defined scope, regardless of results.",
    typical: "KOL posts, UGC production, product reviews",
  },
  {
    model: "commission",
    icon: Percent,
    description: "A percentage or fixed amount for each sale, lead or conversion the partner generates.",
    typical: "Sales agents, affiliate programs, resellers",
  },
  {
    model: "fixed_plus_commission",
    icon: Coins,
    description: "A base fee for the partner's time plus a performance bonus on results.",
    typical: "Sales representatives, longer creator campaigns",
  },
  {
    model: "revenue_sharing",
    icon: PieChart,
    description: "The partner receives an agreed share of the revenue generated in their channel or territory.",
    typical: "Regional distributors, agency partnerships",
  },
  {
    model: "negotiable",
    icon: Scale,
    description: "The business invites proposals and settles terms with each shortlisted applicant.",
    typical: "Agency briefs, bespoke partnerships",
  },
];

export const TRUST_POINTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: BadgeCheck,
    title: "Verification",
    description: "Users can request verification. Our team reviews the information provided and verified profiles carry a badge.",
  },
  {
    icon: Star,
    title: "Reviews & ratings",
    description: "After a partnership, both sides can leave a review, building a track record others can rely on.",
  },
  {
    icon: Flag,
    title: "Reporting",
    description: "Anyone signed in can report a listing or profile that looks misleading or unsafe. Our team reviews every report.",
  },
  {
    icon: FileText,
    title: "Transparent opportunity details",
    description: "Listings state the compensation model, requirements, deliverables, deadline and duration before you apply.",
  },
];

export const PAYMENT_NOTE = {
  icon: Handshake,
  title: "Payments between partners",
  description:
    "MarketIn does not currently hold or disburse payments between users. Agree compensation and payment timing in writing with your partner before work begins.",
};
