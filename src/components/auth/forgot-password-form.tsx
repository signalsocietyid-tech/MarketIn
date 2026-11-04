"use client";

import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="rounded-xl border border-line bg-canvas/60 p-5">
        <MailCheck className="size-6 text-success-600" />
        <p className="mt-3 font-semibold text-ink">Check your inbox</p>
        <p className="mt-1 text-sm text-subtle">{sent}</p>
        <p className="mt-3 text-xs text-muted">
          Email delivery is enabled once Supabase Auth (or another mail provider) is configured for this environment.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await requestPasswordReset(email);
          if (res.ok) setSent(res.message ?? "");
          else setError(res.error);
        });
      }}
    >
      <Field label="Email" htmlFor="email" error={error ?? undefined}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} placeholder="you@company.com" />
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Send reset link
      </Button>
    </form>
  );
}
