import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]" />
          <div className="relative">
            <LogoMark className="mx-auto size-11" />
            <h2 className="mx-auto mt-6 max-w-2xl text-[30px] font-bold leading-tight text-navy-900 sm:text-[38px]">
              Your Next Growth Opportunity Is Waiting.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[17px] text-subtle">Join MarketIn and start building meaningful partnerships.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Join MarketIn for Free <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/marketplace">Browse the marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
