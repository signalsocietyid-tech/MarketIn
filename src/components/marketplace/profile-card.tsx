import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Avatar, Badge } from "@/components/ui/primitives";
import { ProBadge, VerifiedMark } from "@/components/shared/status-badge";
import { SocialIcon } from "@/components/brand/social-icons";
import { SaveButton } from "./save-button";
import type { ProfileView } from "@/lib/data/queries";
import { formatCompact } from "@/lib/utils";

export function ProfileCard({
  profile: p,
  saved = false,
  signedIn = false,
  showSave = true,
}: {
  profile: ProfileView;
  saved?: boolean;
  signedIn?: boolean;
  showSave?: boolean;
}) {
  return (
    <article className="glass glass-interactive group relative flex h-full flex-col rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={p.name} src={p.avatarUrl} size={48} square={p.role === "business" || p.role === "agency"} />
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 font-sans text-[15px] font-semibold tracking-normal text-ink">
              <Link href={`/profiles/${p.id}`} className="truncate after:absolute after:inset-0 focus-visible:outline-none">
                {p.name}
              </Link>
              {p.verified && <VerifiedMark />}
            </h3>
            <p className="truncate text-[13px] text-subtle">{p.headline}</p>
          </div>
        </div>
        {showSave && <SaveButton targetType="profile" targetId={p.id} initialSaved={saved} signedIn={signedIn} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-subtle">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5 text-muted" /> {p.location}
        </span>
        {p.rating.count > 0 ? (
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-ink">{p.rating.average.toFixed(1)}</span> ({p.rating.count})
          </span>
        ) : (
          <span className="text-muted">No reviews yet</span>
        )}
        {p.pro && <ProBadge />}
      </div>

      {p.creator && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.creator.socials.map((s) => (
            <span key={s.platform} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-ink">
              <SocialIcon platform={s.platform} className="size-3.5 text-subtle" />
              {formatCompact(s.followers)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.tags.slice(0, 4).map((t) => (
          <Badge key={t} tone="neutral">
            {t}
          </Badge>
        ))}
      </div>

      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
        {p.stats.map((s) => (
          <div key={s.label}>
            <dd className="text-sm font-semibold text-navy-900">{s.value}</dd>
            <dt className="mt-0.5 text-[11px] leading-tight text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
    </article>
  );
}
