"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminActivateSubscription, adminCancelSubscription } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import type { BillingCycle, SubscriptionStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { MANUAL_ACTIVATION_WARNING } from "./copy";

export function SubscriptionActions({
  subscription: s,
}: {
  subscription: {
    id: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    userName: string;
    planName: string;
    amount: number;
    paymentReference?: string;
  };
}) {
  const { run, pending } = useAction();
  const [dialog, setDialog] = useState<"activate" | "cancel" | null>(null);
  const close = () => setDialog(null);

  if (s.status !== "pending_payment" && s.status !== "active") return <span className="text-xs text-muted">No actions</span>;

  return (
    <>
      {s.status === "pending_payment" ? (
        <Button size="sm" variant="navy" onClick={() => setDialog("activate")}>
          Activate manually
        </Button>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setDialog("cancel")}>
          Cancel
        </Button>
      )}

      <ConfirmDialog
        open={dialog === "activate"}
        onOpenChange={(o) => !o && close()}
        title="Activate subscription manually?"
        description={`${s.planName} for ${s.userName}`}
        confirmLabel="I confirmed payment, activate"
        variant="primary"
        pending={pending}
        onConfirm={() => run(() => adminActivateSubscription(s.id), { onSuccess: close })}
      >
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-warning-50 p-3 text-warning-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="text-[13px] font-medium leading-relaxed">{MANUAL_ACTIVATION_WARNING}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          <dt className="text-subtle">Amount due</dt>
          <dd className="font-medium text-ink">
            {formatIDR(s.amount)} / {s.billingCycle === "yearly" ? "year" : "month"}
          </dd>
          <dt className="text-subtle">Payment reference</dt>
          <dd className="font-mono text-ink">{s.paymentReference ?? "None recorded"}</dd>
        </dl>
        <p className="text-[13px]">
          The new billing period starts today. Any other active subscription for this user is closed automatically.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(o) => !o && close()}
        title="Cancel this subscription?"
        description={`${s.planName} for ${s.userName}`}
        confirmLabel="Cancel subscription"
        pending={pending}
        onConfirm={() => run(() => adminCancelSubscription(s.id), { onSuccess: close })}
      >
        <p>
          Paid features are removed immediately and the user falls back to their segment&apos;s free plan. No refund is issued by
          MarketIn; handle any refund outside the platform.
        </p>
      </ConfirmDialog>
    </>
  );
}
