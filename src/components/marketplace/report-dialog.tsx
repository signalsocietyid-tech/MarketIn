"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { submitReport } from "@/lib/actions/marketplace";
import { reportSchema } from "@/lib/validation";
import { useAction } from "@/lib/use-action";

const REASONS = {
  opportunity: [
    "Misleading or false information",
    "Suspected scam or fraud",
    "Requests upfront payment",
    "Inappropriate content",
    "Duplicate listing",
    "Other",
  ],
  user: [
    "Fake or impersonated profile",
    "Suspicious profile",
    "Spam or unsolicited messages",
    "Inappropriate content",
    "Other",
  ],
} as const;

export function ReportDialog({
  targetType,
  targetId,
  signedIn,
  loginHref,
  subject,
}: {
  targetType: "opportunity" | "user";
  targetId: string;
  signedIn: boolean;
  /** Where guests are sent instead of opening the dialog. */
  loginHref: string;
  /** Shown in the dialog description, e.g. the listing title or profile name. */
  subject: string;
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: { targetType, targetId, reason: "", details: "" },
  });

  if (!signedIn) {
    return (
      <Button asChild variant="ghost" size="sm" className="text-subtle">
        <Link href={loginHref}>
          <Flag /> Report
        </Link>
      </Button>
    );
  }

  const onSubmit = handleSubmit((values) =>
    run(() => submitReport(values), {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    }),
  );

  const idPrefix = `report-${targetType}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-subtle">
          <Flag /> Report
        </Button>
      </DialogTrigger>
      <DialogContent
        title={targetType === "opportunity" ? "Report this listing" : "Report this profile"}
        description={`Tell our trust & safety team what's wrong with "${subject}". Reports are confidential.`}
        size="sm"
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Reason" htmlFor={`${idPrefix}-reason`} error={formState.errors.reason?.message}>
            <Select id={`${idPrefix}-reason`} aria-invalid={!!formState.errors.reason} {...register("reason")}>
              <option value="">Choose a reason</option>
              {REASONS[targetType].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Details"
            htmlFor={`${idPrefix}-details`}
            optional
            hint="Add anything that helps us review this faster."
            error={formState.errors.details?.message}
          >
            <Textarea id={`${idPrefix}-details`} rows={4} maxLength={800} {...register("details")} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="danger" loading={pending}>
              Submit report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
