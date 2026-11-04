"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { applyToOpportunity } from "@/lib/actions/marketplace";
import { applicationSchema } from "@/lib/validation";
import { useAction } from "@/lib/use-action";

export type TalentOption = { id: string; label: string };

export function ApplyDialog({
  opportunityId,
  opportunityTitle,
  companyName,
  isAgency,
  allowAgencySelf,
  talentOptions,
  usage,
  triggerLabel = "Apply now",
  triggerVariant = "primary",
}: {
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  isAgency: boolean;
  /** Agencies may apply as the agency itself only before any other application to this listing. */
  allowAgencySelf: boolean;
  talentOptions: TalentOption[];
  usage?: { used: number; limit: number };
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { pending, run } = useAction();
  const { register, handleSubmit, reset, control, formState } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      opportunityId,
      message: "",
      proposedRate: "",
      talentId: isAgency && !allowAgencySelf ? (talentOptions[0]?.id ?? "") : "",
    },
  });
  const message = useWatch({ control, name: "message" }) ?? "";

  const onSubmit = handleSubmit((values) =>
    run(() => applyToOpportunity({ ...values, talentId: values.talentId || undefined }), {
      onSuccess: () => {
        setOpen(false);
        reset();
        router.refresh();
      },
    }),
  );

  const remaining = usage ? Math.max(0, usage.limit - usage.used) : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="lg" className="w-full">
          <Send /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent title={`Apply to ${opportunityTitle}`} description={`Your application goes directly to ${companyName}.`}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <input type="hidden" {...register("opportunityId")} />

          {isAgency && (
            <Field
              label="Apply as"
              htmlFor="apply-talent"
              hint="Submit for your agency, or on behalf of a talent in your roster."
              error={formState.errors.talentId?.message}
            >
              <Select id="apply-talent" {...register("talentId")}>
                {allowAgencySelf && <option value="">My agency</option>}
                {talentOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field
            label="Your pitch"
            htmlFor="apply-message"
            error={formState.errors.message?.message}
            hint="Share relevant experience, coverage or audience, and why you're a good fit."
          >
            <Textarea
              id="apply-message"
              rows={6}
              maxLength={1500}
              aria-invalid={!!formState.errors.message}
              placeholder="Introduce yourself and explain how you'd deliver results…"
              {...register("message")}
            />
          </Field>
          <p className="-mt-2 text-right text-xs text-muted">{message.length} / 1500</p>

          <Field
            label="Proposed rate or terms"
            htmlFor="apply-rate"
            optional
            hint="e.g. Rp3 jt per post, or 10% commission"
            error={formState.errors.proposedRate?.message}
          >
            <Input id="apply-rate" maxLength={120} {...register("proposedRate")} />
          </Field>

          {usage && remaining !== undefined && (
            <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-subtle">
              {remaining > 0
                ? `You have ${remaining} of ${usage.limit} applications left this month.`
                : "You've used all applications included in your plan this month. Upgrade to send more."}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              Send application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
