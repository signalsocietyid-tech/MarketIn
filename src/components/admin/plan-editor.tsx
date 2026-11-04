"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Label } from "@/components/ui/form-controls";
import { Switch } from "@/components/ui/overlays";
import { Badge, Card } from "@/components/ui/primitives";
import { updatePlan } from "@/lib/actions/admin";
import { FEATURE_LABEL } from "@/lib/constants";
import type { FeatureKey, PlanLimits, Segment, SubscriptionPlan } from "@/lib/types";
import { useAction } from "@/lib/use-action";
import { cn, formatIDR } from "@/lib/utils";

const FEATURES = Object.keys(FEATURE_LABEL) as FeatureKey[];

const LIMITS: { key: keyof PlanLimits; label: string; segments: Segment[] }[] = [
  { key: "activeOpportunities", label: "Active opportunities", segments: ["business"] },
  { key: "monthlyApplications", label: "Applications / month", segments: ["sales", "creator", "agency"] },
  { key: "talentRoster", label: "Talent roster size", segments: ["agency"] },
  { key: "teamMembers", label: "Team members", segments: ["agency"] },
  { key: "savedItems", label: "Saved items", segments: ["business", "sales", "creator", "agency"] },
];

type Line = { id: number; text: string };

type FormState = {
  name: string;
  tagline: string;
  priceMonthly: string;
  priceYearly: string;
  benefits: Line[];
  entitlements: FeatureKey[];
  limits: Record<keyof PlanLimits, string>;
  recommended: boolean;
  active: boolean;
};

function toState(p: SubscriptionPlan): FormState {
  return {
    name: p.name,
    tagline: p.tagline,
    priceMonthly: String(p.priceMonthly),
    priceYearly: String(p.priceYearly),
    benefits: p.benefits.map((text, id) => ({ id, text })),
    entitlements: [...p.entitlements],
    limits: Object.fromEntries(LIMITS.map((l) => [l.key, String(p.limits[l.key])])) as Record<keyof PlanLimits, string>,
    recommended: p.recommended,
    active: p.active,
  };
}

const snapshot = (s: FormState) => JSON.stringify({ ...s, benefits: s.benefits.map((b) => b.text) });

function yearlyHint(monthly: number, yearly: number) {
  if (!monthly || !Number.isFinite(monthly) || !Number.isFinite(yearly)) return null;
  const months = (monthly * 12 - yearly) / monthly;
  const perMonth = `≈ ${formatIDR(Math.round(yearly / 12))} / month`;
  if (Math.abs(months) < 0.05) return `${perMonth} · no yearly discount`;
  if (months < 0) return `${perMonth} · costs more than paying monthly`;
  const rounded = Math.round(months * 10) / 10;
  return `${perMonth} · ${rounded.toLocaleString("en")} ${rounded === 1 ? "month" : "months"} free`;
}

export function PlanEditor({ plan, segmentLabel }: { plan: SubscriptionPlan; segmentLabel: string }) {
  const { run, pending } = useAction();
  const [initial, setInitial] = useState(() => toState(plan));
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nextId = useRef(plan.benefits.length);

  const dirty = snapshot(form) !== snapshot(initial);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const idp = (s: string) => `${plan.id}-${s}`;

  const monthly = Number(form.priceMonthly);
  const yearly = Number(form.priceYearly);

  const moveBenefit = (index: number, dir: -1 | 1) =>
    setForm((f) => {
      const next = [...f.benefits];
      const j = index + dir;
      if (j < 0 || j >= next.length) return f;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...f, benefits: next };
    });

  const save = () => {
    const local: Record<string, string> = {};
    const num = (v: string, key: string) => {
      if (v.trim() === "" || !Number.isInteger(Number(v)) || Number(v) < 0) local[key] = "Enter a whole number of 0 or more.";
      return Number(v);
    };
    const payload = {
      id: plan.id,
      name: form.name,
      tagline: form.tagline,
      priceMonthly: num(form.priceMonthly, "priceMonthly"),
      priceYearly: num(form.priceYearly, "priceYearly"),
      benefits: form.benefits.map((b) => b.text),
      entitlements: form.entitlements,
      limits: Object.fromEntries(LIMITS.map((l) => [l.key, num(form.limits[l.key], `limits.${l.key}`)])) as Record<keyof PlanLimits, number>,
      recommended: form.recommended,
      active: form.active,
    };
    if (form.benefits.length === 0) local.benefits = "Add at least one benefit.";
    form.benefits.forEach((b, i) => {
      if (!b.text.trim()) local[`benefits.${i}`] = "Benefit cannot be empty.";
    });
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    run(
      async () => {
        const r = await updatePlan(payload);
        setErrors(r.ok ? {} : (r.fieldErrors ?? {}));
        return r;
      },
      { onSuccess: () => setInitial(form) },
    );
  };

  return (
    <Card className={cn("flex flex-col", !form.active && "bg-canvas/40")}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">
            {segmentLabel} · <span className="font-mono">{plan.id}</span>
          </p>
          <h3 className="mt-0.5 font-sans text-[15px] font-semibold text-ink">{form.name || "Untitled plan"}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={plan.tier === "pro" ? "brand" : "neutral"}>{plan.tier === "pro" ? "Pro tier" : "Free tier"}</Badge>
          {form.recommended && <Badge tone="blue">Recommended</Badge>}
          {!form.active && <Badge tone="warning">Inactive</Badge>}
          {dirty && <Badge tone="outline">Unsaved changes</Badge>}
        </div>
      </div>

      <div className="grid flex-1 gap-5 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plan name" htmlFor={idp("name")} error={errors.name}>
            <Input id={idp("name")} value={form.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Tagline" htmlFor={idp("tagline")} error={errors.tagline} hint={`${form.tagline.length}/160`}>
            <Input
              id={idp("tagline")}
              value={form.tagline}
              maxLength={160}
              aria-invalid={!!errors.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field
            label="Monthly price (IDR)"
            htmlFor={idp("pm")}
            error={errors.priceMonthly}
            hint={Number.isFinite(monthly) ? (monthly === 0 ? "Free" : `${formatIDR(monthly)} / month`) : undefined}
          >
            <Input
              id={idp("pm")}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={form.priceMonthly}
              aria-invalid={!!errors.priceMonthly}
              onChange={(e) => set("priceMonthly", e.target.value)}
            />
          </Field>
          <Field
            label="Yearly price (IDR, total per year)"
            htmlFor={idp("py")}
            error={errors.priceYearly}
            hint={
              Number.isFinite(yearly)
                ? [`${formatIDR(yearly)} / year`, yearlyHint(monthly, yearly)].filter(Boolean).join(" · ")
                : undefined
            }
          >
            <Input
              id={idp("py")}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={form.priceYearly}
              aria-invalid={!!errors.priceYearly}
              onChange={(e) => set("priceYearly", e.target.value)}
            />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label>Benefits shown on the pricing page</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => set("benefits", [...form.benefits, { id: nextId.current++, text: "" }])}
            >
              <Plus /> Add line
            </Button>
          </div>
          <ol className="space-y-2">
            {form.benefits.map((b, i) => {
              const err = errors[`benefits.${i}`];
              return (
                <li key={b.id}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                    <Input
                      value={b.text}
                      aria-label={`Benefit ${i + 1}`}
                      aria-invalid={!!err}
                      className="h-9"
                      onChange={(e) =>
                        set(
                          "benefits",
                          form.benefits.map((x) => (x.id === b.id ? { ...x, text: e.target.value } : x)),
                        )
                      }
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Move up" disabled={i === 0} onClick={() => moveBenefit(i, -1)}>
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={i === form.benefits.length - 1}
                      onClick={() => moveBenefit(i, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove benefit"
                      onClick={() => set("benefits", form.benefits.filter((x) => x.id !== b.id))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  {err && <p className="ml-6 mt-1 text-xs font-medium text-danger-600">{err}</p>}
                </li>
              );
            })}
          </ol>
          {form.benefits.length === 0 && <p className="text-sm text-subtle">No benefits yet.</p>}
          {errors.benefits && <p className="mt-1 text-xs font-medium text-danger-600">{errors.benefits}</p>}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Feature entitlements</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const id = idp(`f-${f}`);
              const checked = form.entitlements.includes(f);
              return (
                <label key={f} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2 text-[13px] hover:bg-canvas">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onChange={(e) =>
                      set("entitlements", e.target.checked ? [...form.entitlements, f] : form.entitlements.filter((x) => x !== f))
                    }
                  />
                  <span className="text-ink">{FEATURE_LABEL[f]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Usage limits</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {LIMITS.map((l) => {
              const applies = l.segments.includes(plan.segment);
              const key = `limits.${l.key}`;
              return (
                <Field
                  key={l.key}
                  label={l.label}
                  htmlFor={idp(l.key)}
                  error={errors[key]}
                  hint={applies ? undefined : "Not used for this segment"}
                  className={cn(!applies && "opacity-70")}
                >
                  <Input
                    id={idp(l.key)}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.limits[l.key]}
                    aria-invalid={!!errors[key]}
                    className="h-9"
                    onChange={(e) => set("limits", { ...form.limits, [l.key]: e.target.value })}
                  />
                </Field>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor={idp("rec")} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
            <span>
              <span className="block text-[13px] font-medium text-ink">Recommended</span>
              <span className="block text-xs text-subtle">Highlighted on pricing. Only one per segment.</span>
            </span>
            <Switch id={idp("rec")} checked={form.recommended} onCheckedChange={(v) => set("recommended", v)} />
          </label>
          <label htmlFor={idp("act")} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
            <span>
              <span className="block text-[13px] font-medium text-ink">Active</span>
              <span className="block text-xs text-subtle">Inactive plans are hidden from pricing and checkout.</span>
            </span>
            <Switch id={idp("act")} checked={form.active} onCheckedChange={(v) => set("active", v)} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!dirty || pending}
          onClick={() => {
            setForm(initial);
            setErrors({});
          }}
        >
          Discard
        </Button>
        <Button type="button" size="sm" loading={pending} disabled={!dirty} onClick={save}>
          Save plan
        </Button>
      </div>
    </Card>
  );
}
