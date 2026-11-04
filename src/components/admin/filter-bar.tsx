"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { hrefWith } from "./search-params";

export type FilterSelect = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * Search box + select filters synced to the URL. `values` are the current
 * search params (passed from the server page, so no Suspense boundary needed).
 */
export function FilterBar({
  values,
  searchPlaceholder = "Search",
  selects = [],
  resetKeys,
}: {
  values: Record<string, string>;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
  /** Params cleared by "Clear filters" (defaults to q + every select). */
  resetKeys?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(values.q ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const keys = resetKeys ?? ["q", ...selects.map((s) => s.name)];
  const hasFilters = keys.some((k) => values[k]);

  const navigate = (patch: Record<string, string | undefined>) => {
    startTransition(() => router.replace(hrefWith(pathname, values, patch), { scroll: false }));
  };

  const onSearch = (value: string) => {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate({ q: value.trim() || undefined }), 350);
  };

  const clear = () => {
    clearTimeout(timer.current);
    setQ("");
    navigate(Object.fromEntries(keys.map((k) => [k, undefined])));
  };

  return (
    <form
      role="search"
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        navigate({ q: q.trim() || undefined });
      }}
    >
      <div className="relative min-w-0 sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 pl-9"
        />
      </div>
      {selects.map((s) => (
        <div key={s.name} className="sm:w-48">
          <Select
            aria-label={s.label}
            value={values[s.name] ?? ""}
            onChange={(e) => navigate({ [s.name]: e.target.value || undefined })}
            className="h-9"
          >
            <option value="">{s.label}: All</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
      {hasFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          <X /> Clear filters
        </Button>
      )}
      {pending && <Loader2 className="size-4 animate-spin text-muted" aria-label="Loading" />}
    </form>
  );
}
