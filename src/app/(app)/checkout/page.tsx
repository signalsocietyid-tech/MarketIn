import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { RequestUpgradeButton } from "@/components/dashboard/billing-actions";
import { requireUser } from "@/lib/auth/session";
import { getActiveSubscription, getPendingSubscription, getPlan } from "@/lib/data/queries";
import { getPaymentProvider } from "@/lib/payments";
import { SEGMENT_LABEL } from "@/lib/constants";
import type { BillingCycle } from "@/lib/types";
import { cn, formatIDR } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const sp = await props.searchParams;
  const user = await requireUser("/checkout");
  const plan = typeof sp.plan === "string" ? await getPlan(sp.plan) : null;
  if (!plan || !plan.active || plan.tier !== "pro") notFound();
  if (plan.segment !== user.role) redirect(`/pricing?segment=${user.role === "admin" ? "business" : user.role}`);

  const cycle: BillingCycle = sp.cycle === "yearly" ? "yearly" : "monthly";
  const [active, pending] = await Promise.all([getActiveSubscription(user.id), getPendingSubscription(user.id)]);
  if (active?.planId === plan.id && active.billingCycle === cycle) redirect("/dashboard/billing");

  const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const saving = plan.priceMonthly * 12 - plan.priceYearly;
  const provider = getPaymentProvider();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/billing" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-ink">
        <ArrowLeft className="size-4" /> Back to subscription
      </Link>
      <h1 className="text-2xl font-bold text-navy-900">Upgrade to {plan.name}</h1>
      <p className="mt-1 text-sm text-subtle">For {SEGMENT_LABEL[plan.segment]} accounts · {user.email}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink">Billing cycle</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["monthly", "yearly"] as const).map((c) => {
                const price = c === "yearly" ? plan.priceYearly : plan.priceMonthly;
                return (
                  <Link
                    key={c}
                    href={`/checkout?plan=${plan.id}&cycle=${c}`}
                    replace
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      cycle === c ? "border-brand-400 bg-brand-50/50 ring-2 ring-brand-100" : "border-line hover:border-navy-200",
                    )}
                    aria-current={cycle === c}
                  >
                    <p className="text-sm font-semibold capitalize text-ink">{c}</p>
                    <p className="mt-1 text-[13px] text-subtle">
                      {formatIDR(price)} / {c === "yearly" ? "year" : "month"}
                    </p>
                    {c === "yearly" && saving > 0 && <p className="mt-1 text-xs font-medium text-success-700">Save {formatIDR(saving)} per year</p>}
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink">What you get</p>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {plan.benefits.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <p className="text-sm font-semibold text-ink">Order summary</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-subtle">{plan.name}</dt>
              <dd className="text-ink">{formatIDR(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">Billing</dt>
              <dd className="capitalize text-ink">{cycle}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-semibold">
              <dt className="text-ink">Total due</dt>
              <dd className="text-navy-900">{formatIDR(amount)}</dd>
            </div>
          </dl>
          {pending && (
            <p className="mt-4 rounded-md bg-warning-50 px-3 py-2 text-xs text-warning-700">
              You already have a pending upgrade request. Submitting again replaces it.
            </p>
          )}
          <div className="mt-5">
            <RequestUpgradeButton planId={plan.id} cycle={cycle} label={provider.connected ? "Continue to payment" : "Request upgrade"} />
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-subtle">
            <ShieldCheck className="size-4 shrink-0 text-navy-600" />
            {provider.connected
              ? "You'll be redirected to our payment partner to complete payment securely."
              : "Online payment is not connected yet — you won't be charged now. We'll record your request and our team will contact you to confirm payment before activating your plan."}
          </p>
        </Card>
      </div>
    </div>
  );
}
