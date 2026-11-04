import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CtaLink = { label: string; href: string };

/** Closing call-to-action band: orange glass panel, centered. */
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
    <section className={cn("px-4 py-16 sm:py-20", className)}>
      <div className="container-page">
        <div className="glass-orange relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-[30px] font-semibold leading-tight sm:text-[38px]">{title}</h2>
            {description && <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">{description}</p>}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={primary.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-brand-700 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5"
              >
                {primary.label} <ArrowRight className="size-4" />
              </Link>
              {secondary && (
                <Link
                  href={secondary.href}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/50 bg-white/15 px-6 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
