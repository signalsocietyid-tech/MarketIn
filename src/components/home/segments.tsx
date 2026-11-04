import Link from "next/link";
import { ArrowRight, Building2, Check, Megaphone, Network, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    title: "For Business",
    lead: "Find the right partners to expand your business.",
    icon: Building2,
    accent: "bg-navy-800 text-white",
    benefits: ["Independent sales reps & distributors", "Affiliates, KOLs and agencies", "Publish and manage opportunities"],
    cta: "Find partners",
    href: "/for-business",
  },
  {
    title: "For Sales Partners",
    lead: "Turn your network and sales expertise into opportunities.",
    icon: TrendingUp,
    accent: "bg-brand-500 text-white",
    benefits: ["Commission-based opportunities", "Products to distribute by region", "A professional sales portfolio"],
    cta: "Find opportunities",
    href: "/for-sales-partners",
  },
  {
    title: "For Affiliates & KOLs",
    lead: "Connect with brands and monetize your audience.",
    icon: Megaphone,
    accent: "bg-blue-500 text-white",
    benefits: ["Paid campaigns & affiliate programs", "Showcase channels & audience", "Manage all applications"],
    cta: "Browse campaigns",
    href: "/for-creators",
  },
  {
    title: "For Agencies",
    lead: "Manage your network and unlock more partnerships.",
    icon: Network,
    accent: "bg-navy-950 text-white",
    benefits: ["One roster for every talent", "Business opportunity inbox", "Team & partnership pipelines"],
    cta: "Register your agency",
    href: "/for-agencies",
  },
];

export function Segments() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Who it's for"
          title="One Platform. Different Ways to Grow."
          description="Whether you're looking for new business opportunities or searching for the right people to grow your business, MarketIn brings everyone together."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENTS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                href={s.href}
                className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-lift"
              >
                <span className={cn("flex size-10 items-center justify-center rounded-lg", s.accent)}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-sans text-lg font-semibold tracking-tight text-navy-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{s.lead}</p>
                <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                  {s.benefits.map((b) => (
                    <li key={b} className="flex gap-2 text-[13px] text-ink">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> {b}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  {s.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
