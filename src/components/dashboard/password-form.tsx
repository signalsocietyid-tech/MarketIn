"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { changePassword } from "@/lib/actions/auth";
import { passwordChangeSchema } from "@/lib/validation";

type Values = z.input<typeof passwordChangeSchema>;

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(passwordChangeSchema), defaultValues: { current: "", next: "", confirm: "" } });
  const e = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = await changePassword(values);
      if (res.ok) {
        toast.success(res.message ?? "Password updated");
        form.reset();
      } else {
        toast.error(res.error);
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) form.setError(k as keyof Values, { message: m });
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:max-w-md">
      <Field label="Current password" htmlFor="current" error={e.current?.message}>
        <Input id="current" type="password" autoComplete="current-password" aria-invalid={!!e.current} {...form.register("current")} />
      </Field>
      <Field label="New password" htmlFor="next" error={e.next?.message} hint="At least 8 characters.">
        <Input id="next" type="password" autoComplete="new-password" aria-invalid={!!e.next} {...form.register("next")} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm" error={e.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!e.confirm} {...form.register("confirm")} />
      </Field>
      <div>
        <Button type="submit" loading={pending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
