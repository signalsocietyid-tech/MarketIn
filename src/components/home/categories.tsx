import Link from "next/link";
import { ArrowRight, Handshake, Megaphone, TrendingUp, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";

type Example = { title: string; meta: string; comp: string };

const CATEGORIES: { id: string; title: string; description: string; href: string; icon: LucideIcon; examples: Example[] }[] = [
  {
    id: "sales",
    title: "Sales & Distribution",
    description: "Connect with businesses looking for sales representatives, agents, and distributors across different regions.",
    href: "/marketplace/sales",
    icon: TrendingUp,
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
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Marketplace"
          title="Explore Growth Opportunities."
          description="Three marketplaces, one account. Every listing shows its compensation model, requirements and deliverables up front."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="glass flex flex-col items-center rounded-[1.75rem] p-6 text-center sm:p-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_12px_24px_-10px_rgb(244_119_53/0.8)]">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-subtle">{c.description}</p>
                <ul className="mt-6 w-full space-y-2">
                  {c.examples.map((e) => (
                    <li key={e.title} className="glass-interactive rounded-2xl border border-white/70 bg-white/55 px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{e.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {e.meta} · <span className="font-medium text-brand-700">{e.comp}</span>
                      </p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={c.href}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-400 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(244_119_53/0.7)] transition-transform hover:-translate-y-0.5"
                >
                  Explore Opportunities <ArrowRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Example listing formats. Browse the marketplace for current opportunities.</p>
      </div>
    </section>
  );
}
