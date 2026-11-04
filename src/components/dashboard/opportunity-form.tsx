"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/primitives";
import { Checkbox, ChoiceChips, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Switch } from "@/components/ui/overlays";
import { saveOpportunity } from "@/lib/actions/marketplace";
import { opportunitySchema, type OpportunityInput } from "@/lib/validation";
import {
  CATEGORY_META,
  COMPENSATION_LABEL,
  EXPERIENCE_LEVELS,
  OPPORTUNITY_TYPE_CATEGORY,
  OPPORTUNITY_TYPE_LABEL,
  PLATFORM_LABEL,
  PLATFORMS,
} from "@/lib/constants";
import type { CompensationModel, OpportunityType, SocialPlatform } from "@/lib/types";

const TYPES = Object.keys(OPPORTUNITY_TYPE_LABEL) as OpportunityType[];

export function OpportunityForm({
  id,
  defaults,
  industries,
  locations,
  canPremium,
}: {
  id?: string;
  defaults?: Partial<OpportunityInput>;
  industries: string[];
  locations: string[];
  canPremium: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      type: "sales_representative",
      industry: "",
      location: "",
      remote: false,
      description: "",
      requirements: "",
      deliverables: "",
      compensationModel: "commission",
      compensationDetail: "",
      budgetMin: "",
      budgetMax: "",
      experienceLevel: "any",
      platforms: [],
      deadline: "",
      duration: "",
      premium: false,
      ...defaults,
    },
  });
  const { register, control, formState } = form;
  const e = formState.errors;
  const type = useWatch({ control, name: "type" }) as OpportunityType;
  const category = OPPORTUNITY_TYPE_CATEGORY[type];
  const showPlatforms = category === "kol" || category === "affiliate";

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const res = await saveOpportunity(values, id);
      if (!res.ok) {
        setError(res.error);
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) form.setError(k as keyof OpportunityInput, { message: m });
        return;
      }
      toast.success(res.message ?? "Saved");
      router.push(`/dashboard/opportunities/${res.data?.id ?? id}`);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader title="Basics" description="What kind of partner are you looking for?" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Opportunity title" htmlFor="title" error={e.title?.message} className="sm:col-span-2">
              <Input id="title" placeholder="e.g. Regional Sales Representative — East Java" aria-invalid={!!e.title} {...register("title")} />
            </Field>
            <Field label="Opportunity type" htmlFor="type" hint={`Listed in ${CATEGORY_META[category].label}`}>
              <Select id="type" {...register("type")}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {OPPORTUNITY_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Industry" htmlFor="industry" error={e.industry?.message}>
              <Select id="industry" aria-invalid={!!e.industry} {...register("industry")}>
                <option value="">Select…</option>
                {industries.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </Field>
            <Field label="Location" htmlFor="location" error={e.location?.message}>
              <Select id="location" aria-invalid={!!e.location} {...register("location")}>
                <option value="">Select…</option>
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Experience level" htmlFor="experienceLevel">
              <Select id="experienceLevel" {...register("experienceLevel")}>
                {EXPERIENCE_LEVELS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2.5 text-sm text-ink sm:col-span-2">
              <Checkbox {...register("remote")} /> Partners can work remotely / online
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Details" description="Clear expectations attract better applicants." />
          <div className="space-y-5 p-5">
            <Field label="Opportunity description" htmlFor="description" error={e.description?.message}>
              <Textarea id="description" rows={6} aria-invalid={!!e.description} placeholder="About the product, the market you want to reach, and what success looks like." {...register("description")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Requirements" htmlFor="requirements" error={e.requirements?.message} hint="One per line.">
                <Textarea id="requirements" rows={5} aria-invalid={!!e.requirements} placeholder={"2+ years in Horeca sales\nNetwork in East Java"} {...register("requirements")} />
              </Field>
              <Field label="Expected deliverables" htmlFor="deliverables" error={e.deliverables?.message} hint="One per line.">
                <Textarea id="deliverables" rows={5} aria-invalid={!!e.deliverables} placeholder={"8 new accounts per quarter\nMonthly report"} {...register("deliverables")} />
              </Field>
            </div>
            {showPlatforms && (
              <Field label="Platforms" hint="Where should partners publish or promote?">
                <Controller
                  control={control}
                  name="platforms"
                  render={({ field }) => (
                    <ChoiceChips
                      options={PLATFORMS.map((p) => PLATFORM_LABEL[p])}
                      value={(field.value ?? []).map((p) => PLATFORM_LABEL[p as SocialPlatform])}
                      onChange={(labels) => field.onChange(PLATFORMS.filter((p) => labels.includes(PLATFORM_LABEL[p])))}
                    />
                  )}
                />
              </Field>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Compensation & timeline" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Compensation model" htmlFor="compensationModel">
              <Select id="compensationModel" {...register("compensationModel")}>
                {(Object.keys(COMPENSATION_LABEL) as CompensationModel[]).map((c) => (
                  <option key={c} value={c}>
                    {COMPENSATION_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Commission or budget" htmlFor="compensationDetail" error={e.compensationDetail?.message} hint="Shown on the listing, e.g. “10% per closed deal”.">
              <Input id="compensationDetail" aria-invalid={!!e.compensationDetail} {...register("compensationDetail")} />
            </Field>
            <Field label="Budget from (IDR)" htmlFor="budgetMin" optional error={e.budgetMin?.message}>
              <Input id="budgetMin" type="number" min={0} inputMode="numeric" placeholder="2500000" {...register("budgetMin")} />
            </Field>
            <Field label="Budget up to (IDR)" htmlFor="budgetMax" optional error={e.budgetMax?.message}>
              <Input id="budgetMax" type="number" min={0} inputMode="numeric" placeholder="6000000" aria-invalid={!!e.budgetMax} {...register("budgetMax")} />
            </Field>
            <Field label="Application deadline" htmlFor="deadline" error={e.deadline?.message}>
              <Input id="deadline" type="date" aria-invalid={!!e.deadline} {...register("deadline")} />
            </Field>
            <Field label="Partnership duration" htmlFor="duration" error={e.duration?.message}>
              <Input id="duration" placeholder="e.g. 6 months, renewable" aria-invalid={!!e.duration} {...register("duration")} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Premium listing</p>
              <p className="mt-1 text-[13px] text-subtle">Visible in full to Pro partners only. Best for high-value deals.</p>
            </div>
            <Controller
              control={control}
              name="premium"
              render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} disabled={!canPremium} aria-label="Premium listing" />}
            />
          </div>
          {!canPremium && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <Lock className="size-3" /> Requires Business Pro.{" "}
              <Link href="/dashboard/billing" className="font-medium text-brand-700 hover:underline">
                Upgrade
              </Link>
            </p>
          )}
        </Card>
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {id ? "Save changes" : "Publish opportunity"}
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={id ? `/dashboard/opportunities/${id}` : "/dashboard/opportunities"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
