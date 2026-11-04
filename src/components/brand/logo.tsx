import Link from "next/link";
import { cn } from "@/lib/utils";

/** MarketIn mark: two connected nodes forming an upward "M" path. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#17365D" />
      <path d="M8 22V12.5l8 6 8-8.5V22" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10" r="3.2" fill="#F47735" />
    </svg>
  );
}

export function Logo({ href = "/", className, inverted }: { href?: string; className?: string; inverted?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label="MarketIn home">
      <LogoMark />
      <span className={cn("font-display text-[19px] font-bold tracking-tight", inverted ? "text-white" : "text-navy-900")}>
        Market<span className="text-brand-500">In</span>
      </span>
    </Link>
  );
}
