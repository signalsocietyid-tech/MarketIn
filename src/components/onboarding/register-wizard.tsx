"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FormProvider, useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, Megaphone, Network, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form-controls";
import { registerAccount } from "@/lib/actions/auth";
import { credentialsSchema } from "@/lib/validation";
import type { Segment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PROFILE_SCHEMAS, ProfileStepFields, ROLE_STEPS, emptyProfile, type Taxonomies } from "./profile-fields";

const TYPES: { id: Segment; title: string; body: string; icon: typeof Building2 }[] = [
  { id: "business", title: "Business", body: "Find sales partners, distributors, affiliates, KOLs and agencies.", icon: Building2 },
  { id: "sales", title: "Sales Partner", body: "Independent reps, agents, sales teams and regional distributors.", icon: TrendingUp },
  { id: "creator", title: "Creator & Affiliate", body: "Affiliate marketers, KOLs, UGC creators and reviewers.", icon: Megaphone },
  { id: "agency", title: "Agency", body: "Manage talents and sales reps, and win client partnerships.", icon: Network },
];

type Account = { email: string; password: string };

export function RegisterWizard({
  taxonomies,
  initialType,
  redirectTo,
}: {
  taxonomies: Taxonomies;
  initialType?: Segment;
  redirectTo: string;
}) {
  const [role, setRole] = useState<Segment | null>(initialType ?? null);
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState(initialType ? 1 : 0);

  const roleSteps = role ? ROLE_STEPS[role] : [];
  const labels = ["Account type", "Sign-in details", ...roleSteps.map((s) => s.title)];

  return (
    <div className="w-full max-w-xl">
      <Stepper labels={labels} current={step} />
      <div className="mt-8">
        {step === 0 && (
          <TypeStep
            value={role}
            onSelect={(r) => {
              setRole(r);
              setStep(1);
            }}
          />
        )}
        {step === 1 && role && (
          <AccountStep
            role={role}
            initial={account}
            onBack={() => setStep(0)}
            onNext={(a) => {
              setAccount(a);
              setStep(2);
            }}
          />
        )}
        {step >= 2 && role && account && (
          <ProfileSteps
            key={role}
            role={role}
            account={account}
            taxonomies={taxonomies}
            index={step - 2}
            onIndex={(i) => setStep(i + 2)}
            onBackToAccount={() => setStep(1)}
            redirectTo={redirectTo}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-subtle">
        Step {current + 1} of {labels.length} · <span className="text-ink">{labels[current]}</span>
      </p>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {labels.map((l, i) => (
          <span key={l + i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= current ? "bg-brand-500" : "bg-navy-50")} />
        ))}
      </div>
    </div>
  );
}

function TypeStep({ value, onSelect }: { value: Segment | null; onSelect: (r: Segment) => void }) {
  return (
    <div>
      <h1 className="text-[28px] font-bold text-navy-900">Create your MarketIn account</h1>
      <p className="mt-2 text-sm text-subtle">Choose how you&apos;ll use MarketIn. Each account type gets its own dashboard.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(t.id)}
              className={cn(
                "group relative flex flex-col items-start rounded-xl border bg-white p-4 text-left transition-all hover:border-brand-300 hover:shadow-card",
                active ? "border-brand-400 ring-2 ring-brand-100" : "border-line",
              )}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-lg", active ? "bg-brand-500 text-white" : "bg-navy-50 text-navy-700")}>
                <Icon className="size-[18px]" />
              </span>
              <span className="mt-3 text-[15px] font-semibold text-ink">{t.title}</span>
              <span className="mt-1 text-[13px] leading-snug text-subtle">{t.body}</span>
              {active && <Check className="absolute right-3 top-3 size-4 text-brand-600" />}
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-subtle">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function AccountStep({ role, initial, onBack, onNext }: { role: Segment; initial: Account | null; onBack: () => void; onNext: (a: Account) => void }) {
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState } = useForm<Account>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: initial ?? { email: "", password: "" },
  });
  const label = TYPES.find((t) => t.id === role)?.title;

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <h1 className="text-[28px] font-bold text-navy-900">Your sign-in details</h1>
      <p className="mt-2 text-sm text-subtle">
        Registering as <span className="font-semibold text-ink">{label}</span>.{" "}
        <button type="button" onClick={onBack} className="font-medium text-brand-700 hover:underline">
          Change
        </button>
      </p>
      <div className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={!!formState.errors.email} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={formState.errors.password?.message} hint="At least 8 characters.">
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="new-password" className="pr-10" aria-invalid={!!formState.errors.password} {...register("password")} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      </div>
      <div className="mt-8 flex justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button type="submit">
          Continue <ArrowRight />
        </Button>
      </div>
    </form>
  );
}

function ProfileSteps({
  role,
  account,
  taxonomies,
  index,
  onIndex,
  onBackToAccount,
  redirectTo,
}: {
  role: Segment;
  account: Account;
  taxonomies: Taxonomies;
  index: number;
  onIndex: (i: number) => void;
  onBackToAccount: () => void;
  redirectTo: string;
}) {
  const router = useRouter();
  const steps = ROLE_STEPS[role];
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaults = useMemo(() => emptyProfile(role, account.email), [role, account.email]);
  const form = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- schema chosen at runtime per role
    resolver: zodResolver(PROFILE_SCHEMAS[role] as any),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const next = async () => {
    const ok = await form.trigger(step.fields);
    if (ok) onIndex(index + 1);
  };

  const submit = form.handleSubmit((profile) => {
    if (!agreed) return setError("Please accept the Terms & Conditions and Privacy Policy.");
    setError(null);
    startTransition(async () => {
      const res = await registerAccount({ role, account, profile });
      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setError(res.error);
      // Route server-side field errors back to the right step.
      for (const [key, message] of Object.entries(res.fieldErrors ?? {})) {
        if (key.startsWith("account.")) {
          onBackToAccount();
          return;
        }
        const field = key.replace(/^profile\./, "");
        form.setError(field, { message });
        const owner = steps.findIndex((s) => s.fields.some((f) => field === f || field.startsWith(`${f}.`)));
        if (owner >= 0 && owner !== index) onIndex(owner);
      }
    });
  }, (errors) => {
    // Client validation failed on a field from an earlier step: jump there.
    const first = Object.keys(errors)[0];
    const owner = steps.findIndex((s) => s.fields.includes(first));
    if (owner >= 0) onIndex(owner);
  });

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) submit();
          else next();
        }}
      >
        <h1 className="text-[28px] font-bold text-navy-900">{step.title}</h1>
        <p className="mt-2 text-sm text-subtle">{step.description}</p>

        <div className="mt-6">
          <ProfileStepFields role={role} step={step.id} taxonomies={taxonomies} />
        </div>

        {isLast && (
          <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm text-subtle">
            <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            <span>
              I agree to MarketIn&apos;s{" "}
              <Link href="/terms" target="_blank" className="font-medium text-brand-700 hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-medium text-brand-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button type="button" variant="secondary" onClick={() => (index === 0 ? onBackToAccount() : onIndex(index - 1))}>
            <ArrowLeft /> Back
          </Button>
          <Button type="submit" loading={pending}>
            {isLast ? "Create account" : "Continue"} {!isLast && <ArrowRight />}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
