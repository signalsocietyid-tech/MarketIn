"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { inviteTeamMember } from "@/lib/actions/account";
import { teamInviteSchema } from "@/lib/validation";
import { useAction } from "@/lib/use-action";

type FieldName = "name" | "email" | "role";

export function InviteMemberDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { pending, run } = useAction();
  const { register, handleSubmit, reset, setError, formState } = useForm({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: { name: "", email: "", role: "member" as const },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit((values) =>
    run(
      async () => {
        const result = await inviteTeamMember(values);
        if (!result.ok && result.fieldErrors) {
          for (const [key, message] of Object.entries(result.fieldErrors)) setError(key as FieldName, { message });
        }
        return result;
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
          router.refresh();
        },
      },
    ),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={disabled} title={disabled ? "Your plan's team seats are full" : undefined}>
          <MailPlus /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent title="Invite a team member" description="Managers can manage talents and proposals. Members can view and draft proposals.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Full name" htmlFor="invite-name" error={errors.name?.message}>
            <Input id="invite-name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Work email" htmlFor="invite-email" error={errors.email?.message}>
            <Input id="invite-email" type="email" autoComplete="off" aria-invalid={!!errors.email} placeholder="name@agency.com" {...register("email")} />
          </Field>
          <Field label="Role" htmlFor="invite-role" error={errors.role?.message}>
            <Select id="invite-role" {...register("role")}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </Select>
          </Field>
          <p className="flex gap-2 rounded-lg bg-canvas px-3 py-2.5 text-[13px] text-subtle">
            <Info className="mt-0.5 size-4 shrink-0 text-muted" />
            The invitation is recorded on your team now. Invitation emails will be sent once a mail provider is configured, so share access details with them directly for the time being.
          </p>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
