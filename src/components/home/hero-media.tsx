import { BadgeCheck } from "lucide-react";
import { SocialIcon } from "@/components/brand/social-icons";

/** Hero footage from Pexels (see /public/media/CREDITS.md). */
export function HeroMedia() {
  return (
    <div className="relative mx-auto w-full text-left">
      <div aria-hidden className="absolute inset-x-10 -bottom-8 top-12 rounded-[3rem] bg-brand-400/35 blur-3xl" />

      <div className="glass-strong relative rounded-[2rem] p-2">
        {/* Phones and reduced-motion visitors match no source, so they only get the poster. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-skyline.jpg"
          aria-hidden
          className="aspect-[4/5] w-full rounded-[1.6rem] bg-brand-100 object-cover sm:aspect-[16/9]"
        >
          <source src="/media/hero-skyline.mp4" type="video/mp4" media="(min-width: 768px) and (prefers-reduced-motion: no-preference)" />
        </video>
      </div>

      {/* Floating product cards (illustrative sample data) */}
      <div className="glass-strong absolute -left-14 top-10 hidden w-56 rounded-3xl p-4 motion-safe:animate-float xl:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">DP</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
              Dimas Pratama <BadgeCheck className="size-3.5 fill-brand-500 text-white" />
            </p>
            <p className="truncate text-[11px] text-subtle">Sales partner · Surabaya</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-[11px]">
          <span className="text-subtle">Application</span>
          <span className="rounded-full bg-brand-500 px-2 py-0.5 font-semibold text-white">Shortlisted</span>
        </div>
      </div>

      <div className="glass-strong absolute -right-14 top-24 hidden w-60 rounded-3xl p-4 motion-safe:animate-float-slow xl:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-xs font-semibold text-white">NK</span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Nadia Kusuma</p>
            <p className="text-[11px] text-subtle">KOL · Beauty & Lifestyle</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/70 py-1 text-[11px] text-ink">
            <SocialIcon platform="instagram" className="size-3" /> 128K
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/70 py-1 text-[11px] text-ink">
            <SocialIcon platform="tiktok" className="size-3" /> 214K
          </span>
          <span className="flex flex-1 items-center justify-center rounded-full bg-brand-500 py-1 text-[11px] font-semibold text-white">4.6% ER</span>
        </div>
      </div>
    </div>
  );
}
