// Helpers for reading URL filters in admin server pages.

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** First value of a search param, trimmed; undefined when empty. */
export function param(sp: RawSearchParams, key: string): string | undefined {
  const v = sp[key];
  const s = (Array.isArray(v) ? v[0] : v)?.trim();
  return s ? s : undefined;
}

/** A search param restricted to a set of allowed values. */
export function oneOf<T extends string>(sp: RawSearchParams, key: string, allowed: readonly T[]): T | undefined {
  const v = param(sp, key);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

/** Flatten search params to a plain string record (used to preserve filters in links). */
export function flatParams(sp: RawSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(sp)) {
    const v = param(sp, key);
    if (v) out[key] = v;
  }
  return out;
}

export function hrefWith(pathname: string, current: Record<string, string>, patch: Record<string, string | undefined>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) if (v) next.set(k, v);
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
