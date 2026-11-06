import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon3D } from "@/components/brand/icon-3d";
import { SectionHeading } from "@/components/ui/primitives";

const SEGMENTS = [
  {
    title: "For Business",
    lead: "Find the right partners to expand your business.",
    icon: "office_building" as const,
    benefits: ["Sales reps & distributors", "Affiliates, KOLs and agencies", "Publish and manage opportunities"],
    cta: "Find partners",
    href: "/for-business",
  },
  {
    title: "For Sales Partners",
    lead: "Turn your network and sales expertise into opportunities.",
    icon: "chart_increasing" as const,
    benefits: ["Commission-based opportunities", "Products to distribute by region", "A professional sales portfolio"],
    cta: "Find opportunities",
    href: "/for-sales-partners",
  },
  {
    title: "For Affiliates & KOLs",
    lead: "Connect with brands and monetize your audience.",
    icon: "video_camera" as const,
    benefits: ["Paid campaigns & affiliate programs", "Showcase channels & audience", "Manage all applications"],
    cta: "Browse campaigns",
    href: "/for-creators",
  },
  {
    title: "For Agencies",
    lead: "Manage your network and unlock more partnerships.",
    icon: "busts_in_silhouette" as const,
    benefits: ["One roster for every talent", "Business opportunity inbox", "Team & partnership pipelines"],
    cta: "Register your agency",
    href: "/for-agencies",
  },
];

export function Segments() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Who it's for"
          title="One Platform. Different Ways to Grow."
          description="Whether you're looking for new business opportunities or searching for the right people to grow your business, MarketIn brings everyone together."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENTS.map((s, i) => {
            return (
              <Link key={s.title} href={s.href} className="glass glass-interactive group flex flex-col items-center rounded-[1.75rem] p-7 text-center">
                <Icon3D name={s.icon} size={76} delay={i * 1.3} />
                <h3 className="mt-5 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{s.lead}</p>
                <ul className="mt-6 w-full space-y-2.5 border-t border-black/5 pt-6">
                  {s.benefits.map((b) => (
                    <li key={b} className="text-[13px] leading-snug text-ink">
                      <span aria-hidden className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-brand-500" />
                      {b}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-500 group-hover:text-white">
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
