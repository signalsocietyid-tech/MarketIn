import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroMedia } from "./hero-media";

const TRUST = ["Free registration", "Multiple partnership opportunities", "Built for businesses and professionals"];

export function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-16 text-center sm:pt-24">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/how-it-works"
          className="glass glass-interactive mx-auto inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[13px] text-subtle motion-safe:animate-rise"
        >
          <span className="rounded-full bg-gradient-to-b from-brand-400 to-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white">New</span>
          One Platform. Multiple Growth Opportunities.
          <ArrowRight className="size-3.5" />
        </Link>

        <h1 className="mx-auto mt-8 max-w-4xl text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink motion-safe:animate-rise sm:text-6xl lg:text-[80px]">
          Grow Your Business Through the <span className="text-gradient-brand">Right Connections.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-subtle motion-safe:animate-rise sm:text-xl">
          Find trusted sales partners, distributors, affiliates, KOLs, and agencies to accelerate your business growth — all in
          one platform.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 motion-safe:animate-rise sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/register">
              Get Started for Free <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link href="/marketplace">Explore Opportunities</Link>
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {TRUST.map((t) => (
            <li key={t} className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] text-subtle">
              <Check className="size-3.5 text-brand-600" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <HeroMedia />
      </div>
    </section>
  );
}
