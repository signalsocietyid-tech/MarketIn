import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, Progress } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Single plan-limit meter with an upgrade hint once the limit is reached. */
export function LimitMeter({
  label,
  used,
  limit,
  unit,
  atLimitHint,
  className,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
  atLimitHint: string;
  className?: string;
}) {
  const pct = limit ? (used / limit) * 100 : 100;
  const atLimit = used >= limit;
  const remaining = Math.max(0, limit - used);
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium text-subtle">{label}</p>
        <p className={cn("text-sm font-semibold tabular-nums", atLimit ? "text-danger-600" : "text-ink")}>
          {used} / {limit} <span className="font-normal text-muted">{unit}</span>
        </p>
      </div>
      <Progress value={pct} className="mt-2.5" tone={pct >= 90 ? "brand" : "navy"} />
      {atLimit ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
          <span>{atLimitHint}</span>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
            Upgrade plan <ArrowRight className="size-3.5" />
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-[13px] text-muted">
          {remaining} {remaining === 1 ? "slot" : "slots"} left on your plan.
        </p>
      )}
    </Card>
  );
}
