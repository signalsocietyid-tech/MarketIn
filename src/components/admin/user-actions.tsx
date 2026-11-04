"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Ban, Check, Clock, ExternalLink, Flag, MoreHorizontal, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { setAccountStatus, setVerification } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import type { AccountStatus, VerificationStatus } from "@/lib/types";
import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  user: { id: string; name: string; status: AccountStatus; verification: VerificationStatus };
  /** Show inline Verify / Reject buttons when verification is pending. */
  inlineVerification?: boolean;
};

export function UserActions({ user, inlineVerification = true }: Props) {
  const { run, pending } = useAction();
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const status = (s: AccountStatus) => run(() => setAccountStatus(user.id, s));
  const verify = (v: VerificationStatus) => run(() => setVerification(user.id, v));

  return (
    <div className="flex items-center justify-end gap-1.5">
      {inlineVerification && user.verification === "pending" && (
        <>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => verify("verified")}>
            <Check className="text-success-600" /> Verify
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => verify("rejected")}>
            Reject
          </Button>
        </>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`} disabled={pending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/profiles/${user.id}`}>
              <ExternalLink /> View public profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Account status</DropdownMenuLabel>
          <DropdownMenuItem disabled={user.status === "active"} onSelect={() => status("active")}>
            <Check /> Activate
          </DropdownMenuItem>
          <DropdownMenuItem disabled={user.status === "flagged"} onSelect={() => status("flagged")}>
            <Flag /> Flag for review
          </DropdownMenuItem>
          <DropdownMenuItem destructive disabled={user.status === "suspended"} onSelect={() => setConfirmSuspend(true)}>
            <Ban /> Suspend
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Verification</DropdownMenuLabel>
          <DropdownMenuItem disabled={user.verification === "verified"} onSelect={() => verify("verified")}>
            <BadgeCheck /> Verify
          </DropdownMenuItem>
          <DropdownMenuItem disabled={user.verification === "rejected"} onSelect={() => verify("rejected")}>
            <ShieldX /> Reject
          </DropdownMenuItem>
          <DropdownMenuItem disabled={user.verification === "pending"} onSelect={() => verify("pending")}>
            <Clock /> Mark pending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmSuspend}
        onOpenChange={setConfirmSuspend}
        title={`Suspend ${user.name}?`}
        description="The account is signed out immediately and hidden from the marketplace."
        confirmLabel="Suspend account"
        pending={pending}
        onConfirm={() => run(() => setAccountStatus(user.id, "suspended"), { onSuccess: () => setConfirmSuspend(false) })}
      >
        <p>Their opportunities stop appearing in search. You can reactivate the account at any time from this page.</p>
      </ConfirmDialog>
    </div>
  );
}
