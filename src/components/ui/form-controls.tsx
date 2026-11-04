import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-md border border-line-strong bg-white text-sm text-ink shadow-xs transition-colors placeholder:text-muted hover:border-navy-200 focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70 aria-invalid:border-danger-500 aria-invalid:ring-danger-50";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-10 px-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-24 px-3 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, "h-10 appearance-none pl-3 pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-ink", className)} {...props} />;
}

export function Checkbox({ className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded border-line-strong accent-brand-500 focus-visible:outline-brand-400",
        className,
      )}
      {...props}
    />
  );
}

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error wrapper used across all forms. */
export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="flex items-center gap-1.5">
          {label}
          {optional && <span className="text-xs font-normal text-muted">Optional</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

interface ChoiceChipsProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  className?: string;
}

/** Multi-select pill group, used for niches, industries, areas, etc. */
export function ChoiceChips({ options, value, onChange, max, className }: ChoiceChipsProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else if (!max || value.length < max) onChange([...value, opt]);
  };
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "border-brand-400 bg-brand-50 text-brand-800"
                : "border-line-strong bg-white text-subtle hover:border-navy-200 hover:text-ink",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
