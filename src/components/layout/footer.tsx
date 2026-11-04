import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SocialIcon } from "@/components/brand/social-icons";
import type { SocialPlatform } from "@/lib/types";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/for-business", label: "For Business" },
      { href: "/for-sales-partners", label: "For Sales Partners" },
      { href: "/for-creators", label: "For Creators" },
      { href: "/for-agencies", label: "For Agencies" },
      { href: "/marketplace", label: "Explore Opportunities" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About MarketIn" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
      { href: "/partnership", label: "Partnership" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/insights", label: "Business Insights" },
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  },
];

// Replace with MarketIn's official handles before launch.
const SOCIALS: { platform: SocialPlatform; label: string; href: string }[] = [
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/" },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-900 bg-navy-950 text-navy-100">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo inverted />
            <p className="mt-4 text-sm leading-relaxed text-navy-200">
              The business growth & partnership marketplace connecting businesses with sales partners, distributors,
              affiliates, KOLs and agencies.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`MarketIn on ${s.label}`}
                  className="flex size-9 items-center justify-center rounded-md border border-white/10 text-navy-100 transition-colors hover:border-brand-400 hover:text-white"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-navy-200 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-navy-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MarketIn. All rights reserved.</p>
          <p>Where Businesses Meet Growth Opportunities.</p>
        </div>
      </div>
    </footer>
  );
}
