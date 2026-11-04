import { Building2, Megaphone, Network, ShieldCheck, TrendingUp } from "lucide-react";
import { demoLogin } from "@/lib/actions/auth";
import type { DemoRole } from "@/lib/demo";

const DEMOS = [
  { role: "business", label: "Business", icon: Building2 },
  { role: "sales", label: "Sales Partner", icon: TrendingUp },
  { role: "creator", label: "Creator", icon: Megaphone },
  { role: "agency", label: "Agency", icon: Network },
  { role: "admin", label: "Admin", icon: ShieldCheck },
] as const;

/** One-click sign-in to seeded demo accounts. Which roles are offered is decided by demoRoles(). */
export function DemoAccess({ roles }: { roles: DemoRole[] }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-canvas/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Explore the demo</p>
      <p className="mt-1 text-[13px] text-subtle">Sign in instantly as a sample account. All data is fictional.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DEMOS.filter((d) => roles.includes(d.role)).map((d) => {
          const Icon = d.icon;
          return (
            <form key={d.role} action={demoLogin.bind(null, d.role)}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md border border-line bg-white px-2.5 py-2 text-[13px] font-medium text-ink shadow-xs transition-colors hover:border-brand-300 hover:text-brand-800"
              >
                <Icon className="size-3.5 text-muted" /> {d.label}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
