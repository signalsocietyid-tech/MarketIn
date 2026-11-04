import { BadgeCheck, Clock, Crown, ShieldAlert } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/primitives";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";
import type {
  AccountStatus,
  ApplicationStatus,
  OpportunityStatus,
  SubscriptionStatus,
  VerificationStatus,
} from "@/lib/types";

const APPLICATION_TONE: Record<ApplicationStatus, BadgeTone> = {
  pending: "outline",
  under_review: "blue",
  shortlisted: "brand",
  accepted: "success",
  rejected: "danger",
  completed: "navy",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge tone={APPLICATION_TONE[status]}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {APPLICATION_STATUS_LABEL[status]}
    </Badge>
  );
}

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
  const map: Record<OpportunityStatus, [BadgeTone, string]> = {
    open: ["success", "Open"],
    paused: ["warning", "Paused"],
    closed: ["neutral", "Closed"],
  };
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const map: Record<SubscriptionStatus, [BadgeTone, string]> = {
    active: ["success", "Active"],
    pending_payment: ["warning", "Awaiting payment"],
    canceled: ["neutral", "Canceled"],
    expired: ["neutral", "Expired"],
  };
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, [BadgeTone, string]> = {
    active: ["success", "Active"],
    suspended: ["danger", "Suspended"],
    flagged: ["warning", "Flagged"],
  };
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified")
    return (
      <Badge tone="blue">
        <BadgeCheck /> Verified
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge tone="warning">
        <Clock /> Pending review
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge tone="danger">
        <ShieldAlert /> Rejected
      </Badge>
    );
  return <Badge tone="outline">Unverified</Badge>;
}

/** Small inline check shown next to names. */
export function VerifiedMark({ className = "size-4" }: { className?: string }) {
  return <BadgeCheck className={`${className} shrink-0 fill-blue-500 text-white`} aria-label="Verified" />;
}

export function ProBadge() {
  return (
    <Badge tone="brand" className="font-semibold">
      <Crown /> Pro
    </Badge>
  );
}
