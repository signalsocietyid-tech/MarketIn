import Link from "next/link";
import { CalendarDays, Globe, MapPin, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Badge } from "@/components/ui/primitives";
import { ProBadge, VerifiedMark } from "@/components/shared/status-badge";
import type { ProfileView } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";
import { displayUrl, safeUrl } from "./safe-url";

export function ProfileHeader({
  profile: p,
  isOwn,
  actions,
}: {
  profile: ProfileView;
  isOwn: boolean;
  /** Save / report controls for other viewers. */
  actions?: React.ReactNode;
}) {
  const square = p.role === "business" || p.role === "agency";
  const website = safeUrl(p.website);
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={p.name} src={p.avatarUrl} size={80} square={square} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-navy-900 sm:text-[28px]">{p.name}</h1>
                {p.verified && <VerifiedMark className="size-5" />}
                {p.pro && <ProBadge />}
              </div>
              <p className="mt-1 text-[15px] text-subtle">{p.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-subtle">
                <Badge tone="neutral">{p.roleLabel}</Badge>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted" /> {p.location}
                </span>
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-700 hover:underline"
                  >
                    <Globe className="size-3.5" /> {displayUrl(website)}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5 text-muted" /> Member since{" "}
                  {formatDate(p.joinedAt, { month: "long", year: "numeric" })}
                </span>
                {p.rating.count > 0 && (
                  <a href="#reviews" className="flex items-center gap-1 hover:text-ink">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-ink">{p.rating.average.toFixed(1)}</span> ({p.rating.count})
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isOwn ? (
              <Button asChild variant="secondary">
                <Link href="/profile">
                  <Pencil /> Edit profile
                </Link>
              </Button>
            ) : (
              actions
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {p.stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-4">
              <dt className="text-xs text-subtle">{s.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-navy-900">{s.value}</dd>
            </div>
          ))}
          <div className="bg-white px-4 py-4">
            <dt className="text-xs text-subtle">Rating</dt>
            <dd className="mt-1 text-lg font-semibold text-navy-900">
              {p.rating.count > 0 ? (
                <>
                  {p.rating.average.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-subtle">/ 5</span>
                </>
              ) : (
                <span className="text-sm font-normal text-muted">No reviews yet</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
