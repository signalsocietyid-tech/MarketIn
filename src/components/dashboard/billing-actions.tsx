"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { cancelPendingCheckout, resumeSubscription, scheduleDowngrade, startCheckout } from "@/lib/actions/account";
import { useAction } from "@/lib/use-action";
import type { BillingCycle } from "@/lib/types";

export function DowngradeButton({ periodEnd }: { periodEnd: string }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Downgrade to Free
        </Button>
      </DialogTrigger>
      <DialogContent title="Downgrade to Free?" description={`You'll keep Pro features until ${periodEnd}. After that, free plan limits apply.`} size="sm">
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Keep Pro</Button>
          </DialogClose>
          <Button
            variant="danger"
            loading={pending}
            onClick={() =>
              run(scheduleDowngrade, {
                onSuccess: () => {
                  setOpen(false);
                  router.refresh();
                },
              })
            }
          >
            Schedule downgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ResumeButton() {
  const { run, pending } = useAction();
  const router = useRouter();
  return (
    <Button size="sm" loading={pending} onClick={() => run(resumeSubscription, { onSuccess: () => router.refresh() })}>
      Keep my Pro plan
    </Button>
  );
}

export function CancelPendingButton() {
  const { run, pending } = useAction();
  const router = useRouter();
  return (
    <Button variant="secondary" size="sm" loading={pending} onClick={() => run(cancelPendingCheckout, { onSuccess: () => router.refresh() })}>
      Cancel upgrade request
    </Button>
  );
}

export function RequestUpgradeButton({ planId, cycle, label }: { planId: string; cycle: BillingCycle; label: string }) {
  const { run, pending } = useAction();
  return (
    <Button size="lg" className="w-full" loading={pending} onClick={() => run(() => startCheckout(planId, cycle))}>
      {label}
    </Button>
  );
}
