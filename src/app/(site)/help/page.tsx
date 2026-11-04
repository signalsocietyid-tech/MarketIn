import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Briefcase, Building2, Megaphone, Store } from "lucide-react";
import { InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CONTACT_EMAILS, mailto } from "@/content/contact";
import { FAQ_GROUPS } from "@/content/faq";
import { SEGMENT_CONTENT } from "@/content/segments";
import type { Segment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Getting-started guides for businesses, sales partners, creators and agencies, plus account, billing and safety basics for MarketIn.",
};

const GUIDES: { segment: Segment; icon: typeof Store; title: string; steps: string[] }[] = [
  {
    segment: "business",
    icon: Store,
    title: "Businesses",
    steps: [
      "Register with the Business account type.",
      "Complete your company profile: industry, location, website and description.",
      "Publish your first opportunity from the dashboard, or search the partner directory.",
      "Review applications and update their status as you go.",
      "Accept a partner to open a partnership and track it from your dashboard.",
    ],
  },
  {
    segment: "sales",
    icon: Briefcase,
    title: "Sales Partners",
    steps: [
      "Register with the Sales Partner account type.",
      "Add your experience, industries, specializations and areas of operation.",
      "Browse the Sales & Distribution marketplace and save listings you like.",
      "Apply with a short message about your network and results.",
      "Track application statuses from your dashboard.",
    ],
  },
  {
    segment: "creator",
    icon: Megaphone,
    title: "Creators & Affiliates",
    steps: [
      "Register with the Creator & Affiliate account type.",
      "Choose your creator categories and niches.",
      "Add each social account with its handle, link and follower count.",
      "Browse affiliate programs and KOL campaigns and apply.",
      "Request verification once your profile is complete to earn the badge.",
    ],
  },
  {
    segment: "agency",
    icon: Building2,
    title: "Agencies",
    steps: [
      "Register with the Agency account type.",
      "Complete your agency profile: category, services, team size and portfolio.",
      "Add the creators, affiliates and sales reps you represent to your roster.",
      "Respond to agency opportunities as the agency or on behalf of a talent.",
      "Invite team members (Agency Pro) and manage partnerships together.",
    ],
  },
];

const TOC = [
  { id: "getting-started", label: "Getting started" },
  { id: "faq", label: "Frequently asked questions" },
  { id: "account", label: "Account basics" },
  { id: "billing", label: "Plans & billing" },
  { id: "safety", label: "Safety & reporting" },
  { id: "contact", label: "Still need help?" },
];

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="Help Center"
      title="How can we help?"
      intro="Short guides to get you started on MarketIn, plus the basics of accounts, billing and safety."
      toc={TOC}
    >
      <InfoSection id="getting-started" title="Getting started" bare>
        <p className="text-[15px] leading-relaxed text-ink">Pick the guide for your account type.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {GUIDES.map(({ segment, icon: Icon, title, steps }) => (
            <div key={segment} className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-sans text-[15px] font-semibold tracking-normal text-navy-900">{title}</h3>
              </div>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-ink">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-2.5">
                    <span className="mt-px w-4 shrink-0 text-right font-semibold tabular-nums text-muted">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-sm font-medium">
                <Link href={`/register?type=${segment}`} className="text-brand-700 hover:underline">
                  Create account
                </Link>
                <Link href={SEGMENT_CONTENT[segment].path} className="text-subtle hover:text-ink hover:underline">
                  Learn more
                </Link>
              </div>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection id="faq" title="Frequently asked questions" bare>
        <ul className="divide-y divide-line rounded-xl border border-line bg-white shadow-card">
          {FAQ_GROUPS.map((g) => (
            <li key={g.id}>
              <Link href={`/faq#${g.id}`} className="group flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-canvas/60">
                <span>
                  <span className="block text-[15px] font-medium text-navy-900">{g.label}</span>
                  <span className="block text-[13px] text-subtle">{g.items.length} questions</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection id="account" title="Account basics">
        <ul>
          <li>
            <strong>One account type per registration.</strong> Choose Business, Sales Partner, Creator & Affiliate or
            Agency when you sign up. Agencies are a separate account type for organisations, not individual profiles.
          </li>
          <li>
            <strong>Editing your profile.</strong> Update your details at any time from your profile page once signed in.
          </li>
          <li>
            <strong>Password.</strong> You can change your password from Settings. If you cannot sign in, email{" "}
            <a href={mailto("support", "Sign-in problem")}>{CONTACT_EMAILS.support}</a> from the address on your account.
          </li>
          <li>
            <strong>Verification.</strong> Request verification from your account once your profile is complete. Our team reviews the information you
            provided; social account checks are currently manual.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="billing" title="Plans & billing">
        <ul>
          <li>
            <strong>Free to start.</strong> Every account type has a free plan. Current plans and prices are on the{" "}
            <Link href="/pricing">pricing page</Link>.
          </li>
          <li>
            <strong>Payments are not yet processed online.</strong> When you request a Pro plan, the request is recorded
            as pending and our team activates Pro manually once it is confirmed. You can cancel a pending request from the
            billing page in your dashboard.
          </li>
          <li>
            <strong>Downgrading.</strong> You can schedule a switch back to the free plan; it takes effect at the end of
            your current period.
          </li>
          <li>
            <strong>Payments between partners.</strong> MarketIn does not hold or transfer commissions or fees between
            users. Agree payment terms in writing with your partner.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="safety" title="Safety & reporting">
        <ul>
          <li>Read the full opportunity details, including compensation model and deliverables, before you apply.</li>
          <li>Never pay a fee to be accepted for an opportunity. Legitimate listings on MarketIn do not require it.</li>
          <li>Check verification badges and reviews, and confirm terms in writing before work starts.</li>
          <li>
            Use the report option on any listing or profile that looks misleading or unsafe. See{" "}
            <Link href="/how-it-works">how trust & safety works</Link>.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="contact" title="Still need help?" bare>
        <a
          href={mailto("support", "Help request")}
          className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy-200"
        >
          <span>
            <span className="block text-[15px] font-semibold text-navy-900">Email support</span>
            <span className="block text-sm text-subtle">
              {CONTACT_EMAILS.support} · Include your account email and a short description of the issue.
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-muted" />
        </a>
        <p className="mt-4 text-sm text-subtle">
          Other questions? See all <Link href="/contact" className="font-medium text-brand-700 hover:underline">contact options</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
