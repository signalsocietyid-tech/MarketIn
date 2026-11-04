// Draft legal copy for MarketIn. Every document here is a DRAFT FOR REVIEW and has
// not been approved by legal counsel. Placeholders in [square brackets] must be
// completed before launch. Email addresses come from src/content/contact.ts and are
// rendered as mailto links automatically.

import { CONTACT_EMAILS } from "./contact";

export type LegalBlock =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDocument = {
  title: string;
  description: string;
  intro: string;
  lastUpdated: string; // ISO date
  sections: LegalSection[];
};

const SUPPORT = CONTACT_EMAILS.support;
const GENERAL = CONTACT_EMAILS.general;

/* ---------------------------------- Terms ---------------------------------- */

export const TERMS: LegalDocument = {
  title: "Terms & Conditions",
  description: "The draft terms that govern access to and use of the MarketIn platform.",
  intro:
    "These Terms set out the rules for using MarketIn, the marketplace that connects businesses with sales partners, creators, affiliates and agencies. Please read them carefully.",
  lastUpdated: "2026-11-04",
  sections: [
    {
      id: "about",
      title: "About these Terms",
      blocks: [
        {
          p: "These Terms & Conditions (the “Terms”) form an agreement between you and [legal entity name to be confirmed], a company established under the laws of the Republic of Indonesia (“MarketIn”, “we”, “us”), which operates the MarketIn website and services (the “Platform”).",
        },
        {
          p: "By creating an account or otherwise using the Platform, you confirm that you have read, understood and agree to these Terms and to our Privacy Policy. If you do not agree, please do not use the Platform.",
        },
        {
          p: "If you use the Platform on behalf of a company or agency, you confirm that you are authorised to accept these Terms on its behalf, and “you” refers to that organisation as well as to you personally.",
        },
      ],
    },
    {
      id: "definitions",
      title: "Definitions",
      blocks: [
        {
          ul: [
            "“Business” — a company or organisation that uses the Platform to find partners and publish opportunities.",
            "“Sales Partner” — an individual independent sales representative, sales agent or distributor.",
            "“Creator & Affiliate” — an individual influencer, KOL, UGC creator, product reviewer or affiliate marketer.",
            "“Agency” — an organisation registered under the agency account type that represents talent or provides marketing or sales services to clients.",
            "“Opportunity” — a listing published by a Business describing a partnership, campaign or programme.",
            "“Application” — a submission by a user in response to an Opportunity.",
            "“Partnership” — the working relationship that begins when a Business accepts an Application.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "Eligibility and accounts",
      blocks: [
        {
          ul: [
            "You must be at least 18 years old, or otherwise have full legal capacity under Indonesian law, to create an account.",
            "You must choose the account type that reflects who you are: Business, Sales Partner, Creator & Affiliate or Agency.",
            "The information you provide, including company details, experience, coverage areas and audience figures, must be accurate, current and not misleading.",
            "You are responsible for keeping your login details confidential and for all activity under your account. Tell us promptly if you suspect unauthorised use.",
            "Agency accounts are responsible for the team members they invite and must be authorised by every talent they add to their roster or propose for an Opportunity.",
          ],
        },
      ],
    },
    {
      id: "role",
      title: "MarketIn's role",
      blocks: [
        {
          p: "MarketIn provides a marketplace where users can find each other, publish and apply to Opportunities and manage Partnerships. We are not a party to any agreement between users, and we are not an employer, principal, agent or distributor of any user.",
        },
        {
          p: "We do not guarantee that any Opportunity will be filled, that any Application will be accepted, or that any Partnership will achieve particular sales, reach or revenue.",
        },
        {
          p: "MarketIn does not currently hold, collect or disburse fees, commissions or other payments between users. Payment terms are agreed and settled directly between the parties.",
        },
      ],
    },
    {
      id: "opportunities",
      title: "Opportunities and applications",
      blocks: [
        {
          ul: [
            "Businesses are responsible for the accuracy and lawfulness of their Opportunities, including requirements, deliverables, compensation model, budget, deadline and duration.",
            "Compensation must be described honestly. Listings that require applicants to pay to participate, or that promote pyramid or similar schemes, are not permitted.",
            "Applications move through the statuses Pending, Under Review, Shortlisted, Accepted, Rejected and Completed. The Business that owns the Opportunity is responsible for updating the status.",
            "Applicants may withdraw an Application while it is Pending or Under Review.",
            "We may limit the number of active Opportunities or monthly Applications according to your plan.",
          ],
        },
      ],
    },
    {
      id: "agreements",
      title: "Agreements between users",
      blocks: [
        {
          p: "Any Partnership is a direct relationship between the users involved. We strongly recommend that you confirm scope, deliverables, compensation, payment timing, exclusivity and termination in a written agreement before work begins.",
        },
        {
          ul: [
            "Each party is responsible for its own tax, licensing and regulatory obligations arising from a Partnership.",
            "Creators and Affiliates must disclose paid or sponsored content as required by applicable law and platform rules.",
            "Businesses are responsible for the products and services they ask partners to sell or promote, including any claims made about them.",
          ],
        },
      ],
    },
    {
      id: "subscriptions",
      title: "Plans, subscriptions and fees",
      blocks: [
        {
          p: "Every account type has a free plan. Optional paid plans (“Pro”) add features and higher limits. The current names, prices and benefits of each plan are shown on the pricing page and may be updated by us from time to time.",
        },
        {
          ul: [
            "Online payment is not yet available. Pro plans are currently activated manually by our team once a subscription request has been confirmed.",
            "Paid plans are billed for the selected period (monthly or yearly) and renew only as described at the time you subscribe.",
            "You may schedule a downgrade to the free plan; it takes effect at the end of the current paid period.",
            "If we change the price of a plan you are subscribed to, we will notify you in advance and the change will apply from your next billing period.",
            "Refunds are handled in accordance with applicable consumer protection law. [Refund policy to be confirmed.]",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      blocks: [
        { p: "You agree not to:" },
        {
          ul: [
            "provide false information, impersonate any person or organisation, or misrepresent your experience, coverage or audience;",
            "inflate audience or engagement figures, for example by using purchased followers or automated engagement;",
            "publish Opportunities for illegal, counterfeit, restricted or unsafe products or services;",
            "send spam, unsolicited bulk messages or the same Application indiscriminately to many listings;",
            "scrape, copy or harvest data from the Platform, or attempt to bypass plan limits or security measures;",
            "harass, threaten or discriminate against other users;",
            "use the Platform to avoid legal obligations, including tax and consumer protection rules.",
          ],
        },
      ],
    },
    {
      id: "content",
      title: "Your content and intellectual property",
      blocks: [
        {
          p: "You keep ownership of the content you submit, such as profile text, logos, portfolio items and Opportunity descriptions. You grant MarketIn a non-exclusive, royalty-free licence to host, display and reproduce that content for the purpose of operating and promoting the Platform, for as long as it remains on the Platform.",
        },
        {
          p: "You confirm that you have the rights needed to share your content and that it does not infringe anyone else's rights. The Platform itself, including its software, design and the MarketIn name and logo, belongs to MarketIn.",
        },
      ],
    },
    {
      id: "trust",
      title: "Verification, reviews and reports",
      blocks: [
        {
          ul: [
            "A verification badge means we have reviewed certain information provided by the user. It is not an endorsement or a guarantee of performance.",
            "Reviews must reflect genuine experience from a Partnership. We may remove reviews that are fake, abusive or irrelevant.",
            "You can report listings or profiles that appear misleading or unsafe. We review reports and may remove content, restrict features or suspend accounts.",
          ],
        },
      ],
    },
    {
      id: "termination",
      title: "Suspension and termination",
      blocks: [
        {
          p: "You may stop using the Platform and request closure of your account at any time. We may suspend or close an account, or remove content, if we reasonably believe these Terms or applicable law have been breached, or to protect other users. Where appropriate we will tell you why and give you an opportunity to respond.",
        },
      ],
    },
    {
      id: "liability",
      title: "Disclaimers and limitation of liability",
      blocks: [
        {
          p: "The Platform is provided “as is” and “as available”. To the extent permitted by law, MarketIn is not liable for indirect or consequential losses, lost profits, or losses arising from agreements, payments or disputes between users.",
        },
        {
          p: "Nothing in these Terms excludes liability that cannot be excluded under Indonesian law. [Liability cap to be confirmed by legal counsel.]",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      blocks: [
        {
          p: "We may update these Terms as the Platform evolves. We will post the updated version on this page with a new “last updated” date and, for material changes, notify you by email or in the Platform before they take effect.",
        },
      ],
    },
    {
      id: "law",
      title: "Governing law and disputes",
      blocks: [
        {
          p: "These Terms are governed by the laws of the Republic of Indonesia. The parties will first try to resolve any dispute amicably. If that fails, the dispute will be resolved by [competent court or arbitration forum to be confirmed].",
        },
        {
          p: "An Indonesian-language version of these Terms will be made available. [Prevailing language to be confirmed by legal counsel in line with Law No. 24 of 2009.]",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [{ p: `Questions about these Terms can be sent to ${GENERAL}. For help with your account, contact ${SUPPORT}.` }],
    },
  ],
};

/* --------------------------------- Privacy --------------------------------- */

export const PRIVACY: LegalDocument = {
  title: "Privacy Policy",
  description: "How MarketIn collects, uses and protects personal data, in line with Indonesia's Personal Data Protection Law.",
  intro:
    "This policy explains what personal data MarketIn collects for each account type, why we collect it, who can see it and the choices you have.",
  lastUpdated: "2026-11-04",
  sections: [
    {
      id: "scope",
      title: "Who we are and scope",
      blocks: [
        {
          p: "MarketIn is operated by [legal entity name to be confirmed], which acts as the personal data controller for the data described in this policy. This policy applies to the MarketIn website and platform.",
        },
        {
          p: "We intend to process personal data in compliance with Law of the Republic of Indonesia No. 27 of 2022 on Personal Data Protection (“UU PDP”) and its implementing regulations.",
        },
      ],
    },
    {
      id: "data-collected",
      title: "Data we collect",
      blocks: [
        { h: "All accounts" },
        {
          ul: [
            "Name, email address and account type.",
            "Password, stored only as a one-way hash.",
            "Account status, verification status, sign-up date and last activity date.",
          ],
        },
        { h: "Businesses" },
        {
          ul: [
            "Company name, business email, industry, business category, location, website, company size, description and logo.",
            "Opportunities you publish and the decisions you record on applications.",
          ],
        },
        { h: "Sales Partners" },
        {
          ul: [
            "Full name, professional title, location and areas of operation.",
            "Industries, years of experience, specializations, preferred partnership types, portfolio and bio.",
          ],
        },
        { h: "Creators & Affiliates" },
        {
          ul: [
            "Full name, location, creator categories, niches, preferred collaboration types, portfolio and bio.",
            "Social media handles, profile links, follower counts and engagement rate that you provide.",
          ],
        },
        { h: "Agencies" },
        {
          ul: [
            "Agency name, category, website, location, services, team size, description and portfolio.",
            "Talent roster entries you add (name, talent type, specialty, location, follower count and availability).",
            "Names and email addresses of team members you invite.",
          ],
        },
        { h: "Activity and subscription data" },
        {
          ul: [
            "Applications and the messages included in them, saved items, partnerships and the performance figures recorded for them, reviews, reports and notifications.",
            "Your plan, billing cycle, subscription status and payment references. We do not store card or bank account numbers.",
            "Technical data needed to run the service, such as the session cookie described below and standard server logs (IP address, browser type and request times).",
          ],
        },
      ],
    },
    {
      id: "use",
      title: "How we use your data",
      blocks: [
        {
          ul: [
            "To create and operate your account and show your profile to other users.",
            "To publish Opportunities, deliver Applications to the right Business and keep both sides informed of status changes.",
            "To provide search, filters, recommendations and dashboards.",
            "To manage subscriptions and activate plan features.",
            "To verify profiles, moderate content, handle reports and keep the Platform safe.",
            "To respond to your enquiries and send service notices.",
            "To meet our legal obligations.",
          ],
        },
        {
          p: "Under UU PDP we rely on the following lawful bases, as applicable: performance of our agreement with you, your consent, compliance with legal obligations, and our legitimate interests in operating and securing the Platform.",
        },
      ],
    },
    {
      id: "visibility",
      title: "What other users can see",
      blocks: [
        {
          p: "Profile information you publish (for example your name or company name, headline, location, industries, services, social handles and reviews) is visible to visitors and other users. Your account email and password are never shown publicly.",
        },
        {
          p: "An Application, including the message you write, is visible to the Business that owns the Opportunity and, where relevant, to the Agency submitting it.",
        },
      ],
    },
    {
      id: "sharing",
      title: "Sharing your data",
      blocks: [
        { p: "We do not sell personal data. We share it only:" },
        {
          ul: [
            "with other users, as described above;",
            "with service providers that host, store or help us operate the Platform (for example cloud hosting, database and email providers, and a payment provider once online payments are enabled), under contracts that require them to protect it;",
            "when required by law, court order or a competent authority;",
            "as part of a merger, acquisition or reorganisation, subject to this policy.",
          ],
        },
      ],
    },
    {
      id: "agency-talent",
      title: "Talent data added by agencies",
      blocks: [
        {
          p: "Agencies must have the consent or other lawful basis required to add a person to their talent roster or to propose them for an Opportunity. The agency is responsible for informing the people it represents about how their data is used on MarketIn.",
        },
      ],
    },
    {
      id: "transfers",
      title: "Transfers outside Indonesia",
      blocks: [
        {
          p: "Some of our service providers may store or process data outside Indonesia. Where this happens we will take the measures required by UU PDP, including ensuring an adequate level of protection or appropriate safeguards.",
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep data",
      blocks: [
        {
          p: "We keep personal data for as long as your account is active and as needed to provide the service. When you close your account we delete or anonymise your data within a reasonable period, except where we must retain it to meet legal, tax or dispute-resolution obligations. [Specific retention periods to be confirmed.]",
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      blocks: [
        {
          p: "We use technical and organisational measures to protect personal data, including hashed passwords, a signed HttpOnly session cookie and role-based access controls. No system is completely secure; if a personal data breach occurs, we will notify affected users and the relevant authority as required by UU PDP.",
        },
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      blocks: [
        { p: "Subject to UU PDP, you have the right to:" },
        {
          ul: [
            "obtain information about how your personal data is processed;",
            "access and obtain a copy of your personal data;",
            "correct inaccurate or incomplete data;",
            "request deletion of your data or end its processing;",
            "withdraw consent you have given;",
            "object to decisions based solely on automated processing;",
            "restrict or suspend processing;",
            "receive your data in a commonly used format.",
          ],
        },
        {
          p: `You can update most profile data yourself from your account settings. For other requests, email ${SUPPORT}. We may need to verify your identity before acting on a request.`,
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          p: "MarketIn is intended for people aged 18 and over. We do not knowingly collect personal data from children. If you believe a child has created an account, please contact us so we can remove it.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      blocks: [
        {
          p: "We use a single session cookie, only to keep you signed in. We do not use analytics or advertising cookies. See our Cookie Policy for details.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          p: "We will post any changes on this page with a new “last updated” date and notify you of material changes before they take effect.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [{ p: `For privacy questions or requests, contact ${SUPPORT}. [Data protection officer contact to be confirmed, if required under UU PDP.]` }],
    },
  ],
};

/* --------------------------------- Cookies --------------------------------- */

export const COOKIES: LegalDocument = {
  title: "Cookie Policy",
  description: "MarketIn uses a single session cookie for authentication and no tracking cookies.",
  intro: "MarketIn keeps cookies to the minimum needed to run the service: one cookie that keeps you signed in.",
  lastUpdated: "2026-11-04",
  sections: [
    {
      id: "what",
      title: "What cookies are",
      blocks: [
        {
          p: "Cookies are small text files that a website stores in your browser. They let the site remember information between page loads, such as whether you are signed in.",
        },
      ],
    },
    {
      id: "we-use",
      title: "Cookies we use",
      blocks: [
        {
          table: {
            head: ["Name", "Type", "Purpose", "Duration"],
            rows: [
              [
                "marketin_session",
                "Strictly necessary",
                "Keeps you signed in and identifies your account on each request. Signed, HttpOnly and not readable by page scripts.",
                "Up to 14 days, or until you sign out",
              ],
            ],
          },
        },
        {
          p: "Because this cookie is strictly necessary to provide the service you request, it does not require consent. It is only set when you sign in or register.",
        },
      ],
    },
    {
      id: "not-used",
      title: "What we do not use",
      blocks: [
        {
          p: "We currently do not use analytics, advertising, social media or other third-party tracking cookies, and we do not use tracking pixels to follow you across other websites.",
        },
      ],
    },
    {
      id: "manage",
      title: "Managing cookies",
      blocks: [
        {
          p: "You can delete or block cookies in your browser settings. If you block the session cookie you will still be able to browse public pages, but you will not be able to sign in.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          p: "If we introduce any non-essential cookies in future, we will update this policy and ask for your consent before setting them.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [{ p: `Questions about cookies can be sent to ${SUPPORT}.` }],
    },
  ],
};
