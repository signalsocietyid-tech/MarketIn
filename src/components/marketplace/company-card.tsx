import Link from "next/link";
import { ArrowRight, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Card, CardHeader } from "@/components/ui/primitives";
import { ProBadge, VerifiedMark } from "@/components/shared/status-badge";
import type { ProfileView } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";
import { displayUrl, safeUrl } from "./safe-url";

/** "About the company" sidebar card on the opportunity detail page. */
export function CompanyCard({ profile: p }: { profile: ProfileView }) {
  const website = safeUrl(p.website);
  return (
    <Card>
      <CardHeader title="About the company" />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Avatar name={p.name} src={p.avatarUrl} size={44} square />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              <span className="truncate">{p.name}</span>
              {p.verified && <VerifiedMark />}
            </p>
            <p className="truncate text-[13px] text-subtle">{p.headline}</p>
          </div>
        </div>
        {p.pro && (
          <div className="mt-3">
            <ProBadge />
          </div>
        )}
        <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-subtle">{p.about}</p>
        <ul className="mt-3 space-y-1.5 text-[13px] text-subtle">
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-muted" /> {p.location}
          </li>
          {website && (
            <li className="flex items-center gap-2">
              <Globe className="size-3.5 text-muted" />
              <a href={website} target="_blank" rel="noopener noreferrer" className="truncate text-brand-700 hover:underline">
                {displayUrl(website)}
              </a>
            </li>
          )}
          <li className="text-xs text-muted">Member since {formatDate(p.joinedAt, { month: "long", year: "numeric" })}</li>
        </ul>
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href={`/profiles/${p.id}`}>
            View company profile <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
