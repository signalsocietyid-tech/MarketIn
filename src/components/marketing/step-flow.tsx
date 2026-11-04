import { cn } from "@/lib/utils";

export type FlowStep = { title: string; description: string };

/**
 * Numbered step flow: a vertical timeline on mobile, a horizontal row with
 * connectors from `lg` up.
 */
export function StepFlow({ steps, className }: { steps: FlowStep[]; className?: string }) {
  return (
    <ol className={cn("grid gap-0 lg:grid-cols-4 lg:gap-6", className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.title} className={cn("relative pl-14 lg:pl-0", !last && "pb-8 lg:pb-0")}>
            {/* connector: vertical on mobile, horizontal on desktop */}
            {!last && (
              <>
                <span aria-hidden className="absolute left-[19px] top-11 bottom-1 w-px bg-line lg:hidden" />
                <span aria-hidden className="absolute left-14 right-0 top-5 hidden h-px bg-line lg:block" />
              </>
            )}
            <span
              aria-hidden
              className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-navy-100 bg-white font-display text-sm font-bold text-navy-800 shadow-xs lg:static"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="lg:mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">Step {i + 1}</p>
              <h3 className="mt-1 text-[17px] font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-subtle">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
