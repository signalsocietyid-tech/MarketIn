"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lock, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogTrigger, SheetContent, Switch } from "@/components/ui/overlays";
import type { MarketCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ANY_VALUE, type PartnerKind } from "./filter-params";
import { opportunityFields, partnerFields, type FilterField, type Taxonomies } from "./filter-fields";

/* ------------------------------- URL helpers ------------------------------- */

/** Reads and writes marketplace filters in the URL (replace, no scroll). */
function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  return { searchParams, apply, pending };
}

/** Debounced keyword state bound to the `q` param. */
function useKeyword(delay = 350) {
  const { searchParams, apply, pending } = useFilterParams();
  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // When the keyword is cleared elsewhere (e.g. "Clear all"), reset the input.
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    if (urlQ === "") setQ("");
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function onChange(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => apply({ q: value.trim() || null }), delay);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    clearTimeout(timer.current);
    apply({ q: q.trim() || null });
  }

  return { q, onChange, submit, pending };
}

/* ------------------------------ Keyword search ----------------------------- */

export function KeywordSearch({
  id = "keyword",
  placeholder = "Search opportunities, companies or industries…",
  size = "md",
  className,
}: {
  id?: string;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const { q, onChange, submit, pending } = useKeyword();
  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Keyword search
      </label>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
          size === "lg" ? "left-4 size-5" : "left-3 size-4",
        )}
      />
      <Input
        id={id}
        type="search"
        value={q}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={size === "lg" ? "h-12 pl-12 pr-10 text-[15px]" : "pl-9 pr-9"}
      />
      {pending && (
        <LoaderCircle
          className={cn("absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-muted", size === "lg" ? "right-4" : "right-3")}
          aria-label="Updating results"
        />
      )}
    </form>
  );
}

/* ------------------------------ Filter panel ------------------------------- */

type SearchFiltersProps = {
  mode: "opportunity" | "partner";
  /** Partner directory kind (partner mode). */
  kind?: PartnerKind;
  /** Restricts opportunity types to this category (opportunity mode). */
  category?: MarketCategory;
  taxonomies: Taxonomies;
  advancedUnlocked: boolean;
  /** Page-level defaults used when a param is absent, e.g. creatorType on the affiliate directory. */
  defaults?: Record<string, string>;
  /** Render the keyword box inside the panel (off when the page has its own <KeywordSearch />). */
  showSearch?: boolean;
  searchPlaceholder?: string;
};

export function SearchFilters({
  mode,
  kind = "sales",
  category,
  taxonomies,
  advancedUnlocked,
  defaults = {},
  showSearch = true,
  searchPlaceholder,
}: SearchFiltersProps) {
  const { searchParams, apply, pending } = useFilterParams();
  const [open, setOpen] = useState(false);

  const fields = useMemo(
    () => (mode === "opportunity" ? opportunityFields(category, taxonomies) : partnerFields(kind, taxonomies)),
    [mode, category, kind, taxonomies],
  );
  const basic = fields.filter((f) => !f.advanced);
  const advanced = fields.filter((f) => f.advanced);
  const activeCount = fields.filter((f) => {
    const v = searchParams.get(f.key);
    return !!v && v !== defaults[f.key];
  }).length;
  const hasAnything = activeCount > 0 || !!searchParams.get("q");

  const placeholder =
    searchPlaceholder ?? (mode === "opportunity" ? "Search title, company, industry…" : "Search name, niche, skills…");

  const valueFor = (f: FilterField) => searchParams.get(f.key) ?? defaults[f.key] ?? "";

  function setValue(key: string, value: string) {
    apply({ [key]: value && value !== defaults[key] ? value : null });
  }

  function clearAll() {
    apply(Object.fromEntries([...fields.map((f) => [f.key, null] as const), ["q", null] as const]));
  }

  const panel = (idPrefix: string) => (
    <div className="space-y-5">
      <div className="space-y-4">
        {basic.map((f) => (
          <FilterControl
            key={f.key}
            field={f}
            idPrefix={idPrefix}
            value={valueFor(f)}
            hasDefault={!!defaults[f.key]}
            onChange={setValue}
          />
        ))}
      </div>

      {advanced.length > 0 && (
        <div className="space-y-4 border-t border-line pt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-subtle">Advanced filters</p>
            {!advancedUnlocked && <Lock className="size-3.5 text-muted" aria-hidden />}
          </div>
          {!advancedUnlocked && (
            <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2.5 text-[13px] text-subtle">
              <Link href="/pricing" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                <Lock className="size-3.5" /> Upgrade to unlock advanced filters
              </Link>
              <p className="mt-0.5 text-xs">Available on Pro plans.</p>
            </div>
          )}
          {advanced.map((f) => (
            <FilterControl
              key={f.key}
              field={f}
              idPrefix={idPrefix}
              value={valueFor(f)}
              hasDefault={!!defaults[f.key]}
              onChange={setValue}
              disabled={!advancedUnlocked}
            />
          ))}
        </div>
      )}
    </div>
  );

  const countPill =
    activeCount > 0 ? (
      <span className="rounded-full bg-brand-500 px-1.5 py-px text-[11px] font-semibold text-white">{activeCount}</span>
    ) : null;

  const header = (
    <div className="flex flex-1 items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
        <SlidersHorizontal className="size-4 text-muted" />
        Filters
        {countPill}
        {pending && <LoaderCircle className="size-3.5 animate-spin text-muted" aria-label="Updating results" />}
      </p>
      {hasAnything && (
        <button type="button" onClick={clearAll} className="text-[13px] font-medium text-brand-700 hover:underline">
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: search bar + drawer */}
      <div className="flex items-center gap-2 lg:hidden">
        {showSearch && <KeywordSearch id="filters-q-mobile" placeholder={placeholder} className="min-w-0 flex-1" />}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className={cn(!showSearch && "w-full")}>
              <SlidersHorizontal />
              Filters
              {countPill}
            </Button>
          </DialogTrigger>
          <SheetContent title="Filters" side="right">
            <div className="flex items-center border-b border-line px-5 py-4">
              {header}
              <DialogClose
                className="-mr-2 ml-3 rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink"
                aria-label="Close filters"
              >
                <X className="size-4" />
              </DialogClose>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel("filters-m")}</div>
            <div className="flex gap-2 border-t border-line px-5 py-4">
              <Button variant="secondary" className="flex-1" onClick={clearAll} disabled={!hasAnything}>
                Clear all
              </Button>
              <DialogClose asChild>
                <Button className="flex-1">Show results</Button>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24 space-y-5 rounded-xl border border-line bg-white p-5 shadow-card">
          {header}
          {showSearch && <KeywordSearch id="filters-q" placeholder={placeholder} />}
          {panel("filters-d")}
        </div>
      </aside>
    </>
  );
}

function FilterControl({
  field,
  idPrefix,
  value,
  hasDefault,
  onChange,
  disabled,
}: {
  field: FilterField;
  idPrefix: string;
  value: string;
  hasDefault: boolean;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}) {
  const id = `${idPrefix}-${field.key}`;
  if (field.control === "toggle") {
    return (
      <div className={cn("flex items-center justify-between gap-3", disabled && "opacity-60")}>
        <Label htmlFor={id} className="flex items-center gap-1.5 text-[13px]">
          {disabled && <Lock className="size-3 text-muted" aria-hidden />}
          {field.label}
        </Label>
        <Switch
          id={id}
          checked={value === "1"}
          onCheckedChange={(c) => onChange(field.key, c ? "1" : "")}
          disabled={disabled}
        />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={cn("flex items-center gap-1.5 text-[13px]", disabled && "text-subtle")}>
        {disabled && <Lock className="size-3 text-muted" aria-hidden />}
        {field.label}
      </Label>
      <Select id={id} value={value} onChange={(e) => onChange(field.key, e.target.value)} disabled={disabled}>
        {/* Fields with a page default need an explicit "any" value so the default can be overridden. */}
        <option value={hasDefault ? ANY_VALUE : ""}>{field.emptyLabel}</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/* ---------------------------------- Sort ----------------------------------- */

/** Sort dropdown shown above results; writes `sort` to the URL. */
export function SortSelect({
  options,
  id = "results-sort",
}: {
  options: readonly { value: string; label: string }[];
  id?: string;
}) {
  const { searchParams, apply } = useFilterParams();
  const current = searchParams.get("sort") ?? "";
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="shrink-0 text-[13px] font-normal text-subtle">
        Sort by
      </Label>
      <Select
        id={id}
        value={options.some((o) => o.value === current) ? current : ""}
        onChange={(e) => apply({ sort: e.target.value || null })}
        className="h-9 min-w-40 text-[13px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
