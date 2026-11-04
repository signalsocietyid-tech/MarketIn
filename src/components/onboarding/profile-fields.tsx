"use client";

import { useRef } from "react";
import { Controller, useFieldArray, useFormContext, type FieldValues } from "react-hook-form";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoiceChips, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Avatar } from "@/components/ui/primitives";
import { SocialIcon } from "@/components/brand/social-icons";
import {
  AGENCY_CATEGORIES,
  AGENCY_SERVICES,
  COLLABORATION_TYPES,
  CREATOR_TYPES,
  PLATFORM_LABEL,
  PLATFORMS,
  SALES_PARTNERSHIP_TYPES,
  SALES_SPECIALIZATIONS,
  TEAM_SIZES,
} from "@/lib/constants";
import type { Segment } from "@/lib/types";
import {
  agencyOnboardingSchema,
  businessOnboardingSchema,
  creatorOnboardingSchema,
  salesOnboardingSchema,
} from "@/lib/validation";

export type Taxonomies = { industries: string[]; niches: string[]; locations: string[] };

export const PROFILE_SCHEMAS = {
  business: businessOnboardingSchema,
  sales: salesOnboardingSchema,
  creator: creatorOnboardingSchema,
  agency: agencyOnboardingSchema,
} as const;

export const BUSINESS_CATEGORIES = ["Brand", "Manufacturer", "Distributor / Wholesaler", "Retailer", "SME / Startup", "Technology company", "Service provider"];

export type StepDef = { id: string; title: string; description: string; fields: string[] };

export const ROLE_STEPS: Record<Segment, StepDef[]> = {
  business: [
    { id: "company", title: "Company details", description: "Tell partners who you are.", fields: ["companyName", "businessEmail", "industry", "category", "location", "website"] },
    { id: "about", title: "About your business", description: "A clear description attracts better partners.", fields: ["description", "logoUrl"] },
  ],
  sales: [
    { id: "professional", title: "Professional profile", description: "Your background and expertise.", fields: ["fullName", "title", "location", "experienceYears", "industries"] },
    { id: "partnership", title: "Partnership preferences", description: "How and where you sell.", fields: ["partnershipTypes", "areas", "specializations", "portfolio", "bio"] },
  ],
  creator: [
    { id: "creator", title: "Creator profile", description: "What kind of creator are you?", fields: ["fullName", "creatorTypes", "location", "niches"] },
    { id: "channels", title: "Social channels", description: "Add the accounts brands will review.", fields: ["socials", "engagementRate"] },
    { id: "collaboration", title: "Collaboration preferences", description: "The work you want to take on.", fields: ["collaborationTypes", "portfolio", "bio"] },
  ],
  agency: [
    { id: "agency", title: "Agency details", description: "The basics about your agency.", fields: ["agencyName", "category", "website", "location", "teamSize"] },
    { id: "services", title: "Services & portfolio", description: "Show businesses what you deliver.", fields: ["description", "services", "portfolio"] },
  ],
};

export function emptyProfile(role: Segment, email = ""): FieldValues {
  switch (role) {
    case "business":
      return { companyName: "", businessEmail: email, industry: "", category: "", location: "", website: "", description: "", logoUrl: "" };
    case "sales":
      return { fullName: "", title: "", location: "", industries: [], experienceYears: 0, partnershipTypes: [], areas: [], specializations: [], portfolio: "", bio: "" };
    case "creator":
      return { fullName: "", creatorTypes: [], socials: [{ platform: "instagram", handle: "", url: "", followers: 0 }], engagementRate: "", niches: [], location: "", portfolio: "", collaborationTypes: [], bio: "" };
    case "agency":
      return { agencyName: "", category: "", website: "", location: "", description: "", services: [], teamSize: "", portfolio: "" };
  }
}

/* ------------------------------- helpers ---------------------------------- */

function useErr() {
  const { formState } = useFormContext();
  return (name: string): string | undefined => {
    const parts = name.split(".");
    let cur: unknown = formState.errors;
    for (const p of parts) cur = (cur as Record<string, unknown> | undefined)?.[p];
    const msg = (cur as { message?: unknown } | undefined)?.message;
    return typeof msg === "string" ? msg : undefined;
  };
}

function TextField({ name, label, placeholder, type = "text", hint, optional }: { name: string; label: string; placeholder?: string; type?: string; hint?: string; optional?: boolean }) {
  const { register } = useFormContext();
  const err = useErr()(name);
  return (
    <Field label={label} htmlFor={name} error={err} hint={hint} optional={optional}>
      <Input id={name} type={type} placeholder={placeholder} aria-invalid={!!err} {...register(name)} />
    </Field>
  );
}

function AreaField({ name, label, placeholder, hint, optional, rows = 4 }: { name: string; label: string; placeholder?: string; hint?: string; optional?: boolean; rows?: number }) {
  const { register } = useFormContext();
  const err = useErr()(name);
  return (
    <Field label={label} htmlFor={name} error={err} hint={hint} optional={optional}>
      <Textarea id={name} rows={rows} placeholder={placeholder} aria-invalid={!!err} {...register(name)} />
    </Field>
  );
}

function SelectField({ name, label, options, placeholder = "Select…" }: { name: string; label: string; options: readonly string[]; placeholder?: string }) {
  const { register } = useFormContext();
  const err = useErr()(name);
  return (
    <Field label={label} htmlFor={name} error={err}>
      <Select id={name} aria-invalid={!!err} {...register(name)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function ChipsField({ name, label, options, hint, max }: { name: string; label: string; options: readonly string[]; hint?: string; max?: number }) {
  const { control } = useFormContext();
  const err = useErr()(name);
  return (
    <Field label={label} error={err} hint={hint}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <ChoiceChips options={options} value={field.value ?? []} onChange={field.onChange} max={max} />}
      />
    </Field>
  );
}

function LogoField() {
  const { watch, setValue, setError, clearErrors } = useFormContext();
  const ref = useRef<HTMLInputElement>(null);
  const logo = watch("logoUrl") as string | undefined;
  const name = (watch("companyName") as string) || "Company";
  const err = useErr()("logoUrl");

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("logoUrl", { message: "Upload a PNG, JPG or SVG image" });
    if (file.size > 500_000) return setError("logoUrl", { message: "Logo must be smaller than 500 KB" });
    const reader = new FileReader();
    reader.onload = () => {
      clearErrors("logoUrl");
      setValue("logoUrl", String(reader.result), { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Field label="Business logo" optional error={err} hint="PNG, JPG or SVG, up to 500 KB. Square images look best.">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={logo || undefined} size={56} square />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.click()}>
            <ImagePlus /> {logo ? "Replace" : "Upload logo"}
          </Button>
          {logo && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setValue("logoUrl", "", { shouldDirty: true })}>
              Remove
            </Button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </Field>
  );
}

function SocialsField() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "socials" });
  const err = useErr();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Social media accounts</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ platform: "tiktok", handle: "", url: "", followers: 0 })}
          disabled={fields.length >= PLATFORMS.length}
        >
          <Plus /> Add account
        </Button>
      </div>
      {err("socials") && <p className="text-xs font-medium text-danger-600">{err("socials")}</p>}
      {fields.map((f, i) => (
        <div key={f.id} className="rounded-lg border border-line bg-canvas/40 p-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <Field label="Platform" htmlFor={`socials.${i}.platform`}>
              <Select id={`socials.${i}.platform`} {...register(`socials.${i}.platform`)}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABEL[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Handle" htmlFor={`socials.${i}.handle`} error={err(`socials.${i}.handle`)}>
              <Input id={`socials.${i}.handle`} placeholder="@yourhandle" aria-invalid={!!err(`socials.${i}.handle`)} {...register(`socials.${i}.handle`)} />
            </Field>
            <Field label="Profile link" htmlFor={`socials.${i}.url`} error={err(`socials.${i}.url`)} className="sm:col-span-1">
              <Input id={`socials.${i}.url`} placeholder="https://" aria-invalid={!!err(`socials.${i}.url`)} {...register(`socials.${i}.url`)} />
            </Field>
            <Field label="Followers" htmlFor={`socials.${i}.followers`} error={err(`socials.${i}.followers`)}>
              <Input id={`socials.${i}.followers`} type="number" min={0} inputMode="numeric" aria-invalid={!!err(`socials.${i}.followers`)} {...register(`socials.${i}.followers`)} />
            </Field>
          </div>
          {fields.length > 1 && (
            <div className="mt-2 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="text-danger-600 hover:text-danger-700">
                <Trash2 /> Remove
              </Button>
            </div>
          )}
        </div>
      ))}
      <p className="flex items-center gap-1.5 text-xs text-subtle">
        <SocialIcon platform="instagram" className="size-3.5" /> Follower counts are self-reported until account connection is available. Verified figures are reviewed by our team.
      </p>
    </div>
  );
}

/* ---------------------------- role field groups --------------------------- */

export function ProfileStepFields({ role, step, taxonomies }: { role: Segment; step: string | "all"; taxonomies: Taxonomies }) {
  const show = (id: string) => step === "all" || step === id;
  const { industries, niches, locations } = taxonomies;

  if (role === "business") {
    return (
      <div className="space-y-5">
        {show("company") && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField name="companyName" label="Company name" placeholder="PT Contoh Sejahtera" />
            </div>
            <TextField name="businessEmail" label="Business email" type="email" placeholder="partners@company.com" />
            <TextField name="website" label="Website" placeholder="https://company.com" optional />
            <SelectField name="industry" label="Industry" options={industries} />
            <SelectField name="category" label="Business category" options={BUSINESS_CATEGORIES} />
            <SelectField name="location" label="Company location" options={locations} />
          </div>
        )}
        {show("about") && (
          <>
            <AreaField name="description" label="Company description" rows={5} placeholder="What you sell, who your customers are, and what kind of partners you're looking for." />
            <LogoField />
          </>
        )}
      </div>
    );
  }

  if (role === "sales") {
    return (
      <div className="space-y-5">
        {show("professional") && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="fullName" label="Full name" />
              <TextField name="title" label="Professional title" placeholder="Independent B2B Sales Consultant" />
              <SelectField name="location" label="Location" options={locations} />
              <TextField name="experienceYears" label="Sales experience (years)" type="number" />
            </div>
            <ChipsField name="industries" label="Industry expertise" options={industries} hint="Pick up to 5." max={5} />
          </>
        )}
        {show("partnership") && (
          <>
            <ChipsField name="partnershipTypes" label="Preferred partnership type" options={SALES_PARTNERSHIP_TYPES} />
            <ChipsField name="areas" label="Areas of operation" options={locations} hint="Cities or regions you actively cover." />
            <ChipsField name="specializations" label="Sales specialization" options={SALES_SPECIALIZATIONS} />
            <AreaField name="portfolio" label="Portfolio or previous experience" optional placeholder="Accounts you've grown, products you've sold, results you're proud of." />
            <AreaField name="bio" label="Short bio" optional rows={3} />
          </>
        )}
      </div>
    );
  }

  if (role === "creator") {
    return (
      <div className="space-y-5">
        {show("creator") && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="fullName" label="Full name" />
              <SelectField name="location" label="Location" options={locations} />
            </div>
            <ChipsField name="creatorTypes" label="Creator category" options={CREATOR_TYPES} hint="Select all that apply — you can be both an affiliate and a KOL." />
            <ChipsField name="niches" label="Content niche" options={niches} max={5} hint="Pick up to 5." />
          </>
        )}
        {show("channels") && (
          <>
            <SocialsField />
            <TextField name="engagementRate" label="Average engagement rate (%)" type="number" optional hint="If you know it — e.g. 4.5" />
          </>
        )}
        {show("collaboration") && (
          <>
            <ChipsField name="collaborationTypes" label="Preferred collaboration types" options={COLLABORATION_TYPES} />
            <AreaField name="portfolio" label="Portfolio" optional placeholder="Brands you've worked with, content formats, links to your best work." />
            <AreaField name="bio" label="Short bio" optional rows={3} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {show("agency") && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField name="agencyName" label="Agency name" />
          </div>
          <SelectField name="category" label="Agency category" options={AGENCY_CATEGORIES} />
          <TextField name="website" label="Website" placeholder="https://agency.com" optional />
          <SelectField name="location" label="Location" options={locations} />
          <SelectField name="teamSize" label="Team size" options={TEAM_SIZES} />
        </div>
      )}
      {show("services") && (
        <>
          <AreaField name="description" label="Agency description" rows={5} />
          <ChipsField name="services" label="Services" options={AGENCY_SERVICES} />
          <AreaField name="portfolio" label="Portfolio" optional placeholder="Client campaigns, results, case studies." />
        </>
      )}
    </div>
  );
}
