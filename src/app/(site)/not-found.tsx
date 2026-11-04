import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border border-line bg-white text-muted shadow-card">
        <Compass className="size-6" />
      </span>
      <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-subtle">
        The listing or profile may have been removed, or the link might be incorrect.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/marketplace">Explore the marketplace</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
