"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Star, UserRound } from "lucide-react";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { Select } from "@/components/ui/form-controls";
import { ApplicationStatusBadge, ProBadge, VerifiedMark } from "@/components/shared/status-badge";
import { updateApplicationStatus } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

export type ApplicantItem = {
  id: string;
  status: ApplicationStatus;
  message: string;
  proposedRate?: string;
  createdAt: string;
  talentName?: string;
  applicant: {
    id: string;
    name: string;
    headline: string;
    roleLabel: string;
    location: string;
    verified: boolean;
    pro: boolean;
    rating: { average: number; count: number };
    avatarUrl?: string;
  } | null;
};

export function ApplicantReview({ applications }: { applications: ApplicantItem[] }) {
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const shown = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto scrollbar-none">
        {(["all", ...APPLICATION_STATUSES] as const).map((s) => {
          const count = s === "all" ? applications.length : applications.filter((a) => a.status === s).length;
          if (s !== "all" && count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                filter === s ? "bg-white text-navy-900 shadow-xs ring-1 ring-line" : "text-subtle hover:text-ink",
              )}
            >
              {s === "all" ? "All" : APPLICATION_STATUS_LABEL[s]} <span className="ml-1 text-muted">{count}</span>
            </button>
          );
        })}
      </div>
      {shown.length ? (
        <div className="space-y-4">
          {shown.map((a) => (
            <ApplicantCard key={a.id} item={a} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={UserRound} title="No applications here" description="Applications from partners will appear here as they arrive." />
        </Card>
      )}
    </div>
  );
}

function ApplicantCard({ item }: { item: ApplicantItem }) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [status, setStatus] = useState(item.status);
  const p = item.applicant;

  const change = (next: ApplicationStatus) =>
    run(() => updateApplicationStatus(item.id, next), {
      onSuccess: () => {
        setStatus(next);
        router.refresh();
      },
    });

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={p?.name ?? "?"} src={p?.avatarUrl} size={44} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={`/profiles/${p?.id}`} className="font-semibold text-ink hover:text-brand-700">
                {p?.name}
              </Link>
              {p?.verified && <VerifiedMark />}
              {p?.pro && <ProBadge />}
            </div>
            <p className="text-[13px] text-subtle">{p?.headline}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <Badge tone="outline">{p?.roleLabel}</Badge>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {p?.location}
              </span>
              {p && p.rating.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> {p.rating.average.toFixed(1)} ({p.rating.count})
                </span>
              )}
              <span>Applied {timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ApplicationStatusBadge status={status} />
          <div className="w-40">
            <Select
              aria-label="Update application status"
              value={status}
              disabled={pending}
              onChange={(e) => change(e.target.value as ApplicationStatus)}
              className="h-9"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      {item.talentName && (
        <p className="mt-4 text-[13px] text-subtle">
          Agency proposal on behalf of <span className="font-medium text-ink">{item.talentName}</span>
        </p>
      )}
      <p className="mt-4 whitespace-pre-line rounded-lg bg-canvas px-4 py-3 text-sm leading-relaxed text-ink">{item.message}</p>
      {item.proposedRate && (
        <p className="mt-3 text-[13px] text-subtle">
          Proposed terms: <span className="font-medium text-ink">{item.proposedRate}</span>
        </p>
      )}
    </Card>
  );
}
