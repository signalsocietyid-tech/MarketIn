"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, MoreHorizontal, Pause, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Badge, type BadgeTone, Card } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/overlays";
import { VerifiedMark } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReviewDialog } from "./review-dialog";
import { setPartnershipStatus } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";
import type { ProfileView } from "@/lib/data/queries";
import type { Opportunity, Partnership, PartnershipMetrics } from "@/lib/types";
import { formatCompact, formatDate, formatIDRShort } from "@/lib/utils";

export type PartnershipItem = Partnership & {
  opportunity: Pick<Opportunity, "id" | "title" | "companyName" | "category">;
  counterpart: ProfileView | null;
  reviewed: boolean;
};

const STATUS_META: Record<Partnership["status"], { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  completed: { label: "Completed", tone: "navy" },
};

const METRICS: { key: keyof PartnershipMetrics; label: string; format: (n: number) => string }[] = [
  { key: "revenue", label: "Revenue", format: formatIDRShort },
  { key: "leads", label: "Leads", format: (n) => n.toLocaleString("id-ID") },
  { key: "conversions", label: "Conversions", format: (n) => n.toLocaleString("id-ID") },
  { key: "contentPieces", label: "Content pieces", format: (n) => n.toLocaleString("id-ID") },
  { key: "reach", label: "Reach", format: formatCompact },
];

export function PartnershipCard({ partnership: p }: { partnership: PartnershipItem }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const status = STATUS_META[p.status];
  const c = p.counterpart;
  const metrics = METRICS.filter((m) => p.metrics[m.key] > 0);
  const canReview = !p.reviewed && !!c;

  const update = (next: Partnership["status"], after?: () => void) =>
    run(() => setPartnershipStatus(p.id, next), {
      onSuccess: () => {
        after?.();
        router.refresh();
      },
    });

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>
              <span className="size-1.5 rounded-full bg-current opacity-70" />
              {status.label}
            </Badge>
            {p.reviewed && (
              <Badge tone="outline">
                <Star /> Reviewed
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-sans text-[15px] font-semibold leading-snug tracking-normal text-ink">
            <Link href={`/opportunities/${p.opportunity.id}`} className="hover:text-brand-700 hover:underline underline-offset-2">
              {p.opportunity.title}
            </Link>
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Partnership actions" loading={pending}>
              {!pending && <MoreHorizontal />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {p.status === "active" && (
              <DropdownMenuItem onSelect={() => update("paused")}>
                <Pause /> Pause partnership
              </DropdownMenuItem>
            )}
            {p.status === "paused" && (
              <DropdownMenuItem onSelect={() => update("active")}>
                <Play /> Resume partnership
              </DropdownMenuItem>
            )}
            {p.status !== "completed" && (
              <DropdownMenuItem onSelect={() => setConfirmComplete(true)}>
                <CheckCircle2 /> Mark completed
              </DropdownMenuItem>
            )}
            {p.status !== "completed" && canReview && <DropdownMenuSeparator />}
            {canReview && (
              <DropdownMenuItem onSelect={() => setReviewOpen(true)}>
                <Star /> Leave review
              </DropdownMenuItem>
            )}
            {p.status === "completed" && !canReview && (
              <DropdownMenuItem asChild>
                <Link href={`/opportunities/${p.opportunity.id}`}>View opportunity</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {c ? (
        <Link href={`/profiles/${c.id}`} className="mt-4 flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors hover:bg-canvas">
          <Avatar name={c.name} src={c.avatarUrl} size={36} square={c.role === "business" || c.role === "agency"} />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-medium text-ink">
              <span className="truncate">{c.name}</span>
              {c.verified && <VerifiedMark className="size-3.5" />}
            </p>
            <p className="truncate text-xs text-subtle">
              {c.roleLabel} · {c.location}
            </p>
          </div>
        </Link>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm text-muted">Counterpart account no longer available</p>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-subtle">
        <CalendarDays className="size-3.5 text-muted" />
        {formatDate(p.startDate)} – {p.endDate ? formatDate(p.endDate) : "ongoing"}
      </p>

      <div className="mt-auto pt-4">
        {metrics.length ? (
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.key} className="rounded-lg bg-canvas px-3 py-2">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{m.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-navy-900">{m.format(p.metrics[m.key])}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="rounded-lg bg-canvas px-3 py-2.5 text-[13px] text-muted">No results reported yet.</p>
        )}
        {canReview && p.status === "completed" && (
          <Button variant="soft" size="sm" className="mt-3 w-full" onClick={() => setReviewOpen(true)}>
            <Star /> Leave a review for {c.name}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmComplete}
        onOpenChange={setConfirmComplete}
        title="Mark partnership as completed?"
        description="This closes the partnership and marks the related application as completed. Both sides can still leave a review."
        confirmLabel="Mark completed"
        variant="primary"
        pending={pending}
        onConfirm={() => update("completed", () => setConfirmComplete(false))}
      />
      {c && <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} partnershipId={p.id} counterpartName={c.name} />}
    </Card>
  );
}
