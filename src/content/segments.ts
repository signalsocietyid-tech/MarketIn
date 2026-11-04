import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  ChartLine,
  ClipboardList,
  FilePlus2,
  FolderKanban,
  Gauge,
  Inbox,
  Layers,
  Link2,
  ListChecks,
  MapPinned,
  Megaphone,
  Network,
  Package,
  Percent,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  UserSearch,
  Users,
  Workflow,
  ChartColumn,
  Images,
  Handshake,
} from "lucide-react";
import type { Segment } from "@/lib/types";

export type CtaLink = { label: string; href: string };

export type SegmentNeed = { icon: LucideIcon; title: string; description: string };

export type SegmentStep = { title: string; description: string };

export type HeroPanelItem = { icon: LucideIcon; label: string; detail: string };

export interface SegmentContent {
  segment: Segment;
  path: `/${string}`;
  /** "agency" gets a slightly different composition (split hero, account model section). */
  layout: "standard" | "agency";
  meta: { title: string; description: string };
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  trustPoints: string[];
  heroPanel: { title: string; description: string; items: HeroPanelItem[] };
  needs: { eyebrow: string; title: string; description: string; items: SegmentNeed[] };
  steps: { title: string; description: string; items: SegmentStep[] };
  preview: { eyebrow: string; title: string; description: string; links: CtaLink[] };
  plans: { title: string; description: string };
  /** Matches an id in FAQ_GROUPS (src/content/faq.ts). */
  faqGroupId: string;
  closing: { title: string; description: string; secondary: CtaLink };
}

export const SEGMENT_CONTENT: Record<Segment, SegmentContent> = {
  business: {
    segment: "business",
    path: "/for-business",
    layout: "standard",
    meta: {
      title: "For Businesses — Find Sales Partners, Creators & Agencies",
      description:
        "Recruit independent sales reps, regional distributors, affiliates, KOLs and agencies, publish partnership opportunities and track performance on MarketIn.",
    },
    eyebrow: "For Businesses",
    headline: "Build the partner network your growth plan needs.",
    subheadline:
      "Reach independent sales reps, regional distributors, affiliates, creators and agencies in one marketplace. Publish an opportunity, review applicants and keep every partnership on track from one dashboard.",
    primaryCta: { label: "Create a business account", href: "/register?type=business" },
    secondaryCta: { label: "Browse partners", href: "/marketplace/sales?view=partners" },
    trustPoints: ["Free plan to get started", "Verification badges on reviewed profiles", "Compensation stated on every listing"],
    heroPanel: {
      title: "Partners you can reach",
      description: "One business account covers every partnership channel.",
      items: [
        { icon: UserSearch, label: "Independent sales reps", detail: "Field and B2B sellers on commission or fixed fee" },
        { icon: Truck, label: "Regional distributors", detail: "Coverage for the cities and provinces you want to enter" },
        { icon: Link2, label: "Affiliates & resellers", detail: "Performance-based programs with clear commission terms" },
        { icon: Megaphone, label: "KOLs & UGC creators", detail: "Influencers, micro and nano KOLs, product reviewers" },
        { icon: Building2, label: "Agencies", detail: "Influencer, digital, KOL management and sales outsourcing teams" },
      ],
    },
    needs: {
      eyebrow: "What you can do",
      title: "Every growth channel, one place to manage it",
      description:
        "Whether you are opening a new territory or launching a creator campaign, MarketIn gives you the search, listings and tracking to do it without stitching together spreadsheets and chat groups.",
      items: [
        {
          icon: UserSearch,
          title: "Find independent sales reps",
          description: "Search sales professionals by industry, years of experience, specialization and the areas they already cover.",
        },
        {
          icon: Truck,
          title: "Appoint regional distributors",
          description: "Post a distributor partnership for a specific territory and compare applicants side by side.",
        },
        {
          icon: MapPinned,
          title: "Expand to new regions",
          description: "Filter partners by location and areas of operation to find people already active where you want to sell.",
        },
        {
          icon: Link2,
          title: "Recruit affiliates",
          description: "Launch affiliate or reseller programs with commission terms stated upfront, and let affiliates apply to you.",
        },
        {
          icon: Megaphone,
          title: "Find KOLs and creators",
          description: "Discover influencers, micro and nano KOLs and UGC creators by platform, niche and audience size.",
        },
        {
          icon: Building2,
          title: "Work with agencies",
          description: "Brief influencer, digital, KOL management or sales outsourcing agencies that bring a whole team.",
        },
        {
          icon: FilePlus2,
          title: "Publish opportunities",
          description: "Describe requirements, deliverables, compensation and deadline once, then review every application in one queue.",
        },
        {
          icon: ChartLine,
          title: "Monitor partnership performance",
          description: "Follow active partnerships, leads, conversions and content delivered from your partnership dashboard.",
        },
      ],
    },
    steps: {
      title: "How it works for businesses",
      description: "From first listing to an active partnership in four steps.",
      items: [
        { title: "Set up your company profile", description: "Add your industry, location, website and what you sell so partners know who they are talking to." },
        { title: "Publish or search", description: "Post an opportunity for partners to apply to, or search the directory and shortlist profiles yourself." },
        { title: "Review and shortlist", description: "Read applications, move candidates through review and shortlist the ones that fit." },
        { title: "Accept and track", description: "Accept a partner to open a partnership, then monitor its progress from your dashboard." },
      ],
    },
    preview: {
      eyebrow: "Live from the directory",
      title: "Partners with public profiles right now",
      description: "A sample of sales partners, creators and agencies currently listed on MarketIn.",
      links: [
        { label: "All sales partners", href: "/marketplace/sales?view=partners" },
        { label: "All creators", href: "/marketplace/kol?view=partners" },
        { label: "All agencies", href: "/marketplace/agencies?view=partners" },
      ],
    },
    plans: {
      title: "Start free, upgrade when you scale",
      description: "Every business account starts on the free plan. Move to Pro when you need more listings and deeper search.",
    },
    faqGroupId: "business",
    closing: {
      title: "Your next growth partner may already be here.",
      description: "Create a free business account, publish your first opportunity and start reviewing applicants.",
      secondary: { label: "Explore the marketplace", href: "/marketplace" },
    },
  },

  sales: {
    segment: "sales",
    path: "/for-sales-partners",
    layout: "standard",
    meta: {
      title: "For Sales Partners — Commission & Distribution Opportunities",
      description:
        "Find companies seeking independent sales representatives, sales agents and distributors. Build a professional sales portfolio and track every application on MarketIn.",
    },
    eyebrow: "For Sales Partners",
    headline: "Turn your sales network into lasting partnerships.",
    subheadline:
      "Discover companies looking for independent sales representatives, sales agents and distributors. Build a professional portfolio that shows where you sell, which industries you know and what you have delivered.",
    primaryCta: { label: "Join as a sales partner", href: "/register?type=sales" },
    secondaryCta: { label: "Browse sales opportunities", href: "/marketplace/sales" },
    trustPoints: ["Free to create a profile", "Compensation terms shown upfront", "Every application tracked in one place"],
    heroPanel: {
      title: "Opportunity types you will find",
      description: "Listings in the Sales & Distribution marketplace.",
      items: [
        { icon: Briefcase, label: "Sales Representative", detail: "Represent a brand's products to your own customer base" },
        { icon: Truck, label: "Distributor Partnership", detail: "Supply a territory and build the retail network" },
        { icon: Handshake, label: "Sales Agent", detail: "Close deals on behalf of a company, usually on commission" },
        { icon: Building2, label: "B2B Sales Outsourcing", detail: "Take on a company's business-to-business pipeline" },
      ],
    },
    needs: {
      eyebrow: "What you can do",
      title: "Built for independent sellers and distributors",
      description:
        "Spend less time hunting for principals and more time selling. MarketIn puts companies that want partners and the terms they offer in one place.",
      items: [
        {
          icon: Briefcase,
          title: "Find companies seeking sales partners",
          description: "Browse brands and manufacturers that are actively recruiting sales representatives and agents.",
        },
        {
          icon: Percent,
          title: "Commission-based opportunities",
          description: "Filter by compensation model, from pure commission to fixed fee plus commission or revenue sharing.",
        },
        {
          icon: Package,
          title: "Products to distribute",
          description: "Find brands looking for distributors and resellers in your area across FMCG, F&B, electronics and more.",
        },
        {
          icon: UserRound,
          title: "A professional sales portfolio",
          description: "Present your track record, industries, specializations and reviews from completed partnerships.",
        },
        {
          icon: Network,
          title: "Showcase your networks & expertise",
          description: "List the cities you cover and the channels you know, such as modern trade, general trade, Horeca or B2B.",
        },
        {
          icon: ListChecks,
          title: "Track applications & partnerships",
          description: "Follow every application from Pending to Accepted and manage active partnerships from your dashboard.",
        },
      ],
    },
    steps: {
      title: "How it works for sales partners",
      description: "Four steps from profile to your first signed principal.",
      items: [
        { title: "Build your sales profile", description: "Add your title, experience, industries, specializations and the areas you operate in." },
        { title: "Find the right principals", description: "Filter opportunities by industry, location, compensation model and experience level." },
        { title: "Apply with a tailored pitch", description: "Send a short message explaining your network and why you are a good fit." },
        { title: "Agree terms and start selling", description: "Once accepted, confirm terms in writing with the business and track the partnership." },
      ],
    },
    preview: {
      eyebrow: "Live opportunities",
      title: "Open sales & distribution opportunities",
      description: "The latest listings from businesses looking for sales partners.",
      links: [{ label: "View all sales opportunities", href: "/marketplace/sales" }],
    },
    plans: {
      title: "Plans for sales partners",
      description: "Create your profile and apply for free. Upgrade for more applications and better visibility.",
    },
    faqGroupId: "sales",
    closing: {
      title: "Put your network to work.",
      description: "Create your sales partner profile and start applying to companies looking for partners like you.",
      secondary: { label: "See how it works", href: "/how-it-works" },
    },
  },

  creator: {
    segment: "creator",
    path: "/for-creators",
    layout: "standard",
    meta: {
      title: "For Creators & Affiliates — Paid Collaborations & Affiliate Programs",
      description:
        "Find paid brand collaborations, affiliate programs and UGC work. Showcase your platforms, audience and portfolio, and manage campaign applications on MarketIn.",
    },
    eyebrow: "For Creators & Affiliates",
    headline: "Get discovered by brands that fit your audience.",
    subheadline:
      "Find paid collaborations, affiliate programs and brands looking for promotion. Show your platforms, audience and past work in one portfolio, and manage every campaign application from a single dashboard.",
    primaryCta: { label: "Join as a creator", href: "/register?type=creator" },
    secondaryCta: { label: "Browse campaigns", href: "/marketplace/kol" },
    trustPoints: ["One account for affiliate and KOL work", "Budget and compensation on every listing", "Free plan available"],
    heroPanel: {
      title: "Collaboration types",
      description: "Listings across the Affiliate and KOL & Creator marketplaces.",
      items: [
        { icon: Link2, label: "Affiliate Campaign", detail: "Earn commission on the sales you drive" },
        { icon: Store, label: "Reseller Partnership", detail: "Sell a brand's products through your own channels" },
        { icon: Megaphone, label: "KOL Campaign", detail: "Paid posts, live sessions and ambassador work" },
        { icon: Images, label: "UGC Collaboration", detail: "Produce content the brand publishes on its own channels" },
        { icon: ClipboardList, label: "Product Review", detail: "Honest reviews of products sent to you" },
      ],
    },
    needs: {
      eyebrow: "What you can do",
      title: "Your creator business, organised",
      description:
        "Stop chasing briefs across DMs. Find work that matches your niche, present your numbers clearly and keep every application in one place.",
      items: [
        {
          icon: BadgeDollarSign,
          title: "Paid collaborations",
          description: "Apply to KOL campaigns, UGC briefs and product reviews with the budget and deliverables stated upfront.",
        },
        {
          icon: Link2,
          title: "Affiliate programs",
          description: "Join commission-based programs and reseller partnerships from brands across many industries.",
        },
        {
          icon: Megaphone,
          title: "Brands seeking promotion",
          description: "Filter by platform, industry and compensation to find brands that want to reach your audience.",
        },
        {
          icon: Images,
          title: "Portfolio & social accounts",
          description: "Bring your platforms, handles, niches and best work together in one shareable profile.",
        },
        {
          icon: ChartColumn,
          title: "Audience statistics",
          description: "Show follower counts per platform and your engagement rate. Verification is currently reviewed manually.",
        },
        {
          icon: ClipboardList,
          title: "Manage campaign applications",
          description: "See which applications are pending, under review, shortlisted or accepted without asking.",
        },
        {
          icon: ShieldCheck,
          title: "Professional credibility",
          description: "Reviews from completed collaborations and a verification badge help brands trust your work.",
        },
        {
          icon: Users,
          title: "Work through an agency",
          description: "If an agency manages you, it can put you forward for campaigns from its talent roster.",
        },
      ],
    },
    steps: {
      title: "How it works for creators",
      description: "From profile to paid collaboration in four steps.",
      items: [
        { title: "Create your creator profile", description: "Pick your creator categories, such as affiliate marketer, KOL or UGC creator, and your niches." },
        { title: "Add platforms and portfolio", description: "List each social account with its follower count and link to work you are proud of." },
        { title: "Apply to campaigns", description: "Browse affiliate programs and KOL campaigns and send a short, relevant pitch." },
        { title: "Deliver and get reviewed", description: "Complete the collaboration, collect a review and build credibility for the next one." },
      ],
    },
    preview: {
      eyebrow: "Live opportunities",
      title: "Open campaigns & affiliate programs",
      description: "The latest affiliate programs and creator collaborations from businesses on MarketIn.",
      links: [
        { label: "Affiliate programs", href: "/marketplace/affiliate" },
        { label: "KOL & creator campaigns", href: "/marketplace/kol" },
      ],
    },
    plans: {
      title: "Plans for creators & affiliates",
      description: "Build your profile and apply for free. Upgrade for more applications and premium opportunities.",
    },
    faqGroupId: "creator",
    closing: {
      title: "Your audience is valuable. Get paid fairly for it.",
      description: "Create your creator profile in a few minutes and start applying to campaigns that fit.",
      secondary: { label: "See how it works", href: "/how-it-works" },
    },
  },

  agency: {
    segment: "agency",
    path: "/for-agencies",
    layout: "agency",
    meta: {
      title: "For Agencies — Manage Talent, Clients & Partnerships",
      description:
        "A dedicated agency account for influencer, digital, KOL management, sales outsourcing and affiliate management agencies. Manage your roster, receive opportunities and run client campaigns.",
    },
    eyebrow: "For Agencies",
    headline: "Run your talent, clients and pipeline from one agency account.",
    subheadline:
      "Agency accounts are built for teams, not individuals. Represent your roster of creators and sales reps, receive partnership requests from businesses and manage several client campaigns side by side.",
    primaryCta: { label: "Register your agency", href: "/register?type=agency" },
    secondaryCta: { label: "Browse agency opportunities", href: "/marketplace/agencies" },
    trustPoints: ["A dedicated agency account type", "Talent roster and team members", "Propose as the agency or for a talent"],
    heroPanel: {
      title: "One account, your whole operation",
      description: "What an agency account brings together.",
      items: [
        { icon: Building2, label: "Agency profile", detail: "Category, services, team size and portfolio" },
        { icon: Users, label: "Talent roster", detail: "Creators, affiliates and sales reps with availability" },
        { icon: UserRound, label: "Team members", detail: "Colleagues who manage campaigns with you, on Agency Pro" },
        { icon: Inbox, label: "Opportunity inbox", detail: "Partnership requests and campaigns that fit your services" },
        { icon: Workflow, label: "Partnership pipeline", detail: "Proposals, active work and completed partnerships" },
      ],
    },
    needs: {
      eyebrow: "What you can do",
      title: "Tools for agencies that manage people and accounts",
      description:
        "Influencer marketing, digital, KOL management, sales outsourcing and affiliate management agencies each juggle talent, clients and deadlines. MarketIn keeps them in one workspace.",
      items: [
        {
          icon: Users,
          title: "Manage multiple talents & sales reps",
          description: "Keep a roster of creators, affiliates and sales representatives and mark who is available or on a project.",
        },
        {
          icon: FolderKanban,
          title: "Showcase your agency portfolio",
          description: "Present your category, services, team size and past client work on a public agency profile.",
        },
        {
          icon: Inbox,
          title: "Receive business opportunities",
          description: "Get agency partnership requests and campaigns that match your services, in one opportunity inbox.",
        },
        {
          icon: Layers,
          title: "Manage multiple client campaigns",
          description: "Run several client briefs in parallel and submit proposals as the agency or on behalf of a talent.",
        },
        {
          icon: Gauge,
          title: "Monitor team performance",
          description: "See how campaigns and partnerships are progressing across your roster from the agency dashboard.",
        },
        {
          icon: Workflow,
          title: "Collaboration & partnership pipelines",
          description: "Track every proposal from submission to active partnership and completion.",
        },
      ],
    },
    steps: {
      title: "How it works for agencies",
      description: "Four steps to bring your agency's pipeline onto MarketIn.",
      items: [
        { title: "Register the agency", description: "Create an agency account with your category, services, location and team size." },
        { title: "Build your roster", description: "Add the creators, affiliates and sales reps you represent, and invite team members." },
        { title: "Respond to opportunities", description: "Submit proposals for the agency or put forward a specific talent from your roster." },
        { title: "Deliver and grow accounts", description: "Manage active partnerships, collect reviews and turn one brief into a long-term client." },
      ],
    },
    preview: {
      eyebrow: "Live from the marketplace",
      title: "Agency opportunities and agencies already here",
      description: "Open agency partnership requests from businesses, alongside agencies with public profiles.",
      links: [
        { label: "All agency opportunities", href: "/marketplace/agencies" },
        { label: "Agency directory", href: "/marketplace/agencies?view=partners" },
      ],
    },
    plans: {
      title: "Plans for agencies",
      description: "Start with a limited roster for free. Agency Pro expands your roster and adds team members and analytics.",
    },
    faqGroupId: "agency",
    closing: {
      title: "Bring your agency's pipeline into one place.",
      description: "Register your agency, add your roster and start receiving opportunities from businesses.",
      secondary: { label: "See how it works", href: "/how-it-works" },
    },
  },
};

/**
 * How an agency account differs from an individual profile. Rendered only on the
 * agency landing page.
 */
export const AGENCY_ACCOUNT_MODEL = {
  title: "An agency account, not an individual profile",
  description:
    "Agencies register as their own account type. You represent a team and a roster, so your account is structured around organisations rather than one person.",
  individual: {
    label: "Individual profile",
    caption: "Sales partners and creators",
    points: [
      "Represents one person",
      "Applies to opportunities for themselves",
      "Personal portfolio, platforms and coverage",
      "One login, one set of applications",
    ],
  },
  agency: {
    label: "Agency account",
    caption: "Agencies and managed teams",
    points: [
      "Represents an organisation and its roster",
      "Proposes as the agency or on behalf of a talent",
      "Agency portfolio, services and client work",
      "Invite team members to work alongside you on Agency Pro",
    ],
  },
} as const;
