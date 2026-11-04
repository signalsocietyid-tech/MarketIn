import Link from "next/link";
import { cn } from "@/lib/utils";

/** MarketIn mark: two connected nodes forming an upward "M" path. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="marketin-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9F5A" />
          <stop offset="1" stopColor="#E25E1B" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#marketin-mark)" />
      <path d="M8 22V12.5l8 6 8-8.5V22" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10" r="3.2" fill="#fff" />
    </svg>
  );
}

export function Logo({ href = "/", className, inverted }: { href?: string; className?: string; inverted?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label="MarketIn home">
      <LogoMark />
      <span className={cn("font-display text-[19px] font-semibold tracking-[-0.03em]", inverted ? "text-white" : "text-ink")}>
        Market<span className="text-brand-500">In</span>
      </span>
    </Link>
  );
}
