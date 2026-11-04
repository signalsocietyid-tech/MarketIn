import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaLink = { label: string; href: string };

/** Closing call-to-action band: navy surface, single orange primary action. */
export function CtaBand({
  title,
  description,
  primary,
  secondary,
  className,
}: {
  title: string;
  description?: string;
  primary: CtaLink;
  secondary?: CtaLink;
  className?: string;
}) {
  return (
    <section className={cn("py-16 sm:py-20", className)}>
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-12 sm:px-12 sm:py-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-[26px] font-bold leading-tight text-white sm:text-[32px]">{title}</h2>
              {description && <p className="mt-3 text-base leading-relaxed text-navy-100">{description}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight />
                </Link>
              </Button>
              {secondary && (
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="border border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
