"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { VerificationBadge } from "@/components/shared/status-badge";
import { requestVerification } from "@/lib/actions/account";
import { useAction } from "@/lib/use-action";
import type { VerificationStatus } from "@/lib/types";

const COPY: Record<VerificationStatus, string> = {
  unverified: "Verified profiles earn a badge and rank higher in search. Our team reviews your details before approving.",
  pending: "Your request is with our team. We'll notify you once it has been reviewed.",
  verified: "Your profile shows a verified badge to businesses and partners.",
  rejected: "We couldn't verify your profile. Update your details and request again.",
};

export function VerificationCard({ status }: { status: VerificationStatus }) {
  const { run, pending } = useAction();
  const router = useRouter();
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <BadgeCheck className="size-4 text-blue-600" /> Verification
        </p>
        <VerificationBadge status={status} />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-subtle">{COPY[status]}</p>
      {(status === "unverified" || status === "rejected") && (
        <Button size="sm" variant="secondary" className="mt-4 w-full" loading={pending} onClick={() => run(requestVerification, { onSuccess: () => router.refresh() })}>
          Request verification
        </Button>
      )}
    </Card>
  );
}
