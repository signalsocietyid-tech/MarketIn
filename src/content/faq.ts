export type FaqGroup = { id: string; label: string; items: { q: string; a: string }[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "business",
    label: "For Businesses",
    items: [
      {
        q: "How can I find sales partners?",
        a: "Create a free business profile, then browse the Sales & Distribution marketplace or the partner directory. Filter by industry expertise, geographical coverage, experience and specialization, save promising profiles, or publish an opportunity and let partners apply to you.",
      },
      {
        q: "How do I publish an opportunity?",
        a: "From your dashboard choose “New opportunity”, pick the opportunity type (sales representative, distributor, affiliate campaign, KOL campaign and more), then describe requirements, deliverables, compensation model, deadline and duration. Your listing goes live immediately and you can pause or close it at any time.",
      },
      {
        q: "Can I find distributors in other cities?",
        a: "Yes. Every opportunity and partner profile carries a location and areas of operation, so you can search for distributors and sales agents in specific cities or post a regional distribution opportunity for the area you want to enter.",
      },
      {
        q: "How does the subscription work?",
        a: "Every account starts on a free plan. Business Pro is a monthly or yearly subscription that adds more active listings, advanced search and filters, priority visibility and analytics. You can upgrade, or schedule a downgrade back to Free, from the Subscription page at any time.",
      },
    ],
  },
  {
    id: "sales",
    label: "For Sales Partners",
    items: [
      {
        q: "How can I register?",
        a: "Select “Get Started”, choose the Sales Partner account type and complete the short onboarding: your title, location, industry expertise, sales experience, preferred partnership types and areas of operation.",
      },
      {
        q: "Can I apply to multiple opportunities?",
        a: "Yes. Free accounts can send a set number of applications per month and Sales Pro raises that limit. You can track every application and its status — pending, under review, shortlisted, accepted, rejected or completed — from your dashboard.",
      },
      {
        q: "How do I showcase my experience?",
        a: "Your professional profile includes your track record, industries, specializations, coverage areas and a portfolio section. Reviews from completed partnerships appear on your profile and help businesses trust your work.",
      },
      {
        q: "How do I receive commissions?",
        a: "Commission terms are agreed directly between you and the business and are stated on each opportunity (commission-based, fixed fee + commission, revenue sharing and more). MarketIn currently does not hold or disburse commissions, so always confirm payment terms in writing before you start.",
      },
    ],
  },
  {
    id: "creator",
    label: "For Creators & Affiliates",
    items: [
      {
        q: "How do I find campaigns?",
        a: "Browse the Affiliate Marketing and KOL & Creator Collaboration marketplaces. Filter by platform, industry, compensation and budget, and check your dashboard for campaigns recommended for your niches.",
      },
      {
        q: "Can I register as both an affiliate and KOL?",
        a: "Yes. A Creator & Affiliate account lets you select several creator categories — affiliate marketer, influencer, micro or nano KOL, UGC creator, product reviewer — so you can apply to both affiliate programs and paid campaigns.",
      },
      {
        q: "How can I connect my social media accounts?",
        a: "Add each platform with your handle, profile link and follower count during onboarding or later from your profile. Automated account connection and audience verification are planned; until then, verification is reviewed manually by our team.",
      },
    ],
  },
  {
    id: "agency",
    label: "For Agencies",
    items: [
      {
        q: "Can I manage multiple talents?",
        a: "Yes. Agencies get a talent roster for creators, affiliates and sales representatives, with availability status for each. The free plan includes a limited roster and Agency Pro expands it.",
      },
      {
        q: "Can I receive opportunities for my clients?",
        a: "Your opportunity inbox collects agency partnership requests and campaigns that fit your services. You can submit proposals as the agency or on behalf of a specific talent from your roster.",
      },
      {
        q: "What features are included in Agency Pro?",
        a: "Agency Pro adds an expanded talent roster, multiple team members, the advanced agency dashboard and analytics, priority opportunity access and centralized partnership management. See the pricing page for current limits.",
      },
    ],
  },
];
