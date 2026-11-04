import Link from "next/link";
import { ArrowRight, Handshake, Megaphone, TrendingUp, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Example = { title: string; meta: string; comp: string };

const CATEGORIES: {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
  examples: Example[];
}[] = [
  {
    id: "sales",
    title: "Sales & Distribution",
    description: "Connect with businesses looking for sales representatives, agents, and distributors across different regions.",
    href: "/marketplace/sales",
    icon: TrendingUp,
    tone: "bg-navy-50 text-navy-700",
    examples: [
      { title: "Regional Sales Representative", meta: "F&B · Surabaya", comp: "Retainer + commission" },
      { title: "Distributor Partnership", meta: "FMCG · Medan", comp: "Distributor margin" },
      { title: "Independent Sales Agent", meta: "Agri-tech · Semarang", comp: "Commission-based" },
      { title: "B2B Sales Outsourcing", meta: "Industrial · East Java", comp: "Fixed fee + commission" },
    ],
  },
  {
    id: "affiliate",
    title: "Affiliate Marketing",
    description: "Discover affiliate programs and collaborate with brands through performance-based marketing.",
    href: "/marketplace/affiliate",
    icon: Handshake,
    tone: "bg-blue-50 text-blue-700",
    examples: [
      { title: "Affiliate Program", meta: "Beauty · Remote", comp: "Commission per order" },
      { title: "Product Promotion", meta: "FMCG · Live selling", comp: "Fee + commission" },
      { title: "Reseller Partnership", meta: "Beauty · Makassar", comp: "Wholesale discount" },
      { title: "Performance Marketing Campaign", meta: "SaaS · Remote", comp: "Pay per conversion" },
    ],
  },
  {
    id: "kol",
    title: "KOL & Creator Collaboration",
    description: "Find brands, paid campaigns, and content collaboration opportunities.",
    href: "/marketplace/kol",
    icon: Megaphone,
    tone: "bg-brand-50 text-brand-800",
    examples: [
      { title: "Instagram Campaign", meta: "Home & Living · Reels", comp: "Fixed fee + products" },
      { title: "TikTok Content Collaboration", meta: "F&B · 2 videos", comp: "Fixed fee" },
      { title: "UGC Production", meta: "Beauty · Ad creatives", comp: "Per content package" },
      { title: "Product Review", meta: "WFH gear · YouTube", comp: "Fixed fee + product" },
    ],
  },
];

export function Categories() {
  return (
    <section className="border-y border-line bg-white py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Marketplace"
          title="Explore Growth Opportunities."
          description="Three marketplaces, one account. Every listing shows its compensation model, requirements and deliverables up front."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="flex flex-col rounded-xl border border-line bg-canvas/50 p-6">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-lg", c.tone)}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-sans text-lg font-semibold tracking-tight text-navy-900">{c.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-subtle">{c.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {c.examples.map((e) => (
                    <li key={e.title} className="rounded-lg border border-line bg-white px-4 py-3 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{e.title}</p>
                          <p className="mt-0.5 text-xs text-muted">{e.meta}</p>
                        </div>
                        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium", c.tone)}>{e.comp}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="secondary" className="mt-6 w-full">
                  <Link href={c.href}>
                    Explore Opportunities <ArrowRight />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Example listing formats. Browse the marketplace for current opportunities.</p>
      </div>
    </section>
  );
}
