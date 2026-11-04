import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialIcon } from "@/components/brand/social-icons";
import type { SocialPlatform } from "@/lib/types";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/for-business", label: "For Business" },
      { href: "/for-sales-partners", label: "For Sales Partners" },
      { href: "/for-creators", label: "For KOL & Creators" },
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
    <footer className="relative mt-10 overflow-hidden px-3 pb-6 sm:px-4">
      <div className="mx-auto max-w-6xl">
        {/* Call to action */}
        <div className="glass-orange relative overflow-hidden rounded-[2rem] px-6 py-12 text-center text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="relative">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">Free to get started</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-[40px]">Your Next Growth Opportunity Is Waiting.</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">Join MarketIn and start building meaningful partnerships.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-brand-700 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5"
              >
                Join MarketIn for Free <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/50 bg-white/15 px-6 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
              >
                Explore opportunities
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="glass relative mt-4 overflow-hidden rounded-[2rem] px-6 pb-8 pt-12 sm:px-10">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-subtle">
              The business growth & partnership marketplace connecting businesses with sales partners, distributors,
              affiliates, KOLs and agencies.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`MarketIn on ${s.label}`}
                  className="flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-ink/70 shadow-[inset_0_1px_0_white,0_6px_16px_-8px_rgb(244_119_53/0.5)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:text-brand-600"
                >
                  <SocialIcon platform={s.platform} className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 text-center sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-subtle transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 border-t border-black/5 pt-6 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
            <p>© {new Date().getFullYear()} MarketIn. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Built for growing businesses in Indonesia
            </p>
          </div>

          {/* Oversized wordmark */}
          <p
            aria-hidden
            className="pointer-events-none mt-6 select-none text-center font-display text-[18vw] font-bold leading-[0.8] tracking-[-0.06em] text-transparent sm:text-[150px]"
            style={{ WebkitTextStroke: "1px rgb(244 119 53 / 0.18)", backgroundImage: "linear-gradient(180deg, rgb(244 119 53 / 0.14), transparent)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
          >
            MarketIn
          </p>
        </div>
      </div>
    </footer>
  );
}
