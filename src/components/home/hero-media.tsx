"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";
import { SocialIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

// Real footage from Pexels (see /public/media/CREDITS.md).
const CLIPS: { key: string; video: string; poster: string; label: string; line: string; icon: Icon3DName }[] = [
  {
    key: "business",
    video: "/media/hero-business.mp4",
    poster: "/media/hero-business.jpg",
    label: "Businesses",
    line: "Find the partners who grow your market.",
    icon: "office_building",
  },
  {
    key: "distribution",
    video: "/media/hero-distribution.mp4",
    poster: "/media/hero-distribution.jpg",
    label: "Sales & distribution",
    line: "Reps and distributors who move product.",
    icon: "delivery_truck",
  },
  {
    key: "creator",
    video: "/media/hero-creator.mp4",
    poster: "/media/hero-creator.jpg",
    label: "Creators & KOLs",
    line: "Voices that bring your brand to life.",
    icon: "video_camera",
  },
];

const CLIP_MS = 7000;

export function HeroMedia() {
  const [active, setActive] = useState(0);
  // Video only on wider screens without reduced motion; otherwise posters.
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");
  const [reduced, setReduced] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setReduced(motion.matches);
      setMode(!motion.matches && wide.matches ? "video" : "still");
    };
    update();
    motion.addEventListener("change", update);
    wide.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, []);

  // Advance automatically unless the visitor prefers reduced motion.
  useEffect(() => {
    if (reduced || mode === "pending") return;
    const t = setTimeout(() => setActive((i) => (i + 1) % CLIPS.length), CLIP_MS);
    return () => clearTimeout(t);
  }, [active, reduced, mode]);

  // Play only the active clip; rewind it so each turn starts fresh.
  useEffect(() => {
    if (mode !== "video") return;
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, [active, mode]);

  const clip = CLIPS[active];

  return (
    <div className="relative mx-auto w-full text-left">
      <div aria-hidden className="absolute inset-x-10 -bottom-8 top-12 rounded-[3rem] bg-brand-400/35 blur-3xl" />

      <div className="glass-strong relative rounded-[2rem] p-2">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-brand-100 sm:aspect-[16/9]"
          role="region"
          aria-roledescription="carousel"
          aria-label="MarketIn in action"
        >
          {CLIPS.map((c, i) => (
            <div
              key={c.key}
              className={cn("absolute inset-0 transition-opacity duration-1000", i === active ? "opacity-100" : "opacity-0")}
              aria-hidden={i !== active}
            >
              {mode === "video" ? (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  src={c.video}
                  poster={c.poster}
                  muted
                  playsInline
                  loop
                  preload={i === 0 ? "auto" : "metadata"}
                  className="size-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- poster swap is purely decorative
                <img
                  src={c.poster}
                  alt=""
                  className={cn("size-full object-cover", !reduced && i === active && "motion-safe:animate-[ken-burns_8s_ease-out_both]")}
                />
              )}
            </div>
          ))}

          {/* Legibility gradient */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          {/* Caption */}
          <div className="absolute inset-x-3 bottom-3 flex flex-col gap-3 sm:inset-x-5 sm:bottom-5 sm:flex-row sm:items-end sm:justify-between">
            <div
              key={clip.key}
              className="flex items-center gap-3 self-start rounded-3xl border border-white/60 bg-white/80 py-2 pl-2 pr-4 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.4)] backdrop-blur-xl motion-safe:animate-rise"
            >
              <Icon3D name={clip.icon} size={44} float={false} />
              <div>
                <p className="text-sm font-semibold text-ink">{clip.label}</p>
                <p className="text-[13px] text-subtle">{clip.line}</p>
              </div>
            </div>

            <div className="flex gap-1.5 self-start sm:self-end" role="tablist" aria-label="Choose clip">
              {CLIPS.map((c, i) => (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show ${c.label}`}
                  onClick={() => setActive(i)}
                  className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/45 backdrop-blur-sm transition-colors hover:bg-white/70"
                >
                  {i === active && (
                    <span
                      key={`${c.key}-${active}`}
                      className={cn("absolute inset-y-0 left-0 rounded-full bg-white", reduced ? "w-full" : "animate-[progress_7s_linear_forwards]")}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating product cards (illustrative sample data) */}
      <div className="glass-strong absolute -left-4 top-10 hidden w-56 rounded-3xl p-4 motion-safe:animate-float lg:-left-14 lg:block">
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

      <div className="glass-strong absolute -right-4 top-24 hidden w-60 rounded-3xl p-4 motion-safe:animate-float-slow lg:-right-14 lg:block">
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
