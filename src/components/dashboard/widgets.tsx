import Link from "next/link";
import { ArrowRight, Crown, Lock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, Progress } from "@/components/ui/primitives";
import { SubscriptionStatusBadge } from "@/components/shared/status-badge";
import type { UsageMeter } from "@/lib/permissions";
import type { SubscriptionPlan, UserSubscription } from "@/lib/types";
import { cn, formatDate, formatIDR } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  tone?: "neutral" | "brand" | "success" | "blue";
}) {
  const iconTone = {
    neutral: "bg-navy-50 text-navy-700",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-success-50 text-success-700",
    blue: "bg-blue-50 text-blue-700",
  }[tone];
  const body = (
    <Card className={cn("h-full p-5", href && "transition-colors hover:border-navy-100")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-subtle">{label}</p>
        {Icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-lg", iconTone)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-navy-900">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-brand-400">
      {body}
    </Link>
  ) : (
    body
  );
}

export function UsageCard({ meters }: { meters: UsageMeter[] }) {
  return (
    <Card>
      <CardHeader title="Plan usage" description="Limits reset or change with your plan." />
      <ul className="space-y-4 p-5">
        {meters.map((m) => {
          const pct = m.limit ? (m.used / m.limit) * 100 : 100;
          return (
            <li key={m.key}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-subtle">{m.label}</span>
                <span className={cn("font-medium", pct >= 100 ? "text-danger-600" : "text-ink")}>
                  {m.used} / {m.limit}
                </span>
              </div>
              <Progress value={pct} className="mt-1.5" tone={pct >= 90 ? "brand" : "navy"} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function SubscriptionCard({
  plan,
  subscription,
  pending,
  pendingPlan,
}: {
  plan: SubscriptionPlan | null;
  subscription: UserSubscription | null;
  pending: UserSubscription | null;
  pendingPlan?: SubscriptionPlan | null;
}) {
  const isPro = plan?.tier === "pro";
  return (
    <Card className="overflow-hidden">
      <div className={cn("p-5", isPro ? "bg-navy-900 text-white" : "bg-white")}>
        <div className="flex items-center justify-between">
          <p className={cn("text-[13px] font-medium", isPro ? "text-navy-200" : "text-subtle")}>Subscription</p>
          {subscription ? <SubscriptionStatusBadge status={subscription.status} /> : null}
        </div>
        <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold">
          {isPro && <Crown className="size-5 text-brand-400" />}
          {plan?.name ?? "Free"}
        </p>
        <p className={cn("mt-1 text-[13px]", isPro ? "text-navy-200" : "text-subtle")}>
          {subscription
            ? subscription.cancelAtPeriodEnd
              ? `Switches to Free on ${formatDate(subscription.currentPeriodEnd)}`
              : `Renews ${formatDate(subscription.currentPeriodEnd)} · ${subscription.billingCycle}`
            : "Free forever — upgrade any time."}
        </p>
      </div>
      <div className="border-t border-line p-5">
        {pending && pendingPlan ? (
          <p className="text-[13px] text-warning-700">
            {pendingPlan.name} ({formatIDR(pending.billingCycle === "yearly" ? pendingPlan.priceYearly : pendingPlan.priceMonthly)}) is awaiting payment confirmation.
          </p>
        ) : null}
        <Button asChild variant={isPro ? "secondary" : "primary"} size="sm" className={cn("w-full", pending && "mt-3")}>
          <Link href="/dashboard/billing">
            {isPro ? "Manage subscription" : "Upgrade to Pro"} <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

/** Wraps a Pro-only area: renders children when allowed, otherwise an upgrade prompt. */
export function FeatureGate({
  allowed,
  title,
  description,
  children,
  className,
}: {
  allowed: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (allowed) return <>{children}</>;
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none select-none p-5 opacity-40 blur-[2px]" aria-hidden>
        <div className="h-4 w-40 rounded bg-navy-100" />
        <div className="mt-6 flex h-40 items-end gap-2">
          {[40, 65, 50, 80, 60, 90, 70, 95].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-navy-100" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 px-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
          <Lock className="size-4 text-brand-700" />
        </span>
        <p className="mt-3 text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-subtle">{description}</p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/dashboard/billing">See Pro plans</Link>
        </Button>
      </div>
    </Card>
  );
}

export function WelcomeBanner({ name, show }: { name: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
      <p className="font-semibold text-brand-900">Welcome to MarketIn, {name.split(" ")[0]}!</p>
      <p className="mt-1 text-sm text-brand-800">
        Your account is ready. Complete your profile and request verification to stand out to partners.{" "}
        <Link href="/profile" className="font-semibold underline underline-offset-2">
          Go to profile
        </Link>
      </p>
    </div>
  );
}
