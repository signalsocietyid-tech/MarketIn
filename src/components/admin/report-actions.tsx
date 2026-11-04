"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, Check, ExternalLink, Flag, FlagOff, Lock, MoreHorizontal, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { moderateOpportunity, resolveReport, setAccountStatus } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import type { AccountStatus, OpportunityStatus } from "@/lib/types";
import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  report: {
    id: string;
    status: "open" | "resolved" | "dismissed";
    targetType: "user" | "opportunity";
    targetId: string;
    target: {
      label: string;
      href: string | null;
      exists: boolean;
      userId?: string;
      userStatus?: AccountStatus;
      opportunityFlagged?: boolean;
      opportunityStatus?: OpportunityStatus;
    };
  };
};

export function ReportActions({ report: r }: Props) {
  const { run, pending } = useAction();
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const t = r.target;
  const userLabel = r.targetType === "user" ? "reported user" : "listing owner";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {r.status === "open" ? (
        <>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => resolveReport(r.id, "resolved"))}>
            <Check className="text-success-600" /> Resolve
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => resolveReport(r.id, "dismissed"))}>
            Dismiss
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => resolveReport(r.id, "open"))}>
          <RotateCcw /> Reopen
        </Button>
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Moderation actions" disabled={pending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {t.href && (
            <DropdownMenuItem asChild>
              <Link href={t.href}>
                <ExternalLink /> Open {r.targetType === "user" ? "profile" : "listing"}
              </Link>
            </DropdownMenuItem>
          )}
          {r.status === "open" && (
            <DropdownMenuItem onSelect={() => run(() => resolveReport(r.id, "dismissed"))}>
              <X /> Dismiss report
            </DropdownMenuItem>
          )}

          {r.targetType === "opportunity" && t.exists && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Listing</DropdownMenuLabel>
              {t.opportunityFlagged ? (
                <DropdownMenuItem onSelect={() => run(() => moderateOpportunity(r.targetId, "unflag"))}>
                  <FlagOff /> Clear listing flag
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem destructive onSelect={() => run(() => moderateOpportunity(r.targetId, "flag"))}>
                  <Flag /> Flag listing (hide from search)
                </DropdownMenuItem>
              )}
              {t.opportunityStatus !== "closed" && (
                <DropdownMenuItem destructive onSelect={() => run(() => moderateOpportunity(r.targetId, "close"))}>
                  <Lock /> Close listing
                </DropdownMenuItem>
              )}
            </>
          )}

          {t.userId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{r.targetType === "user" ? "Reported user" : "Listing owner"}</DropdownMenuLabel>
              {t.userStatus !== "flagged" && (
                <DropdownMenuItem onSelect={() => run(() => setAccountStatus(t.userId!, "flagged"))}>
                  <Flag /> Flag {userLabel}
                </DropdownMenuItem>
              )}
              {t.userStatus !== "active" && (
                <DropdownMenuItem onSelect={() => run(() => setAccountStatus(t.userId!, "active"))}>
                  <Check /> Reactivate {userLabel}
                </DropdownMenuItem>
              )}
              {t.userStatus !== "suspended" && (
                <DropdownMenuItem destructive onSelect={() => setConfirmSuspend(true)}>
                  <Ban /> Suspend {userLabel}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {t.userId && (
        <ConfirmDialog
          open={confirmSuspend}
          onOpenChange={setConfirmSuspend}
          title={`Suspend the ${userLabel}?`}
          description="The account is signed out immediately and hidden from the marketplace."
          confirmLabel="Suspend account"
          pending={pending}
          onConfirm={() => run(() => setAccountStatus(t.userId!, "suspended"), { onSuccess: () => setConfirmSuspend(false) })}
        >
          <p>
            Suspending does not resolve this report. Resolve it separately once moderation is complete. The account can be
            reactivated from Users &amp; verification.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
