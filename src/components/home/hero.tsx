import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "./hero-visual";

const TRUST = ["Free registration", "Multiple partnership opportunities", "Built for businesses and professionals"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]" />
      <div className="container-page relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="max-w-xl">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[13px] text-subtle shadow-xs transition-colors hover:border-brand-200"
          >
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">New</span>
            One Platform. Multiple Growth Opportunities.
            <ArrowRight className="size-3.5" />
          </Link>
          <h1 className="mt-6 text-[40px] font-extrabold leading-[1.08] text-navy-900 sm:text-5xl lg:text-[56px]">
            Grow Your Business Through the <span className="text-brand-500">Right Connections.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-subtle sm:text-lg">
            Find trusted sales partners, distributors, affiliates, KOLs, and agencies to accelerate your business growth —
            all in one platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Get Started for Free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/marketplace">Explore Opportunities</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-subtle sm:flex-row sm:flex-wrap sm:gap-x-6">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-success-50">
                  <Check className="size-3 text-success-700" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:pl-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
