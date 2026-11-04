"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { addTalent } from "@/lib/actions/account";
import { talentSchema } from "@/lib/validation";
import { useAction } from "@/lib/use-action";

type FieldName = "name" | "type" | "specialty" | "location" | "followers";

export function AddTalentDialog({ locations, disabled }: { locations: string[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { pending, run } = useAction();
  const { register, handleSubmit, reset, setError, formState } = useForm({
    resolver: zodResolver(talentSchema),
    defaultValues: { name: "", type: "creator", specialty: "", location: "", followers: "" },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit((values) =>
    run(
      async () => {
        const result = await addTalent(values);
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
        <Button disabled={disabled} title={disabled ? "Your roster is at its plan limit" : undefined}>
          <UserPlus /> Add talent
        </Button>
      </DialogTrigger>
      <DialogContent title="Add talent" description="Add a creator, affiliate or sales rep you represent. You can propose them to opportunities.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Full name" htmlFor="talent-name" error={errors.name?.message}>
            <Input id="talent-name" autoComplete="off" aria-invalid={!!errors.name} placeholder="e.g. Laras Ayuningtyas" {...register("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="talent-type" error={errors.type?.message}>
              <Select id="talent-type" aria-invalid={!!errors.type} {...register("type")}>
                <option value="creator">Creator / KOL</option>
                <option value="affiliate">Affiliate</option>
                <option value="sales">Sales rep</option>
              </Select>
            </Field>
            <Field label="Location" htmlFor="talent-location" error={errors.location?.message}>
              <Select id="talent-location" aria-invalid={!!errors.location} {...register("location")}>
                <option value="">Select a location</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Specialty" htmlFor="talent-specialty" hint="Niche and main channel, e.g. Beauty — Instagram" error={errors.specialty?.message}>
            <Input id="talent-specialty" aria-invalid={!!errors.specialty} {...register("specialty")} />
          </Field>
          <Field label="Followers" htmlFor="talent-followers" optional hint="Total audience across platforms" error={errors.followers?.message}>
            <Input id="talent-followers" type="number" inputMode="numeric" min={0} aria-invalid={!!errors.followers} {...register("followers")} />
          </Field>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              Add to roster
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
