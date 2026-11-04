"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormProvider, useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/primitives";
import { updateProfile } from "@/lib/actions/account";
import type { Segment } from "@/lib/types";
import { PROFILE_SCHEMAS, ProfileStepFields, ROLE_STEPS, type Taxonomies } from "./profile-fields";

export function ProfileEditor({ role, defaults, taxonomies }: { role: Segment; defaults: FieldValues; taxonomies: Taxonomies }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- schema chosen at runtime per role
    resolver: zodResolver(PROFILE_SCHEMAS[role] as any),
    defaultValues: defaults,
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const res = await updateProfile(values);
      if (!res.ok) {
        setError(res.error);
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) form.setError(k, { message: m });
        return;
      }
      toast.success(res.message ?? "Profile saved");
      form.reset(values);
      router.refresh();
    });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {ROLE_STEPS[role].map((step) => (
          <Card key={step.id}>
            <CardHeader title={step.title} description={step.description} />
            <div className="p-5">
              <ProfileStepFields role={role} step={step.id} taxonomies={taxonomies} />
            </div>
          </Card>
        ))}
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
          <div className="min-h-5 text-sm">
            {error ? (
              <span className="flex items-center gap-1.5 text-danger-700">
                <AlertCircle className="size-4" /> {error}
              </span>
            ) : form.formState.isDirty ? (
              <span className="text-subtle">You have unsaved changes.</span>
            ) : (
              <span className="text-muted">All changes saved.</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={!form.formState.isDirty || pending} onClick={() => form.reset(defaults)}>
              Discard
            </Button>
            <Button type="submit" loading={pending} disabled={!form.formState.isDirty}>
              Save profile
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
